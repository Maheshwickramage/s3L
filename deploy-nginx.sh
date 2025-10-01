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
    log "Building React frontend..."
    
    cd frontend
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        log "Installing frontend dependencies..."
        npm install
    fi
    
    # Build the React app
    log "Building React app for production..."
    npm run build
    
    cd ..
    success "Frontend build completed"
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
    build_frontend
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
    "build")
        build_frontend
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
    "help"|"-h"|"--help")
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  deploy    - Full deployment (default)"
        echo "  build     - Build frontend only"
        echo "  start     - Start services only"
        echo "  stop      - Stop all services"
        echo "  logs      - View service logs"
        echo "  status    - Show service status"
        echo "  help      - Show this help"
        ;;
    *)
        error "Unknown command: $1. Use '$0 help' for available commands."
        ;;
esac