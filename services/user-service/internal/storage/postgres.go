package storage

import (
	"fmt" // Importing fmt for string formatting
	"log" // Importing log for logging errors
	"os"  // Importing os for environment variable access

	"github.com/Gupta5804/gop2pwallet/services/user-service/internal/model"
	
	"gorm.io/driver/postgres" // Importing GORM PostgreSQL driver
	"gorm.io/gorm"            // Importing GORM for ORM functionality
)

type UserStore interface {
	CreateUser(user *model.User) error
	GetUserByEmail(email string) (*model.User, error)
	GetUserByID(id string) (*model.User, error) // for jwt middleware
	SearchUsers(query string) ([]*model.User, error) // for public user profiles 
	GetUserByUsername(username string) (*model.User, error) // for public user profiles
	GetUserByGoogleID(googleID string) (*model.User, error) // for oauth2/google
}
// postgresStore holds the database connection object
type PostgresStore struct { // Defining PostgresStore struct
	DB *gorm.DB // DB field of type *gorm.DB
}

// NewPostgresStore establishes a connection to the PostgreSQL database
// runs auto-migration and returns a new PostgresStore instance
func NewPostgresStore() (*PostgresStore, error) { // Function to create a new PostgresStore
	// Fetching the database URL from environment variables
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		return nil, fmt.Errorf("DATABASE_URL environment variable is not set")
	}
	// Open a connection to PostgreSQL using GORM
	db, err := gorm.Open(postgres.Open(databaseURL), &gorm.Config{}) // Opening a connection to the PostgreSQL database

	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	log.Println("Successfully connected to the database")

	// Run GORM's auto migration
	// This inspects your Go structs (model.User)
	// and automatically creates or updates the database tables to match their structure
	err = db.AutoMigrate(&model.User{}) // Auto-migrating the User model
	if err != nil {
		return nil, fmt.Errorf("failed to auto migrate: %w", err)
	}
	log.Println(" Database migration completed")

	return &PostgresStore{DB: db}, nil

}

// ---- User Management Methods ----
// CreateUser inserts a new user record into the database
func (s *PostgresStore) CreateUser(user *model.User) error {
	// GORM's .Create method handles the SQL INSERT statement for you
	// concise and less error-prone than writing raw SQL
	result := s.DB.Create(user)
	return result.Error
}

// GetUserByEmail retrieves a single user from the database by their email address
func (s *PostgresStore) GetUserByEmail(email string) (*model.User, error) {
	var user model.User
	// GORM's .Where and .First methods build a SELECT query
	// .First will automatically return gorm.ErrRecordNotFound if no record matches
	result := s.DB.Where("email = ?", email).First(&user)
	if result.Error != nil {
		return nil, result.Error
	}
	return &user, nil
}

func (s *PostgresStore) GetUserByID(id string) (*model.User, error) {
	var user model.User
	// GORM's .First method is efficient for primary key lookups
	result := s.DB.First(&user, "id = ?", id)
	if result.Error != nil {
		return nil, result.Error // Return the error if the user is not found or any other error occurs
	}
	return &user, nil
}

func (s *PostgresStore) SearchUsers(query string) ([]*model.User, error) {
	var users []*model.User

	// The '%' wildcards allow for partial matches before and after the query string
	searchQuery := "%" + query + "%"

	// we user GORM's .Where with OR conditions to search across all desired fields
	result := s.DB.Where(
		"username ILIKE ? OR first_name ILIKE ? OR last_name ILIKE ? OR email ILIKE ?",
		searchQuery, searchQuery, searchQuery, searchQuery,
	).Limit(10).Find(&users) // we add a limit to avoid too many results

	if result.Error != nil {
		return nil, result.Error
	}
	return users, nil
}
// GetUserByUsername retrieves a single user from the database by their username
func (s *PostgresStore) GetUserByUsername(username string) (*model.User, error) {
	var user model.User
	// Using .First is efficient for primary key lookups
	result := s.DB.Where("username = ?", username).First(&user)
	if result.Error != nil {
		// this will correctly return gorm.ErrRecordNotFound if no user is found
		return nil, result.Error
	}
	return &user, nil
}
func (s *PostgresStore) GetUserByGoogleID(googleID string) (*model.User, error) {
	var user model.User
	result := s.DB.Where("google_id = ?", googleID).First(&user)
	if result.Error != nil {
		return nil, result.Error
	}
	return &user,nil
}