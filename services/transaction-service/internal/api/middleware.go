package api

import (
	"context"
	"net/http"
	"strings"

	"github.com/Gupta5804/gop2pwallet/services/transaction-service/internal/config"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

// UserIDKey is the key used to store the user ID in the request context.
type contextKey string
const UserIDKey contextKey = "userID"

// AuthMiddleware creates a middleware for JWT authentication.
func AuthMiddleware(cfg *config.Config) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// 1. Get the Authorization header
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				http.Error(w, "Authorization header required", http.StatusUnauthorized)
				return
			}

			// 2. Extract the token ("Bearer <token>")
			tokenString := strings.TrimPrefix(authHeader, "Bearer ")
			if tokenString == authHeader {
				http.Error(w, "Invalid token format", http.StatusUnauthorized)
				return
			}

			// 3. Parse and validate the token
			token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
				// We only use HMAC, so check the signing method
				if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, jwt.ErrSignatureInvalid
				}
				return []byte(cfg.JWTSecret), nil
			})

			if err != nil {
				http.Error(w, "Invalid token: "+err.Error(), http.StatusUnauthorized)
				return
			}

			// 4. Extract claims and user ID
			if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
				userIDStr, ok := claims["user_id"].(string)
				if !ok {
					http.Error(w, "Invalid token claims: user_id missing or not a string", http.StatusUnauthorized)
					return
				}

				userID, err := uuid.Parse(userIDStr)
				if err != nil {
					http.Error(w, "Invalid token claims: user_id is not a valid UUID", http.StatusUnauthorized)
					return
				}

				// 5. Add user ID to the request context
				ctx := context.WithValue(r.Context(), UserIDKey, userID)
				next.ServeHTTP(w, r.WithContext(ctx))
			} else {
				http.Error(w, "Invalid token", http.StatusUnauthorized)
			}
		})
	}
}

// GetUserIDFromContext retrieves the user ID from the request context.
// Our handlers will use this helper function.
func GetUserIDFromContext(ctx context.Context) (uuid.UUID, bool) {
	userID, ok := ctx.Value(UserIDKey).(uuid.UUID)
	return userID, ok
}