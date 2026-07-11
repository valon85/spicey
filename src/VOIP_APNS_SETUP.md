# 🔧 VoIP Push Setup Guide - CRITICAL

## Problem
Your app is **NOT** receiving calls in background/closed state because:
- ❌ Firebase FCM **cannot** send VoIP pushes
- ❌ VoIP pushes **must** use Apple Push Network (APN) directly
- ❌ Only APN can wake your app for calls like WhatsApp/FaceTime

## Solution

### Step 1: Generate APN Auth Key (.p8 file)

1. Go to [Apple Developer Portal](https://developer.apple.com/account/resources/authkeys/list)
2. Click **"+"** to create new key
3. Select **"Push Notifications auth key"**
4. Name it: `Spicey VoIP Push`
5. Click **Continue** → **Register**
6. Download the `.p8` file (e.g., `AuthKey_ABC123DEF456.p8`)

**⚠️ IMPORTANT:** You can only download this file ONCE! Save it securely.

### Step 2: Find Your Credentials

Open the downloaded `.p8` file in a text editor - it contains:
```
-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...
...long string...
-----END PRIVATE KEY-----
```

You need:
1. **Key ID** - Found in filename: `AuthKey_ABC123DEF456.p8` → `ABC123DEF456`
2. **Team ID** - Apple Developer Portal → Membership → Team ID
3. **Bundle ID** - Your app's bundle identifier (e.g., `com.spicey.app`)
4. **Auth Key** - The entire content of the `.p8` file (including BEGIN/END lines)

### Step 3: Add to Base44 Secrets

Go to **Base44 Dashboard → Settings → Environment Variables** and add:

```
APN_KEY_ID=ABC123DEF456
APN_TEAM_ID=XYZ123456
APN_BUNDLE_ID=com.spicey.app
APN_AUTH_KEY=-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...
...entire key content...
-----END PRIVATE KEY-----
```

**⚠️ CRITICAL:** The `APN_AUTH_KEY` must include the entire `.p8` file content with newlines!

### Step 4: Verify iOS App Configuration

In Xcode, ensure these are set:

**Info.plist:**
```xml
<key>UIBackgroundModes</key>
<array>
    <string>fetch</string>
    <string>remote-notification</string>
    <string>voip</string>
    <string>audio</string>
</array>
```

**Signing & Capabilities:**
- ✅ Push Notifications
- ✅ Background Modes → Voice over IP
- ✅ Background Modes → Remote notifications

### Step 5: Test VoIP Token Registration

On your iPhone:
1. Open the app
2. Login
3. Open browser console (Safari Web Inspector)
4. Look for: `[VoIP] Token retrieved: <64-char-hex-token>`

**VoIP tokens are 64 hex characters** (different from regular push tokens)

### Step 6: Test Call

1. User A (iPhone) → User B (iPhone)
2. User B closes app completely
3. User A initiates call
4. User B should see **native CallKit UI** with ringing

### Debugging

**Check logs in Base44:**
```
[VoIP] Sending VoIP push to token: abc123...
[VoIP] APN response: { sent: [...], failed: [] }
[VoIP] VoIP push sent successfully!
```

**Common errors:**
- `BadDeviceToken` - Token is invalid or app not on real device
- `BadCertificateEnvironment` - Using dev cert for production (VoIP always production)
- `MissingBundleIdentifier` - APN_BUNDLE_ID doesn't match app
- `InvalidProviderToken` - APN_AUTH_KEY is malformed

**Check UserProfile:**
```javascript
// In browser console:
const profile = await base44.entities.UserProfile.filter({ user_id: user.id });
console.log('VoIP token:', profile[0].voip_push_token);
// Should be 64 hex characters
```

## How It Works

1. **App opens** → iOS registers for VoIP → 64-char token saved to UserProfile
2. **Call initiated** → Backend sends VoIP push via APN (not Firebase!)
3. **iOS receives VoIP push** → Wakes app from background/closed
4. **AppDelegate** → `didReceiveIncomingPushWith` → Reports to CallKit
5. **CallKit** → Shows native call UI with system ringtone

## Why Firebase Doesn't Work for VoIP

| Feature | Firebase FCM | Apple APN VoIP |
|---------|-------------|----------------|
| Wake app from closed | ❌ No | ✅ Yes |
| High priority | ⚠️ Limited | ✅ Guaranteed |
| System ringtone | ❌ No | ✅ Yes |
| CallKit integration | ❌ No | ✅ Yes |
| Background execution | ⚠️ Restricted | ✅ Full |

**VoIP pushes are SPECIAL** - only Apple's APN can send them!

## Next Steps

1. ✅ Generate APN Auth Key (.p8)
2. ✅ Add 4 secrets to Base44
3. ✅ Test VoIP token appears in UserProfile
4. ✅ Test call with app closed
5. ✅ Verify CallKit UI shows

Once APN credentials are set, calls will work exactly like WhatsApp/FaceTime! 📱🔔