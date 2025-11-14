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
	SenderUsername string `json:"sender_username,omitempty"`
	RecipientUsername string `json:"recipient_username,omitempty"`
}

type PaymentFailedMessage struct {
	Type        string    `json:"type"`
	SenderID    uuid.UUID `json:"sender_id"`
	RecipientID uuid.UUID `json:"recipient_id"`
	Amount      int64     `json:"amount"`
	Reason      string    `json:"reason"`
	SenderUsername string `json:"sender_username,omitempty"`
	RecipientUsername string `json:"recipient_username,omitempty"`
}

type PaymentRequestMessage struct {
	Type          string    `json:"type"`
	RequesterID   uuid.UUID `json:"requester_id"`
	RequesteeID   uuid.UUID `json:"requestee_id"`
	Amount        int64     `json:"amount"`
	TransactionID uuid.UUID `json:"transaction_id"`
	RequesterUsername string `json:"requester_username,omitempty"`
	RequesteeUsername string `json:"requestee_username,omitempty"`
}

type PaymentRejectedMessage struct {
	Type          string    `json:"type"`
	RequesterID   uuid.UUID `json:"requester_id"`
	RejecterID    uuid.UUID `json:"rejecter_id"`
	Amount        int64     `json:"amount"`
	TransactionID uuid.UUID `json:"transaction_id"`
	RequesterUsername string `json:"requester_username,omitempty"`
	RejecterUsername string `json:"rejecter_username,omitempty"`
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
		failReason := "Wallet service error"
		if ok && st.Code() == codes.InvalidArgument && st.Message() == "insufficient balance" {
			// 2a. Debit failed (insufficient funds)
			failReason = "Insufficient funds"
		}
		// 2b. Other grpc or network error
		tx := &model.Transaction{
			SenderUserID:    senderID,
			RecipientUserID: recipientID,
			Amount:          amount,
			Status:          model.StatusFailed,
			Type:            model.TypeSend,
			FailureReason:   &failReason,
		}
		return s.createAndPublishFailedTx(ctx, tx, failReason)
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

		// Attempt to reverse the debit by crediting the sender again
		reversalReq := &walletpb.CreditWalletRequest{
			UserId: senderID.String(),
			Amount: amount,
		}
		if _, revErr := s.wallet.CreditWallet(context.Background(), reversalReq); revErr != nil {
			// If reversal fails, this is a catastrophic failure. Manual intervention is required.
			log.Printf("CATASTROPHIC ERROR: FAILED TO REVERSE DEBIT for user %s: %v", senderID, revErr)
			// TODO: Add to a manual review queue
		}
		// Now, create the failed transaction and notify the user
		failReason := "Credit Operation failed. Your funds have been reversed."
		if err != nil {
			failReason = "Credit operation failed. Reversal failed, contact support."
		}
		tx := &model.Transaction{
			SenderUserID:    senderID,
			RecipientUserID: recipientID,
			Amount:          amount,
			Status:          model.StatusFailed,
			Type:            model.TypeSend,
			FailureReason:   &failReason,
		}
		return s.createAndPublishFailedTx(ctx, tx, failReason)
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

	go s.publishSuccessNotification(context.Background(), createdTx)

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
	
	go s.publishRequestNotification(context.Background(), createdTx)

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
		failReason := "Insufficient funds"
		if st, ok := status.FromError(err); ok && st.Code() != codes.InvalidArgument {
			failReason = "Wallet service error"
		}
		
		tx.Status = model.StatusFailed
		tx.FailureReason = &failReason
		s.store.UpdateTransaction(ctx, tx) // Update DB
		
		// REFACTOR: Use helper to publish fail message
		go s.publishFailedNotification(context.Background(), tx)
		return nil, fmt.Errorf(failReason)
	}

	// 3b. Credit the original requester
	_, err = s.wallet.CreditWallet(ctx, &walletpb.CreditWalletRequest{UserId: recipientID.String(), Amount: amount})
	if err != nil {
		// REFACTOR: CRITICAL FLAW FIX
		// The debit succeeded but the credit failed. We MUST reverse the debit.
		log.Printf("CRITICAL ERROR: Approved debit succeeded but credit failed: %v. Reversing debit for user %s", err, senderID)
		
		reversalReq := &walletpb.CreditWalletRequest{
			UserId: senderID.String(),
			Amount: amount,
		}
		if _, revErr := s.wallet.CreditWallet(context.Background(), reversalReq); revErr != nil {
			log.Printf("CATASTROPHIC ERROR: FAILED TO REVERSE DEBIT for user %s: %v", senderID, revErr)
		}

		failReason := "credit operation failed. Your funds have been returned."
		if err != nil {
			failReason = "credit operation failed. Reversal failed, contact support."
		}

		tx.Status = model.StatusFailed
		tx.FailureReason = &failReason
		s.store.UpdateTransaction(ctx, tx) // Update DB
		
		// REFACTOR: Use helper to publish fail message
		go s.publishFailedNotification(context.Background(), tx)
		return nil, fmt.Errorf(failReason)
	}

	// IMPORTANT: We need to update the sender and recipient fields to reflect actual money flow.
	// When a request is approved, the money flows FROM the approver (who was the recipient)
	// TO the requester (who was the sender in the pending request).
	// We swap them so the transaction displays correctly in the user's history.
	tx.SenderUserID = senderID      // The person who paid (approver)
	tx.RecipientUserID = recipientID // The person who received (requester)

	// 4. Success. Update transaction status to "completed"
	tx.Status = model.StatusCompleted
	if err := s.store.UpdateTransaction(ctx, tx); err != nil {
		log.Printf("CRITICAL ERROR: Approval transfer complete but failed to update tx record: %v", err)
	}

	// 5. Publish "success" message
	go s.publishSuccessNotification(context.Background(), tx)

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
	go s.publishRejectedNotification(context.Background(), tx)

	return tx, nil
}

