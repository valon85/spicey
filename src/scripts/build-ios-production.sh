#!/bin/bash

# SPICEY App - iOS Production Build Script
# This script ensures a clean build with proper bundle ID and cache busting
# Usage: bash scripts/build-ios-production.sh

set -e

echo "🔥 SPICEY iOS Production Build"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Clean everything
echo -e "${YELLOW}📦 Step 1: Cleaning previous builds...${NC}"
rm -rf dist/ 2>/dev/null || true
rm -rf node_modules/.vite 2>/dev/null || true
rm -rf ios/App/App/public 2>/dev/null || true
echo -e "${GREEN}✅ Cleaned${NC}"

# 2. Install dependencies (clean install)
echo -e "${YELLOW}📥 Step 2: Installing dependencies...${NC}"
npm ci --production
echo -e "${GREEN}✅ Dependencies installed${NC}"

# 3. Build optimized web bundle
echo -e "${YELLOW}⚙️  Step 3: Building optimized web bundle...${NC}"
npm run build
echo -e "${GREEN}✅ Build complete${NC}"

# 4. Verify build output
echo -e "${YELLOW}✅ Step 4: Verifying build output...${NC}"
if [ ! -d "dist" ]; then
  echo -e "${RED}❌ Build failed: dist/ directory not found${NC}"
  exit 1
fi

BUNDLE_SIZE=$(du -sh dist/ | cut -f1)
echo -e "${GREEN}✅ Build output verified: $BUNDLE_SIZE${NC}"

# 5. Sync Capacitor
echo -e "${YELLOW}🔄 Step 5: Syncing Capacitor...${NC}"
npx cap sync ios
echo -e "${GREEN}✅ Capacitor synced${NC}"

# 6. Verify bundle ID
echo -e "${YELLOW}🔍 Step 6: Verifying bundle configuration...${NC}"
BUNDLE_ID=$(grep -o '<key>BUNDLE_ID</key><string>[^<]*</string>' ios/App/App/GoogleService-Info.plist | grep -o 'com\.[^<]*')
echo -e "${GREEN}✅ Bundle ID: $BUNDLE_ID${NC}"

if [ "$BUNDLE_ID" != "com.spicey.app" ]; then
  echo -e "${RED}❌ Bundle ID mismatch! Expected: com.spicey.app, Got: $BUNDLE_ID${NC}"
  exit 1
fi

# 7. Show next steps
echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✅ BUILD READY FOR XCODE${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1. Open Xcode:"
echo "   cd ios/App"
echo "   open App.xcworkspace"
echo ""
echo "2. In Xcode:"
echo "   - Select your Team in Signing & Capabilities"
echo "   - Select physical iPhone device (not simulator)"
echo "   - Product → Clean Build Folder (Shift+Cmd+K)"
echo "   - Product → Build (Cmd+B)"
echo ""
echo "3. Test on iPhone:"
echo "   - App should open directly to Spicey (not Base44)"
echo "   - Login/signup should work without redirects"
echo "   - Enable notifications when prompted"
echo "   - Test VoIP calls (app closed)"
echo "   - Test message notifications (app closed)"
echo ""
echo "4. For App Store/ TestFlight:"
echo "   - Product → Archive"
echo "   - Distribute App → App Store Connect"
echo "   - Upload for TestFlight"
echo ""
echo -e "${YELLOW}⚠️  Requirements:${NC}"
echo "   - Apple Developer Account ($99/year)"
echo "   - Valid provisioning profile for com.spicey.app"
echo "   - Physical iPhone for testing"
echo "   - GoogleService-Info.plist with correct bundle ID"
echo ""