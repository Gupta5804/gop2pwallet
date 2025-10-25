package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type TransactionStatus string

const (
	StatusPending   TransactionStatus = "pending"
	StatusCompleted TransactionStatus = "completed"
	StatusFailed    TransactionStatus = "failed"
	StatusRejected  TransactionStatus = "rejected"
)

type TransactionType string

const (
	TypeSend    TransactionType = "send"
	TypeRequest TransactionType = "request"
)

type Transaction struct {
	ID            uuid.UUID         `gorm:"type:uuid;default:gen_random_uuid();primary_key" json:"id"`
	SenderUserID  uuid.UUID         `gorm:"type:uuid;not null;index" json:"send_user_id"`
	RecepientID   uuid.UUID         `gorm:"type:uuid;not null;index" json:"recepient_user_id"`
	Amount        int64             `gorm:"not null" json:"amount"`
	Status        TransactionStatus `grom:"type:varchar(20);not null;index" json:"status"`
	Type          TransactionType   `gorm:"type:varchar(20);not null" json:"type"`
	FailureReason *string           `gorm:"type:text" json:"failure_reason,omitempty"`
	CreatedAt     time.Time         `gorm:"default:now()" json:"created_at"`
	UpdatedAt     time.Time         `gorm:"default:now()" json:"updated_at"`
}

// BeforeCreate is a GORM hook that runs before a new record is created
// It is for setting the CreatedAt and UpdatedAt fields
func (tx *Transaction) BeforeCreate(db *gorm.DB) (err error) {
	if tx.ID == uuid.Nil {
		tx.ID = uuid.New()
	}
	tx.CreatedAt = time.Now()
	tx.UpdatedAt = time.Now()
	return
}

// BeforeUpdate is a GORM hook that runs before a record is updated
func (tx *Transaction) BeforeUpdate(db *gorm.DB) (err error) {
	tx.UpdatedAt = time.Now()
	return
}
