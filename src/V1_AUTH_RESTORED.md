# V1 Authentication Flow Restored

## What Changed

Restored the SIMPLE V1 authentication flow that was working. Removed all complex protections and fallback logic.

## V1 Flow (WORKING)

### 1. Login Success
```javascript
// SpiceyAuthModal.jsx
finishLogin(token, email) {
  1. Save token to Capacitor Preferences ✅
  2. Save token to localStorage ✅
  3. Get user via auth.me() ✅
  4. Dispatch auth-success event ✅
}
```

### 2. Auth Restore (App Launch)
```javascript
// AuthContext.jsx
initAuth() {
  1. Call initializeAuth() (reads token from Capacitor/localStorage) ✅
  2. If token valid → setUser(user) ✅
  3. Set authChecked=true ✅
}
```

### 3. App Render Logic
```javascript
// App.jsx
if (user?.id || hasToken) → Render Feed ✅
else if (loading) → Render AuthLoader ✅
else → Render SpiceyAuthModal ✅
```

### 4. Logout
```javascript
// AuthContext.jsx
logout() {
  1. Clear Capacitor Preferences token ✅
  2. Clear localStorage token ✅
  3. Set user=null ✅
}
```

## Test Logs

You will see these logs in Xcode console:

### Login Flow
```
🔑 LOGIN_SUCCESS: Starting...
✅ TOKEN_SAVED: Capacitor + localStorage
✅ USER_OBTAINED: user123
✅ USER_PERSISTED
✅ AUTH_SUCCESS_DISPATCHED: user.id = user123
```

### App Launch (After Login)
```
✅ USER_RESTORED: user123
✅ APP_RENDER_FEED: user.id = user123 | hasToken = true
```

### Logout
```
🚪 LOGOUT_START: Clearing session...
✅ LOGOUT_SUCCESS: Token cleared from Capacitor + localStorage
```

## Files Modified

1. **lib/AuthContext.jsx** - V1 simple initAuth + logout
2. **components/SpiceyAuthModal.jsx** - V1 simple finishLogin
3. **App.jsx** - V1 simple render logic

## What Was Removed

- ❌ Complex protection logic (protectedSetUser, preventUserClear, etc.)
- ❌ iOS auth fallback (initializeIOSAuth)
- ❌ Multiple retry attempts
- ❌ Background refresh logic
- ❌ Extensive logging (kept only essential test logs)

## Why V1 Works

V1 was SIMPLE:
1. Login → Save token → Get user → Dispatch event → Feed renders
2. App launch → Read token → Get user → Feed renders
3. Logout → Clear token → Clear user → Login renders

No complex state protection, no fallbacks, no retries.

## Testing

1. **Login on iOS device** → Should go to Feed ✅
2. **Kill app** → Relaunch → Should still be in Feed ✅
3. **Logout** → Should go to Login ✅
4. **Relaunch after logout** → Should show Login ✅

## If It Still Fails

Check Xcode console for:
- `❌ TOKEN_SAVE_ERROR` → Token not persisting
- `❌ USER_OBTAIN_ERROR` → auth.me() failing
- `⛔ NO_USER_RESTORED` → Token not found on launch
- `⛔ APP_RENDER_AUTH_MODAL` → No user/token found

Send me the full console output from:
1. Login
2. App kill
3. Relaunch