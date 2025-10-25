package config

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port string
	DatabaseURL string
	JWTSecret string
	WalletServiceGRPCAddr string
	RabbitMQURL string
}

func LoadConfig() (*Config, error) {
	_= godotenv.Load()
	port := os.Getenv("PORT")
	if port == "" {
		port = "8082"
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		return nil, fmt.Errorf("DATABASE_URL environment variable is not set")
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		return nil, fmt.Errorf("JWT_SECRET environment variable is not set")
	}

	walletServiceGRPCAddr := os.Getenv("WALLET_SERVICE_GRPC_ADDR")
	if walletServiceGRPCAddr == "" {
		return nil, fmt.Errorf("WALLET_SERVICE_GRPC_ADDR environment variable is not set")
	}

	rabbitMQURL := os.Getenv("RABBITMQ_URL")
	if rabbitMQURL == "" {
		return nil, fmt.Errorf("RABBITMQ_URL environment variable is not set")
	}

	return &Config{
		Port: port,
		DatabaseURL: dbURL,
		JWTSecret: jwtSecret,
		WalletServiceGRPCAddr: walletServiceGRPCAddr,
		RabbitMQURL: rabbitMQURL,
	}, nil
}