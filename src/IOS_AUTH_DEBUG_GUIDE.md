# iOS Authentication Debugging Guide

## Critical Fix Applied

**Problem**: App was rendering Signup/Login screen BEFORE iOS auth restore completed.

**Root Cause**: `isLoadingAuth` and `authChecked` were being set to `false` before Capacitor Preferences token was read and validated.

**Solution**: Block render until auth is 100% complete.

## How It Works Now

### Render Blocking Logic (App.jsx)

```javascript
// CRITICAL: Block render until auth is fully checked
if (isLoadingAuth || !authChecked) {
  console.log('DIAG-RENDER: ➡️  BLOCKED — showing AuthLoader');
  return <AuthLoader />;
}

// Only after authChecked=true, decide based on user
if (user?.id) {
  // Show Feed
} else {
  // Show Signup/Login
  return <SpiceyAuthModal />;
}
```

### Auth Flow Sequence (iOS Native)

1. **App Mount** → `isLoadingAuth=true`, `authChecked=false`
2. **AuthLoader Shows** → Blocks all other rendering
3. **Wait 500ms** → Capacitor fully ready
4. **Read Capacitor Preferences** → Get token
5. **Inject Token into SDK** → `base44.auth.setToken(token)`
6. **Call auth.me()** → Validate with server
7. **Set User State** → `setUser(restoredUser)`
8. **Set authChecked=true** → Unblock render
9. **Decide Screen**:
   - User exists → Feed
   - No user → Signup/Login

## Console Logs to Check

### Success Flow (Feed Shows)

```
╔══════════════════════════════════════════════╗
║  DIAG-A: AuthContext initAuth() CALLED       ║
╚══════════════════════════════════════════════╝
DIAG-A: _isNative = true | protocol = capacitor:
DIAG-A: Capacitor available = true
DIAG-A: ⏳ iOS native detected — waiting 500ms for Capacitor...
DIAG-A: ✅ Capacitor ready, proceeding with auth restore
DIAG-A: Calling initializeAuth()...
╔══════════════════════════════════════════════╗
║  PRE-AUTH: Starting pre-auth check           ║
╚══════════════════════════════════════════════╝
[PRE-AUTH] isNative: true | protocol: capacitor:
[PRE-AUTH] ✅ Token found in Capacitor Preferences: eyJhbGciOiJIUzI1NiIs...
[PRE-AUTH] ✅ User found in Capacitor Preferences: user123
╔══════════════════════════════════════════════╗
║  PRE-AUTH: FINAL RESULT                      ║
╚══════════════════════════════════════════════╝
[PRE-AUTH] token found = true
[PRE-AUTH] user found = user123
[PRE-AUTH] isNative = true
DIAG-A: initializeAuth() result = id=user123
╔══════════════════════════════════════════════╗
║  DIAG-5: ✅ VALID USER RESTORED              ║
╚══════════════════════════════════════════════╝
DIAG-5: setUser() called with id = user123
DIAG-5: ➡️  SCREEN SHOULD BE: Feed/Home
╔══════════════════════════════════════════════╗
║  ✅ RENDER: User authenticated               ║
╚══════════════════════════════════════════════╝
DIAG-RENDER: ➡️  user is set, showing Feed for id=user123
```

### Failure Flow (Signup Shows)

**Scenario A: No Token Found**

```
[PRE-AUTH] ⚠️ NO TOKEN in Capacitor Preferences (key: base44_access_token)
[PRE-AUTH] ⚠️ NO TOKEN in localStorage (key: base44_access_token)
[PRE-AUTH] ⚠️ NO TOKEN in legacy keys
╔══════════════════════════════════════════════╗
║  PRE-AUTH: FINAL RESULT                      ║
╚══════════════════════════════════════════════╝
[PRE-AUTH] token found = false
[PRE-AUTH] user found = null
[PRE-AUTH] ❌ REASON FOR LOGIN SCREEN: NO TOKEN FOUND IN ANY STORAGE
DIAG-A: initializeAuth() result = NULL
╔══════════════════════════════════════════════╗
║  DIAG-6: ⛔ NO USER — WILL SHOW LOGIN        ║
╚══════════════════════════════════════════════╝
DIAG-6: ➡️  SCREEN WILL BE: SpiceyAuthModal (Login/Signup)
╔══════════════════════════════════════════════╗
║  ⛔ RENDER: No user — showing Auth           ║
╚══════════════════════════════════════════════╝
DIAG-RENDER: ➡️  NO USER — showing SpiceyAuthModal
DIAG-RENDER: Reason: authChecked=true, user=NULL
```

**Scenario B: Token Found But auth.me() Failed**

```
[PRE-AUTH] ✅ Token found in Capacitor Preferences: eyJhbGciOiJIUzI1NiIs...
[VALIDATE-TOKEN] ❌ Attempt 1 failed, status: 401 | msg: Invalid token
[VALIDATE-TOKEN] ❌ Attempt 2 failed, status: 401 | msg: Invalid token
[VALIDATE-TOKEN] ❌ All attempts failed, returning null
DIAG-A: initializeAuth() result = NULL
╔══════════════════════════════════════════════╗
║  DIAG-6: ⛔ NO USER — WILL SHOW LOGIN        ║
╚══════════════════════════════════════════════╝
DIAG-6: ➡️  SCREEN WILL BE: SpiceyAuthModal (Login/Signup)
```

