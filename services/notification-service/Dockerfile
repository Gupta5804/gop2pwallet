# services/notification-service/Dockerfile

# Build stage
FROM golang:1.24-alpine AS builder
WORKDIR /app

# Copy all go.mod/go.sum files to leverage build cache
COPY go.mod go.sum ./
COPY services/user-service/go.mod services/user-service/go.sum ./services/user-service/
COPY services/wallet-service/go.mod services/wallet-service/go.sum ./services/wallet-service/
COPY services/transaction-service/go.mod services/transaction-service/go.sum ./services/transaction-service/
COPY services/notification-service/go.mod services/notification-service/go.sum ./services/notification-service/

# Copy proto files
COPY proto ./proto

# Set workdir to the current service and download dependencies
WORKDIR /app/services/notification-service
RUN go mod download

# Copy the entire source code
WORKDIR /app
COPY . .

# Build the notification-service binary
WORKDIR /app/services/notification-service
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /app/server ./cmd/api

# Final, small image
FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/server .
EXPOSE 8083
CMD ["/app/server"]