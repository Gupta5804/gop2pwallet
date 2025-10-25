# services/transaction-service/Dockerfile

# build stage
FROM golang:1.24-alpine AS builder
WORKDIR /app

# copy all go.mod/go.sum files to leverage build cache
COPY go.mod go.sum ./
COPY services/user-service/go.mod services/user-service/go.sum ./services/user-service/
COPY services/wallet-service/go.mod services/wallet-service/go.sum ./services/wallet-service/
COPY services/transaction-service/go.mod services/transaction-service/go.sum ./services/transaction-service/

# copy proto files
COPY proto ./proto

# set workdir to the current service and download dependencies
WORKDIR /app/services/transaction-service
RUN go mod download

# copy the entire source code
WORKDIR /app
COPY . .

# build the transaction-service binary
WORKDIR /app/services/transaction-service
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /app/server ./cmd/api

# final, small image
FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/server .
EXPOSE 8082
CMD ["/app/server"]