# Stage 1: Build
FROM node:22-alpine AS builder

# Working dir
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production packages
RUN npm ci --omit=dev

# Copy source code
COPY . .

# Stage 2: Final lightweight image
FROM node:22-alpine

WORKDIR /app

# Copy from builder stage
COPY --from=builder /app /app

# Expose port
EXPOSE 3000

# Start command
CMD ["node", "app.js"]
