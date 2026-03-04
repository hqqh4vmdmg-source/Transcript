# Multi-stage build for production
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN npm ci --only=production && \
    cd client && npm ci --only=production && \
    cd ../server && npm ci --only=production

# Copy source code
COPY client ./client
COPY server ./server
COPY database ./database

# Build client
RUN cd client && npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Install PostgreSQL client for healthchecks
RUN apk add --no-cache postgresql-client

# Copy built application
COPY --from=builder /app/server ./server
COPY --from=builder /app/client/build ./client/build
COPY --from=builder /app/database ./database

# Copy node_modules
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server/node_modules ./server/node_modules

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["node", "server/server.js"]
