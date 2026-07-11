# 🔧 iOS Capacitor Preferences - Rebuild Required

## Problem
The Capacitor Preferences logs are not appearing in Xcode, which means either:
1. The Capacitor plugin wasn't synced to the native iOS project
2. The app bundle wasn't rebuilt after code changes
3. The old build is still cached

## Solution - Complete Rebuild Process

### Step 1: Verify Capacitor Preferences is Installed

```bash
npm list @capacitor/preferences
```

Should show: `@capacitor/preferences@6.0.4`

If not installed:
```bash
npm install @capacitor/preferences@6.0.4
```

### Step 2: Sync Capacitor to iOS

**CRITICAL**: This step copies the web code and plugins to the native iOS project.

```bash
npx cap sync ios
```

**Expected output:**
```
✔ Copying web assets to ios/App/App/public
✔ Copying capacitor.config.json to ios/App/App
✔ Copying native plugins...
✔ Installing iOS dependencies...
✔ Syncing iOS project...
```

### Step 3: Open Xcode Project

```bash
npx cap open ios
```

### Step 4: Clean Build Folder in Xcode

**In Xcode:**
1. Press `Cmd + Shift + K` (or Product → Clean Build Folder)
2. Wait for clean to complete

### Step 5: Rebuild and Run

**In Xcode:**
1. Select your iOS device/simulator
2. Press `Cmd + R` (or Product → Run)
3. Wait for build and deployment

### Step 6: Verify Version Markers in Xcode Console

**You SHOULD see these logs immediately on app startup:**

```
╔══════════════════════════════════════════════════════╗
║   AUTH VERSION 2 - CAPACITOR PREFERENCES LOADED      ║
║   Build Time: 2026-06-06T...                        ║
╚══════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════╗
║  BASE44 CLIENT V2 - CAPACITOR PREFERENCES LOADED     ║
║  Build: 2026-06-06T...                               ║
╚══════════════════════════════════════════════════════╝

═══════════════════════════════════════════════════════
[AUTH] AuthProvider mounted
[AUTH] isNative: true
[AUTH] protocol: capacitor:
═══════════════════════════════════════════════════════

═══════════════════════════════════════════════════════
[AUTH] initAuth started
[AUTH] isNative: true
[AUTH] Native iOS: Checking Capacitor Preferences...
[AUTH] STEP 1 - Token Storage Check:
  - Storage Type: Capacitor Preferences (Native iOS)
  - Token Found: true/false
  - Token Preview: eyJhbGciOiJIUzI1NiIs...
```

## Troubleshooting

### If you DON'T see "AUTH VERSION 2" logs:

**The old build is still cached. Try:**

1. **Delete the app from the device/simulator**
   - Long press the app icon → Remove App → Delete App

2. **Clean Xcode derived data:**
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData
   ```

3. **Repeat Steps 2-5 above**

### If you see "isNative: false":

**The Capacitor protocol isn't being detected. Check:**

1. **Are you running from Xcode?**
   - Must run from Xcode, not Safari
   - Check URL bar in app: should show `capacitor://` not `http://` or `https://`

2. **Verify capacitor.config.json exists:**
   ```bash
   cat capacitor.config.json
   ```
   Should have:
   ```json
   {
     "appId": "com.spicey.app",
     "appName": "Spicey",
     ...
   }
   ```

### If Capacitor Preferences.get() fails:

**The plugin wasn't synced properly:**

1. **Check iOS Podfile includes Preferences:**
   ```bash
   cat ios/App/Podfile | grep -i capacitor
   ```

2. **Reinstall pods:**
   ```bash
   cd ios/App
   pod deintegrate
   pod install
   cd ../..
   ```

3. **Resync:**
   ```bash
   npx cap sync ios
   ```

4. **Rebuild in Xcode**

## Quick Diagnostic Commands

Run these in your terminal:

```bash
# 1. Check if Capacitor Preferences is installed
npm list @capacitor/preferences

# 2. Check capacitor config
cat capacitor.config.json

# 3. Check if iOS folder exists
ls -la ios/App/App/

# 4. Sync to iOS
npx cap sync ios

# 5. Open Xcode
npx cap open ios
```

## Success Indicators

✅ You know it's working when Xcode shows:

```
[AUTH] Native iOS: Checking Capacitor Preferences...
[AUTH] STEP 1 - Token Storage Check:
  - Storage Type: Capacitor Preferences (Native iOS)
  - Token Found: true
[TOKEN_STORAGE] Native iOS - Preferences.get() result: { found: true, ... }
[AUTH] STEP 3 - me() Call Result:
  - Success: true
  - User ID: abc123...
[AUTH] STEP 4 - Setting authenticated state
```

❌ If you only see:
```
[AUTH] Native detected - setting auth state to unauthenticated
user: null
```

Then the Capacitor Preferences code is NOT running - you need to rebuild.

## Nuclear Option (if nothing else works)

```bash
# 1. Delete iOS build completely
rm -rf ios/App/App/public/*
rm -rf ios/App/App/node_modules
rm -rf ios/App/Pods
rm -rf ios/App/.pod

# 2. Reinstall everything
npm install
npx cap sync ios

# 3. Open Xcode and clean build folder
# 4. Rebuild and run
```

---

**Last Updated:** 2026-06-06
**Auth Version:** 2 (Capacitor Preferences)