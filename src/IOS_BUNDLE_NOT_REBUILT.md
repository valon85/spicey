# 🚨 CRITICAL: iOS Bundle Not Rebuilt

## Diagnosis

**You're seeing:**
```
[AUTH] Native detected - setting auth state to unauthenticated
user: null
```

**You're NOT seeing:**
```
[AUTH VERSION 2] Capacitor Preferences integration active
[AUTH VERSION 2] If you see this, iOS bundle was rebuilt
```

## Conclusion

**Your iOS app is running OLD code.** The new AuthContext with Capacitor Preferences was never synced/built into the iOS bundle.

## The Fix (3 Steps)

### Step 1: Sync Capacitor to iOS

```bash
npx cap sync ios
```

**Expected output:**
```
✔ Copying web assets to ios/App/App/public
✔ Copying capacitor.config.json
✔ Installing iOS dependencies
✔ Syncing iOS project
```

### Step 2: Open Xcode

```bash
npx cap open ios
```

### Step 3: Clean & Rebuild in Xcode

1. **Press `Cmd + Shift + K`** (Clean Build Folder)
2. **Wait for clean to complete**
3. **Press `Cmd + R`** (Rebuild and Run)

## Verification

After rebuild, Xcode console MUST show:

```
╔══════════════════════════════════════════════════════╗
║   AUTH VERSION 2 - CAPACITOR PREFERENCES LOADED      ║
╚══════════════════════════════════════════════════════╝

[AUTH VERSION 2] Capacitor Preferences integration active
[AUTH VERSION 2] If you see this, iOS bundle was rebuilt

═══════════════════════════════════════════════════════
[AUTH] AuthProvider mounted
[AUTH] isNative: true
[AUTH] protocol: capacitor:

═══════════════════════════════════════════════════════
[AUTH] Native iOS: Checking Capacitor Preferences...
[AUTH] STEP 1 - Token Storage Check:
  - Storage Type: Capacitor Preferences (Native iOS)
```

## If [AUTH VERSION 2] Still Doesn't Appear

### Option A: Delete App Completely

1. **Delete app from device/simulator** (long press → Delete App)
2. **Clean Xcode derived data:**
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData
   ```
3. **Resync:**
   ```bash
   npx cap sync ios
   ```
4. **Rebuild in Xcode** (Cmd+Shift+K, then Cmd+R)

### Option B: Nuclear Option

```bash
# Delete everything
rm -rf ios/App/App/public/*
rm -rf ios/App/Pods
rm -rf ios/App/.pod

# Reinstall
npm install
npx cap sync ios

# Open Xcode and rebuild
npx cap open ios
# Then Cmd+Shift+K, Cmd+R
```

## Quick Checklist

- [ ] `npx cap sync ios` completed without errors
- [ ] Xcode build succeeded (no red errors)
- [ ] App launched on device/simulator
- [ ] Xcode shows `[AUTH VERSION 2]` within first 10 lines
- [ ] Xcode shows `Checking Capacitor Preferences...`
- [ ] Token storage verification appears

## Why This Happens

Capacitor copies your web code to `ios/App/App/public` during `cap sync`. If you skip this step or don't rebuild in Xcode, the iOS app continues running the old bundle.

**The web preview ≠ iOS app.** You must rebuild the native iOS bundle.

---

**Bottom line:** Run `npx cap sync ios`, open Xcode, clean, rebuild.