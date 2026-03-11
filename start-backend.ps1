# PowerShell script to start Django backend server
# Run this from PowerShell: .\start-backend.ps1

Write-Host "Starting Django Backend Server..." -ForegroundColor Green
Write-Host ""

# Navigate to project root
Set-Location "C:\MAIN PROJECT"

# Check if manage.py exists
if (Test-Path "manage.py") {
    Write-Host "Found manage.py" -ForegroundColor Green
    Write-Host "Starting server at http://127.0.0.1:8000/" -ForegroundColor Cyan
    Write-Host ""
    python manage.py runserver
} else {
    Write-Host "Error: manage.py not found!" -ForegroundColor Red
    Write-Host "Make sure you are in the correct directory." -ForegroundColor Yellow
}
