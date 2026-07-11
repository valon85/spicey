#!/bin/bash

# SPICEY - FORCE NUCLEAR REBUILD WITH PROOF
# This script will PROVE the bundle changed

set -e

echo "🔥 SPICEY - FORCE NUCLEAR REBUILD WITH VERIFICATION"
echo "===================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}STEP 1: Checking OLD bundle before cleanup...${NC}"
OLD_DIST_BUNDLE=""
OLD_IOS_BUNDLE=""

if [ -d "dist/assets" ]; then
  OLD_DIST_BUNDLE=$(ls dist/assets/index-*.js 2>/dev/null | head -1 | xargs basename 2>/dev/null || echo "none")
  echo "   Current dist bundle: $OLD_DIST_BUNDLE"
fi

if [ -d "ios/App/App/www/assets" ]; then
  OLD_IOS_BUNDLE=$(ls ios/App/App/www/assets/index-*.js 2>/dev/null | head -1 | xargs basename 2>/dev/null || echo "none")
  echo "   Current iOS bundle:  $OLD_IOS_BUNDLE"
fi

if [[ "$OLD_DIST_BUNDLE" == *"BgPJe7mR"* ]] || [[ "$OLD_IOS_BUNDLE" == *"BgPJe7mR"* ]]; then
  echo -e "${RED}⚠️  FOUND OLD BROKEN BUNDLE (BgPJe7mR) - Will be deleted${NC}"
fi
echo ""

