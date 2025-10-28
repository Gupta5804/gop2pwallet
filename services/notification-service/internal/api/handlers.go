package api

import (
	"log"
	"net/http"

	"github.com/Gupta5804/gop2pwallet/services/notification-service/internal/config"
	"github.com/Gupta5804/gop2pwallet/services/notification-service/internal/websocket"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	ws "github.com/gorilla/websocket"
)

// websocketUpgrader configures the parameters for upgrading an HTTP connection
// to a websocket connection.
var upgrader = ws.Upgrader{
	// Allow all origins for now. In production, we should restrict this
	// to our frontend's domain
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

// WebSocketHandler holds the dependencies for the WebSocket Handler
type WebSocketHandler struct {
	hub *websocket.Hub
	cfg *config.Config
}

// NewWebSocketHandler creates a new WebsocketHandler
func NewWebSocketHandler(hub *websocket.Hub, cfg *config.Config) *WebSocketHandler {
	return &WebSocketHandler{
		hub: hub,
		cfg: cfg,
	}
}

// HandleWebSocket is the Gin Handler for the /ws endpoint
// It upgrades the connection and registers the client with the hub
func (h *WebSocketHandler) HandleWebSocket(c *gin.Context) {
	// 1. Get the token from the query parameter (/ws?token=<token>)
	tokenString := c.Query("token")
	if tokenString == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing token"})
		return
	}

	// 2. Validate the JWT token
	userID, err := h.validateToken(tokenString)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// 3. Upgrade the HTTP connection to a WebSocket Connection
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("Failed to upgrade connection: %v", err)
		return
	}

	// 4. Create a new client
	client := websocket.NewClient(h.hub, conn, userID)

	// 5. Register the client with the hub
	client.Run()

}

func (h *WebSocketHandler) validateToken(tokenString string) (uuid.UUID, error) {
	var userID uuid.UUID

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrSignatureInvalid
		}
		return []byte(h.cfg.JWTSecret), nil
	})
	if err != nil {
		return userID, err
	}
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		userIDStr, ok := claims["user_id"].(string)
		if !ok {
			return userID, jwt.ErrInvalidKey
		}
		userID, err = uuid.Parse(userIDStr)
		if err != nil {
			return userID, jwt.ErrInvalidKey
		}
		return userID, nil
	}
	return userID, jwt.ErrInvalidKey
}
