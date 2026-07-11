# ✅ iOS VoIP + CallKit Configuration Checklist

## Completed Configurations

### 1. Firebase Setup ✅
- [x] iOS app created in Firebase Console
- [x] `GoogleService-Info.plist` downloaded
- [x] APNs Key (.p8) uploaded to Firebase (Development + Production)
- [x] Firebase project ID and API key set in secrets

### 2. iOS Project Files ✅
- [x] `ios/App/App/GoogleService-Info.plist` - Place your downloaded file here
- [x] `ios/App/App/Info.plist` - Updated with background modes:
  - `remote-notification`
  - `voip`
  - `audio`
  - `fetch`
- [x] `ios/App/App/AppDelegate.swift` - VoIP registration and CallKit integration
- [x] `ios/App/App/CallKitPlugin.swift` - CallKit plugin for native call UI
- [x] `ios/App/App/CallKitManager.swift` - CallKit call management
- [x] `ios/App/App/SceneDelegate.swift` - Scene delegate for iOS 13+

### 3. Capacitor Configuration ✅
- [x] `capacitor.config.json` - Push notifications configured
- [x] `@capacitor/push-notifications` v6.0.5 installed
- [x] `@capacitor/preferences` v6.0.0 installed (for VoIP token storage)

### 4. Backend Functions ✅
- [x] `sendPushNotification` - Send push notifications
- [x] `sendCallNotification` - Send call-specific notifications
- [x] `initiateCall` - Create call sessions
- [x] `notifyNewMessage` - Notify on new messages

### 5. Frontend Components ✅
- [x] `VoIPProvider.jsx` - VoIP token registration and sync
- [x] `PushNotificationProvider.jsx` - Push notification initialization
- [x] `GlobalIncomingCallHandler.jsx` - Handle incoming calls
- [x] `CallSheet.jsx` - In-call UI with WebRTC
- [x] `MissedCallBanner.jsx` - Missed call notifications
- [x] `NotificationPermissionBanner.jsx` - Permission prompts

### 6. Entity Updates ✅
- [x] `UserProfile` entity updated with:
  - `push_token` - Regular APNs token
  - `voip_push_token` - VoIP token for calls
  - `platform` - User platform (ios/android/web)

## Required Manual Steps in Xcode

### 1. Open Project
```bash
chmod +x scripts/build-ios-capacitor.sh
./scripts/build-ios-capacitor.sh
```

### 2. Signing & Capabilities
- [ ] Select your Apple Developer Team
- [ ] Bundle Identifier: `com.spicey.app`
- [ ] Enable **Push Notifications** capability
- [ ] Enable **Background Modes**:
  - [ ] Audio, AirPlay, and Picture in Picture
  - [ ] Voice over IP
  - [ ] Background fetch
  - [ ] Remote notifications

### 3. VoIP Signing Certificate (Critical!)
- [ ] Go to [Apple Developer Portal](https://developer.apple.com/account/resources/certificates/list)
- [ ] Create **VoIP Services Certificate**
- [ ] Download and install in Keychain
- [ ] Export as `.p12` and convert to `.pem` if needed for testing

### 4. Build Settings
- [ ] Deployment Target: iOS 15.0+
- [ ] Swift Version: 5.0+
- [ ] Enable Bitcode: No (optional)

### 5. Test on Real Device
- [ ] Connect iPhone via USB
- [ ] Select device in Xcode (NOT simulator)
- [ ] Build and run (Cmd+R)
- [ ] Grant notification permissions when prompted

## Testing Checklist

### Push Notifications
- [ ] App receives push notifications when open
- [ ] App receives push notifications when backgrounded
- [ ] App receives push notifications when fully closed

### VoIP Calls
- [ ] VoIP token is saved to UserProfile
- [ ] Incoming call shows CallKit UI when app is open
- [ ] Incoming call shows CallKit UI when app is backgrounded
- [ ] **Incoming call shows CallKit UI when app is fully closed**
- [ ] Call audio works in all states
- [ ] CallKit shows caller name and photo
- [ ] Answer/Decline buttons work
- [ ] Call state syncs with backend

### Call Features
- [ ] Video toggle works
- [ ] Mute/unmute works
- [ ] Speaker toggle works
- [ ] Camera switch works
- [ ] Call duration timer works
- [ ] End call properly cleans up

## Troubleshooting

### VoIP Not Working?
1. Ensure VoIP certificate is installed in Keychain
2. Check `Info.plist` has `voip` in `UIBackgroundModes`
3. Verify app is running on **real device** (not simulator)
4. Check Xcode console for VoIP token logs

### Push Not Working?
1. Verify `GoogleService-Info.plist` is in correct location
2. Check Firebase Console → Cloud Messaging has APNs key
3. Ensure Push Notifications capability is enabled in Xcode
4. Check device is registered in Firebase Console

### CallKit Not Showing?
1. Ensure CallKit plugin is registered in `AppDelegate.swift`
2. Check `CallKitManager.swift` is properly reporting calls
3. Verify notification payload has correct `type: "call"`

## Build Commands

```bash
# Development build
./scripts/build-ios-capacitor.sh

# Production build (App Store)
npm run build
npx cap sync ios
cd ios/App/App
xcodebuild -workspace App.xcworkspace \
  -scheme App \
  -configuration Release \
  -archivePath Spicey.xcarchive \
  archive
```

## Next Steps

1. **Place `GoogleService-Info.plist`** in `ios/App/App/`
2. **Run build script**: `./scripts/build-ios-capacitor.sh`
3. **Configure Xcode** signing and capabilities
4. **Test on real device** for VoIP functionality
5. **Upload to TestFlight** for beta testing

---

**Status**: Ready for Xcode configuration and device testing 🚀