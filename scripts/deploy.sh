#!/bin/bash

# Deployment script for Wolfinder
set -e

echo "🚀 Starting Wolfinder deployment..."

# Environment check
if [ -z "$NODE_ENV" ]; then
  export NODE_ENV=production
fi

echo "📋 Environment: $NODE_ENV"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# TypeScript compilation check
echo "🔍 Running TypeScript check..."
npm run check

# Build application
echo "🏗️  Building application..."
npm run build

# Database migration (if needed)
echo "🗄️  Checking database migrations..."
npm run db:push

# Health check after deployment
echo "🔧 Running post-deployment health check..."
if command -v curl >/dev/null 2>&1; then
  sleep 3
  curl -f http://localhost:5000/health || echo "⚠️  Health check failed - manual verification needed"
else
  echo "ℹ️  Curl not available - skipping automated health check"
fi

echo "✅ Deployment completed successfully!"
echo "🌐 Application available at: http://localhost:5000"