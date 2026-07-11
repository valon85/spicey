# iOS CallKit + VoIP Push Notifications Setup Guide

## ✅ What's Been Fixed

### 1. **Ringtone System**
- ✅ Web Audio API ringtone implemented in `public/ringtone.js`
- ✅ Works when app is open or in background
- ✅ Continuous pulsing pattern (2s on, 2s off)

### 2. **VoIP Push Notifications**
- ✅ Native iOS receives VoIP pushes via `PKPushRegistry`
- ✅ Token saved to both `UserDefaults` and `CapacitorPreferences`
- ✅ Token sent to backend automatically

### 3. **CallKit Integration**
- ✅ Native iOS call UI (like WhatsApp/FaceTime)
- ✅ Works when app is open, background, or closed
- ✅ System ringtone plays automatically (no custom sound file needed)

### 4. **Firebase Cloud Messaging**
- ✅ Updated payload for proper VoIP delivery
- ✅ High priority + content-available flags
- ✅ Thread ID for proper call grouping

## 🔧 Required iOS Build Steps

### Step 1: Add VoIP Background Mode

In Xcode:
1. Open `ios/App/App.xcworkspace`
2. Select your app target
3. Go to **Signing & Capabilities**
4. Click **+ Capability**
5. Add **Background Modes**
6. Check:
   - ✅ **Voice over IP**
   - ✅ **Remote notifications**
   - ✅ **Audio, AirPlay, and Picture in Picture**

### Step 2: Configure Push Notifications

1. In **Signing & Capabilities**, add **Push Notifications**
2. Enable for all targets (App, Share Extension, etc.)

### Step 3: Generate VoIP Certificate

1. Go to **Apple Developer Portal** → **Certificates, IDs & Profiles**
2. **Certificates** → **+** → **Apple Push Notification service SSL (Sandbox & Production)**
3. Select your App ID
4. Create certificate, download `.cer` file
5. Double-click to install in Keychain
6. Export as `.p12` file
7. Convert to `.pem` for Firebase:
   ```bash
   openssl pkcs12 -in voip_cert.p12 -out voip_cert.pem -nodes -clcerts
   ```

### Step 4: Configure Firebase for VoIP

1. Go to **Firebase Console** → **Project Settings** → **Cloud Messaging**
2. Upload your **VoIP certificate** (not the regular APNs cert)
3. Make sure it's marked as **VoIP** certificate
4. Download updated `GoogleService-Info.plist`

### Step 5: Update Info.plist

Ensure these keys exist in `ios/App/App/Info.plist`:

```xml
<key>UIBackgroundModes</key>
<array>
    <string>fetch</string>
    <string>remote-notification</string>
    <string>voip</string>
    <string>audio</string>
</array>

<key>BGTaskSchedulerPermittedIdentifiers</key>
<array>
    <string>com.spicey.app.fetch</string>
    <string>com.spicey.app.refresh</string>
</array>
```

### Step 6: Build and Deploy

```bash
# Build iOS app
npm run build
npx cap sync ios

# Open in Xcode
npx cap open ios

# In Xcode:
# 1. Select your team for signing
# 2. Ensure VoIP certificate is selected for Push Notifications
# 3. Build → Archive → Upload to App Store Connect
```

## 🧪 Testing

### Test VoIP Token Registration

1. Build and run on **real iOS device** (simulator doesn't support VoIP)
2. Login to the app
3. Check console logs:
   ```
   [AppDelegate] VoIP push token: <64-char-hex-token>
   [VoIP] Token saved to backend
   ```

### Test Incoming Calls

1. **App Open**: Call should show CallKit UI + ringtone
2. **App in Background**: Call should show CallKit UI + system ringtone
3. **App Closed**: Call should show CallKit UI + system ringtone (wakes device)

### Debug Commands

```javascript
// In browser console (when app is open):
console.log(await import('@/lib/pushNotifications').then(m => m.getVoIPToken()));

// Should return 64-character hex token
```

## 🚨 Common Issues

### Issue: "No VoIP token"

**Cause**: Running on simulator or missing background modes

**Fix**:
- Test on real device only
- Ensure VoIP background mode is enabled
- Check push notification entitlements

### Issue: "Call doesn't ring when app is closed"

**Cause**: Firebase not configured for VoIP or wrong certificate

**Fix**:
- Upload VoIP certificate to Firebase (not regular APNs)
- Ensure `voip_push_token` is saved in UserProfile
- Check Firebase logs for delivery status

### Issue: "Ringtone doesn't play"

**Cause**: Audio session not initialized or permissions denied

**Fix**:
- Ensure microphone permission is granted
- Check `Info.plist` has `NSMicrophoneUsageDescription`
- Test on real device (simulator audio is limited)

## 📋 Checklist

- [ ] VoIP background mode enabled in Xcode
- [ ] Push Notifications capability added
- [ ] VoIP certificate generated and uploaded to Firebase
- [ ] `GoogleService-Info.plist` updated
- [ ] `Info.plist` has correct background modes
- [ ] App tested on real iOS device
- [ ] VoIP token appears in user's UserProfile
- [ ] Incoming calls show CallKit UI
- [ ] Ringtone plays when app is open
- [ ] System ringtone plays when app is closed

## 🎯 How It Works

1. **User logs in** → iOS generates VoIP token → saved to backend
2. **Caller initiates call** → backend sends VoIP push via Firebase
3. **iOS receives VoIP push** → wakes app in background → CallKit reports incoming call
4. **CallKit shows native UI** → system ringtone plays automatically
5. **User answers** → app opens → WebRTC call connects

## 📞 Support

If calls still don't work:
1. Check Xcode console for CallKit errors
2. Check Firebase console for push delivery status
3. Verify VoIP token is saved in UserProfile entity
4. Test with app open first, then background, then closed