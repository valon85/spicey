# 🔥 SPICEY iOS PRODUCTION BUILD - COMPLETE FIX GUIDE

## ⚠️ CRITICAL ISSUES FIXED

### Issue 1: App Redirecting to Base44/Preview
**Problem:** The app was configured to load from `https://69fe90d3bbe7ad47925e4a0a.base44.app` instead of bundled assets.

**Fix:** Removed `server.url` from `capacitor.config.json` - app now loads bundled `dist/` folder.

### Issue 2: Wrong Bundle Identifier
**Problem:** Bundle ID was `com.base44.69fe90d3bbe7ad47925e4a0a.app` instead of `com.spicey.app`

**Fix:** Updated:
- ✅ `capacitor.config.json` → `com.spicey.app`
- ✅ `GoogleService-Info.plist` → `com.spicey.app`

### Issue 3: Login/Signup Redirecting to Browser
**Problem:** Auth flow was opening external browser instead of staying in-app.

**Fix:** Navigation guard in `AppDelegate.swift` blocks all external HTTP/HTTPS navigation, keeping auth within the app.

---

## 📋 STEP-BY-STEP: BUILD & DEPLOY ON REAL IPHONE

### Phase 1: Build the App

```bash
# 1. Make script executable
chmod +x scripts/build-ios-production.sh

# 2. Run production build
bash scripts/build-ios-production.sh
```

This will:
- ✅ Clean all previous builds
- ✅ Install fresh dependencies
- ✅ Build optimized web bundle
- ✅ Sync Capacitor with correct bundle ID
- ✅ Verify configuration

### Phase 2: Open in Xcode

1. **Open Xcode**
2. **File → Open** → Navigate to `ios/App/App.xcworkspace`
3. **Clean Build Folder**: `Product → Clean Build Folder` (Shift+Cmd+K)

### Phase 3: Configure Signing

1. **Select Project** in left sidebar
2. **Select Target: App**
3. Go to **Signing & Capabilities** tab
4. **Choose Team**: Select your Apple Developer Team
5. **Verify Bundle Identifier**: Should show `com.spicey.app`
6. **Provisioning Profile**: Keep it **Automatic**

### Phase 4: Verify Capabilities

In **Signing & Capabilities**, ensure these are added:

#### Required Capabilities:
- ✅ **Push Notifications**
- ✅ **Background Modes** with:
  - ☑️ **Remote notifications**
  - ☑️ **Voice over IP**
  - ☑️ **Background fetch**

If missing, click **+ Capability** and add them.

### Phase 5: Verify Firebase Configuration

1. Open `ios/App/App/GoogleService-Info.plist` in Xcode
2. Verify **BUNDLE_ID** = `com.spicey.app`
3. Verify **PROJECT_ID** = `spicey-ed7f7`

### Phase 6: Connect iPhone & Build

1. **Connect iPhone** via USB cable
2. In Xcode, **select your iPhone** from device dropdown (top)
3. **Build & Run**: `Product → Build` (Cmd+B)
4. Wait for app to install on iPhone

### Phase 7: Test on Real Device

#### Test 1: App Opens Correctly
1. **Open Spicey app** on iPhone
2. ✅ Should open directly to Spicey login (NOT Base44 website)
3. ✅ No external browser redirects

#### Test 2: Login/Signup Works
1. **Sign up** with email/password OR **Login** with existing account
2. ✅ Should stay within the app
3. ✅ No redirect to external browser
4. ✅ Successfully logs in

#### Test 3: Grant Permissions
1. App will ask for **Notifications** permission
2. ✅ Tap **Allow**
3. App will ask for **Camera/Microphone** when creating content
4. ✅ Tap **Allow**

#### Test 4: Notifications (App Closed)
1. **Close app completely**: Swipe up from bottom, swipe away Spicey
2. From another device, **send a message** to your account
3. ✅ **Notification should arrive** with sound and vibration
4. ✅ Tap notification → Opens Spicey app

#### Test 5: VoIP Calls (App Closed)
1. **Close app completely**
2. From another device, **start a video call** to your account
3. ✅ **CallKit UI appears** (native iPhone call screen)
4. ✅ **Ringtone plays** (system ringtone)
5. ✅ **Accept** → Call connects with video
6. ✅ **Decline** → Call ends

---

## 🔧 TROUBLESHOOTING

### Problem: App Still Redirects to Base44

**Solution:**
1. Delete app from iPhone
2. Run `bash scripts/build-ios-production.sh` again
3. Clean in Xcode: `Product → Clean Build Folder`
4. Rebuild and reinstall

### Problem: Login Opens External Browser

**Cause:** Navigation guard not installed properly

**Solution:**
1. Check `AppDelegate.swift` has `WebViewNavigationGuard` class
2. Verify `installWebViewNavigationGuard()` is called in `didFinishLaunchingWithOptions`
3. Rebuild app

