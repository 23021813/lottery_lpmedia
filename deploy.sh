#!/bin/bash

echo "🚀 Starting deployment process..."

# Check if .env file exists
if [ ! -f .env ] && [ ! -f .env.local ]; then
    echo "⚠️  Warning: No .env file found. Please create one with required variables."
    echo "Required variables: GEMINI_API_KEY, ADMIN_PASSWORD"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🏗️  Building application..."
npm run build:full

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed!"
    exit 1
fi

# Create data directory if it doesn't exist
if [ ! -d "data" ]; then
    echo "📁 Creating data directory..."
    mkdir -p data
    chmod 755 data
fi

# Check if PM2 is available
if command -v pm2 &> /dev/null; then
    echo "🔄 Starting with PM2..."
    pm2 start ecosystem.config.js --env production
    pm2 save
    echo "🎉 Deployment completed with PM2!"
    echo "🌐 Application is running on http://localhost:3000/lottery_lpmedia/"
    echo "📊 Monitor with: pm2 monit"
else
    echo "🌟 Starting production server..."
    npm start &
    echo "🎉 Deployment completed!"
    echo "🌐 Application is running on http://localhost:3000/lottery_lpmedia/"
fi