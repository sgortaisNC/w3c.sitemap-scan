#!/bin/bash

# Test Redis Connection Script
# This script tests Redis connectivity using Docker Compose

echo "🔍 Testing Redis Connection..."

# Check if Redis is running
if ! docker ps | grep -q w3c_checker_redis; then
    echo "❌ Redis container is not running"
    echo "Starting Redis with Docker Compose..."
    docker-compose -f docker-compose.dev.yml up -d redis
    sleep 3
fi

# Test Redis connection
echo "📡 Testing Redis connectivity..."
redis-cli -h localhost -p 6379 ping

if [ $? -eq 0 ]; then
    echo "✅ Redis connection successful!"
    
    # Show Redis info
    echo "📊 Redis Information:"
    redis-cli -h localhost -p 6379 INFO server | head -5
    
    exit 0
else
    echo "❌ Redis connection failed"
    exit 1
fi
