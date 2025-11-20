# Multi-stage Dockerfile for Bible App Backend
# Optimized for production deployment

# Stage 1: Dependencies
FROM node:18-alpine AS dependencies

# Set working directory
WORKDIR /app

# Copy package files
COPY backend/nodejs/package*.json ./

# Install dependencies
# Use --production for production dependencies only
RUN npm ci --only=production && \
    npm cache clean --force

# Stage 2: Development dependencies (for building if needed)
FROM node:18-alpine AS dev-dependencies

WORKDIR /app

COPY backend/nodejs/package*.json ./

RUN npm ci && \
    npm cache clean --force

# Stage 3: Production image
FROM node:18-alpine AS production

# Add metadata
LABEL maintainer="Bible App Team"
LABEL description="Biblical Lessons API for Entrepreneurs"
LABEL version="1.0.0"

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy production dependencies from dependencies stage
COPY --from=dependencies --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy application code
COPY --chown=nodejs:nodejs backend/nodejs/ ./

# Create necessary directories
RUN mkdir -p logs && \
    chown -R nodejs:nodejs logs

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health/live', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Set environment to production
ENV NODE_ENV=production
ENV PORT=3000

# Start application
CMD ["node", "server.js"]
