# user-service Dockerfile

# Build stage
FROM golang:1.24-alpine AS builder 
WORKDIR /app            
COPY go.mod go.sum ./  
RUN go mod download
COPY . .

# --- DEBUG CHECKPOINT 1: List all files copied into the container ---
RUN echo "--- Source files in /app ---" && ls -R
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /app/server ./cmd/api

# --- DEBUG CHECKPOINT 2: Check if the 'server' executable was created ---
RUN echo "--- Files in /app after build ---" && ls -la /app

# create final,small image
FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/server .
EXPOSE 8080
CMD ["/app/server"]