// GetPendingTransactions fetches all pending requests for a user.
// This implements the logic for "/api/vs/transactions/pending"
func (s *TransactionService) GetPendingTransactions(ctx context.Context, userID uuid.UUID, limit, offset int) ([]*model.Transaction, error) {
	return s.store.GetPendingTransactionsByRecipientID(ctx, userID, limit, offset)
}

// GetTransactionHistory fetches a user's transaction history.
// This implements the logic for "/api/v1/transactions"
func (s *TransactionService) GetTransactionHistory(ctx context.Context, userID uuid.UUID, withUserID uuid.NullUUID, limit, offset int) ([]*model.Transaction, error) {
	return s.store.GetTransactionHistoryByUserID(ctx, userID, withUserID, limit,offset)
}

// --- Internal Helper Methods ---

// createAndPublishFailedTx is a helper for when a /send operation fails.
// It creates the "failed" DB record and publishes the "payment_failed" message.
func (s *TransactionService) createAndPublishFailedTx(ctx context.Context, tx *model.Transaction, reason string) (*model.Transaction, error) {
	// 1. Create "failed" transaction record
	createdTx, err := s.store.CreateTransaction(ctx, tx)
	if err != nil {
		log.Printf("Error saving failed tx record: %v", err)
		// We still want to publish the failure, even if DB save failed
		return nil, fmt.Errorf("failed to save transaction: %w", err)
	}

	go s.publishFailedNotification(context.Background(), createdTx)
	return createdTx, fmt.Errorf("%s", reason)
	
}

// publishFailedTx is a helper to run publishing in a goroutine.
func (s *TransactionService) publishFailedNotification(ctx context.Context, tx *model.Transaction) {
	txWithNames, err := s.store.GetTransactionByID(ctx, tx.ID)
	if err != nil {
		log.Printf("Failed to get tx details for fail notification: %v", err)
		txWithNames = tx
	}

	reason := "Transaction Failed"
	if txWithNames.FailureReason != nil {
		reason = *txWithNames.FailureReason
	}
	msg := PaymentFailedMessage{
		Type: "payment_failed",
		SenderID: txWithNames.SenderUserID,
		RecipientID: txWithNames.RecipientUserID,
		Amount: txWithNames.Amount,
		Reason: reason,
		SenderUsername: txWithNames.SenderUsername,
		RecipientUsername: txWithNames.RecipientUsername,
	}
	if err := s.publisher.Publish(ctx, "notify.payment.failed", msg); err != nil {
		log.Printf("Failed to publish failed message: %v", err)
	}
}
func (s *TransactionService) publishSuccessNotification(ctx context.Context, tx *model.Transaction) {
	txWithNames, err := s.store.GetTransactionByID(ctx, tx.ID)
	if err != nil {
		log.Printf("Failed to get tx details for success notification: %v", err)
		txWithNames = tx
	}
	msg := PaymentSuccessMessage{
		Type: "payment_success",
		SenderID: txWithNames.SenderUserID,
		RecipientID: txWithNames.RecipientUserID,
		Amount: txWithNames.Amount,
		TransactionID: txWithNames.ID,
		SenderUsername: txWithNames.SenderUsername,
		RecipientUsername: txWithNames.RecipientUsername,
	}
	if err := s.publisher.Publish(ctx, "notify.payment.success", msg); err != nil {
		log.Printf("Failed to publish success message: %v", err)
	}
}

func (s *TransactionService) publishRequestNotification(ctx context.Context, tx *model.Transaction) {
	txWithNames, err := s.store.GetTransactionByID(ctx, tx.ID)
	if err != nil {
		log.Printf("Failed to get tx details for request notification: %v", err)
		txWithNames = tx
	}
	msg := PaymentRequestMessage{
		Type: "payment_request",
		RequesterID: txWithNames.SenderUserID,
		RequesteeID: txWithNames.RecipientUserID,
		Amount: txWithNames.Amount,
		TransactionID: txWithNames.ID,
		RequesterUsername: txWithNames.SenderUsername,
		RequesteeUsername: txWithNames.RecipientUsername,
	}
	if err := s.publisher.Publish(ctx, "notify.payment.request", msg); err != nil {
		log.Printf("Failed to publish request message: %v", err)
	}
}

func (s *TransactionService) publishRejectedNotification(ctx context.Context, tx *model.Transaction){
	txWithNames, err := s.store.GetTransactionByID(ctx, tx.ID)
	if err != nil {
		log.Printf("Failed to get tx details for reject notification: %v", err)
		txWithNames = tx
	}
	msg := PaymentRejectedMessage{
		Type: "payment_rejected",
		RequesterID: txWithNames.SenderUserID,
		RejecterID: txWithNames.RecipientUserID,
		Amount: txWithNames.Amount,
		TransactionID: txWithNames.ID,
		RequesterUsername: txWithNames.SenderUsername,
		RejecterUsername: txWithNames.RecipientUsername,
	}
	if err := s.publisher.Publish(ctx, "notify.payment.rejected", msg); err != nil {
		log.Printf("Failed to publish reject message: %v", err)
	}
}
