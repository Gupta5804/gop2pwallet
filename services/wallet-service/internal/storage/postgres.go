package storage

import (
	"context"
	"fmt"
	"log"

	"github.com/Gupta5804/gop2pwallet/services/wallet-service/internal/config"
	"github.com/Gupta5804/gop2pwallet/services/wallet-service/internal/model"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)
// WalletStore defines the database operations for wallet
type WalletStore interface {
	CreateWallet(ctx context.Context, userID string) (*model.Wallet,error)
	GetWalletByUserID(ctx context.Context, userID string) (*model.Wallet,error)
	CreditWallet(ctx context.Context, userID string, amount int64) (*model.Wallet,error)
	DebitWallet(ctx context.Context, userID string, amount int64) (*model.Wallet,error)
}

type PostgresStorage struct {
	db *gorm.DB
}

func NewPostgresStore(cfg *config.Config)(*PostgresStorage, error) {
	db, err := gorm.Open(postgres.Open(cfg.DatabaseURL), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to Database : %w",err)
	}

	if err := db.AutoMigrate(&model.Wallet{}); err != nil {
		log.Printf("Warning: failed to auto migrate: %v", err)
	}
	return &PostgresStorage{db: db}, nil
}

// CreateWallet adds a new wallet to the database
func (s *PostgresStorage) CreateWallet(ctx context.Context,userID string) (*model.Wallet, error) {
	wallet := &model.Wallet{
		UserID:    userID,
		Balance:   50000,
		Currency:  "INR",
	}
	if err := s.db.WithContext(ctx).Create(wallet).Error; err != nil {
		return nil, err
	}
	return wallet,nil
}

//GetWalletByUserID finds a wallet by the user's ID
func (s *PostgresStorage) GetWalletByUserID(ctx context.Context, userID string) (*model.Wallet, error) {
	var wallet model.Wallet
	if err := s.db.WithContext(ctx).Where("user_id = ?", userID).First(&wallet).Error; err != nil {
		return nil, err
	}
	return &wallet, nil
}

// CreditWallet Atomically adds funds to a wallet
func (s *PostgresStorage) CreditWallet(ctx context.Context, userID string, amount int64) (*model.Wallet, error) {
	var wallet model.Wallet

	// start a database transaction
	err := s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// 1. Find and lock the wallet row for the duration of the transaction
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("user_id = ?",userID).First(&wallet).Error; err != nil {
			return err
		}

		// 2. Perform the update
		wallet.Balance += amount
		if err := tx.Save(&wallet).Error; err != nil {
			return err
		}

		return nil // return nil to commit the transaction
	})

	if err != nil {
		return nil, err
	}

	return &wallet, nil
}

// DebitWallet atomically removes funds from a wallet
func (s *PostgresStorage) DebitWallet(ctx context.Context, userID string, amount int64) (*model.Wallet, error) {
	var wallet model.Wallet

	// start a database connection
	err := s.db.WithContext(ctx).Transaction(func (tx *gorm.DB) error  {
		// 1. Find and lock the wallet row for the duration of the transaction
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("user_id = ?",userID).First(&wallet).Error; err != nil {
			return err
		}
		// 2. Check for sufficient funds
		if wallet.Balance < amount {
			return fmt.Errorf("insufficient funds")
		}
		// 3. Perform the update
		wallet.Balance -= amount
		if err := tx.Save(&wallet).Error; err != nil {
			return err
		}
		return nil
		
	})
	
	if err != nil {
		return nil, err
	}
	return &wallet, nil
}