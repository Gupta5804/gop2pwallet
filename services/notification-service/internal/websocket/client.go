package websocket

import (
	"log"

	"github.com/google/uuid"
	ws "github.com/gorilla/websocket"
)

// Client is a middleman between the websocket connection and the hub
type Client struct {
	hub *Hub

	// The websocket connection
	conn *ws.Conn

	// Buffered channel of outbound messages
	send chan []byte

	// The User ID for this client
	UserID uuid.UUID
}

func NewClient(hub *Hub, conn *ws.Conn, userID uuid.UUID) *Client {
	client := &Client{
		hub:    hub,
		conn:   conn,
		send:   make(chan []byte, 256),
		UserID: userID,
	}
	client.hub.register <- client
	return client
}

func (c *Client) Run() {
	go c.writePump()
	go c.readPump()
}

// writePump pumps messages from the hub to the websocket connection
// A go routine running writePump is started for each connection
func (c *Client) writePump() {
	defer func() {
		c.conn.Close()
	}()
	for {
		message, ok := <-c.send
		if !ok {
			c.conn.WriteMessage(ws.CloseMessage, []byte{})
			return
		}

		if err := c.conn.WriteMessage(ws.TextMessage, message); err != nil {
			log.Printf("error: failed to write message to websocket: %v", err)
			return
		}
	}
}

// readPump pumps messages from the websocket connection to the hub
// This is mainly to detect when the client was disconnected
func (c *Client) readPump() {
	defer func() {
		// When this function exists
		// we unregister the client from the hub
		c.hub.unregister <- c
		c.conn.Close()
	}()

	// Configure the connection to send a pong message back
	// This helps keep the connection alive and detect disconnections
	c.conn.SetReadLimit(512)                                 // Max Message size is 512 bytes
	c.conn.SetPongHandler(func(string) error { return nil }) // Ignore Pong messages

	// This loop will block until the client disconnects or sends a message
	// we dont care about the message content, only that the connection is alive
	for {
		if _, _, err := c.conn.ReadMessage(); err != nil {
			if ws.IsUnexpectedCloseError(err, ws.CloseGoingAway, ws.CloseAbnormalClosure) {
				log.Printf("error: unexpected websocket close: %v", err)
			}
			break // Exit loop on any error (which means client disconnected)
		}
	}
}
