# iOS Push Notifications & VoIP Fix Guide

## ⚠️ Root Cause
The code in AppDelegate.swift, Info.plist, and all backend functions is CORRECT.
The issue is in **Xcode project Capabilities** and **APNs certificate configuration**.
These cannot be fixed from Base44 — they require manual steps in Xcode and Apple Developer Portal.

---

## STEP 1 — Xcode Capabilities (Most Common Cause)

Open `ios/App/App.xcworkspace` in Xcode:

1. Click on **App** target (left sidebar)
2. Click **Signing & Capabilities** tab
3. Click **+ Capability** and add ALL of these if missing:
   - ✅ **Push Notifications**
   - ✅ **Background Modes** → check these boxes:
     - [x] Audio, AirPlay, and Picture in Picture
     - [x] Voice over IP
     - [x] Background fetch
     - [x] Remote notifications
   - ✅ **PushKit** (search for it — required for VoIP)

> If these are missing, notifications NEVER work regardless of code.

---

## STEP 2 — APNs Certificates in Apple Developer Portal

Go to https://developer.apple.com → Certificates, Identifiers & Profiles:

### For Regular Push Notifications:
1. Certificates → + → **Apple Push Notification service SSL (Sandbox & Production)**
2. Select your App ID → generate → download `.cer` → install in Keychain
3. Export as `.p12` with password → upload to your push server

### For VoIP Push (calls when app is closed):
1. Certificates → + → **VoIP Services Certificate**
2. Select your App ID → generate → download → install
3. Export as `.p12` → this is what `APN_AUTH_KEY` / VoIP keys in secrets should use

> **Your app has these secrets set:** APN_AUTH_KEY, APN_BUNDLE_ID, APN_TEAM_ID, APN_KEY_ID, APN_ENV
> These look correct. The issue is likely the Xcode Capabilities above.

---

## STEP 3 — Verify App ID has Push Enabled

In Apple Developer Portal → Identifiers → your App ID:
- ✅ Push Notifications → must say **Enabled**
- ✅ VoIP → must be checked

If they show "Configurable" instead of "Enabled", click Edit and enable them.

---

## STEP 4 — Entitlements File

In Xcode, check that `App.entitlements` (or `App/App.entitlements`) exists and contains:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>aps-environment</key>
    <string>production</string>
    <key>com.apple.developer.pushkit.unrestricted-voip-connection</key>
    <true/>
</dict>
</plist>
```

For TestFlight: `aps-environment` must be `production` (not `development`).

---

## STEP 5 — Clean Build & Rebuild

After making the above changes:

```bash
cd ios/App
xcodebuild clean

# In Xcode:
# Product → Clean Build Folder (Shift+Cmd+K)
# Product → Build (Cmd+B)
# Then archive for TestFlight
```

---

## STEP 6 — Test Push Delivery

Use this curl command to test APNs directly (replace values):

```bash
# Test regular push notification
curl -v \
  --http2 \
  --cert /path/to/cert.pem \
  -H "apns-topic: com.yourapp.bundleid" \
  -H "apns-push-type: alert" \
  -d '{"aps":{"alert":{"title":"Test","body":"Push works!"},"sound":"default"}}' \
  https://api.push.apple.com/3/device/DEVICE_TOKEN
```

---

## STEP 7 — Verify Provisioning Profile

1. Xcode → Preferences → Accounts → your Apple ID
2. Download all profiles
3. Make sure the provisioning profile used for Archive includes **Push Notifications** entitlement

---

## Checklist Before Archiving for TestFlight

- [ ] Push Notifications capability added in Xcode
- [ ] Background Modes: Voice over IP + Remote Notifications checked
- [ ] App ID has Push Notifications enabled in Developer Portal
- [ ] VoIP Services Certificate created and configured
- [ ] Entitlements file has `aps-environment: production`
- [ ] Provisioning profile updated after enabling push in App ID
- [ ] Clean build done after all changes

---

## What the Code Already Does Correctly ✅

- `Info.plist` has all UIBackgroundModes: voip, remote-notification, audio, fetch
- `AppDelegate.swift` registers PushKit (PKPushRegistry) correctly
- `AppDelegate.swift` calls `reportNewIncomingCall` synchronously (required by iOS)
- Backend functions `sendApnsPush` and `sendVoIPCall` are configured
- `VoIPProvider` React component saves token to backend on launch

The native code is ready. Only Xcode project settings need to be configured.