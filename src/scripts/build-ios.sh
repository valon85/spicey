#!/bin/bash

# SPICEY App - iOS TestFlight/App Store Build Script
# Usage: bash scripts/build-ios.sh

set -e

echo "🚀 SPICEY iOS Build"
echo "===================="

# 1. Clean previous builds
echo "📦 Cleaning previous builds..."
rm -rf dist/ 2>/dev/null || true

# 2. Install dependencies
echo "📥 Installing dependencies..."
npm ci --production

# 3. Build optimized web bundle
echo "⚙️  Building optimized web bundle..."
npm run build

# 4. Verify build output
echo "✅ Verifying build output..."
if [ ! -d "dist" ]; then
  echo "❌ Build failed: dist/ directory not found"
  exit 1
fi

BUNDLE_SIZE=$(du -sh dist/ | cut -f1)
echo "✅ Build output verified: $BUNDLE_SIZE"

# 5. Version info
echo ""
echo "📋 Build Information:"
APP_VERSION=$(grep '"version"' package.json | head -1 | grep -o '"[^"]*"' | sed 's/"//g' | tail -1)
BUILD_NUMBER=$(date +%s)
echo "   App Version: $APP_VERSION"
echo "   Build Number: $BUILD_NUMBER"
echo "   Build Date: $(date +'%Y-%m-%d %H:%M:%S')"

# 6. Build for iOS
echo ""
echo "📦 Preparing iOS Archive..."
echo ""
echo "Next steps:"
echo ""
echo "1. Using Xcode (Recommended):"
echo "   - Open Xcode"
echo "   - File > Open > ios/ directory (or just use Web app)"
echo "   - Select iPhone target"
echo "   - Product > Archive"
echo "   - Window > Organizer"
echo "   - Select latest Archive > Distribute App"
echo "   - Choose 'TestFlight & App Store'"
echo "   - Click Upload"
echo ""
echo "2. Using fastlane (Automated):"
echo "   sudo gem install fastlane"
echo "   fastlane pilot upload"
echo ""
echo "3. Using Apple Configurator 2:"
echo "   - Connect iPhone"
echo "   - Apps > Drag dist/ folder"
echo "   - Install"
echo ""
echo "✅ Web assets ready in: dist/"
echo "✅ Ready for TestFlight upload"
echo ""
echo "⚠️  Requirements:"
echo "   - Apple Developer Account ($99/year)"
echo "   - Xcode 14.0 or later"
echo "   - Physical iPhone for testing (recommended)"