package main

import (
	"log" // Importing log for logging
	"github.com/gin-gonic/gin" // Importing Gin web framework
	"github.com/Gupta5804/gop2pwallet/services/user-service/internal/config"
	"github.com/Gupta5804/gop2pwallet/services/user-service/internal/storage" 
	"github.com/Gupta5804/gop2pwallet/services/user-service/internal/api"
	"github.com/Gupta5804/gop2pwallet/services/user-service/internal/service"
)

func main() {
	// 0. Load configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Could not load configuration: %v", err)
	}
	service.InitializeGoogleOauthConfig(cfg)
	// 1. Create the storage layer (PostgresStore) (dependency)
	store, err := storage.NewPostgresStore() // Creating a new PostgresStore
	if err != nil {
		log.Fatalf("Could not connect to the database: %v", err)
	}
	// 2. Create the service layer (UserService) and inject the store
	userService := service.NewUserService(store, cfg) // Creating a new UserService
	// 3. Create the API layer (UserHandler) and inject the service
	userHandler := api.NewUserHandler(userService) // Creating a new UserHandler


	router:= gin.Default()

	// 4. Define routes and apply middleware
	// Create a top-level route group for versioning
	// This allows for future versions of the API to coexist
	v1 := router.Group("/api/v1") // Version 1 API group
	{
		// Sub-group for public routes (no authentication required)
		userPublic := v1.Group("/users")
		{
			userPublic.GET("/search",userHandler.SearchUsers) // Search users endpoint
			userPublic.GET("/:username",userHandler.GetUserProfile) // Get user by ID endpoint
			
		}
		// v1.GET("/health",func(c *gin.Context){
		// 	c.JSON(200,gin.H{
		// 		"Status":"UP",
		// 		"Service":"user-service",
		// 	})
		// })
		// Sub-group fro routes that require JWT authentication
		auth := v1.Group("/auth")
		{
			auth.POST("/register", userHandler.RegisterUser) // Register user endpoint
			auth.POST("/login",userHandler.LoginUser) // Login user endpoint
			auth.GET("/google/login",userHandler.HandleGoogleLogin) // for oauth2/google
			auth.GET("/google/callback",userHandler.HandleGoogleCallback) // for oauth2/google
		}
		authProtected := auth.Group("") // Protected routes group
		authProtected.Use(api.AuthMiddleware(cfg)) // Applying the AuthMiddleware to this group
		{
			// The '/me' will now be at /api/v1/auth/me
			authProtected.GET("/me", userHandler.GetMe)
		}

		// (future) Sub-group for public user profile routes (no authentication required)
		// for example, /api/v1/users/search?q=...

	}
	// health check endpoint
	router.GET("/health",func(c *gin.Context){
		c.JSON(200,gin.H{
			"Status":"UP",
			"Service":"user-service",
		})
	})
	log.Println("Starting user-service on port 8080")
	
	if err := router.Run(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}

	
}



