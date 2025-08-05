#!/bin/bash

# Build script for Lucky Draw Registration App
echo "Building Lucky Draw Registration App..."

# Step 1: Clean previous build
echo "Cleaning previous build..."
rm -rf dist

# Step 2: Build with Vite
echo "Building with Vite..."
npm run build

# Step 3: Copy public assets
echo "Copying public assets..."
cp -r public/* dist/

echo "Build completed successfully!"
echo ""
echo "To run production server:"
echo "  npm start"
echo ""
echo "API endpoints available:"
echo "  POST /api/write-config - Write config.json"
echo "  POST /api/write-csv - Write data.csv"
