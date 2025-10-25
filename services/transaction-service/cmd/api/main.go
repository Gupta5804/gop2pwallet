package main

import (
	"log"
	"net/http"

	"github.com/Gupta5804/gop2pwallet/services/transaction-service/internal/api"
	"github.com/Gupta5804/gop2pwallet/services/transaction-service/internal/config"
	"github.com/Gupta5804/gop2pwallet/services/transaction-service/internal/grpc_client"
	"github.com/Gupta5804/gop2pwallet/services/transaction-service/internal/mq"
	"github.com/Gupta5804/gop2pwallet/services/transaction-service/internal/service"
	"github.com/Gupta5804/gop2pwallet/services/transaction-service/internal/storage"
	"github.com/gin-gonic/gin"
)

func main() {
	//1 . Load configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// 2. Connect to Database(storage layer)
	store, err := storage.NewPostgresStore(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	log.Println("Successfully connected to database")

	// 3. Connect to WalletService(gRPC client layer)
	walletClient, err := grpc_client.NewWalletServiceClient(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to wallet service: %v", err)
	}

	// 4. Connect to RabbitMQ (publisher)
	publisher, err := mq.NewRabbitMQPublisher(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to RabbitMQ: %v", err)
	}
	defer publisher.Close()

	// 5. Initialize Service Layer (Business logic)
	// This is where we inject the dependencies
	txService:= service.NewTransactionService(store, walletClient, publisher)

	// 6. Intialize API layer (handlers)
	txHandlers := api.NewTransactionHandlers(txService)

	// 7. Setup gin router
	router :=  gin.Default()

	router.GET("health",func(c *gin.Context){
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})
	// setup API v1 routes
	v1 := router.Group("/api/v1")
	{
		// All routes in here are protected by auth middleware
		authRoutes := v1.Group("/transactions")
		authRoutes.Use(api.AuthMiddleware(cfg))
		{
			authRoutes.POST("/send", txHandlers.HandleSendMoney)
			authRoutes.POST("/request", txHandlers.HandleRequestMoney)
			authRoutes.POST("/approve/:tx_id", txHandlers.HandleApproveRequest)
			authRoutes.POST("/reject/:tx_id", txHandlers.HandleRejectRequest)
			authRoutes.GET("/pending", txHandlers.HandleGetPending)
			authRoutes.GET("", txHandlers.HandleGetHistory)
		}
	}

	// 8. Start the server
	log.Printf("Starting server on port %s", cfg.Port)
	if err := router.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}