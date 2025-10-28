package websocket

import (
	"log"

	"github.com/google/uuid"
)

// Hub maintains the set of active clients and broadcasts messages to the clients.
type Hub struct {
	// Registered clients.
	clients map[uuid.UUID] *Client

	// Register requests from the clients
	register chan *Client

	// unregister requests from clients
	unregister chan *Client

}

// NewHub creates a new hub (factory function)
func NewHub() *Hub {
	return &Hub{
		register:   make(chan *Client),
		unregister: make(chan *Client),
		clients:    make(map[uuid.UUID] *Client),
	}
}

// Run starts the Hub's main event loop in a goroutine
// This is the only place where the clients map is modified
func(h *Hub) Run() {
	log.Println("WebSocket Hub started")
	for {
		select {
		case client := <- h.register:
			// A new client has connected
			log.Printf("Client Registered: %s", client.UserID.String())
			h.clients[client.UserID] = client
		
		case client := <- h.unregister:
			// A client has disconnected
			if _, ok := h.clients[client.UserID]; ok {
					log.Printf("Client Unregistered: %s", client.UserID.String())
					delete(h.clients, client.UserID)
					close(client.send)
			}
		}
	}
}
func (h *Hub) SendToUser(userID uuid.UUID, message []byte) {
	// Find the client in our map
	client, ok := h.clients[userID]
	if !ok {
		log.Printf("Attempted to send message to disconnected user: %s", userID.String())
		return
	}

	// Send the message to client's send channel
	// The client's writePump will handle the rest
	select {
	case client.send <- message:
		log.Printf("Message sent to user: %s", userID.String())
	default:
		// The client's send buffer is full , which means they are 
		// either disconnected or lagging badly, we'll close them
		log.Printf("Send Buffer full, disconnecting user: %s", userID.String())
		close(client.send)
		delete(h.clients,client.UserID)
	}
}