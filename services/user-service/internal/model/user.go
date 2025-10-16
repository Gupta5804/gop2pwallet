package model

import (
	"time"

	"gorm.io/gorm" // Importing GORM for ORM functionality
)

// User is the core struct that maps to the users table in the database
type User struct { // User model definition
	ID           string `gorm:"type:uuid;primary_key;default:gen_random_uuid()"` // UUID primary key with default generation
	Username	 string `gorm:"type:varchar(255);uniqueIndex;not null"`          // Username field
	FirstName    string `gorm:"type:varchar(255);not null"`                      // First name field
	LastName     string `gorm:"type:varchar(255);not null"`                      // Last name field
	Email        string `gorm:"type:varchar(255);uniqueIndex;not null"`
	// passwordhash can be null for users who register via Google OAuth
	PasswordHash string `gorm:"type:varchar(255);"`
	GoogleID     string `gorm:"type:varchar(255);"` // Google OAuth ID, unique if present
	CreatedAt    time.Time
	UpdatedAt    time.Time
	DeletedAt    gorm.DeletedAt `gorm:"index"` // Soft delete field
}

// --- API Data Transfer Objects (DTOs) ---
// RegisterUserRequest represents the expected payload for user registration
// The `binding` tags are used by Gin for request validation
type RegisterUserRequest struct {
	Username  string `json:"username" binding:"required"`
	FirstName string `json:"firstName" binding:"required"`
	LastName  string `json:"lastName" binding:"required"`
	Email     string `json:"email" binding:"required,email"`
	Password  string `json:"password" binding:"required,min=8"`
}

// LoginUserRequest defines the shape of the JSON body for login endpoint
type LoginUserRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// UserResponse defines the safe, public shape of a user object returned by the API
// It explicitly omits sensitive fields like password hash and google ID
type UserResponse struct {
	ID        string    `json:"id"`
	Username  string    `json:"username"`
	FirstName string    `json:"firstName"`
	LastName  string    `json:"lastName"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"createdAt"`
}
