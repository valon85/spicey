#!/bin/bash

# SPICEY App - AGGRESSIVE NUCLEAR REBUILD WITH VERIFICATION
# This script performs a COMPLETE clean rebuild and verifies NO old code exists

set -e

echo "🔥 SPICEY - AGGRESSIVE NUCLEAR REBUILD"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}🗑️  STEP 1: NUCLEAR CLEAN - Removing ALL artifacts...${NC}"
echo "   - Deleting dist/"
rm -rf dist/
echo "   - Deleting node_modules/.vite/"
rm -rf node_modules/.vite/
echo "   - Deleting .vite/"
rm -rf .vite/
echo "   - Deleting ios/App/App/public/*"
rm -rf ios/App/App/public/*
echo "   - Deleting ios/App/App/www/*"
rm -rf ios/App/App/www/*
echo "   - Deleting ios/App/DerivedData/"
rm -rf ios/App/DerivedData/
echo "   - Deleting Xcode DerivedData (App-*)"
rm -rf ~/Library/Developer/Xcode/DerivedData/App-*
echo -e "${GREEN}✅ All artifacts deleted${NC}"
echo ""

echo -e "${YELLOW}📦 STEP 2: Clean node_modules & reinstall...${NC}"
rm -rf node_modules/
echo "   Running: npm ci --production"
npm ci --production
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

echo -e "${YELLOW}⚙️  STEP 3: Building FRESH web bundle...${NC}"
echo "   Running: npm run build"
npm run build
echo -e "${GREEN}✅ Build complete${NC}"
echo ""

echo -e "${YELLOW}🔍 STEP 4: Verify NEW bundle hash...${NC}"
if [ ! -d "dist/assets" ]; then
  echo -e "${RED}❌ BUILD FAILED: dist/assets/ not found${NC}"
  exit 1
fi

# Get the new bundle filename
NEW_BUNDLE=$(ls dist/assets/index-*.js 2>/dev/null | head -1 | xargs basename)
if [ -z "$NEW_BUNDLE" ]; then
  echo -e "${RED}❌ No index-*.js found in dist/assets/${NC}"
  exit 1
fi

echo -e "${GREEN}✅ NEW bundle: $NEW_BUNDLE${NC}"

# Check if it's the OLD broken bundle
if [[ "$NEW_BUNDLE" == *"BgPJe7mR"* ]]; then
  echo -e "${RED}❌ CRITICAL: Still building OLD bundle (BgPJe7mR)!${NC}"
  echo -e "${RED}   This means Vite cache was not cleared properly.${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Confirmed: NOT the old BgPJe7mR bundle${NC}"
echo ""

echo -e "${YELLOW}🔍 STEP 5: Scan for 'NAV GUARD' in bundle...${NC}"
if grep -q "NAV GUARD" "dist/assets/$NEW_BUNDLE" 2>/dev/null; then
  echo -e "${RED}❌ CRITICAL: 'NAV GUARD' found in bundled JS!${NC}"
  echo -e "${RED}   The old code is still being bundled.${NC}"
  echo -e "${RED}   Checking source files...${NC}"
  grep -r "NAV GUARD" --include="*.jsx" --include="*.js" . || true
  exit 1
fi
echo -e "${GREEN}✅ Confirmed: 'NAV GUARD' NOT in bundle${NC}"
echo ""

echo -e "${YELLOW}🔍 STEP 6: Scan for 'readonly property' in bundle...${NC}"
if grep -q "readonly property" "dist/assets/$NEW_BUNDLE" 2>/dev/null; then
  echo -e "${RED}❌ CRITICAL: 'readonly property' code found in bundle!${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Confirmed: 'readonly property' code NOT in bundle${NC}"
echo ""

echo -e "${YELLOW}🔄 STEP 7: Force Capacitor sync...${NC}"
echo "   Running: npx cap sync ios --force"
npx cap sync ios --force
echo -e "${GREEN}✅ Capacitor synced${NC}"
echo ""

echo -e "${YELLOW}🔍 STEP 8: Verify iOS www folder has NEW bundle...${NC}"
IOS_BUNDLE=$(ls ios/App/App/www/assets/index-*.js 2>/dev/null | head -1 | xargs basename)
if [ -z "$IOS_BUNDLE" ]; then
  echo -e "${RED}❌ iOS www folder is empty!${NC}"
  exit 1
fi
echo -e "${GREEN}✅ iOS bundle: $IOS_BUNDLE${NC}"

if [[ "$IOS_BUNDLE" != "$NEW_BUNDLE" ]]; then
  echo -e "${RED}❌ MISMATCH: iOS has different bundle than dist!${NC}"
  echo -e "${RED}   dist: $NEW_BUNDLE${NC}"
  echo -e "${RED}   iOS:  $IOS_BUNDLE${NC}"
  exit 1
fi
echo -e "${GREEN}✅ iOS bundle matches dist bundle${NC}"
echo ""

echo -e "${YELLOW}🔍 STEP 9: Verify iOS bundle has NO 'NAV GUARD'...${NC}"
if grep -q "NAV GUARD" "ios/App/App/www/assets/$IOS_BUNDLE" 2>/dev/null; then
  echo -e "${RED}❌ CRITICAL: 'NAV GUARD' found in iOS bundle!${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Confirmed: 'NAV GUARD' NOT in iOS bundle${NC}"
echo ""

echo -e "${YELLOW}📝 STEP 10: Verify bundle ID...${NC}"
BUNDLE_ID=$(grep -o '<key>BUNDLE_ID</key><string>[^<]*</string>' ios/App/App/GoogleService-Info.plist 2>/dev/null | grep -o 'com\.[^<]*' || echo "not found")
echo -e "${GREEN}✅ Bundle ID: $BUNDLE_ID${NC}"

if [ "$BUNDLE_ID" != "com.spicey.app" ]; then
  echo -e "${RED}❌ Bundle ID mismatch! Expected: com.spicey.app, Got: $BUNDLE_ID${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Bundle ID correct${NC}"
echo ""

echo -e "${BLUE}==================================================${NC}"
echo -e "${GREEN}✅✅✅  AGGRESSIVE REBUILD COMPLETE  ✅✅✅${NC}"
echo -e "${BLUE}==================================================${NC}"
echo ""
echo -e "${GREEN}VERIFICATION SUMMARY:${NC}"
echo "  ✅ Bundle: $NEW_BUNDLE"
echo "  ✅ NOT old BgPJe7mR bundle"
echo "  ✅ No 'NAV GUARD' in bundle"
echo "  ✅ No 'readonly property' code"
echo "  ✅ iOS www synced correctly"
echo "  ✅ Bundle ID: com.spicey.app"
echo ""
echo -e "${YELLOW}📱 NEXT STEPS IN XCODE:${NC}"
echo ""
echo "1. Open Xcode:"
echo "   cd ios/App"
echo "   open App.xcworkspace"
echo ""
echo "2. In Xcode (CRITICAL):"
echo "   - Product → Clean Build Folder (Shift+Cmd+K)"
echo "   - DELETE app from iPhone if installed"
echo "   - Select your iPhone device"
echo "   - Product → Build (Cmd+B)"
echo ""
echo "3. Verify in Xcode Console:"
echo "   - Should see: '=== MAIN.JSX LOADED ==='"
echo "   - Bundle filename: $NEW_BUNDLE"
echo "   - Should NOT see: 'STARTUP JS ERROR'"
echo "   - Should NOT see: 'NAV GUARD' messages"
echo ""
echo -e "${GREEN}Ready for Xcode build!${NC}"