package main

import (
	"log"
	"net"

	pb "github.com/Gupta5804/gop2pwallet/proto/wallet"
	"github.com/Gupta5804/gop2pwallet/services/wallet-service/internal/api"
	"github.com/Gupta5804/gop2pwallet/services/wallet-service/internal/config"
	"github.com/Gupta5804/gop2pwallet/services/wallet-service/internal/service"
	"github.com/Gupta5804/gop2pwallet/services/wallet-service/internal/storage"
	"github.com/gin-gonic/gin"
	"google.golang.org/grpc"
)

func main() {
	// 1. Load config
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Could not load configuration: %v", err)
	}

	//2. Init storage
	store, err := storage.NewPostgresStore(cfg)
	if err != nil {
		log.Fatalf("Could not connect to the database: %v", err)
	}
	// 3. Init service
	walletService := service.NewWalletService(store)

	// 4. Init handlers
	walletHandler := api.NewWalletHandler(walletService)

	// 5. Start the gRPC server in a goroutine
	go func() {
		lis, err := net.Listen("tcp", cfg.GRPCPort) // listen on gRPC port
		if err != nil {
			log.Fatalf("Failed to listen: %v", err)
		}
		s := grpc.NewServer()                            // create a new gRPC server
		pb.RegisterWalletServiceServer(s, walletService) // register the WalletService server
		log.Printf("server listening at %v", lis.Addr())
		if err := s.Serve(lis); err != nil {
			log.Fatalf("failed to serve: %v", err)
		}
	}()

	// 6. start Gin (REST) server
	router := gin.Default()

	// define auth middleware
	authMiddleware := api.AuthMiddleWare(cfg)

	// Setup routes
	v1 := router.Group("/api/v1")
	{
		walletRoutes := v1.Group("/wallet")
		{
			walletRoutes.GET("/balance", authMiddleware, walletHandler.GetBalance)
		}
	}

	router.GET("/health", walletHandler.HealthCheck)

	log.Printf("REST server listening on %s", cfg.RESTPort)
	if err := router.Run(cfg.RESTPort); err != nil { // start the REST server
		log.Fatalf("Failed to run REST server: %v", err)
	}
}
