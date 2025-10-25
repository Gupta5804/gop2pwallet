package mq

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"github.com/Gupta5804/gop2pwallet/services/transaction-service/internal/config"
	amqp "github.com/rabbitmq/amqp091-go"
)

const (
	ExchangeName = "transactions_exchange"
)

// TransactionPublisher is an interface for publishing transactions
type TransactionPublisher interface {
	Publish(ctx context.Context, routingKey string, body interface{}) error
	Close()
}

// RabbitMQPublisher is a struct that implements TransactionPublisher
type RabbitMQPublisher struct {
	conn    *amqp.Connection
	channel *amqp.Channel
}

// NewRabbitMQPublisher connects to RabbitMQ and sets up the exchange
func NewRabbitMQPublisher(cfg *config.Config) (*RabbitMQPublisher, error) {
	conn, err := amqp.Dial(cfg.RabbitMQURL)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to RabbitMQ: %w", err)
	}
	channel, err := conn.Channel()
	if err != nil {
		return nil, fmt.Errorf("failed to open a channel: %w", err)
	}
	// Declare the exchange. We use a "topic" exchange, which is the most
	// flexible for routing messages based in routing keys

	err = channel.ExchangeDeclare(
		ExchangeName, // name
		"topic",      // type
		true,         // durable
		false,        // auto-deleted
		false,        // internal
		false,        // no-wait
		nil,          // arguments
	)
	if err != nil {
		conn.Close()
		return nil, fmt.Errorf("failed to declare an exchange: %w", err)
	}
	log.Println("Successfully connected to RabbitMQ")
	return &RabbitMQPublisher{conn: conn, channel: channel}, nil
}

// Publish serializes the body to JSON and publishes it to the exchange
// with the specified routing key
func (p *RabbitMQPublisher) Publish(ctx context.Context, routingKey string, body interface{}) error {
	// Serialize the body to JSON
	jsonBody, err := json.Marshal(body)
	if err != nil {
		return fmt.Errorf("failed to marshal body to JSON: %w", err)
	}

	err = p.channel.PublishWithContext(ctx,
		ExchangeName, //exchange
		routingKey,   // routing key
		false,        // mandatory
		false,        // immediate
		amqp.Publishing{
			ContentType:  "application/json",
			Body:         jsonBody,
			DeliveryMode: amqp.Persistent,
		},
	)
	if err != nil {
		return fmt.Errorf("failed to publish message: %w", err)
	}
	log.Printf("Published message with routing key: %s", routingKey)
	return nil
}

// close gracefully closes the channel and connection
func (p *RabbitMQPublisher) Close() {
	if p.channel != nil {
		p.channel.Close()
	}
	if p.conn != nil {
		p.conn.Close()
	}
	log.Println("Successfully disconnected from RabbitMQ")
}
