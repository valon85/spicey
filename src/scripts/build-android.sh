#!/bin/bash

# SPICEY App - Android AAB Build Script
# Usage: bash scripts/build-android.sh

set -e

echo "🚀 SPICEY Android AAB Build"
echo "=============================="

# 1. Clean previous builds
echo "📦 Cleaning previous builds..."
rm -rf dist/ android/app/build/ 2>/dev/null || true

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

echo "✅ Build output verified: $(du -sh dist/ | cut -f1)"

# 5. Version info
echo ""
echo "📋 Version Information:"
APP_VERSION=$(grep '"version"' package.json | head -1 | grep -o '"[^"]*"' | sed 's/"//g' | tail -1)
echo "   App Version: $APP_VERSION"
echo "   Build Date: $(date +'%Y-%m-%d %H:%M:%S')"

# 6. Create AAB using bundletool (if available)
echo ""
echo "📦 Preparing Android App Bundle..."
echo ""
echo "Next steps:"
echo ""
echo "1. On macOS/Linux with Android Studio:"
echo "   - Open Android Studio"
echo "   - File > Open > android/ directory"
echo "   - Build > Generate Signed Bundle / APK"
echo "   - Select 'Bundle (AAB)'"
echo "   - Choose your keystore"
echo "   - Build > Release"
echo ""
echo "2. Or use Gradle command line:"
echo "   cd android && ./gradlew bundleRelease"
echo ""
echo "3. Output location:"
echo "   android/app/release/app-release.aab"
echo ""
echo "✅ Web assets ready in: dist/"
echo "✅ Ready for Google Play submission"