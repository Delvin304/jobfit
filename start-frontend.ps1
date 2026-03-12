# PowerShell script to start React frontend server
# Run this from PowerShell: .\start-frontend.ps1

Write-Host "Starting React Frontend Server..." -ForegroundColor Green
Write-Host ""

# Navigate to frontend directory
Set-Location "C:\MAIN PROJECT\frontend"

# Check if package.json exists
if (Test-Path "package.json") {
    Write-Host "Found package.json" -ForegroundColor Green
    Write-Host "Starting development server..." -ForegroundColor Cyan
    Write-Host ""
    cmd /c npm run dev
} else {
    Write-Host "Error: package.json not found!" -ForegroundColor Red
    Write-Host "Make sure you are in the frontend directory." -ForegroundColor Yellow
}
