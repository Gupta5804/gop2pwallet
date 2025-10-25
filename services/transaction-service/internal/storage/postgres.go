package storage
import (
	"context"
	"fmt"
	"log"

	"github.com/Gupta5804/gop2pwallet/services/transaction-service/internal/config"
	"github.com/Gupta5804/gop2pwallet/services/transaction-service/internal/model"
	"github.com/google/uuid"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type TransactionStore interface {
	CreateTransaction(ctx context.Context, tx *model.Transaction) (*model.Transaction, error)
	GetTransactionByID(ctx context.Context, txID uuid.UUID) (*model.Transaction, error)
	UpdateTransaction(ctx context.Context, tx *model.Transaction) error
	GetPendingTransactionsByRecipientID(ctx context.Context, recipientID uuid.UUID) ([]*model.Transaction, error)
	GetTransactionHistoryByUserID(ctx context.Context, userID uuid.UUID, limit int) ([]*model.Transaction, error)
}

type PostgresStorage struct {
	db *gorm.DB
}

// NewPostgresStore creates a new PostgreSQL storage instance (factory method)
func NewPostgresStore(cfg *config.Config) (*PostgresStorage, error) {
	db, err := gorm.Open(postgres.Open(cfg.DatabaseURL), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Auto migrate the transaction schema
	if err := db.AutoMigrate(&model.Transaction{}); err != nil {
		log.Fatalf("Failed to auto-migrate database: %v", err)
	}
	return &PostgresStorage{db: db}, nil
}

// CreateTransaction creates a new transaction in the database
func (s *PostgresStorage) CreateTransaction(ctx context.Context, tx *model.Transaction) (*model.Transaction, error) {
	if err := s.db.WithContext(ctx).Create(tx).Error; err != nil {
		return nil, err
	}
	return tx, nil
}

// GetTransactionByID retrieves a single transaction by its ID
func (s *PostgresStorage) GetTransactionByID(ctx context.Context, txID uuid.UUID) (*model.Transaction, error){
	var tx model.Transaction
	if err := s.db.WithContext(ctx).Where("id = ?", txID).First(&tx).Error; err != nil {
		return nil, err
	}
	return &tx, nil
}

// UpdateTransaction Updates a transaction in the database
// we will use this for approvals and rejections
func (s *PostgresStorage) UpdateTransaction (ctx context.Context, tx *model.Transaction) error{
	return s.db.WithContext(ctx).Save(tx).Error
}

// GetPendingTransactionsByRecepient fetches all "pending transactions" for a specific user
// This is for the "view pending" endpoint
func (s *PostgresStorage) GetPendingTransactionsByRecipientID(ctx context.Context, recipientID uuid.UUID) ([]*model.Transaction, error){
	var transactions []*model.Transaction
	if err := s.db.WithContext(ctx).
		Where("recipient_user_id = ? AND status = ?", recipientID, model.StatusPending).
		Order("created_at desc").
		Find(&transactions).Error; err != nil {
			return nil, err
		}
	return transactions, nil
}

// GetTransactionHistoryByUserID fetches all completed/failed/rejected transactions for a user
// This is for the "Get History" endpoint

func (s *PostgresStorage) GetTransactionHistoryByUserID (ctx context.Context, userID uuid.UUID, limit int) ([]*model.Transaction,error){
	var transactions []*model.Transaction

	query := s.db.WithContext(ctx).
		Where("(sender_user_id = ? OR recipient_user_id = ?) AND status != ?", userID, userID, model.StatusPending).
		Order("created_at desc")
	// Apply limit if provided (limit > 0)
	if limit > 0 {
		query = query.Limit(limit)
	}

	if err := query.Find(&transactions).Error; err != nil {
		return nil, err
	}
	return transactions, nil
}