**Scenario C: Auth Restore Ended Too Early**

```
DIAG-A: initAuth error = Some error message
╔══════════════════════════════════════════════╗
║  DIAG-A: ❌ initAuth THREW ERROR             ║
╚══════════════════════════════════════════════╝
DIAG-A: initAuth error = Some error message
DIAG-A: stack = Error: Some error message...
DIAG-6: ➡️  SCREEN WILL BE: SpiceyAuthModal (Login/Signup)
```

## Testing Checklist

### Cold Start (App Kill → Relaunch)

1. **Before Test**: Kill app completely (swipe up from app switcher)
2. **Launch App**: Look for `╔══════════════════════════════════════════════╗` logs
3. **Check Logs**:
   - [ ] `DIAG-A: AuthContext initAuth() CALLED`
   - [ ] `DIAG-A: ⏳ iOS native detected — waiting 500ms for Capacitor...`
   - [ ] `DIAG-A: ✅ Capacitor ready, proceeding with auth restore`
   - [ ] `[PRE-AUTH] ✅ Token found in Capacitor Preferences` OR `⚠️ NO TOKEN`
   - [ ] `DIAG-A: initializeAuth() result = id=XXX` OR `NULL`
   - [ ] `DIAG-5: ✅ VALID USER RESTORED` OR `DIAG-6: ⛔ NO USER`
   - [ ] `✅ RENDER: User authenticated` OR `⛔ RENDER: No user`

4. **Expected Result**:
   - **Token exists**: Feed shows
   - **No token**: Signup/Login shows

### Login Flow

1. **Enter credentials** → Tap Sign In
2. **Check Logs**:
   - [ ] `FINISH_LOGIN: CALLED`
   - [ ] `FINISH_LOGIN: Saving to Capacitor Preferences...`
   - [ ] `FINISH_LOGIN: ✅ Capacitor Preferences saved`
   - [ ] `FINISH_LOGIN: ✅ localStorage saved`
   - [ ] `FINISH_LOGIN: auth-success dispatched`
   - [ ] `DIAG-B: auth-success EVENT RECEIVED`
   - [ ] `DIAG-B: ✅ setUser() called with id = user123`

3. **Expected Result**: Feed shows immediately after login

### Logout Flow

1. **Logout** → Check logs
2. **Check Logs**:
   - [ ] `[AUTH] Intentional logout started`
   - [ ] `[AUTH] Capacitor Preferences cleared`
   - [ ] `[AUTH] localStorage cleared`
   - [ ] `[AUTH] Logout complete — all storage cleared`

3. **Relaunch App**:
   - [ ] `[PRE-AUTH] ⚠️ NO TOKEN in Capacitor Preferences`
   - [ ] `⛔ RENDER: No user — showing Auth`
   - [ ] Signup/Login shows

## Common Issues & Fixes

### Issue: AuthLoader Shows Forever

**Symptom**: Infinite loading spinner, never shows Feed or Login

**Cause**: `authChecked` never set to `true`

**Fix**: Check logs for error in `initAuth()`:
```
DIAG-A: initAuth error = Some error
```

### Issue: Signup Shows Even After Login

**Symptom**: User logs in successfully, but relaunch shows Signup again

**Cause**: Token not saved to Capacitor Preferences

**Fix**: Check logs after login:
```
FINISH_LOGIN: ✅ Capacitor Preferences saved
```

If NOT saved, check `SpiceyAuthModal.finishLogin()` function.

### Issue: Token Found But auth.me() Fails

**Symptom**: Token exists but validation fails

**Cause**: Token expired or invalid

**Fix**: Check logs:
```
[VALIDATE-TOKEN] ❌ Attempt 1 failed, status: 401
```

User needs to re-login.

## Files Modified

1. **lib/AuthContext.jsx**
   - Added 500ms wait for Capacitor on iOS
   - Enhanced logging with clear markers
   - Added iOS fallback with `initializeIOSAuth()`

2. **App.jsx**
   - Block render until `authChecked=true`
   - Show AuthLoader while auth in progress
   - Clear logging of render decision

3. **lib/iosAuthFix.js**
   - Detailed logging of token retrieval
   - Shows exact reason for login screen
   - Checks Capacitor Preferences + localStorage + legacy keys

## Next Steps

1. **Build iOS app** (Xcode → Product → Archive)
2. **Test on real device** (not simulator)
3. **Capture full console logs** from Xcode
4. **Share logs** if issue persists

## Critical: Do NOT Test Until

- [ ] iOS app is rebuilt with these changes
- [ ] Testing on real iOS device (not simulator)
- [ ] Console logs are captured from Xcode

**This fix is NOT tested until verified on real iOS native app.**