# wallet-service Dockerfile 

# Build
FROM golang:1.24-alpine AS builder
WORKDIR /app

#Copy all module files first to leverage Docker layer caching
COPY go.mod ./
COPY services/user-service/go.mod services/user-service/go.sum ./services/user-service/
COPY services/wallet-service/go.mod services/wallet-service/go.sum ./services/wallet-service/
COPY services/transaction-service/go.mod services/transaction-service/go.sum ./services/transaction-service/ 
# copy proto files
COPY proto ./proto
#set working directory to the service
WORKDIR /app/services/wallet-service

RUN go mod download

# go back to root and copy all source files
WORKDIR /app
COPY . .

# build the service
WORKDIR /app/services/wallet-service
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /app/server ./cmd/api

# Final, small image
FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/server .

# Expose both REST and GRPC ports
EXPOSE 8081
EXPOSE 50052

# Run the service
CMD ["/app/server"]