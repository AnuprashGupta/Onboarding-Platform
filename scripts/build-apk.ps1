# PowerShell Build Script for Windows
# Build APK for Onboarding Platform

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Onboarding Platform - APK Build Script" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if EAS CLI is installed
try {
    $null = Get-Command eas -ErrorAction Stop
    Write-Host "✅ EAS CLI is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ EAS CLI not found!" -ForegroundColor Red
    Write-Host "Installing EAS CLI..." -ForegroundColor Yellow
    npm install -g eas-cli
}

Write-Host ""

# Check if logged in
Write-Host "Checking Expo authentication..." -ForegroundColor Yellow
try {
    $user = eas whoami 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Logged in as: $user" -ForegroundColor Green
    } else {
        Write-Host "❌ Not logged in to Expo" -ForegroundColor Red
        Write-Host "Please login:" -ForegroundColor Yellow
        eas login
    }
} catch {
    Write-Host "❌ Not logged in to Expo" -ForegroundColor Red
    Write-Host "Please login:" -ForegroundColor Yellow
    eas login
}

Write-Host ""
Write-Host "Select build type:" -ForegroundColor Cyan
Write-Host "1) Preview (for testing/demo)" -ForegroundColor White
Write-Host "2) Production (for release)" -ForegroundColor White
$choice = Read-Host "Enter choice (1 or 2)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Building preview APK..." -ForegroundColor Yellow
        Write-Host "This will take ~10-15 minutes" -ForegroundColor Gray
        eas build --platform android --profile preview
    }
    "2" {
        Write-Host ""
        Write-Host "Building production APK..." -ForegroundColor Yellow
        Write-Host "This will take ~10-15 minutes" -ForegroundColor Gray
        eas build --platform android --profile production
    }
    default {
        Write-Host "Invalid choice. Exiting." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Build started!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Monitor progress:" -ForegroundColor Yellow
Write-Host "  - Watch terminal output above" -ForegroundColor Gray
Write-Host "  - Or run: eas build:list" -ForegroundColor Gray
Write-Host "  - Or check: https://expo.dev" -ForegroundColor Gray
Write-Host ""
Write-Host "When complete:" -ForegroundColor Yellow
Write-Host "  1. Download APK from provided link" -ForegroundColor White
Write-Host "  2. Upload to Google Drive" -ForegroundColor White
Write-Host "  3. Update README.md with Drive link" -ForegroundColor White
Write-Host "  4. Submit assignment!" -ForegroundColor White
Write-Host ""
Write-Host "Good luck! 🚀" -ForegroundColor Green




