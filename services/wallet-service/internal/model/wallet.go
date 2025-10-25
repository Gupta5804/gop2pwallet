// services/wallet-service/internal/model/wallet.go
package model

import "time"

type Wallet struct {
	ID        string    `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID    string    `gorm:"type:uuid;not null;unique" json:"user_id"`
	Balance   int64   `gorm:"not null;default:0" json:"balance"`
	Currency  string    `gorm:"type:varchar(255);not null;default:'INR'" json:"currency"`
	CreatedAt time.Time `gorm:"default:current_timestamp" json:"created_at"`
	UpdatedAt time.Time `grom:"default:current_timestamp" json:"updated_at"`
}
