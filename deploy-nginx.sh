#!/bin/bash

# S3Learn Deployment Script with Nginx Reverse Proxy
# This script builds the frontend and starts the services with Nginx

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        error "Docker is not running. Please start Docker Desktop first."
    fi
    success "Docker is running"
}

# Build frontend
build_frontend() {
    log "Building React frontend with Docker..."
    
    # Check if we should force rebuild
    if [ "$1" = "force" ] || [ ! -d "frontend/build" ]; then
        log "Building frontend using Docker container..."
        
        # Remove existing build if forcing rebuild
        if [ "$1" = "force" ] && [ -d "frontend/build" ]; then
            log "Removing existing build directory..."
            rm -rf frontend/build
        fi
        
        # Build frontend using Docker
        log "Running npm install and build in Docker container..."
        docker run --rm \
            -v "$(pwd)/frontend:/app" \
            -w /app \
            node:18-alpine \
            sh -c "npm ci --only=production && npm run build"
        
        if [ ! -d "frontend/build" ]; then
            error "Frontend build failed - build directory not created"
        fi
        
        # Check if build contains index.html
        if [ ! -f "frontend/build/index.html" ]; then
            error "Frontend build incomplete - index.html not found"
        fi
        
        success "Frontend build completed successfully"
    else
        log "Frontend build directory already exists, skipping build (use 'force' to rebuild)"
    fi
}

# Start services
start_services() {
    log "Starting services with Docker Compose..."
    
    # Stop any existing containers
    docker-compose down || true
    
    # Start the services
    docker-compose up -d --build
    
    success "Services started"
}

# Check service health
check_health() {
    log "Checking service health..."
    
    # Wait for services to start
    sleep 30
    
    # Check backend health
    if curl -f http://localhost/health > /dev/null 2>&1; then
        success "Nginx proxy is healthy"
    else
        warning "Nginx proxy health check failed"
    fi
    
    # Check if backend is accessible through proxy
    if curl -f http://localhost/api/health > /dev/null 2>&1; then
        success "Backend API is accessible through proxy"
    else
        warning "Backend API not accessible through proxy"
    fi
}

# Show service information
show_info() {
    echo ""
    echo "======================================"
    echo "  S3Learn Services Information"
    echo "======================================"
    echo ""
    echo "🌐 Service URLs:"
    echo "  Frontend (s3learn.com):     http://localhost"
    echo "  API (api.s3learn.com):      http://localhost/api/"
    echo "  Health Check:               http://localhost/health"
    echo ""
    echo "🔧 Service Status:"
    docker-compose ps
    echo ""
    echo "📋 Next Steps:"
    echo "1. Update your Cloudflare DNS:"
    echo "   - s3learn.com → YOUR_SERVER_IP"
    echo "   - api.s3learn.com → YOUR_SERVER_IP"
    echo ""
    echo "2. Update frontend API URL:"
    echo "   REACT_APP_API_URL=https://api.s3learn.com"
    echo ""
    echo "3. Configure Cloudflare SSL (see CLOUDFLARE_SETUP.md)"
    echo ""
    echo "🔍 Useful Commands:"
    echo "  View logs:        docker-compose logs -f"
    echo "  Restart:          docker-compose restart"
    echo "  Stop:             docker-compose down"
    echo "  Rebuild:          ./deploy-nginx.sh"
}

# Main deployment function
main() {
    log "Starting S3Learn deployment with Nginx reverse proxy..."
    
    check_docker
    build_frontend "$1"
    start_services
    check_health
    show_info
    
    success "Deployment completed successfully!"
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "deploy-force")
        main "force"
        ;;
    "build")
        build_frontend
        ;;
    "build-force")
        build_frontend "force"
        ;;
    "start")
        start_services
        ;;
    "stop")
        docker-compose down
        success "Services stopped"
        ;;
    "logs")
        docker-compose logs -f
        ;;
    "status")
        docker-compose ps
        ;;
    "clean")
        log "Cleaning up build files and containers..."
        docker-compose down
        rm -rf frontend/build
        docker system prune -f
        success "Cleanup completed"
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  deploy        - Full deployment (default)"
        echo "  deploy-force  - Full deployment with frontend rebuild"
        echo "  build         - Build frontend only"
        echo "  build-force   - Force rebuild frontend"
        echo "  start         - Start services only"
        echo "  stop          - Stop all services"
        echo "  logs          - View service logs"
        echo "  status        - Show service status"
        echo "  clean         - Clean build files and containers"
        echo "  help          - Show this help"
        echo ""
        echo "Examples:"
        echo "  $0 deploy-force    # Force rebuild and deploy"
        echo "  $0 build-force     # Force rebuild frontend only"
        echo "  $0 clean           # Clean up everything"
        ;;
    *)
        error "Unknown command: $1. Use '$0 help' for available commands."
        ;;
esac