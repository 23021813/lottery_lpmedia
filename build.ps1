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

# Step 3: Copy data folder and public assets
Write-Host "Copying data folder and assets..." -ForegroundColor Yellow
if (Test-Path "data") {
    Copy-Item -Recurse -Force "data" "dist/"
}
if (Test-Path "public") {
    Copy-Item -Recurse -Force "public/*" "dist/"
}

# Step 4: Set write permissions for data folder (Windows)
Write-Host "Setting write permissions for data folder..." -ForegroundColor Yellow
if (Test-Path "dist/data") {
    # Grant full control to current user for data folder
    $dataPath = "dist/data"
    $acl = Get-Acl $dataPath
    $accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule($env:USERNAME, "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
    $acl.SetAccessRule($accessRule)
    Set-Acl -Path $dataPath -AclObject $acl
    
    # Set permissions for all files in data folder
    Get-ChildItem -Path $dataPath -Recurse | ForEach-Object {
        $acl = Get-Acl $_.FullName
        $acl.SetAccessRule($accessRule)
        Set-Acl -Path $_.FullName -AclObject $acl
    }
}

Write-Host "Build completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "To run production server:" -ForegroundColor Cyan
Write-Host "  npm start" -ForegroundColor White
Write-Host ""
Write-Host "API endpoints available:" -ForegroundColor Cyan
Write-Host "  POST /api/write-config - Write config.json" -ForegroundColor White
Write-Host "  POST /api/write-csv - Write data.csv" -ForegroundColor White