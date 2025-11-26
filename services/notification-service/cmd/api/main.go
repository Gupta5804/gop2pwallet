package main

import (
	"log"

	"github.com/Gupta5804/gop2pwallet/services/notification-service/internal/api"
	"github.com/Gupta5804/gop2pwallet/services/notification-service/internal/config"
	"github.com/Gupta5804/gop2pwallet/services/notification-service/internal/mq"
	"github.com/Gupta5804/gop2pwallet/services/notification-service/internal/websocket"
	"github.com/gin-gonic/gin"
)

func main() {
	// 1. Load configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// 2. Create a new WebSocket hub
	hub := websocket.NewHub()

	// start the hub's main loop
	go hub.Run()

	// 3. Create a new RabbitMQ consumer
	consumer, err := mq.NewNotificationConsumer(cfg, hub)
	if err != nil {
		log.Fatalf("Failed to create RabbitMQ consumer: %v", err)
	}
	defer consumer.Close()

	// start the consumer's listening loop
	go consumer.Start()

	// 4. Create the API Handler
	wsHandler := api.NewWebSocketHandler(hub, cfg)

	// 5. Create the Gin Router
	router := gin.Default()

	// Health check endpoint
	router.GET("/health", wsHandler.HealthCheck)

	// WebSocket endpoint
	router.GET("/ws", wsHandler.HandleWebSocket)

	// Start the server
	log.Printf("Starting server on port %s", cfg.Port)
	if err := router.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
