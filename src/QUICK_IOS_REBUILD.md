# ⚠️ URGENT: iOS Rebuild Checklist

## Current Status
✅ Code updated with Capacitor Preferences  
✅ Version markers added (AUTH VERSION 2, BASE44 CLIENT V2)  
❌ iOS app NOT rebuilt (old build still running)

## Quick Fix (5 minutes)

### Run These Commands:

```bash
# 1. Verify Capacitor Preferences installed
npm list @capacitor/preferences

# 2. Sync to iOS (CRITICAL - copies new code)
npx cap sync ios

# 3. Open Xcode
npx cap open ios
```

### Then in Xcode:

1. **Press `Cmd + Shift + K`** (Clean Build Folder)
2. **Press `Cmd + R`** (Rebuild and Run)

## What You Should See in Xcode Console:

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
[AUTH] Native iOS: Checking Capacitor Preferences...
[AUTH] STEP 1 - Token Storage Check:
  - Storage Type: Capacitor Preferences (Native iOS)
  - Token Found: true/false
```

## If You DON'T See Version Markers:

### Option A: Delete App + Rebuild

1. **Delete app from device/simulator** (long press → Delete App)
2. **Clean Xcode derived data:**
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData
   ```
3. **Resync and rebuild:**
   ```bash
   npx cap sync ios
   # Open Xcode, Cmd+Shift+K, Cmd+R
   ```

### Option B: Nuclear Rebuild

```bash
# Delete iOS build
rm -rf ios/App/App/public/*
rm -rf ios/App/Pods
rm -rf ios/App/.pod

# Reinstall
npm install
npx cap sync ios

# Open Xcode, clean, rebuild
```

## Verification Checklist:

- [ ] `npx cap sync ios` completed without errors
- [ ] Xcode build succeeded
- [ ] App launched on device/simulator
- [ ] Xcode console shows "AUTH VERSION 2"
- [ ] Xcode console shows "BASE44 CLIENT V2"
- [ ] Logs show "Checking Capacitor Preferences..."
- [ ] Token storage verification appears

## Common Issues:

### "isNative: false"
→ You're not running from Xcode. Must run from Xcode, not Safari.

### "Preferences.get is not a function"
→ Capacitor Preferences plugin not synced. Run `npx cap sync ios` again.

### Old logs still showing
→ Delete app from device, clean derived data, rebuild.

---

**Bottom line:** The code is correct. You just need to rebuild the iOS app.