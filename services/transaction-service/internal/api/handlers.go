package api

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/Gupta5804/gop2pwallet/services/transaction-service/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// TransactionHandlers holds the service to be used by the HTTP handlers.
type TransactionHandlers struct {
	service *service.TransactionService
}

// NewTransactionHandlers creates a new handler struct.
func NewTransactionHandlers(s *service.TransactionService) *TransactionHandlers {
	return &TransactionHandlers{service: s}
}

// --- Request/Response Structs ---

type SendMoneyRequest struct {
	RecipientID string `json:"recipient_id" binding:"required"`
	Amount      int64  `json:"amount" binding:"required,gt=0"` // Expecting amount in paise (cents)
}

type RequestMoneyRequest struct {
	RequesteeID string `json:"requestee_id" binding:"required"`
	Amount      int64  `json:"amount" binding:"required,gt=0"` // Expecting amount in paise (cents)
}

// --- Handler Functions ---

// HandleSendMoney handles the POST /api/v1/transactions/send request.
func (h *TransactionHandlers) HandleSendMoney(c *gin.Context) {
	// 1. Get authenticated user ID from context
	senderID, err := h.getUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// 2. Decode and validate the JSON request body
	var req SendMoneyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 3. Validate recipient_id and check for self-payment
	recipientID, err := uuid.Parse(req.RecipientID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid recipient_id"})
		return
	}
	if senderID == recipientID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot send money to yourself"})
		return
	}

	// 4. Call the service
	tx, err := h.service.SendMoney(c.Request.Context(), senderID, recipientID, req.Amount)
	if err != nil {
		// Service layer will return specific errors, e.g., "Insufficient funds"
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 5. Send success response
	c.JSON(http.StatusCreated, tx)
}

// HandleRequestMoney handles the POST /api/v1/transactions/request request.
func (h *TransactionHandlers) HandleRequestMoney(c *gin.Context) {
	// 1. Get authenticated user ID (the requester)
	requesterID, err := h.getUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// 2. Decode and validate the JSON request body
	var req RequestMoneyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 3. Validate requestee_id and check for self-request
	requesteeID, err := uuid.Parse(req.RequesteeID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid requestee_id"})
		return
	}
	if requesterID == requesteeID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot request money from yourself"})
		return
	}

	// 4. Call the service
	tx, err := h.service.RequestMoney(c.Request.Context(), requesterID, requesteeID, req.Amount)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 5. Send success response
	c.JSON(http.StatusCreated, tx)
}

// HandleApproveRequest handles the POST /api/v1/transactions/approve/:tx_id request.
func (h *TransactionHandlers) HandleApproveRequest(c *gin.Context) {
	// 1. Get authenticated user ID (the approver)
	approverID, err := h.getUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// 2. Get tx_id from URL parameter
	txIDStr := c.Param("tx_id")
	txID, err := uuid.Parse(txIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid transaction ID"})
		return
	}

	// 3. Call the service
	tx, err := h.service.ApproveRequest(c.Request.Context(), approverID, txID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 4. Send success response
	c.JSON(http.StatusOK, tx)
}

// HandleRejectRequest handles the POST /api/v1/transactions/reject/:tx_id request.
func (h *TransactionHandlers) HandleRejectRequest(c *gin.Context) {
	// 1. Get authenticated user ID (the rejecter)
	rejecterID, err := h.getUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// 2. Get tx_id from URL parameter
	txIDStr := c.Param("tx_id")
	txID, err := uuid.Parse(txIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid transaction ID"})
		return
	}

	// 3. Call the service
	tx, err := h.service.RejectRequest(c.Request.Context(), rejecterID, txID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 4. Send success response
	c.JSON(http.StatusOK, tx)
}

// HandleGetPending handles the GET /api/v1/transactions/pending request.
func (h *TransactionHandlers) HandleGetPending(c *gin.Context) {
	// 1. Get authenticated user ID
	userID, err := h.getUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}
	// get limit query parameter
	limitStr := c.Query("limit")
	limit,_ := strconv.Atoi(limitStr) // Atoi returns 0 on error, which is fine
	// 2. Call the service
	transactions, err := h.service.GetPendingTransactions(c.Request.Context(), userID,limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 3. Send success response
	c.JSON(http.StatusOK, transactions)
}

// HandleGetHistory handles the GET /api/v1/transactions request.
func (h *TransactionHandlers) HandleGetHistory(c *gin.Context) {
	// 1. Get authenticated user ID
	userID, err := h.getUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// 2. Get "limit" query parameter (for ?limit=5)
	limitStr := c.Query("limit")
	limit, _ := strconv.Atoi(limitStr) // Atoi returns 0 on error, which is fine

	// 3. Call the service
	transactions, err := h.service.GetTransactionHistory(c.Request.Context(), userID, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 4. Send success response
	c.JSON(http.StatusOK, transactions)
}

// --- Helper Function ---

// getUserIDFromContext retrieves the user ID from the gin context.
// This matches the pattern in your wallet-service handlers.go
func (h *TransactionHandlers) getUserIDFromContext(c *gin.Context) (uuid.UUID, error) {
	userIDVal, exists := c.Get("userID")
	if !exists {
		return uuid.Nil, fmt.Errorf("user ID not found in context")
	}

	userIDStr, ok := userIDVal.(string)
	if !ok {
		return uuid.Nil, fmt.Errorf("user ID in context is not a string")
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return uuid.Nil, fmt.Errorf("invalid user ID format in context")
	}

	return userID, nil
}