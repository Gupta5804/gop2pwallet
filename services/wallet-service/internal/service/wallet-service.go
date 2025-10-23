package service

import (
	"context"
	"errors"
	"fmt"

	pb "github.com/Gupta5804/gop2pwallet/proto/wallet"
	"github.com/Gupta5804/gop2pwallet/services/wallet-service/internal/storage"
	"gorm.io/gorm"
)

// WalletService implements the gRPC WalletServiceServer
type WalletService struct {
	
	pb.UnimplementedWalletServiceServer // Embed the unimplemented server for forward-compatibility
	store storage.WalletStore
}

// NewWalletService creates a new WalletService instance
func NewWalletService(store storage.WalletStore) *WalletService{
	return &WalletService{store: store}
}

// CreateWallet is a gRPC method to create a new wallet
func (s *WalletService) CreateWallet(ctx context.Context, req *pb.CreateWalletRequest) (*pb.CreateWalletResponse, error){
	wallet, err := s.store.CreateWallet(ctx, req.UserId)
	if err != nil {
		return nil, fmt.Errorf("failed to create wallet: %w", err)
	}
	return &pb.CreateWalletResponse{WalletId: wallet.ID, UserId: wallet.UserID}, nil
}

// GetBalance is a gRPC method to get a user's balance
// This will also be used by our REST handler
func (s *WalletService) GetBalance(ctx context.Context, req *pb.GetBalanceRequest) (*pb.GetBalanceResponse, error) {
	wallet, err := s.store.GetWalletByUserID(ctx, req.UserId)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("wallet not found for user_id: %s", req.UserId)
		}
		return nil, fmt.Errorf("failed to get balance: %w", err)
	}
	return &pb.GetBalanceResponse{
		Balance: wallet.Balance,
		Currency: wallet.Currency,
	},nil
}
// CreditWallet is a gRPC method to credit a user's wallet
func (s *WalletService) CreditWallet(ctx context.Context, req *pb.CreditWalletRequest) (*pb.CreditWalletResponse, error) {
	if req.Amount <= 0 {
		return nil, fmt.Errorf("Credit amount must be positive")
	}
	wallet, err := s.store.CreditWallet(ctx, req.UserId, req.Amount)
	if err != nil {
		return nil, fmt.Errorf("failed to credit wallet: %w", err)
	}
	return &pb.CreditWalletResponse{
		Success: true,
		NewBalance: wallet.Balance,
	}, nil
}

// DebitWallet is a gRPC method to remove funds
func (s *WalletService) DebitWallet(ctx context.Context, req *pb.DebitWalletRequest) (*pb.DebitWalletResponse, error){
	if req.Amount <= 0 {
		return nil, fmt.Errorf("Debit amount must be positive")
	}

	wallet, err := s.store.DebitWallet(ctx, req.UserId, req.Amount)
	if err != nil {
		// This is our specific business rule check
		if err.Error() == "insufficient funds" {
			return &pb.DebitWalletResponse{
				Success: false,
				NewBalance: wallet.Balance,
				Error: "insufficient_funds",
			},nil
		}

		return nil, fmt.Errorf("failed to debit wallet: %w", err)
	}
	return &pb.DebitWalletResponse{
		Success: true,
		NewBalance: wallet.Balance,
	}, nil
}