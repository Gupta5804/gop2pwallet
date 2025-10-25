// services/user-service/internal/api/handlers.go

package api

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/Gupta5804/gop2pwallet/services/transaction-service/internal/config"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// AuthMiddleware is a Gin middleware for JWT authentication
// It checks for the presence and validity of a JWT token in the Authorization header
// If the token is valid, it extracts the user ID and sets it in the Gin context
// If the token is missing or invalid, it responds with a 401 Unauthorized status
// Authorization header comes from the client in the format: "Bearer <token>"
// comes in every request that needs authentication and is validated here
// this middleware is applied to routes that require authentication

func AuthMiddleware(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Get the token from the Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error":"Authorization header missing"})
			return
		}
		// The header should be in the format "Bearer <token>"
		parts := strings.Split(authHeader," ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid Authorization header format"})
			return
		}
		tokenString := parts[1]

		// 2. Parse and validate the token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Make sure that the token's signing method is what you expect
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method %v",token.Header["alg"])
			}
			return []byte(cfg.JWTSecret), nil
		})

		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			return
		}

		// 3. If the token is valid, extract the user ID from the token claims
		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
			// "sub" is a standard claim for the subject (user ID in this case)
			userID := claims["sub"].(string)
			// Set the user ID in the Gin context for use in handlers
			c.Set("userID", userID)
		} else {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			return
		}

		// 4. Call the next handler in the chain
		c.Next()
	}
}

// Note: This code assumes that the JWT token contains a "sub" claim with the user ID