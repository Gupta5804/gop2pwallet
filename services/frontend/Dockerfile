# frontend Dockerfile

# Build Stage
# Use the official Node.js image as a base image
#
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install
COPY . .
RUN npm run build
# serve the static files with nginx
# Production Stage
# Use the official Nginx image as a base image
FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.frontend.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g","daemon off;"]