### Problem: Notifications Don't Arrive

**Checklist:**
- □ App granted notification permission?
- □ GoogleService-Info.plist has correct Bundle ID?
- □ APNs Key uploaded to Firebase?
- □ VoIP Certificate uploaded to Firebase?
- □ Push Notifications capability added in Xcode?
- □ Background Modes → Remote notifications enabled?

**Test:**
```bash
# Check if token is saved
# In app, go to console logs (Xcode → Debug → Console)
# Look for: "[Push] APNs Token: ..." or "[VoIP] Token: ..."
```

If no token appears:
1. Delete app
2. Reinstall
3. Grant permissions again

### Problem: VoIP Calls Don't Ring

**Checklist:**
- □ VoIP Services Certificate uploaded to Firebase?
- □ Background Modes → Voice over IP enabled?
- □ CallKit plugin registered in AppDelegate?
- □ `pushRegistry(_:didReceiveIncomingPushWith...)` implemented?

**Test:**
1. Close app completely
2. Start call from another device
3. Check Xcode console for: `[AppDelegate] VoIP PushKit received`
4. If not appearing → Firebase certificate issue

### Problem: Build Fails in Xcode

**Common Errors:**

**"No provisioning profiles found"**
- Solution: Xcode → Preferences → Accounts → Select Team → Download Profiles

**"Code signing failed"**
- Solution: Verify Team is selected, Bundle ID matches provisioning profile

**"GoogleService-Info.plist not found"**
- Solution: File → Add Files → Select `ios/App/App/GoogleService-Info.plist`

---

## 📱 TESTING CHECKLIST

Before submitting to App Store, verify ALL of these work:

### Basic Functionality
- [ ] App opens to Spicey login (not Base44)
- [ ] Signup creates account successfully
- [ ] Login works without external browser
- [ ] Feed loads posts
- [ ] Can create posts with photos
- [ ] Can create reels with videos
- [ ] Can create stories
- [ ] Can comment and like

### Notifications (App Closed)
- [ ] **Message notification** arrives with sound
- [ ] **Post notification** (like/comment) arrives
- [ ] **Follow notification** arrives
- [ ] Tapping notification opens app

### VoIP Calls (App Closed)
- [ ] **Incoming call** shows CallKit UI
- [ ] **Ringtone plays** (system default)
- [ ] **Accept** → Call connects with video/audio
- [ ] **Decline** → Call ends properly
- [ ] **CallKit end call** → Notifies web app

### Background Modes
- [ ] App receives push when in background
- [ ] App receives VoIP when completely closed
- [ ] Audio continues during calls when screen is off

---

## 🚀 ARCHIVE FOR TESTFLIGHT

Once everything works on device:

1. **Select Generic iOS Device** in Xcode (not your phone)
2. **Product → Archive**
3. Wait for archive to complete
4. **Organizer window** opens automatically
5. Select latest archive → **Distribute App**
6. Choose **TestFlight & App Store**
7. Click **Upload**
8. Wait for upload to complete
9. Go to [App Store Connect](https://appstoreconnect.apple.com/)
10. **My Apps → Spicey → TestFlight**
11. Add internal testers
12. Submit for external TestFlight beta review

---

## 🎯 FINAL PRODUCTION CHECKLIST

Before App Store submission:

### Configuration
- [ ] Bundle ID: `com.spicey.app`
- [ ] Version: 1.0.0
- [ ] Build number: Unique for each upload
- [ ] APNs Key uploaded to Firebase (Production)
- [ ] VoIP Certificate uploaded to Firebase (Production)

### Capabilities
- [ ] Push Notifications enabled
- [ ] Background Modes: Remote notifications
- [ ] Background Modes: Voice over IP
- [ ] Background Modes: Background fetch

### Testing
- [ ] All features work on real device
- [ ] Notifications arrive when app closed
- [ ] VoIP calls ring when app closed
- [ ] Login stays in-app (no browser redirect)
- [ ] No crashes during normal usage

### App Store Requirements
- [ ] Privacy policy URL
- [ ] Terms of service URL
- [ ] App description
- [ ] Screenshots (all iPhone sizes)
- [ ] App icon (1024x1024)
- [ ] Age rating questionnaire completed
- [ ] App Store categories selected

---

## 📞 SUPPORT

If issues persist after following this guide:

1. **Check Xcode Console** for errors
2. **Check Firebase Console** → Cloud Messaging → Delivery reports
3. **Check Apple Developer** → Certificates, Identifiers & Profiles
4. **Re-run build script** with clean install
5. **Delete app** from device and reinstall

---

**Last Updated:** June 2, 2026
**Version:** 1.0.0
**Status:** Production Ready ✅