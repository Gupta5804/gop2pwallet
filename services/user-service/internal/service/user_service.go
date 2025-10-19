package service

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/Gupta5804/gop2pwallet/services/user-service/internal/config"
	"github.com/Gupta5804/gop2pwallet/services/user-service/internal/model"
	"github.com/Gupta5804/gop2pwallet/services/user-service/internal/storage"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	// for oauth2/google

	// "google.golang.org/api/oauth2/v2"
	"google.golang.org/api/idtoken"
)

// Global variable to hold the OAuth2 configuration
// var googleOauthConfig *oauth2.Config

// // IntializeGoogleOauthConfig initializes the Google OAuth2 configuration
// func InitializeGoogleOauthConfig(cfg *config.Config) {
// 	googleOauthConfig = &oauth2.Config{
// 		RedirectURL:  "http://localhost:8080/api/v1/auth/google/callback",
// 		ClientID:     cfg.GoogleClientID,
// 		ClientSecret: cfg.GoogleClientSecret,
// 		Scopes: []string{
// 			"https://www.googleapis.com/auth/userinfo.email",
// 			"https://www.googleapis.com/auth/userinfo.profile",
// 		},
// 		Endpoint: google.Endpoint,
// 	}
// }

type UserService interface {
	Register(req *model.RegisterUserRequest) (string, error)
	Login(req *model.LoginUserRequest) (string, error)
	GetUserProfile(id string) (*model.User, error)                 // new method to get user profile
	SearchUsers(query string) ([]*model.User, error)               // new method to search users
	GetUserProfileByUsername(username string) (*model.User, error) // new method to get user profile by username
	//GetGoogleLoginURL(state string) string                         // for oauth2/google
	// HandleGoogleCallback(code string) (string, error)              // for oauth2/google
	ProcessGoogleTokenLogin(idToken string) (string, error)
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
func (s *userService) Register(req *model.RegisterUserRequest) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return "", fmt.Errorf("failed to hash password: %w", err)
	}

	user := &model.User{
		Username:     req.Username,
		FirstName:    req.FirstName,
		LastName:     req.LastName,
		Email:        strings.ToLower(req.Email),
		PasswordHash: string(hashedPassword),
	}
	createdUser, err := s.store.CreateUser(user)
	if err != nil {
		return "", err
	}
	return s.generateJWT(createdUser)
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

	return s.generateJWT(user)
}

func (s *userService) GetUserProfile(id string) (*model.User, error) {
	return s.store.GetUserByID(id)
}

func (s *userService) SearchUsers(query string) ([]*model.User, error) {
	return s.store.SearchUsers(query)
}

func (s *userService) GetUserProfileByUsername(username string) (*model.User, error) {
	user, err := s.store.GetUserByUsername(username)
	if err != nil {
		return nil, fmt.Errorf("user not found")
	}
	return user, nil
}

// func (s *userService) GetGoogleLoginURL(state string) string {
// 	return googleOauthConfig.AuthCodeURL(state)
// }

// func getUserInfoFromGoogle(token *oauth2.Tokeninfo) ([]byte, error) {
// 	response, err := http.Get("https://www.googleapis.com/oauth2/v2/userinfo?access_token=" + token.AccessToken)
// 	if err != nil {
// 		return nil, fmt.Errorf("failed getting user info: %s", err.Error())
// 	}
// 	defer response.Body.Close()
// 	return io.ReadAll(response.Body)
// }

// func (s *userService) HandleGoogleCallback(code string) (string, error) {
// 	// 1. Exchange the authorization code for an access token
// 	token, err := googleOauthConfig.Exchange(context.Background(), code)
// 	if err != nil {
// 		return "", fmt.Errorf("code exchange failed: %s", err.Error())
// 	}

// 	// 2. Use the access token to get user info from Google
// 	userInfoBytes, err := getUserInfoFromGoogle(token)
// 	if err != nil {
// 		return "", fmt.Errorf("failed to get user info: %s", err.Error())
// 	}

// 	var userInfo struct {
// 		ID    string `json:"id"`
// 		Email string `json:"email"`
// 		Name  string `json:"name"`
// 	}
// 	if err := json.Unmarshal(userInfoBytes, &userInfo); err != nil {
// 		return "", fmt.Errorf("failed to unmarshal user info: %s", err.Error())
// 	}
// 	// 3. Check if the user already exists in the database
// 	user, err := s.store.GetUserByGoogleID(userInfo.ID)
// 	if err != nil && err != gorm.ErrRecordNotFound {
// 		return "", err
// 	}

// 	// 4. If the user does not exist, create a new user record
// 	if err == gorm.ErrRecordNotFound {
// 		nameParts := strings.SplitN(userInfo.Name, " ", 2)
// 		firstName := nameParts[0]
// 		lastName := ""
// 		if len(nameParts) > 1 {
// 			lastName = nameParts[1]
// 		}
// 		// Create a simple unique username
// 		username := strings.Split(userInfo.Email, "@")[0]

// 		newUser := &model.User{
// 			GoogleID:  userInfo.ID,
// 			Email:     userInfo.Email,
// 			FirstName: firstName,
// 			LastName:  lastName,
// 			Username:  username,
// 			// No password since it's OAuth
// 		}
// 		if err := s.store.CreateUser(newUser); err != nil {
// 			return "", fmt.Errorf("failed to create user: %w", err)
// 		}
// 		user = newUser
// 	}

// 	// 5. Generate a JWT token for the user
// 	return s.generateJWT(user)

// }

// Add this helpers method to generate JWT tokens
func (s *userService) generateJWT(user *model.User) (string, error) {
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

func (s *userService) ProcessGoogleTokenLogin(idToken string) (string, error) {
	// 1. Verify the ID token with google's servers
	payload, err := idtoken.Validate(context.Background(), idToken, s.config.GoogleClientID)
	if err != nil {
		return "", fmt.Errorf("failed to validate token %w", err)
	}
	//2. Get user info from the payload
	googleID := payload.Subject
	email, _ := payload.Claims["email"].(string)
	firstName, _ := payload.Claims["given_name"].(string)
	lastName, _ := payload.Claims["family_name"].(string)

	//3. Check if the user already exists in the database
	user, err := s.store.GetUserByGoogleID(googleID)
	if err != nil {
		// if not found be google ID, try by email
		user, err = s.store.GetUserByEmail(email)
		if err != nil {
			// if not found by email, create a new user
			newUser := &model.User{
				GoogleID:  googleID,
				Email:     email,
				FirstName: firstName,
				LastName:  lastName,
				Username:  email,
				// No password since it's OAuth
			}
			createdUser, err := s.store.CreateUser(newUser)
			if err != nil {
				return "", fmt.Errorf("failed to create user: %w", err)
			}
			user = createdUser
		} else {
			// if found by email, update the google ID
			user.GoogleID = googleID
			if err := s.store.UpdateUser(user); err != nil {
				return "", fmt.Errorf("could not link google account: %w", err)
			}
		}
	}
	return s.generateJWT(user)
}
