# iOS Login Debug Test Checklist

**Purpose:** Identify exactly where the login flow fails on iOS

---

## 📋 Test Steps

### 1. Build & Install
```bash
# Clean build
cd ios/App
rm -rf DerivedData build
xcodebuild clean
npx cap sync ios

# Open in Xcode
open App.xcworkspace

# Build & deploy to iPhone
# Product → Build (⌘B)
# Product → Run (⌘R)
```

### 2. Open Safari Web Inspector (Mac)
- On iPhone: Settings → Safari → Advanced → **Enable Web Inspector**
- On Mac: Safari → Preferences → Advanced → **Show Develop menu**
- Connect iPhone via USB
- In Safari Mac: Develop → [Your iPhone] → [Spicey App]

### 3. Test Login Flow

**Open Console in Safari Web Inspector** and watch for these logs:

#### Step A: Login Button Press
Look for:
```
[AUTH_API] POST /login
```
✅ Expected: API call to base44.com

#### Step B: Token Received
Look for:
```
╔══════════════════════════════════════════════╗
║  RAW SERVER RESPONSE                         ║
╚══════════════════════════════════════════════╝
STATUS: 200
```
✅ Expected: Status 200, token in response

#### Step C: Token Saved
Look for:
```
╔══════════════════════════════════════════════╗
║  FINISH_LOGIN: User found, dispatching       ║
╚══════════════════════════════════════════════╝
[FINISH_LOGIN] user.id: <USER_ID>
[FINISH_LOGIN] ✅ persistLogin completed
[FINISH_LOGIN] 📢 Dispatching auth-success event
[FINISH_LOGIN] ✅ Event dispatched
```
✅ Expected: All these logs appear

#### Step D: AuthContext Receives Event
Look for:
```
╔══════════════════════════════════════════════╗
║  AUTH_CONTEXT: auth-success event RECEIVED   ║
╚══════════════════════════════════════════════╝
[AUTH_CONTEXT] event.detail: user.id=<USER_ID>
[AUTH_CONTEXT] ✅ Setting user: <USER_ID>
[AUTH_CONTEXT] ✅ User state updated, authChecked=true
```
✅ Expected: Event received, user set in state

#### Step E: App Renders Feed
Look for:
```
[AUTH_INIT] ✅ Setting user in state: <USER_ID>
[AUTH_INIT] ✅ User state set, authChecked=true
```
✅ Expected: These logs, then Feed page appears

---

## ❌ If It Fails

### Failure Mode 1: Returns to Signup Screen

**Check:** Do you see these logs?
```
[AUTH_CONTEXT] auth-success event RECEIVED
[AUTH_CONTEXT] ✅ Setting user: <USER_ID>
```

- **NO** → Event not reaching AuthContext (check Step C)
- **YES but still shows Signup** → State bouncing issue

### Failure Mode 2: Token Not Saved

**Check:** After login, do you see:
```
[IOS_DEBUG] ✅ Capacitor Preferences SAVE SUCCESS
[IOS_DEBUG] ✅ localStorage SAVE SUCCESS
```

- **NO** → Token not persisting (Capacitor issue)

### Failure Mode 3: AuthContext Never Initializes User

**Check:** On app restart, do you see:
```
[AUTH_INIT] initializeAuth() CALLED
[AUTH_INIT] TokenStorage.get() returned: YES
[AUTH_INIT] ✅ SUCCESS - returning user to AuthContext
```

- **NO token found** → Storage cleared between sessions
- **Token found but auth.me() fails** → Network/SDK issue

---

## 📊 Report Back

Copy these logs and send:

1. **Full console output** from login button press to final screen
2. **Which failure mode** matches your issue
3. **Last log message** you see before it fails

This will pinpoint exactly where the flow breaks.

---

## 🔧 Quick Fixes

### If Capacitor Preferences not saving:
```bash
# Check Info.plist has proper permissions
# Ensure Capacitor Preferences plugin installed
npm list @capacitor/preferences
```

### If auth-success event not firing:
Check SpiceyAuthModal.jsx line ~160 - the dispatch must happen AFTER persistLogin completes.

### If AuthContext not receiving event:
The event listener must be added BEFORE login completes (check timing in useEffect).

---

**Run this test and send me the console logs.** The logs will show exactly where the flow breaks.