echo -e "${YELLOW}STEP 2: NUCLEAR DELETE - Removing EVERYTHING...${NC}"
echo "   Deleting dist/"
rm -rf dist/
echo "   Deleting node_modules/.vite/"
rm -rf node_modules/.vite/
echo "   Deleting .vite/"
rm -rf .vite/
echo "   Deleting ios/App/App/public/*"
rm -rf ios/App/App/public/*
echo "   Deleting ios/App/App/www/*"
rm -rf ios/App/App/www/*
echo "   Deleting ios/App/DerivedData/"
rm -rf ios/App/DerivedData/
echo "   Deleting Xcode DerivedData"
rm -rf ~/Library/Developer/Xcode/DerivedData/App-*
echo -e "${GREEN}✅ All deleted${NC}"
echo ""

echo -e "${YELLOW}STEP 3: Deleting node_modules...${NC}"
rm -rf node_modules/
echo -e "${GREEN}✅ node_modules deleted${NC}"
echo ""

echo -e "${YELLOW}STEP 4: Installing dependencies (this may take 2-3 minutes)...${NC}"
npm ci --production
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

echo -e "${YELLOW}STEP 5: Building FRESH bundle...${NC}"
npm run build
echo -e "${GREEN}✅ Build complete${NC}"
echo ""

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}STEP 6: VERIFYING NEW BUNDLE (CRITICAL PROOF)${NC}"
echo -e "${BLUE}==================================================${NC}"
echo ""

# Check dist folder exists
if [ ! -d "dist/assets" ]; then
  echo -e "${RED}❌ CRITICAL: dist/assets/ folder does not exist!${NC}"
  echo -e "${RED}   Build failed.${NC}"
  exit 1
fi

# Get NEW bundle filename
NEW_DIST_BUNDLE=$(ls dist/assets/index-*.js 2>/dev/null | head -1 | xargs basename 2>/dev/null)

if [ -z "$NEW_DIST_BUNDLE" ]; then
  echo -e "${RED}❌ CRITICAL: No index-*.js found in dist/assets/${NC}"
  ls -la dist/assets/ || true
  exit 1
fi

echo -e "${GREEN}✅ PROOF: New dist bundle: $NEW_DIST_BUNDLE${NC}"

# Verify it's NOT the old broken bundle
if [[ "$NEW_DIST_BUNDLE" == *"BgPJe7mR"* ]]; then
  echo -e "${RED}❌ CRITICAL ERROR: Still building OLD bundle (BgPJe7mR)!${NC}"
  echo -e "${RED}   Vite cache was not cleared properly.${NC}"
  echo -e "${RED}   Checking what's in dist/assets:${NC}"
  ls -la dist/assets/
  exit 1
fi

echo -e "${GREEN}✅ Confirmed: NOT the old BgPJe7mR bundle${NC}"
echo ""

echo -e "${YELLOW}STEP 7: Scanning bundle for 'NAV GUARD'...${NC}"
if grep -q "NAV GUARD" "dist/assets/$NEW_DIST_BUNDLE" 2>/dev/null; then
  echo -e "${RED}❌ CRITICAL: 'NAV GUARD' found in dist bundle!${NC}"
  echo -e "${RED}   Showing matches:${NC}"
  grep -o "NAV GUARD" "dist/assets/$NEW_DIST_BUNDLE" | head -5
  exit 1
fi
echo -e "${GREEN}✅ Confirmed: 'NAV GUARD' NOT in dist bundle${NC}"
echo ""

echo -e "${YELLOW}STEP 8: Scanning for 'readonly property'...${NC}"
if grep -q "readonly property" "dist/assets/$NEW_DIST_BUNDLE" 2>/dev/null; then
  echo -e "${RED}❌ CRITICAL: 'readonly property' code found!${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Confirmed: 'readonly property' NOT in bundle${NC}"
echo ""

echo -e "${YELLOW}STEP 9: Force syncing to iOS...${NC}"
npx cap sync ios --force
echo -e "${GREEN}✅ Capacitor sync complete${NC}"
echo ""

echo -e "${YELLOW}STEP 10: Verifying iOS www folder...${NC}"

if [ ! -d "ios/App/App/www/assets" ]; then
  echo -e "${RED}❌ CRITICAL: ios/App/App/www/assets/ does not exist!${NC}"
  exit 1
fi

NEW_IOS_BUNDLE=$(ls ios/App/App/www/assets/index-*.js 2>/dev/null | head -1 | xargs basename 2>/dev/null)

if [ -z "$NEW_IOS_BUNDLE" ]; then
  echo -e "${RED}❌ CRITICAL: No bundle in iOS www folder!${NC}"
  ls -la ios/App/App/www/assets/ || true
  exit 1
fi

echo -e "${GREEN}✅ PROOF: iOS bundle: $NEW_IOS_BUNDLE${NC}"

# Verify iOS bundle matches dist
if [[ "$NEW_IOS_BUNDLE" != "$NEW_DIST_BUNDLE" ]]; then
  echo -e "${RED}❌ MISMATCH: iOS bundle different from dist!${NC}"
  echo -e "${RED}   dist: $NEW_DIST_BUNDLE${NC}"
  echo -e "${RED}   iOS:  $NEW_IOS_BUNDLE${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Confirmed: iOS bundle MATCHES dist bundle${NC}"
echo ""

echo -e "${YELLOW}STEP 11: Verifying iOS bundle has NO 'NAV GUARD'...${NC}"
if grep -q "NAV GUARD" "ios/App/App/www/assets/$NEW_IOS_BUNDLE" 2>/dev/null; then
  echo -e "${RED}❌ CRITICAL: 'NAV GUARD' found in iOS bundle!${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Confirmed: 'NAV GUARD' NOT in iOS bundle${NC}"
echo ""

echo -e "${YELLOW}STEP 12: Checking that OLD BgPJe7mR is GONE...${NC}"
if [ -f "dist/assets/index-BgPJe7mR.js" ]; then
  echo -e "${RED}❌ OLD BUNDLE STILL EXISTS in dist!${NC}"
  exit 1
fi

if [ -f "ios/App/App/www/assets/index-BgPJe7mR.js" ]; then
  echo -e "${RED}❌ OLD BUNDLE STILL EXISTS in iOS!${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Confirmed: index-BgPJe7mR.js is DELETED${NC}"
echo ""

echo -e "${BLUE}==================================================${NC}"
echo -e "${GREEN}✅✅✅  REBUILD COMPLETE - VERIFIED  ✅✅✅${NC}"
echo -e "${BLUE}==================================================${NC}"
echo ""
echo -e "${GREEN}FINAL PROOF:${NC}"
echo "  ✅ Dist bundle:  $NEW_DIST_BUNDLE"
echo "  ✅ iOS bundle:   $NEW_IOS_BUNDLE"
echo "  ✅ Bundles match: YES"
echo "  ✅ Old BgPJe7mR deleted: YES"
echo "  ✅ No 'NAV GUARD' in bundle: YES"
echo "  ✅ No 'readonly property' code: YES"
echo ""
echo -e "${YELLOW}📱 READY FOR XCODE BUILD:${NC}"
echo ""
echo "1. Open Xcode:"
echo "   cd ios/App"
echo "   open App.xcworkspace"
echo ""
echo "2. In Xcode:"
echo "   - Product → Clean Build Folder (Shift+Cmd+K)"
echo "   - DELETE app from iPhone"
echo "   - Product → Build (Cmd+B)"
echo ""
echo "3. Xcode Console should show:"
echo "   - Bundle: $NEW_DIST_BUNDLE"
echo "   - NO 'STARTUP JS ERROR'"
echo "   - NO '[NAV GUARD]' messages"
echo ""
echo -e "${GREEN}Build verified and ready!${NC}"