package api

import (
	// "crypto/rand"
	// "encoding/base64"
	"net/http" // Importing net/http for HTTP status codes
	"strings"

	"github.com/Gupta5804/gop2pwallet/services/user-service/internal/model"
	"github.com/Gupta5804/gop2pwallet/services/user-service/internal/service"

	"github.com/gin-gonic/gin" // Importing Gin web framework
	// Importing JWT library
	// Importing bcrypt for password hashing
	// Importing GORM for ORM functionality
)

// Userhandler now holds a reference to the UserService and not the store directly
type UserHandler struct {
	service service.UserService
}
type GoogleLoginRequest struct {
	GoogleToken string `json:"googleToken" binding:"required"`
}
// NewUserHandler is a factory function to create a new UserHandler instance
func NewUserHandler(userService service.UserService) *UserHandler {
	return &UserHandler{service: userService}
}

// RegisterUser handles user registration requests
func (h *UserHandler) RegisterUser(c *gin.Context) { // Handler function for user registration
	var req model.RegisterUserRequest
	// 1. bind and validate the incoming JSON request
	if err := c.ShouldBindJSON(&req); err != nil { // Binding JSON request to struct
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}
	// 2. Call the service layer to handle business logic
	token, err := h.service.Register(&req)
	if err != nil {
		// 3. Translate service errors to appropriate HTTP responses
		if strings.Contains(err.Error(), "duplicate key value") {
			c.JSON(http.StatusConflict, gin.H{"error": "Email already registered"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to register user"})
		return
	}

	
	c.JSON(http.StatusCreated, gin.H{"token": token})
}

// LoginUser handles user login requests
func (h *UserHandler) LoginUser(c *gin.Context) {
	var req model.LoginUserRequest
	// 1. Bind and validate the incoming JSON request
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	// 2. Call the service layer to handle business logic
	tokenString, err := h.service.Login(&req)
	if err != nil {
		// 3. Translate service errors to appropriate HTTP responses
		if strings.Contains(err.Error(), "invalid credentials") {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to login"})
		return
	}

	// 4. Create and send the success response with JWT token
	c.JSON(http.StatusOK, gin.H{"token": tokenString})
}

func (h *UserHandler) GetMe(c *gin.Context) {
	// 1. Retrieve the user ID from the Gin context (set by the AuthMiddleware)
	// Our middleware sets "userID" in the context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
		return
	}

	// 2. Call the service layer to fetch the user profile
	user, err := h.service.GetUserProfile(userID.(string))
	if err != nil {
		// this c
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
	}

	// 3. Format the response using our safe UserResponse DTO
	// This prevents leaking sensitive information like password hashes
	resp := model.UserResponse{
		ID:        user.ID,
		Username:  user.Username,
		FirstName: user.FirstName,
		LastName:  user.LastName,
		Email:     user.Email,
		CreatedAt: user.CreatedAt,
	}
	c.JSON(http.StatusOK, resp)
}
func (h *UserHandler) SearchUsers(c *gin.Context) {
	// 1. Get the search query from the URL parameters
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest,gin.H{"error":"Query parameter 'q' is required"})
		return
	}

	// 2. Call the service layer to perform the search
	users, err := h.service.SearchUsers(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to search users"})
		return
	}

	// 3. Convert the list of User models to UserResponse DTOs
	var userResponses []model.UserResponse
	for _, user := range users {
		userResponses = append(userResponses, model.UserResponse{
			ID:		user.ID,
			Username:	user.Username,
			FirstName:	user.FirstName,
			LastName:	user.LastName,
			Email:		user.Email,
			CreatedAt:	user.CreatedAt,
		})
	}

	// if no users found, return empty array instead of null
	if userResponses == nil {
		userResponses = []model.UserResponse{}
	}
	c.JSON(http.StatusOK, userResponses)

}

func (h *UserHandler) GetUserProfile(c *gin.Context) {
	// 1. Get the user ID from the URL parameters
	username := c.Param("username")

	//2. Call the service layer to fetch the user profile
	user, err := h.service.GetUserProfileByUsername(username)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// 3. Format the response using our safe UserResponse DTO
	resp := model.UserResponse{
		ID:		user.ID,
		Username:	user.Username,
		FirstName:	user.FirstName,
		LastName:	user.LastName,
		Email:		user.Email,
		CreatedAt:	user.CreatedAt,
	}
	c.JSON(http.StatusOK, resp)
}
func (h *UserHandler) HandleGoogleTokenLogin(c *gin.Context) {
	var req GoogleLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}
	token, err := h.service.ProcessGoogleTokenLogin(req.GoogleToken)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to login"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"token": token})
}

// func (h *UserHandler) HandleGoogleCallback(c *gin.Context) {
// 	// 1. Verify the state cookie to prevent CSRF attacks
// 	oauthState, _ := c.Cookie("oauthstate")
// 	if c.Query("state") != oauthState {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid OAuth state"})
// 		return
// 	}
// 	// 2. Get the authorization code from the query parameters
// 	code := c.Query("code")
	
// 	// 3. Pass the code to the service layer to handle the OAuth flow
// 	token, err := h.service.HandleGoogleCallback(code)
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
// 		return
// 	}

// 	// 4. On success, redirect the user to the frontend Dashboard
// 	// we pass the token as a URL parameter
// 	// The frontend will be responsible for storing it (e.g. in localStorage)
// 	// In a real application, consider using HTTP-only cookies for better security
// 	c.Redirect(http.StatusTemporaryRedirect, "http://localhost:3000/dashboard?token="+token)
// }

// HealthCheck returns the service status
func (h *UserHandler) HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "active",
		"service": "user-service",
	})
}
