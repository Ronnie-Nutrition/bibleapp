#!/bin/bash

# Bible App Deployment Script
# This script handles production deployment of the Bible App

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
ENVIRONMENT="${ENVIRONMENT:-production}"
BACKUP_DIR="./backups"

echo -e "${BLUE}🚀 Starting Bible App Deployment...${NC}"

# Function to log messages
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed"
    fi
    
    if [ ! -f ".env" ]; then
        error ".env file not found. Please create one from .env.example"
    fi
    
    if [ ! -f "${COMPOSE_FILE}" ]; then
        error "Docker compose file ${COMPOSE_FILE} not found"
    fi
    
    log "Prerequisites check passed ✓"
}

# Create backup
create_backup() {
    if [ "$ENVIRONMENT" = "production" ]; then
        log "Creating backup..."
        mkdir -p "${BACKUP_DIR}"
        
        # Backup database
        if docker-compose ps | grep -q postgres; then
            docker-compose exec -T postgres pg_dump -U postgres bibleapp > "${BACKUP_DIR}/db_backup_$(date +%Y%m%d_%H%M%S).sql"
            log "Database backup created ✓"
        fi
        
        # Backup media files
        if [ -d "./volumes/media" ]; then
            tar -czf "${BACKUP_DIR}/media_backup_$(date +%Y%m%d_%H%M%S).tar.gz" -C ./volumes media/
            log "Media backup created ✓"
        fi
    fi
}

# Pull latest images
pull_images() {
    log "Pulling latest images..."
    docker-compose -f "${COMPOSE_FILE}" pull
    log "Images pulled ✓"
}

# Build custom images
build_images() {
    log "Building custom images..."
    docker-compose -f "${COMPOSE_FILE}" build --no-cache
    log "Images built ✓"
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    # Wait for database to be ready
    docker-compose -f "${COMPOSE_FILE}" exec -T django python -c "
import os
import time
import psycopg2
from psycopg2 import OperationalError

max_attempts = 30
attempt = 0

while attempt < max_attempts:
    try:
        conn = psycopg2.connect(
            host=os.environ.get('DB_HOST', 'postgres'),
            database=os.environ.get('DB_NAME', 'bibleapp'),
            user=os.environ.get('DB_USER', 'postgres'),
            password=os.environ.get('DB_PASSWORD', 'postgres')
        )
        conn.close()
        print('Database is ready!')
        break
    except OperationalError:
        attempt += 1
        print(f'Database not ready, attempt {attempt}/{max_attempts}')
        time.sleep(2)
else:
    raise Exception('Database connection failed after all attempts')
"
    
    # Run migrations
    docker-compose -f "${COMPOSE_FILE}" exec -T django python manage.py migrate --noinput
    log "Migrations completed ✓"
}

# Collect static files
collect_static() {
    log "Collecting static files..."
    docker-compose -f "${COMPOSE_FILE}" exec -T django python manage.py collectstatic --noinput
    log "Static files collected ✓"
}

# Health check
health_check() {
    log "Performing health check..."
    
    # Wait for services to be healthy
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if docker-compose -f "${COMPOSE_FILE}" ps | grep -q "healthy"; then
            log "Health check passed ✓"
            return 0
        fi
        
        attempt=$((attempt + 1))
        echo "Waiting for services to be healthy... ($attempt/$max_attempts)"
        sleep 10
    done
    
    error "Health check failed after $max_attempts attempts"
}

# Deploy
deploy() {
    log "Starting deployment..."
    
    # Stop existing services
    docker-compose -f "${COMPOSE_FILE}" down
    
    # Start services
    docker-compose -f "${COMPOSE_FILE}" up -d
    
    log "Services started ✓"
}

# Cleanup old images
cleanup() {
    log "Cleaning up old Docker images..."
    docker image prune -f
    docker volume prune -f
    log "Cleanup completed ✓"
}

# Main deployment flow
main() {
    echo "Environment: ${ENVIRONMENT}"
    echo "Compose file: ${COMPOSE_FILE}"
    echo ""
    
    check_prerequisites
    create_backup
    pull_images
    build_images
    deploy
    run_migrations
    collect_static
    health_check
    cleanup
    
    echo ""
    log "🎉 Deployment completed successfully!"
    echo ""
    echo "Services are running at:"
    echo "  - Django API: http://localhost:8000"
    echo "  - Node.js API: http://localhost:3001"
    echo "  - Nginx Proxy: http://localhost"
    echo ""
    echo "To view logs: docker-compose -f ${COMPOSE_FILE} logs -f"
    echo "To view status: docker-compose -f ${COMPOSE_FILE} ps"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --env)
            ENVIRONMENT="$2"
            shift 2
            ;;
        --compose-file)
            COMPOSE_FILE="$2"
            shift 2
            ;;
        --skip-backup)
            SKIP_BACKUP=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --env ENVIRONMENT       Set environment (development|production)"
            echo "  --compose-file FILE     Use specific compose file"
            echo "  --skip-backup           Skip backup creation"
            echo "  --help                  Show this help message"
            exit 0
            ;;
        *)
            error "Unknown option: $1"
            ;;
    esac
done

# Run main function
main