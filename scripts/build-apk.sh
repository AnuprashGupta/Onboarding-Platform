#!/bin/bash

# Build APK Script for Onboarding Platform
# This script helps build the Android APK for submission

echo "========================================="
echo "Onboarding Platform - APK Build Script"
echo "========================================="
echo ""

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI not found!"
    echo "Installing EAS CLI..."
    npm install -g eas-cli
fi

echo "✅ EAS CLI is installed"
echo ""

# Check if logged in
echo "Checking Expo authentication..."
if ! eas whoami &> /dev/null; then
    echo "❌ Not logged in to Expo"
    echo "Please login:"
    eas login
else
    echo "✅ Logged in as: $(eas whoami)"
fi

echo ""
echo "Select build type:"
echo "1) Preview (for testing/demo)"
echo "2) Production (for release)"
read -p "Enter choice (1 or 2): " choice

case $choice in
    1)
        echo ""
        echo "Building preview APK..."
        echo "This will take ~10-15 minutes"
        eas build --platform android --profile preview
        ;;
    2)
        echo ""
        echo "Building production APK..."
        echo "This will take ~10-15 minutes"
        eas build --platform android --profile production
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "========================================="
echo "Build started!"
echo "========================================="
echo ""
echo "Monitor progress:"
echo "  - Watch terminal output above"
echo "  - Or run: eas build:list"
echo "  - Or check: https://expo.dev/accounts/[username]/builds"
echo ""
echo "When complete:"
echo "  1. Download APK from provided link"
echo "  2. Upload to Google Drive"
echo "  3. Update README.md with Drive link"
echo "  4. Submit assignment!"
echo ""
echo "Good luck! 🚀"





