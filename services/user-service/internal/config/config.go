package config

import (
	"fmt"
	"os"

	"github.com/joho/godotenv" // Importing godotenv to load .env files
)

type Config struct {
	DatabaseURL        string
	JWTSecret          string
	GoogleClientID     string
	GoogleClientSecret string
}

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
	googleClientID := os.Getenv("GOOGLE_CLIENT_ID")
	if googleClientID == "" {
		return nil, fmt.Errorf("GOOGLE_CLIENT_ID environment variable is not set")
	}
	googleClientSecret := os.Getenv("GOOGLE_CLIENT_SECRET")
	if googleClientSecret == "" {
		return nil, fmt.Errorf("GOOGLE_CLIENT_SECRET environment variable is not set")
	}
	return &Config{
		DatabaseURL:        databaseURL,
		JWTSecret:          jwtSecret,
		GoogleClientID:     googleClientID,
		GoogleClientSecret: googleClientSecret,
	}, nil
}
