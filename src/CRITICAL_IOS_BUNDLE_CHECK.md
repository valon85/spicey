# 🔍 CRITICAL: iOS Bundle Stale Detection

## The Problem

You're seeing:
```
[LOGIN] auth success
[AUTH] Native: no stored token, skipping me() call
```

But NOT seeing:
- `[LOGIN_STEP_1]` through `[LOGIN_STEP_10]`
- `[AUTH_OVERRIDE]`
- `[TOKEN_STORAGE]`
- `[SPICEY_AUTH_MODAL_LOADED]`

**This means the iOS bundle is STALE - it's running old code.**

## Unique Build Markers Added

I've added unique timestamp markers that will prove if new code is running:

### 1. AuthContext.jsx
```
🚨 AUTH_V3_BUILD_[TIMESTAMP]
```
**Where to look:** Xcode console when app starts

### 2. SpiceyAuthModal.jsx
```
🚨 SPICEY_AUTH_MODAL_LOADED_[TIMESTAMP]
```
**Where to look:** Xcode console when login screen appears

### 3. base44Client.js
```
🚨 CLIENT_V3_[TIMESTAMP]
```
**Where to look:** Xcode console when app starts

## What You Should See

### If iOS Bundle IS REBUILT (New Code Running):
```
[App Launch]
🚨 AUTH_V3_BUILD_24589631  ← UNIQUE MARKER
🚨 CLIENT_V3_24589631      ← UNIQUE MARKER
[AUTH_V3] If you see this, NEW code is running

[Login Screen Appears]
🚨 SPICEY_AUTH_MODAL_LOADED_24589631  ← UNIQUE MARKER

[After Login Click]
🚨 ACTIVE_LOGIN_HANDLER_RUNNING 🚨     ← From login button
[LOGIN_STEP_1] About to call loginViaEmailPassword
[AUTH_OVERRIDE] loginViaEmailPassword called
[TOKEN_STORAGE] SET called
[LOGIN_STEP_6] Token received: true
```

### If iOS Bundle is STALE (Old Code Running):
```
[App Launch]
[No 🚨 markers appear]
[Only old logs like "[AUTH] AuthProvider mounted"]

[Login Screen Appears]
[No 🚨 SPICEY_AUTH_MODAL_LOADED marker]

[After Login Click]
[LOGIN] auth success  ← OLD LOG FORMAT
[AUTH] Native: no stored token  ← OLD LOG FORMAT
```

## IMMEDIATE ACTION REQUIRED

### Step 1: Verify Current State
Run the app and check Xcode console for:
- ❌ If you DON'T see `🚨 AUTH_V3_BUILD_` markers → Bundle is STALE
- ✅ If you DO see `🚨 AUTH_V3_BUILD_` markers → Bundle is FRESH

### Step 2: If Bundle is STALE (Most Likely)

**Terminal Commands:**
```bash
# 1. Navigate to project
cd /path/to/your/project

# 2. Sync Capacitor
npx cap sync ios

# 3. Open in Xcode
npx cap open ios
```

**In Xcode:**
1. **Product → Clean Build Folder** (Shift + Cmd + K)
2. **Delete app from device/simulator**
3. **Product → Build** (Cmd + B)
4. **Run** (Cmd + R)

### Step 3: Verify Rebuild Success

After rebuild, you MUST see in Xcode console:
```
🚨 AUTH_V3_BUILD_[numbers]
🚨 CLIENT_V3_[numbers]
🚨 SPICEY_AUTH_MODAL_LOADED_[numbers]
```

If you DON'T see these markers, the bundle is STILL STALE.

## Nuclear Option (If Normal Rebuild Fails)

```bash
# 1. Delete Derived Data
rm -rf ~/Library/Developer/Xcode/DerivedData

# 2. Delete node_modules
rm -rf node_modules

# 3. Reinstall dependencies
npm install

# 4. Clean rebuild
npx cap sync ios
npx cap open ios

# 5. In Xcode: Clean Build Folder + Rebuild
```

## Why This Happens

Capacitor copies web files to `ios/App/App/public` during `npx cap sync`.

If you don't run `npx cap sync ios` after code changes:
- Xcode builds with OLD files in `ios/App/App/public`
- App runs old code
- New debug logs don't appear
- Token persistence fixes don't work

## The Smoking Gun

**If you see `[LOGIN] auth success` but NOT `🚨 SPICEY_AUTH_MODAL_LOADED_`:**
- You're running old SpiceyAuthModal code
- Need to rebuild iOS bundle immediately

**If you see `🚨 AUTH_V3_BUILD_` but NOT `[LOGIN_STEP_1]`:**
- AuthContext updated but SpiceyAuthModal not updated
- Partial sync - need full rebuild

## Next Steps

1. Run app
2. Watch Xcode console for `🚨` markers
3. If missing → Rebuild iOS bundle
4. If present → Share the full console log

The markers will tell us EXACTLY what code is running.