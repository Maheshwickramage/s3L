#!/bin/bash

# Simple S3Learn Server Deployment Script
# Optimized for Ubuntu server environments without Node.js

set -e

echo "🚀 S3Learn Server Deployment"
echo "=============================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker is running"

# Build frontend using Docker (no local npm required)
echo "📦 Building frontend with Docker..."
docker run --rm \
    -v "$(pwd)/frontend:/app" \
    -w /app \
    node:18-alpine \
    sh -c "
        echo 'Installing dependencies...' && 
        npm ci --only=production --silent && 
        echo 'Building React app...' && 
        npm run build && 
        echo 'Build completed!'
    "

# Verify build was successful
if [ ! -f "frontend/build/index.html" ]; then
    echo "❌ Frontend build failed - index.html not found"
    exit 1
fi

echo "✅ Frontend build completed"

# Start services
echo "🐳 Starting Docker services..."
docker-compose down > /dev/null 2>&1 || true
docker-compose up -d --build

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 15

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Services are running"
else
    echo "❌ Services failed to start"
    docker-compose logs
    exit 1
fi

# Display service information
echo ""
echo "🎉 Deployment Successful!"
echo "========================"
echo ""
echo "Service URLs:"
echo "  Frontend: http://$(curl -s ifconfig.me || echo 'YOUR_SERVER_IP')"
echo "  Health:   http://$(curl -s ifconfig.me || echo 'YOUR_SERVER_IP')/health"
echo ""
echo "Service Status:"
docker-compose ps
echo ""
echo "📋 Next Steps:"
echo "1. Update Cloudflare DNS to point to your server IP"
echo "2. Configure SSL in Cloudflare dashboard"
echo "3. Test both domains: s3learn.com and api.s3learn.com"
echo ""
echo "🔧 Management Commands:"
echo "  View logs:    docker-compose logs -f"
echo "  Restart:      docker-compose restart"
echo "  Stop:         docker-compose down"
echo "  Status:       docker-compose ps"