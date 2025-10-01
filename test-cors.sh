#!/bin/bash

# CORS Test Script for S3Learn
# Tests CORS configuration after deployment

echo "🔍 Testing CORS Configuration"
echo "=============================="

# Test 1: Preflight request (OPTIONS)
echo "📋 Test 1: Preflight request (OPTIONS)"
curl -X OPTIONS \
  -H "Origin: https://s3learn.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  -i \
  http://localhost/api/auth/login

echo -e "\n"

# Test 2: Actual POST request with CORS headers
echo "📋 Test 2: POST request with CORS"
curl -X POST \
  -H "Origin: https://s3learn.com" \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}' \
  -i \
  http://localhost/api/auth/login

echo -e "\n"

# Test 3: Health check
echo "📋 Test 3: Health check"
curl -H "Origin: https://s3learn.com" \
  -i \
  http://localhost/health

echo -e "\n"

# Test 4: Check for duplicate headers
echo "📋 Test 4: Checking for duplicate CORS headers"
response=$(curl -s -H "Origin: https://s3learn.com" -I http://localhost/api/health)
cors_count=$(echo "$response" | grep -i "access-control-allow-origin" | wc -l)

if [ "$cors_count" -eq 1 ]; then
    echo "✅ CORS headers are correct (single header found)"
else
    echo "❌ CORS issue detected (found $cors_count headers)"
    echo "$response" | grep -i "access-control"
fi

echo -e "\n🎯 If all tests show single Access-Control-Allow-Origin headers, CORS is fixed!"