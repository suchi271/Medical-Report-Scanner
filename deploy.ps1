# Quick Deployment Script
# Deploy Medical Report Scanner to Production

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Medical Report Scanner - Deploy" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if in project root
if (!(Test-Path "firebase.json")) {
    Write-Host "❌ Must run from project root directory" -ForegroundColor Red
    exit 1
}

# Build Frontend
Write-Host "Building frontend for production..." -ForegroundColor Yellow
Set-Location frontend
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host "✅ Frontend built successfully" -ForegroundColor Green
Set-Location ..

# Deploy to Firebase
Write-Host ""
Write-Host "Deploying to Firebase..." -ForegroundColor Yellow
firebase deploy

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "======================================" -ForegroundColor Green
    Write-Host "Deployment Complete! 🎉" -ForegroundColor Green
    Write-Host "======================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your app is live at:" -ForegroundColor Cyan
    Write-Host "https://medical-scanner-app.web.app" -ForegroundColor Green
    Write-Host ""
    Write-Host "Backend API:" -ForegroundColor Cyan
    Write-Host "https://us-central1-medical-scanner-app.cloudfunctions.net/api" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    Write-Host "Check the logs above for details" -ForegroundColor Yellow
    exit 1
}
