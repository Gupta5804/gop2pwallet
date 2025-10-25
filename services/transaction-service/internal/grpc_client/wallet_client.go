// wallet_client.go
package grpc_client

import (
	"log"

	"github.com/Gupta5804/gop2pwallet/services/transaction-service/internal/config"
	walletpb "github.com/Gupta5804/gop2pwallet/proto/wallet"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

// NewWalletServiceClient creates and returns a new WalletService gRPC client
func NewWalletServiceClient(cfg *config.Config) (walletpb.WalletServiceClient, error) {
	// we use insecure.NewCredentials() for simplicity in our internal network
	// For a real-world application, you would use secure credentials
	conn, err := grpc.NewClient(cfg.WalletServiceGRPCAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("Failed to connect to wallet service: %v", err)
		return nil, err
	}
	log.Printf("Successfully connected to wallet service at %s", cfg.WalletServiceGRPCAddr)
	
	// Create a new client stub

	client := walletpb.NewWalletServiceClient(conn)
	return client, nil
}

