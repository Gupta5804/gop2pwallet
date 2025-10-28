package mq

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/Gupta5804/gop2pwallet/services/notification-service/internal/config"
	"github.com/Gupta5804/gop2pwallet/services/notification-service/internal/websocket"
	"github.com/google/uuid"
	amqp "github.com/rabbitmq/amqp091-go"
)

const (
	ExchangeName = "transactions_exchange"
	QueueName = "notifications_queue"
	RoutingKey = "notify.payment.*"
)

// MessagePayload is a generic struct to unmarshal the "type" field
// so we know what kind of message it is
type MessagePayload struct {
	Type string `json:"type"`
}

//Define the message structs we expect from transaction-service
// These must match the structs in transaction-service/internal/service
type PaymentSuccessMessage struct {
	Type          string    `json:"type"`
	SenderID      uuid.UUID `json:"sender_id"`
	RecipientID   uuid.UUID `json:"recipient_id"`
	Amount        int64     `json:"amount"`
	TransactionID uuid.UUID `json:"transaction_id"`
}

type PaymentFailedMessage struct {
	Type        string    `json:"type"`
	SenderID    uuid.UUID `json:"sender_id"`
	RecipientID uuid.UUID `json:"recipient_id"`
	Amount      int64     `json:"amount"`
	Reason      string    `json:"reason"`
}

type PaymentRequestMessage struct {
	Type        string    `json:"type"`
	RequesterID uuid.UUID `json:"requester_id"`
	RequesteeID uuid.UUID `json:"requestee_id"`
	Amount      int64     `json:"amount"`
	TransactionID uuid.UUID `json:"transaction_id"`
}

type PaymentRejectedMessage struct {
	Type          string    `json:"type"`
	RequesterID   uuid.UUID `json:"requester_id"`
	RejecterID    uuid.UUID `json:"rejecter_id"`
	Amount        int64     `json:"amount"`
	TransactionID uuid.UUID `json:"transaction_id"`
}

type NotificationConsumer struct {
	hub *websocket.Hub
	conn *amqp.Connection
	ch *amqp.Channel
}

// NewNotificationConsumer creates a new consumer
func NewNotificationConsumer(cfg *config.Config, hub *websocket.Hub) (*NotificationConsumer, error){
	conn, err := amqp.Dial(cfg.RabbitMQURL)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to RabbitMQ: %w", err)
	}
	ch, err := conn.Channel()
	if err != nil {
		conn.Close()
		return nil, fmt.Errorf("failed to open a channel: %w", err)
	}
	// Declare the same exchange as the publisher(idempotent)
	err = ch.ExchangeDeclare(
		ExchangeName,
		"topic",
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		conn.Close()
		return nil, fmt.Errorf("failed to declare an exchange: %w", err)
	}
	return &NotificationConsumer{
		hub: hub,
		conn: conn,
		ch: ch,
	}, nil
}

// Start consuming messages. This should be run in a goroutine
func (c *NotificationConsumer) Start() {
	// Declare the queue
	q, err := c.ch.QueueDeclare(
		QueueName,
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		log.Fatalf("Failed to declare a queue: %v", err)
	}

	// Bind the queue to the exchange 
	err = c.ch.QueueBind(
		q.Name,
		RoutingKey,
		ExchangeName,
		false,
		nil,
	)
	if err != nil {
		log.Fatalf("Failed to bind a queue: %v", err)
	}

	// Start consuming messages
	msgs, err := c.ch.Consume(
		q.Name,
		"",
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		log.Fatalf("Failed to register a consumer: %v", err)
	}
	log.Printf("RabbitMQ Consumer started, waiting for messages....")

	// run forever, processing messages
	forever := make(chan bool)
	go func() {
		for d := range msgs {
			log.Printf("Received a message: %s", d.Body)
			c.handleMessage(d.Body)
		}
	}()
	<-forever
}

// handleMessage routes the message to the hub
func (c *NotificationConsumer) handleMessage(body []byte) {
	var payload MessagePayload
	if err := json.Unmarshal(body, &payload); err != nil {
		log.Printf("Failed to unmarshal message type: %v", err)
		return
	}

	// Process the message based on its type
	switch payload.Type {
	case "payment_success":
		var msg PaymentSuccessMessage
		if err := json.Unmarshal(body, &msg); err != nil {
			log.Printf("Error unmarshaling %s: %v", payload.Type, err)
			return
		}
		
		// Notify the recipient
		recipientMsg := fmt.Sprintf("You received %d paise.", msg.Amount)
		c.hub.SendToUser(msg.RecipientID, []byte(recipientMsg))

		// Notify the sender
		senderMsg := fmt.Sprintf("Your payment of %d paise was successful.", msg.Amount)
		c.hub.SendToUser(msg.SenderID, []byte(senderMsg))

	case "payment_failed":
		var msg PaymentFailedMessage
		if err := json.Unmarshal(body, &msg); err != nil {
			log.Printf("Error unmarshaling %s: %v", payload.Type, err)
			return
		}
		failMsg := fmt.Sprintf("Your payment failed: %s", msg.Reason)
		c.hub.SendToUser(msg.SenderID, []byte(failMsg))

	case "payment_request":
		var msg PaymentRequestMessage
		if err := json.Unmarshal(body, &msg); err != nil {
			log.Printf("Error unmarshaling %s: %v", payload.Type, err)
			return
		}
		// We can improve this later by fetching the user's name
		requestMsg := fmt.Sprintf("You have a new payment request of %d paise from user %s.", msg.Amount, msg.RequesterID.String())
		c.hub.SendToUser(msg.RequesteeID, []byte(requestMsg))
	
	case "payment_rejected":
		var msg PaymentRejectedMessage
		if err := json.Unmarshal(body, &msg); err != nil {
			log.Printf("Error unmarshaling %s: %v", payload.Type, err)
			return
		}
		rejectMsg := fmt.Sprintf("Your payment request to user %s was rejected.", msg.RejecterID.String())
		c.hub.SendToUser(msg.RequesterID, []byte(rejectMsg))

	default:
		log.Printf("Unknown message type: %s", payload.Type)
	}
}
// Close gracefully shuts down the connection.
func (c *NotificationConsumer) Close() {
	if c.ch != nil {
		c.ch.Close()
	}
	if c.conn != nil {
		c.conn.Close()
	}
	log.Println("RabbitMQ connection closed.")
}