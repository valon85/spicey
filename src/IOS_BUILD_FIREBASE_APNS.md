# 🚀 iOS Build Instructions - Firebase APNs Configured

## ✅ Configuration Status

**APNs Key ID:** `FWS388M7G3` ✅ Uploaded to Firebase  
**Team ID:** `NXLT2KD2JK` ✅ Verified  
**Firebase Project:** `spicey-app`  
**Bundle ID:** `com.spicey.app`

---

## ⚠️ CRITICAL: Before Building

You **MUST** download the real `GoogleService-Info.plist` from Firebase:

### Step 1: Download from Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select **spicey-app** project
3. Click **⚙️ Settings** → **Project settings**
4. Scroll to **Your apps** section
5. Find iOS app with bundle ID `com.spicey.app`
6. Click **Download GoogleService-Info.plist**
7. **Save the file** to your Downloads folder

### Step 2: Replace in Project

```bash
# Navigate to your project
cd /path/to/spicey

# Copy the downloaded file to iOS app directory
cp ~/Downloads/GoogleService-Info.plist ios/App/App/GoogleService-Info.plist

# Verify it's there
ls -la ios/App/App/GoogleService-Info.plist
```

### Step 3: Sync Capacitor

```bash
npx cap sync ios
```

---

## 🔨 Build iOS App

### Option A: Quick Build (Recommended)

```bash
# 1. Clean everything
rm -rf dist/
npm ci

# 2. Build web assets
npm run build

# 3. Sync to iOS
npx cap sync ios

# 4. Open in Xcode
npx cap open ios
```

### Option B: Using Build Script

```bash
bash scripts/build-ios.sh
```

---

## 📱 In Xcode

### 1. Verify Signing

- Select **Project** → **Signing & Capabilities**
- Ensure **Automatically manage signing** is checked
- Select your **Team** (should be `NXLT2KD2JK`)
- Verify **Bundle Identifier** is `com.spicey.app`

### 2. Verify Capabilities

Ensure these are added:
- ✅ **Push Notifications**
- ✅ **Background Modes** → Check:
  - ✅ Remote notifications
  - ✅ Voice over IP
  - ✅ Audio, AirPlay, and Picture in Picture

### 3. Clean Build

```
Product → Clean Build Folder (Shift+Cmd+K)
```

### 4. Build

```
Product → Build (Cmd+B)
```

Ensure no errors appear.

---

## 📤 Upload to TestFlight

### Archive

1. Select **iPhone** or **Any iOS Device** as target
2. **Product** → **Archive**
3. Wait for archive to complete (2-5 minutes)

### Upload to TestFlight

1. **Organizer** window opens automatically
2. Select latest archive
3. Click **Distribute App**
4. Choose **TestFlight & App Store** → **Next**
5. Choose **Upload** → **Next**
6. Select **Upload** button
7. Wait for upload to complete (5-10 minutes)

### In App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Navigate to **TestFlight** tab
3. Wait for processing (10-30 minutes)
4. Add **Internal Testers** or create **External Testers** group
5. Click **Invite** to send TestFlight invitation

---

## 🧪 Test Push Notifications

### On Test Device

1. Install TestFlight app from App Store
2. Install Spicey app via TestFlight invitation
3. Open Spicey and login
4. **Grant notification permissions** when prompted

### Send Test Notification

From another account:
1. Send a message → Should receive push notification
2. Like a post → Should receive push notification
3. Initiate a call → Should see CallKit incoming call screen

---

## 🔍 Verify APNs Configuration

### In Firebase Console

1. Go to **Project Settings** → **Cloud Messaging**
2. Scroll to **Apple app configuration**
3. Verify:
   - ✅ **Key ID:** FWS388M7G3
   - ✅ **Team ID:** NXLT2KD2JK
   - ✅ **Environment:** Development & Production

### In App Logs

When app starts, check console for:
```
[Push] Registered with APNs
[Push] APNs Token: <token_value>
[Push] Token saved to user profile
```

---

## ❗ Common Issues

### Push Not Working

**Problem:** Notifications not appearing  
**Solution:**
1. Verify `GoogleService-Info.plist` is the real one from Firebase
2. Check APNs key is uploaded in Firebase Console
3. Ensure Push Notifications capability is enabled in Xcode
4. Test on **physical device** (simulator doesn't support push)

### VoIP Calls Not Working

**Problem:** CallKit not appearing  
**Solution:**
1. Verify Background Mode → Voice over IP is checked
2. Check VoIP push token is saved in UserProfile
3. Ensure CallKitPlugin.swift is properly linked

### Build Errors

**Problem:** Xcode build fails  
**Solution:**
1. Run `npx cap sync ios` again
2. Clean build folder in Xcode
3. Verify signing certificate is valid
4. Check bundle identifier matches Firebase

---

## 📋 Checklist

- [ ] Downloaded `GoogleService-Info.plist` from Firebase
- [ ] Copied to `ios/App/App/GoogleService-Info.plist`
- [ ] Ran `npx cap sync ios`
- [ ] Verified Push Notifications capability in Xcode
- [ ] Verified Background Modes (Remote + VoIP)
- [ ] Cleaned build folder
- [ ] Built successfully in Xcode
- [ ] Archived for TestFlight
- [ ] Uploaded to App Store Connect
- [ ] Added internal testers
- [ ] Tested push notifications on device
- [ ] Tested VoIP calls on device

---

## 📚 Reference Documents

- `FIREBASE_APNS_CONFIG.md` - APNs configuration details
- `IOS_PUSH_SETUP.md` - General push setup
- `FIREBASE_VOIP_SETUP.md` - VoIP configuration
- `IOS_CALLKIT_NATIVE_BUILD.md` - CallKit integration
- `TESTFLIGHT_BUILD_GUIDE.md` - TestFlight upload guide

---

**Questions?** Reach out to your iOS developer or check Firebase Console for APNs key status.