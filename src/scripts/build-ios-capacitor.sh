#!/bin/bash

# Spicey iOS Build Script with VoIP and CallKit Support
# This script ensures all iOS configurations are properly set

set -e

echo "🔥 Building Spicey iOS App with VoIP + CallKit Support..."

# 1. Build web assets
echo "📦 Building web assets..."
npm run build

# 2. Sync Capacitor
echo "🔄 Syncing Capacitor..."
npx cap sync ios

# 3. Check for GoogleService-Info.plist
if [ ! -f "ios/App/App/GoogleService-Info.plist" ]; then
    echo "❌ ERROR: GoogleService-Info.plist not found!"
    echo "Please download it from Firebase Console and place it in:"
    echo "   ios/App/App/GoogleService-Info.plist"
    exit 1
fi
echo "✅ GoogleService-Info.plist found"

# 4. Check Info.plist for background modes
echo "✅ Verifying Info.plist configurations..."
if grep -q "voip" ios/App/App/Info.plist; then
    echo "✅ VoIP background mode enabled"
else
    echo "❌ ERROR: VoIP background mode not enabled in Info.plist"
    exit 1
fi

if grep -q "remote-notification" ios/App/App/Info.plist; then
    echo "✅ Remote notifications enabled"
else
    echo "❌ ERROR: Remote notifications not enabled in Info.plist"
    exit 1
fi

# 5. Open in Xcode
echo ""
echo "✅ Build complete! Opening Xcode..."
echo ""
echo "📋 Next Steps in Xcode:"
echo "   1. Select your Team in Signing & Capabilities"
echo "   2. Ensure Push Notifications capability is enabled"
echo "   3. Ensure VoIP Signing is enabled (special entitlement)"
echo "   4. Build and run on a real device (not simulator)"
echo ""
echo "🔔 Important: Test on real iOS device for VoIP to work!"
echo ""

npx cap open ios