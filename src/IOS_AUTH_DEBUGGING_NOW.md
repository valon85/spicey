# iOS Auth Debugging - What to Look For

## The Problem

Auth succeeds (token stored, user exists) but **SpiceyAuthModal still renders**. This is a **UI render gating issue**.

## Test Steps

1. **Login successfully** on iOS device
2. **Kill app completely** (swipe up from app switcher)
3. **Relaunch app**
4. **Copy ALL Xcode console logs**
5. **Send me the full logs**

## Critical Log Markers

### 1. Auth Success Event (when login happens)

Look for this AFTER successful login:

```
╔══════════════════════════════════════════════╗
║  DIAG-B: auth-success EVENT RECEIVED @HH:MM:SS
╚══════════════════════════════════════════════╝
DIAG-B: user.id = user123
DIAG-B: user.email = test@example.com
DIAG-B: user.full_name = Test User
DIAG-B: user.role = user
DIAG-B: user object keys = ['id', 'email', 'full_name', 'role']
DIAG-B: ✅ setUser() called with id = user123
DIAG-B: Setting state: isLoadingAuth=false, authChecked=true
DIAG-B: ✅ State update complete — AppContent should see user on next render
DIAG-B: userRef.current = user123
```

**This proves auth succeeded and user was set.**

---

### 2. State Change Tracking

Immediately after auth-success, you should see:

```
╔══════════════════════════════════════════════╗
║  APP: STATE CHANGED @HH:MM:SS
╚══════════════════════════════════════════════╝
APP: user changed = true
APP: auth changed = true
APP: PREV user = NULL
APP: CURR user = id=user123 | email=test@example.com
APP: CURR isLoadingAuth = false
APP: CURR authChecked = true
APP: ✅✅✅ USER JUST SET — Feed should render on next render cycle
APP: user.id = user123
APP: user.email = test@example.com
```

**This proves App.jsx saw the user state change.**

---

### 3. Render Decision (THE CRITICAL ONE)

On app relaunch, look for this:

```
╔══════════════════════════════════════════════╗
║  DIAG-RENDER: AppContent @HH:MM:SS
╚══════════════════════════════════════════════╝
DIAG-RENDER: isLoadingAuth = false
DIAG-RENDER: authChecked = true
DIAG-RENDER: user = id=user123 | email=test@example.com
DIAG-RENDER: user object keys = ['id', 'email', 'full_name', 'role']
DIAG-RENDER: user.full_name = Test User
DIAG-RENDER: user.role = user
DIAG-RENDER: location.pathname = /
DIAG-RENDER: ➡️  user is set, showing Feed
DIAG-RENDER: user.id = user123
DIAG-RENDER: user.email = test@example.com
```

**IF YOU SEE THIS → Feed renders correctly**

OR (the bug):

```
╔══════════════════════════════════════════════╗
║  DIAG-RENDER: AppContent @HH:MM:SS
╚══════════════════════════════════════════════╝
DIAG-RENDER: isLoadingAuth = false
DIAG-RENDER: authChecked = true
DIAG-RENDER: user = NULL
DIAG-RENDER: user object keys = N/A
DIAG-RENDER: user.full_name = undefined
DIAG-RENDER: user.role = undefined
DIAG-RENDER: location.pathname = /
DIAG-RENDER: ➡️  NO USER — showing SpiceyAuthModal
DIAG-RENDER: Reason: authChecked=true, user=NULL
DIAG-RENDER: This means AuthContext.setUser() was NOT called with valid user
DIAG-RENDER: Check AuthContext logs for setUser() calls
```

**IF YOU SEE THIS → Bug! User was lost between auth-success and render**

---

### 4. Auth Restore on Relaunch

Before the render decision, you should see:

```
╔══════════════════════════════════════════════╗
║  DIAG-A: AuthContext initAuth() CALLED       ║
╚══════════════════════════════════════════════╝
DIAG-A: _isNative = true | protocol = capacitor:
DIAG-A: ⏳ iOS native detected — waiting 500ms for Capacitor...
DIAG-A: ✅ Capacitor ready, proceeding with auth restore
DIAG-A: Calling initializeAuth()...
╔══════════════════════════════════════════════╗
║  PRE-AUTH: Starting pre-auth check           ║
╚══════════════════════════════════════════════╝
[PRE-AUTH] ✅ Token found in Capacitor Preferences
[PRE-AUTH] ✅ User found in Capacitor Preferences: user123
╔══════════════════════════════════════════════╗
║  PRE-AUTH: FINAL RESULT                      ║
╚══════════════════════════════════════════════╝
[PRE-AUTH] token found = true
[PRE-AUTH] user found = user123
DIAG-A: initializeAuth() result = id=user123
╔══════════════════════════════════════════════╗
║  DIAG-5: ✅ VALID USER RESTORED              ║
╚══════════════════════════════════════════════╝
DIAG-5: setUser() called with id = user123
DIAG-5: ➡️  SCREEN SHOULD BE: Feed/Home
```

**This proves auth restore succeeded on relaunch.**

---

## What the Logs Will Tell Us

### Scenario A: User Lost Between Renders

**Symptoms:**
- `DIAG-B: auth-success` shows user
- `APP: STATE CHANGED` shows user set
- BUT on relaunch: `DIAG-RENDER: user = NULL`

**Cause:** User state is being reset somewhere between login and relaunch.

**Check for:**
- Any `setUser(null)` calls
- Any errors that clear state
- Capacitor App resume logic interfering

---

### Scenario B: Auth Restore Fails

**Symptoms:**
- Login works fine
- Kill app
- Relaunch: `DIAG-A: initializeAuth() result = NULL`
- Then: `DIAG-6: ⛔ NO USER`

**Cause:** Token not persisting or auth.me() failing on restore.

**Check for:**
- `[PRE-AUTH] ⚠️ NO TOKEN in Capacitor Preferences`
- `[VALIDATE-TOKEN] ❌ Attempt failed`
- Token expiration

---

### Scenario C: Render Logic Wrong

**Symptoms:**
- `DIAG-RENDER: user = id=user123` (user EXISTS!)
- BUT STILL shows `SpiceyAuthModal RENDERED`

**Cause:** Render condition logic is broken.

**This would be a React state/props issue.**

---

## The Smoking Gun

The most important log is:

```
DIAG-RENDER: user = ???
```

If this shows `user = id=user123 | email=...` but SpiceyAuthModal still renders, the render logic is broken.

If this shows `user = NULL` despite auth succeeding, we know user state is being lost.

---

## Send Me

1. **Full Xcode console output** from:
   - Login
   - App kill
   - Relaunch
   - Whatever screen appears (Feed or Signup)

2. **Tell me what screen appeared** after relaunch:
   - Feed (correct)
   - Signup/Login (bug)

3. **Point out the DIAG-RENDER line** that shows the decision

---

## Files Modified

- `lib/AuthContext.jsx` - Enhanced auth-success logging
- `App.jsx` - Enhanced render decision logging with timestamps
- `IOS_AUTH_DEBUGGING_NOW.md` - This guide

**The logs will show EXACTLY why SpiceyAuthModal renders despite auth succeeding.**