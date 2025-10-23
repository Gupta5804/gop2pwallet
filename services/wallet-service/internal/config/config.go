package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/spf13/viper"
)

type Config struct {
	DatabaseURL string
	RESTPort    string
	GRPCPort    string
	JWTSecret   string
}

func LoadConfig() (*Config, error) {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, reading from environment variables")
	}

	viper.AutomaticEnv()

	cfg := &Config{
		DatabaseURL: getEnv("DATABASE_URL", "postgres://user:password@db:5432/gop2pwallet?sslmode=disable"),
		RESTPort:    getEnv("WALLET_SERVICE_REST_PORT", ":8080"),
		GRPCPort:    getEnv("WALLET_SERVICE_GRPC_PORT", ":50052"),
		JWTSecret:   getEnv("JWT_SECRET", "secret"),
	}
	if cfg.JWTSecret == "" {
		log.Fatal("JWT_SECRET is not set")
	}
	if cfg.DatabaseURL == "" {
		log.Fatal("DATABASE_URL is not set")
	}

	return cfg, nil
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
