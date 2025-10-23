package api
import (
	"net/http"

	pb "github.com/Gupta5804/gop2pwallet/proto/wallet"
	"github.com/Gupta5804/gop2pwallet/services/wallet-service/internal/service"
	"github.com/gin-gonic/gin"
)

// WalletHandler holds the service instance
type WalletHandler struct {
	service *service.WalletService
}

// NewWalletHandler creates a new handler (factory function)
func NewWalletHandler(service *service.WalletService) *WalletHandler {
	return &WalletHandler{service: service}
}

// GetBalance is a handler for the GET /api/v1/wallet/balance request
func (h *WalletHandler) GetBalance(c *gin.Context) {
	// 1. Get userID from the context (set by AuthMiddleware)
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error":"User ID not found in token"})
		return
	}
	userIDStr, ok := userID.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID format in token"})
		return
	}

	// 2. Call the service layer(our gRPC method)
	// We are calling our own service's gRPC method, which is clean and efficient
	// We don't have to deal with gRPC internals
	req := &pb.GetBalanceRequest{UserId: userIDStr} // Construct the request
	res, err := h.service.GetBalance(c.Request.Context(), req) // Call the gRPC method
	if err != nil {
		// This will catch "wallet not found" errors from the service layer
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	// 3. Return the response as JSON
	// We'll return the raw gRPC response object , which marshals to JSON perfectly
	c.JSON(http.StatusOK, res)
}