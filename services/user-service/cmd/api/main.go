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
	v1 := router.Group("/v1") // Version 1 API group
	{
		v1.GET("/health",func(c *gin.Context){
			c.JSON(200,gin.H{
				"Status":"UP",
				"Service":"user-service",
			})
		})
		v1.POST("/users/register", userHandler.RegisterUser) // Register user endpoint
		v1.POST("/users/login",userHandler.LoginUser)
	}
	log.Println("Starting user-service on port 8080")
	
	if err := router.Run(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}

	
}



