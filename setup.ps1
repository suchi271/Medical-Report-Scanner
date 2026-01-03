# Quick Setup & Deployment Script
# Medical Report Scanner - Automated Setup

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Medical Report Scanner - Quick Setup" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check Prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

# Check Node.js
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js not found. Please install from https://nodejs.org/" -ForegroundColor Red
    exit 1
}
$nodeVersion = node --version
Write-Host "✅ Node.js $nodeVersion installed" -ForegroundColor Green

# Check npm
if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ npm not found. Please install Node.js" -ForegroundColor Red
    exit 1
}
Write-Host "✅ npm installed" -ForegroundColor Green

# Check Firebase CLI
if (!(Get-Command firebase -ErrorAction SilentlyContinue)) {
    Write-Host "⚠️  Firebase CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g firebase-tools
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install Firebase CLI" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Firebase CLI installed" -ForegroundColor Green
} else {
    Write-Host "✅ Firebase CLI installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
Write-Host ""

# Install Frontend Dependencies
Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Cyan
Set-Location frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend dependency installation failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
Set-Location ..

# Install Functions Dependencies
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Cyan
Set-Location functions
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend dependency installation failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
Set-Location ..

Write-Host ""
Write-Host "Verifying environment configuration..." -ForegroundColor Yellow

# Check Frontend .env
if (!(Test-Path "frontend\.env")) {
    Write-Host "❌ frontend/.env not found" -ForegroundColor Red
    Write-Host "Please create frontend/.env with your Firebase config" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ frontend/.env exists" -ForegroundColor Green

# Check Functions .env
if (!(Test-Path "functions\src\.env")) {
    Write-Host "❌ functions/src/.env not found" -ForegroundColor Red
    Write-Host "Please create functions/src/.env with your API keys" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ functions/src/.env exists" -ForegroundColor Green

Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "Setup Complete! ✅" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""

# Prompt for next action
Write-Host "What would you like to do?" -ForegroundColor Cyan
Write-Host "1. Test locally (run emulators + dev server)"
Write-Host "2. Deploy to production"
Write-Host "3. Exit"
Write-Host ""

$choice = Read-Host "Enter your choice (1-3)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Starting local development environment..." -ForegroundColor Cyan
        Write-Host ""
        Write-Host "This will open TWO terminals:" -ForegroundColor Yellow
        Write-Host "1. Firebase Emulators (Backend)" -ForegroundColor Yellow
        Write-Host "2. Vite Dev Server (Frontend)" -ForegroundColor Yellow
        Write-Host ""
        
        # Start Firebase Emulators in new window
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; firebase emulators:start"
        
        # Wait a moment for emulators to start
        Start-Sleep -Seconds 5
        
        # Start Frontend Dev Server in new window
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; npm run dev"
        
        Write-Host "✅ Local development servers starting..." -ForegroundColor Green
        Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
        Write-Host "Emulator UI: http://localhost:4000" -ForegroundColor Cyan
    }
    
    "2" {
        Write-Host ""
        Write-Host "Deploying to production..." -ForegroundColor Cyan
        Write-Host ""
        
        # Firebase Login
        Write-Host "Logging into Firebase..." -ForegroundColor Yellow
        firebase login
        
        # Set Project
        Write-Host "Setting Firebase project..." -ForegroundColor Yellow
        firebase use medical-scanner-app
        
        # Build Frontend
        Write-Host "Building frontend..." -ForegroundColor Yellow
        Set-Location frontend
        npm run build
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Frontend build failed" -ForegroundColor Red
            exit 1
        }
        Write-Host "✅ Frontend built" -ForegroundColor Green
        Set-Location ..
        
        # Deploy
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
        } else {
            Write-Host "❌ Deployment failed. Check logs above." -ForegroundColor Red
        }
    }
    
    "3" {
        Write-Host "Exiting..." -ForegroundColor Yellow
        exit 0
    }
    
    default {
        Write-Host "Invalid choice. Exiting..." -ForegroundColor Red
        exit 1
    }
}
