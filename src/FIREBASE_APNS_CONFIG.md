# ✅ Firebase APNs Configuration - Spicey iOS

## APNs Authentication Key (Configured)

**Key ID:** `FWS388M7G3`  
**Team ID:** `NXLT2KD2JK`  
**Status:** ✅ Uploaded to Firebase (Development & Production)

---

## Firebase Project Configuration

**Project ID:** `spicey-app`  
**Bundle ID:** `com.spicey.app`  
**GoogleService-Info.plist:** ✅ Configured in `ios/App/App/`

---

## Verification Steps

### 1. Confirm Firebase Project

Ensure you're using the correct Firebase project:
- Go to [Firebase Console](https://console.firebase.google.com/)
- Select **spicey-app** project
- Go to **Project Settings** → **General**
- Verify **iOS app** with bundle ID `com.spicey.app` is registered

### 2. Verify APNs Key in Firebase

In Firebase Console:
- **Project Settings** → **Cloud Messaging** tab
- Scroll to **Apple app configuration**
- Confirm APNs Authentication Key is uploaded:
  - **Key ID:** FWS388M7G3 ✅
  - **Team ID:** NXLT2KD2JK ✅
  - **Environment:** Both Development & Production ✅

### 3. Update GoogleService-Info.plist

The file has been created at `ios/App/App/GoogleService-Info.plist`.

**Before building, you must:**
1. Download the **actual** `GoogleService-Info.plist` from Firebase Console
2. Replace the placeholder values in the file with real values from your Firebase project

### 4. Rebuild iOS App

```bash
# Clean previous builds
rm -rf dist/ ios/App/App/node_modules/

# Install dependencies
npm ci

# Build web assets
npm run build

# Sync to iOS
npx cap sync ios

# Open in Xcode
npx cap open ios
```

### 5. In Xcode

1. **Select Project** → **Signing & Capabilities**
2. Ensure **Push Notifications** capability is added ✅
3. Ensure **Background Modes** → **Remote notifications** is checked ✅
4. Ensure **Background Modes** → **Voice over IP** is checked ✅
5. Select **Product** → **Clean Build Folder** (Shift+Cmd+K)
6. Select **Product** → **Build** (Cmd+B)

### 6. Archive for TestFlight

1. Select **Product** → **Archive**
2. Wait for archive to complete
3. **Organizer** window opens automatically
4. Select latest archive → **Distribute App**
5. Choose **TestFlight & App Store**
6. Click **Upload**

---

## Push Notification Flow

Once configured, the app will:

1. **On Login:** Register with APNs automatically
2. **Save Token:** Store push token in `UserProfile.push_token`
3. **Receive Notifications:**
   - ✅ New messages
   - ✅ Post likes/comments
   - ✅ New followers
   - ✅ Incoming calls (VoIP)

---

## VoIP/Calls Configuration

For call notifications to work:

1. **Firebase VoIP Setup:** See `FIREBASE_VOIP_SETUP.md`
2. **CallKit Integration:** Already configured in `ios/App/App/CallKitPlugin.swift`
3. **Background Modes:** `voip` mode enabled in `Info.plist` ✅

---

## Testing

### Test Push Notifications

1. Build and run on **physical iPhone** (simulator doesn't support push)
2. Login to the app
3. From another account, send a message or like a post
4. Notification should appear with **sound and vibration**

### Test VoIP Calls

1. Build and run on **physical iPhone**
2. Login to the app
3. From another account, initiate a call
4. **CallKit** incoming call screen should appear (even if app is in background)

---

## Troubleshooting

### Push Not Working?

1. **Check Firebase Console:** Verify APNs key is uploaded
2. **Check Device Token:** In app, check `UserProfile.push_token` is saved
3. **Check Capabilities:** Ensure Push Notifications is enabled in Xcode
4. **Check Entitlements:** Verify `aps-environment` entitlement

### VoIP Not Working?

1. **Check Background Modes:** Ensure "Voice over IP" is checked
2. **Check PushKit:** VoIP uses PushKit, not regular APNs
3. **Check CallKit:** Ensure CallKitPlugin is properly linked

---

## Next Steps

1. ✅ Download real `GoogleService-Info.plist` from Firebase
2. ✅ Replace placeholder file in `ios/App/App/`
3. ✅ Run `npx cap sync ios`
4. ✅ Build in Xcode
5. ✅ Test on physical device
6. ✅ Archive and upload to TestFlight

---

**Questions?** Check:
- `IOS_PUSH_SETUP.md` - General push setup
- `FIREBASE_VOIP_SETUP.md` - VoIP configuration
- `IOS_CALLKIT_NATIVE_BUILD.md` - CallKit integration