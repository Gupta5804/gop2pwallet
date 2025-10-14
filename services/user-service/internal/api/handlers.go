package api

import (
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
	user, err := h.service.Register(&req)
	if err != nil {
		// 3. Translate service errors to appropriate HTTP responses
		if strings.Contains(err.Error(), "duplicate key value") {
			c.JSON(http.StatusConflict, gin.H{"error": "Email already registered"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to register user"})
		return
	}

	// 4. Create and send the success response
	resp := model.UserResponse{
		ID:        user.ID,
		FirstName: user.FirstName,
		LastName:  user.LastName,
		Email:     user.Email,
		CreatedAt: user.CreatedAt,
	}
	c.JSON(http.StatusCreated, resp)
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
