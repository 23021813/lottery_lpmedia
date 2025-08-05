# Build script for Lucky Draw Registration App (PowerShell)
Write-Host "Building Lucky Draw Registration App..." -ForegroundColor Green

# Step 1: Clean previous build
Write-Host "Cleaning previous build..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
}

# Step 2: Build with Vite
Write-Host "Building with Vite..." -ForegroundColor Yellow
npm run build

# Step 3: Copy public assets
Write-Host "Copying public assets..." -ForegroundColor Yellow
if (Test-Path "public") {
    Copy-Item -Recurse -Force "public/*" "dist/"
}

Write-Host "Build completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "To run production server:" -ForegroundColor Cyan
Write-Host "  npm start" -ForegroundColor White
Write-Host ""
Write-Host "API endpoints available:" -ForegroundColor Cyan
Write-Host "  POST /api/write-config - Write config.json" -ForegroundColor White
Write-Host "  POST /api/write-csv - Write data.csv" -ForegroundColor White