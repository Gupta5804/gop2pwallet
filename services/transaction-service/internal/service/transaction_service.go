package service

import (
	"context"
	"fmt"
	"log"

	walletpb "github.com/Gupta5804/gop2pwallet/proto/wallet"
	"github.com/Gupta5804/gop2pwallet/services/transaction-service/internal/model"
	"github.com/Gupta5804/gop2pwallet/services/transaction-service/internal/mq"
	"github.com/Gupta5804/gop2pwallet/services/transaction-service/internal/storage"
	"github.com/google/uuid"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)


type TransactionService struct {
	store     storage.TransactionStore
	wallet    walletpb.WalletServiceClient
	publisher mq.TransactionPublisher
}

// NewTransactionService (factory)
func NewTransactionService(store storage.TransactionStore, wallet walletpb.WalletServiceClient, pub mq.TransactionPublisher) *TransactionService {
	return &TransactionService{
		store:     store,
		wallet:    wallet,
		publisher: pub,
	}
}

// Structs for RabbitMQ message bodies
type PaymentSuccessMessage struct {
	Type          string    `json:"type"`
	SenderID      uuid.UUID `json:"sender_id"`
	RecipientID   uuid.UUID `json:"recipient_id"`
	Amount        int64     `json:"amount"`
	TransactionID uuid.UUID `json:"transaction_id"`
}

type PaymentFailedMessage struct {
	Type        string    `json:"type"`
	SenderID    uuid.UUID `json:"sender_id"`
	RecipientID uuid.UUID `json:"recipient_id"`
	Amount      int64     `json:"amount"`
	Reason      string    `json:"reason"`
}

type PaymentRequestMessage struct {
	Type          string    `json:"type"`
	RequesterID   uuid.UUID `json:"requester_id"`
	RequesteeID   uuid.UUID `json:"requestee_id"`
	Amount        int64     `json:"amount"`
	TransactionID uuid.UUID `json:"transaction_id"`
}

type PaymentRejectedMessage struct {
	Type          string    `json:"type"`
	RequesterID   uuid.UUID `json:"requester_id"`
	RejecterID    uuid.UUID `json:"rejecter_id"`
	Amount        int64     `json:"amount"`
	TransactionID uuid.UUID `json:"transaction_id"`
}

// -- Public Methods -- //

// SendMoney executes a p2p transfer
func (s *TransactionService) SendMoney(ctx context.Context, senderID, recipientID uuid.UUID, amount int64) (*model.Transaction, error) {
	// 1. Call wallet service to perform the debit
	debitReq := &walletpb.DebitWalletRequest{
		UserId: senderID.String(),
		Amount: amount,
	}
	_, err := s.wallet.DebitWallet(ctx, debitReq)

	if err != nil {
		// handle specific grpc errors
		st, ok := status.FromError(err)
		if ok && st.Code() == codes.InvalidArgument && st.Message() == "insufficient balance" {
			// 2a. Debit failed (insufficient funds)
			return s.createAndPublishFailedTx(ctx, senderID, recipientID, amount, model.TypeSend, "Insufficient funds")
		}
		// 2b. Other grpc or network error
		return s.createAndPublishFailedTx(ctx, senderID, recipientID, amount, model.TypeSend, "Wallet service error")
	}

	// 3. Debit was successful, now credit the recepient
	creditReq := &walletpb.CreditWalletRequest{
		UserId: recipientID.String(),
		Amount: amount,
	}

	_, err = s.wallet.CreditWallet(ctx, creditReq)

	if err != nil {
		// This is a critical problem! The sender was debited but the recipient
		// was not credited. We must log this and attempt to auto-reconcile.
		// For now, we'll log the failure and notify.
		// A more robust system would trigger a "reversal" on the sender's debit.
		log.Printf("CRITICAL ERROR: Debit succeeded but Credit failed: %v", err)
		return s.createAndPublishFailedTx(ctx, senderID, recipientID, amount, model.TypeSend, "Credit operation failed")
	}

	// 4. Both debit and credit succeeded
	// Create "completed" transaction record
	tx := &model.Transaction{
		SenderUserID:    senderID,
		RecipientUserID: recipientID,
		Amount:          amount,
		Status:          model.StatusCompleted,
		Type:            model.TypeSend,
	}
	createdTx, err := s.store.CreateTransaction(ctx, tx)
	if err != nil {
		log.Printf("CriticalError: Wallet Transfer complete but failed to create transaction record: %v", err)
	}

	// 5. Publish success message to RabbitMQ
	msg := PaymentSuccessMessage{
		Type:          "payment_success",
		SenderID:      senderID,
		RecipientID:   recipientID,
		Amount:        amount,
		TransactionID: createdTx.ID,
	}

	// we run this in a goroutine so we dont block the HTTP response
	go func() {
		if err := s.publisher.Publish(context.Background(),"notify.payment.success", msg); err != nil {
			log.Printf("Failed to publish payment success message: %v", err)
		}
	}()

	return createdTx, nil
}

