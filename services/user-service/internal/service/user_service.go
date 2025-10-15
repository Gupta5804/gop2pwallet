package service

import (
	"fmt"
	"strings"
	"time"

	"github.com/Gupta5804/gop2pwallet/services/user-service/internal/config"
	"github.com/Gupta5804/gop2pwallet/services/user-service/internal/model"
	"github.com/Gupta5804/gop2pwallet/services/user-service/internal/storage"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type UserService interface {
	Register(req *model.RegisterUserRequest) (*model.User, error)
	Login(req *model.LoginUserRequest) (string, error)
	GetUserProfile(id string) (*model.User, error) // new method to get user profile
}

type userService struct {
	store  storage.UserStore // Using the UserStore interface
	config *config.Config
}

// NewUserService is a factory function to create a new UserService instance
func NewUserService(store storage.UserStore, cfg *config.Config) UserService {
	return &userService{
		store:  store,
		config: cfg,
	}
}

// Register handles the user registration logic that takes a RegisterUserRequest and returns a UserResponse or an error
func (s *userService) Register(req *model.RegisterUserRequest) (*model.User, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	user := &model.User{
		Username:     req.Username,
		FirstName:    req.FirstName,
		LastName:     req.LastName,
		Email:        strings.ToLower(req.Email),
		PasswordHash: string(hashedPassword),
	}
	if err := s.store.CreateUser(user); err != nil {
		return nil, err
	}
	return user, nil
}

// Login contains the business logic for authenticating a user and generating a JWT token upon successful login
func (s *userService) Login(req *model.LoginUserRequest) (string, error) {
	// Fetch the user by email
	user, err := s.store.GetUserByEmail(strings.ToLower(req.Email))
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return "", fmt.Errorf("invalid credentials")
		}
		return "", err
	}

	// Compare the provided password with the stored hash
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return "", fmt.Errorf("incorrect password")
	}

	// Generate JWT token upon successful authentication
	jwtSecret := s.config.JWTSecret // Fetching JWT secret from config
	claims := jwt.MapClaims{
		"sub": user.ID,
		"exp": time.Now().Add(72 * time.Hour).Unix(), // Token expires in 72 hours
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(jwtSecret))
	if err != nil {
		return "", fmt.Errorf("failed to generate token %w", err)
	}

	return tokenString, nil
}

func (s *userService) GetUserProfile(id string) (*model.User, error) {
	return s.store.GetUserByID(id)
}
