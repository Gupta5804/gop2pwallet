package config

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"

)

type Config struct {
	Port string
	JWTSecret string
	RabbitMQURL string
}

func LoadConfig() (*Config, error) {
	// Load .env file from the root
	_ = godotenv.Load()

	port := os.Getenv("PORT")
	if port == "" {
		port =  "8083" // Default port
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		return nil, fmt.Errorf("JWT_SECRET environment variable is not set")
	}
	rabbitMQURL := os.Getenv("RABBITMQ_URL")
	if rabbitMQURL == "" {
		return nil, fmt.Errorf("RABBITMQ_URL environment variable is not set")
	}
	return &Config{
		Port: port,
		JWTSecret: jwtSecret,
		RabbitMQURL: rabbitMQURL,
	}, nil
}