// RequestMoney creates a "pending" transaction.
// This implements the logic for "/api/v1/transactions/request"
func (s *TransactionService) RequestMoney(ctx context.Context, requesterID, requesteeID uuid.UUID, amount int64) (*model.Transaction, error) {
	// 1. Create "pending" transaction record
	tx := &model.Transaction{
		SenderUserID:    requesterID, // The person *making* the request
		RecipientUserID: requesteeID, // The person *receiving* the request
		Amount:          amount,
		Status:          model.StatusPending,
		Type:            model.TypeRequest,
	}
	createdTx, err := s.store.CreateTransaction(ctx, tx)
	if err != nil {
		return nil, fmt.Errorf("failed to create pending transaction: %w", err)
	}

	// 2. Publish request message to RabbitMQ
	msg := PaymentRequestMessage{
		Type:          "payment_request",
		RequesterID:   requesterID,
		RequesteeID:   requesteeID,
		Amount:        amount,
		TransactionID: createdTx.ID,
	}
	go func() {
		if err := s.publisher.Publish(context.Background(), "notify.payment.request", msg); err != nil {
			log.Printf("Failed to publish request message: %v", err)
		}
	}()

	return createdTx, nil
}

// ApproveRequest approves a pending request and executes the transfer.
// This implements the logic for "/api/v1/transactions/approve/{tx_id}"
func (s *TransactionService) ApproveRequest(ctx context.Context, approverID uuid.UUID, txID uuid.UUID) (*model.Transaction, error) {
	// 1. Get the pending transaction
	tx, err := s.store.GetTransactionByID(ctx, txID)
	if err != nil {
		return nil, fmt.Errorf("transaction not found")
	}

	// 2. Validate
	if tx.Status != model.StatusPending {
		return nil, fmt.Errorf("transaction is not pending")
	}
	if tx.RecipientUserID != approverID {
		return nil, fmt.Errorf("you are not authorized to approve this request")
	}

	// 3. Execute the transfer (same logic as SendMoney)
	// Note: The approver (recipient of request) is now the SENDER of funds.
	// The requester (sender of request) is now the RECIPIENT of funds.
	senderID := tx.RecipientUserID
	recipientID := tx.SenderUserID
	amount := tx.Amount

	// 3a. Debit the approver
	_, err = s.wallet.DebitWallet(ctx, &walletpb.DebitWalletRequest{UserId: senderID.String(), Amount: amount})
	if err != nil {
		// Failed (e.g., insufficient funds)
		tx.Status = model.StatusFailed
		failReason := "Insufficient funds"
		tx.FailureReason = &failReason
		s.store.UpdateTransaction(ctx, tx) // Update DB
		// Publish fail message
		go s.publishFailedTx(context.Background(), senderID, recipientID, amount, model.TypeRequest, failReason)
		return nil, fmt.Errorf("insufficient funds")
	}

	// 3b. Credit the original requester
	_, err = s.wallet.CreditWallet(ctx, &walletpb.CreditWalletRequest{UserId: recipientID.String(), Amount: amount})
	if err != nil {
		// Critical error (debit worked, credit failed)
		log.Printf("CRITICAL ERROR: Approved debit succeeded but credit failed: %v", err)
		tx.Status = model.StatusFailed
		failReason := "Credit operation failed"
		tx.FailureReason = &failReason
		s.store.UpdateTransaction(ctx, tx) // Update DB
		go s.publishFailedTx(context.Background(), senderID, recipientID, amount, model.TypeRequest, failReason)
		return nil, fmt.Errorf("credit operation failed")
	}

	// 4. Success. Update transaction status to "completed"
	tx.Status = model.StatusCompleted
	if err := s.store.UpdateTransaction(ctx, tx); err != nil {
		log.Printf("CRITICAL ERROR: Approval transfer complete but failed to update tx record: %v", err)
	}

	// 5. Publish success message
	msg := PaymentSuccessMessage{
		Type:          "payment_success",
		SenderID:      senderID,    // The approver
		RecipientID:   recipientID, // The original requester
		Amount:        amount,
		TransactionID: tx.ID,
	}
	go func() {
		if err := s.publisher.Publish(context.Background(), "notify.payment.success", msg); err != nil {
			log.Printf("Failed to publish success message: %v", err)
		}
	}()

	return tx, nil
}

