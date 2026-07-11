# 🚨 MANUAL CLEAN REBUILD - STEP BY STEP

**DO THESE COMMANDS IN ORDER - DO NOT SKIP ANY STEP**

## STEP 1: Open Terminal in Project Root
```bash
cd /path/to/your/spicey/project
```

## STEP 2: DELETE EVERYTHING (Copy-paste these commands one by one)

```bash
# Delete build folders
rm -rf dist/
rm -rf node_modules/.vite/
rm -rf .vite/

# Delete iOS copied assets
rm -rf ios/App/App/public/*
rm -rf ios/App/App/www/*

# Delete Xcode derived data
rm -rf ios/App/DerivedData/
rm -rf ~/Library/Developer/Xcode/DerivedData/App-*
```

## STEP 3: Delete node_modules and reinstall
```bash
rm -rf node_modules/
npm ci --production
```

## STEP 4: Build fresh
```bash
npm run build
```

## STEP 5: VERIFY NEW BUNDLE (CRITICAL!)
```bash
# List the new bundle files
ls -la dist/assets/index-*.js

# Should show something like: index-BmK9x2Lp.js (NEW hash)
# Should NOT show: index-BgPJe7mR.js (OLD broken bundle)
```

**⚠️ If you still see `BgPJe7mR`, STOP and tell me immediately!**

## STEP 6: Check for NAV GUARD in bundle
```bash
# Get the bundle filename
BUNDLE_FILE=$(ls dist/assets/index-*.js | head -1 | xargs basename)

# Search for NAV GUARD
grep "NAV GUARD" "dist/assets/$BUNDLE_FILE" && echo "❌ FOUND NAV GUARD!" || echo "✅ No NAV GUARD found"
```

**⚠️ If "NAV GUARD" is found, STOP and tell me!**

## STEP 7: Sync Capacitor (force copy)
```bash
cd ios/App
npx cap sync ios --force
```

## STEP 8: Verify iOS www folder
```bash
# Check what's in iOS www folder
ls -la ios/App/App/www/assets/index-*.js

# Should match the dist folder bundle
# Should NOT be BgPJe7mR
```

## STEP 9: Open Xcode
```bash
open App.xcworkspace
```

## STEP 10: In Xcode - CRITICAL STEPS

1. **Product → Clean Build Folder** (Shift+Cmd+K)
   - Wait for it to finish

2. **Delete app from iPhone** (if already installed)
   - Long press Spicey icon → Remove App → Delete App

3. **Select your iPhone device** from dropdown

4. **Product → Build** (Cmd+B)
   - Wait 1-2 minutes for build

5. **Watch Xcode Console** for:
   - ✅ `=== MAIN.JSX LOADED === protocol: capacitor:`
   - ✅ `[MAIN] React app rendered successfully`
   - ✅ Bundle filename should be NEW hash (not BgPJe7mR)
   
   - ❌ Should NOT see: `STARTUP JS ERROR`
   - ❌ Should NOT see: `readonly property`
   - ❌ Should NOT see: `[NAV GUARD]` messages

## VERIFICATION CHECKLIST

Before running in Xcode, verify:

- [ ] `dist/assets/` has NEW bundle (not BgPJe7mR)
- [ ] `grep "NAV GUARD"` returned nothing
- [ ] `ios/App/App/www/assets/` has SAME new bundle
- [ ] Xcode Clean Build Folder was done
- [ ] Old app was deleted from iPhone

## EXPECTED RESULT

**Xcode Console should show:**
```
=== MAIN.JSX LOADED === protocol: capacitor: timestamp: 2026-06-02T...
[MAIN] Starting app, isCapacitorNative: true protocol: capacitor:
[MAIN] Root element found: true
[MAIN] React app rendered successfully
```

**App on iPhone:**
- Opens directly to Spicey login
- No Safari browser
- No Base44 website redirect
- Login form works

## IF IT STILL FAILS

Run these diagnostic commands and send me the output:

```bash
# 1. What bundle is in dist?
ls -la dist/assets/index-*.js

# 2. What bundle is in iOS www?
ls -la ios/App/App/www/assets/index-*.js

# 3. Is NAV GUARD in the bundle?
grep -o "NAV GUARD" dist/assets/index-*.js | head -5

# 4. Is "readonly property" in the bundle?
grep -o "readonly property" dist/assets/index-*.js | head -5

# 5. Check Vite cache
ls -la node_modules/.vite/ 2>/dev/null || echo "No Vite cache"
```

---

**DO NOT PROCEED TO XCODE UNTIL:**
- ✅ Bundle hash is NEW (not BgPJe7mR)
- ✅ No "NAV GUARD" in bundle
- ✅ iOS www folder synced