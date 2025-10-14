package config

import (
	"fmt"
	"os"

	"github.com/joho/godotenv" // Importing godotenv to load .env files
)

type Config struct {
	DatabaseURL string
	JWTSecret string
}
// 
func LoadConfig() (*Config, error) {
	// Load .env file from the current directory

	godotenv.Load()

	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		return nil, fmt.Errorf("DATABASE_URL environment variable is not set")
	}
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		return nil, fmt.Errorf("JWT_SECRET environment variable is not set")
	}
	return &Config{
		DatabaseURL: databaseURL,
		JWTSecret: jwtSecret,
	}, nil
}