// RejectRequest rejects a pending transaction.
// This implements the logic for "/api/v1/transactions/reject/{tx_id}"
func (s *TransactionService) RejectRequest(ctx context.Context, rejecterID uuid.UUID, txID uuid.UUID) (*model.Transaction, error) {
	// 1. Get the pending transaction
	tx, err := s.store.GetTransactionByID(ctx, txID)
	if err != nil {
		return nil, fmt.Errorf("transaction not found")
	}

	// 2. Validate
	if tx.Status != model.StatusPending {
		return nil, fmt.Errorf("transaction is not pending")
	}
	if tx.RecipientUserID != rejecterID {
		return nil, fmt.Errorf("you are not authorized to reject this request")
	}

	// 3. Update status to "rejected"
	tx.Status = model.StatusRejected
	if err := s.store.UpdateTransaction(ctx, tx); err != nil {
		return nil, fmt.Errorf("failed to update transaction: %w", err)
	}

	// 4. Publish "rejected" message
	msg := PaymentRejectedMessage{
		Type:          "payment_rejected",
		RequesterID:   tx.SenderUserID,    // Original requester
		RejecterID:    tx.RecipientUserID, // User who rejected
		Amount:        tx.Amount,
		TransactionID: tx.ID,
	}
	go func() {
		if err := s.publisher.Publish(context.Background(), "notify.payment.rejected", msg); err != nil {
			log.Printf("Failed to publish reject message: %v", err)
		}
	}()

	return tx, nil
}

// GetPendingTransactions fetches all pending requests for a user.
// This implements the logic for "/api/vs/transactions/pending"
func (s *TransactionService) GetPendingTransactions(ctx context.Context, userID uuid.UUID) ([]*model.Transaction, error) {
	return s.store.GetPendingTransactionsByRecipientID(ctx, userID)
}

// GetTransactionHistory fetches a user's transaction history.
// This implements the logic for "/api/v1/transactions"
func (s *TransactionService) GetTransactionHistory(ctx context.Context, userID uuid.UUID, limit int) ([]*model.Transaction, error) {
	return s.store.GetTransactionHistoryByUserID(ctx, userID, limit)
}

// --- Internal Helper Methods ---

// createAndPublishFailedTx is a helper for when a /send operation fails.
// It creates the "failed" DB record and publishes the "payment_failed" message.
func (s *TransactionService) createAndPublishFailedTx(ctx context.Context, senderID, recipientID uuid.UUID, amount int64, txType model.TransactionType, reason string) (*model.Transaction, error) {
	// 1. Create "failed" transaction record
	tx := &model.Transaction{
		SenderUserID:    senderID,
		RecipientUserID: recipientID,
		Amount:          amount,
		Status:          model.StatusFailed,
		Type:            txType,
		FailureReason:   &reason,
	}
	createdTx, err := s.store.CreateTransaction(ctx, tx)
	if err != nil {
		log.Printf("Error saving failed tx record: %v", err)
		// We still want to publish the failure, even if DB save failed
	}

	// 2. Publish failure message
	go s.publishFailedTx(ctx, senderID, recipientID, amount, txType, reason)

	return createdTx, fmt.Errorf("%s", reason)
}

// publishFailedTx is a helper to run publishing in a goroutine.
func (s *TransactionService) publishFailedTx(ctx context.Context, senderID, recipientID uuid.UUID, amount int64, txType model.TransactionType, reason string) {
	msg := PaymentFailedMessage{
		Type:        "payment_failed",
		SenderID:    senderID,
		RecipientID: recipientID,
		Amount:      amount,
		Reason:      reason,
	}
	if err := s.publisher.Publish(context.Background(), "notify.payment.failed", msg); err != nil {
		log.Printf("Failed to publish failure message: %v", err)
	}
}
