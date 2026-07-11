# 📱 SPICEY iOS - REAL DEVICE TESTING CHECKLIST

## ⚠️ BEFORE TESTING ON REAL IPHONE

### Prerequisites Checklist
- [ ] ✅ Run `bash scripts/build-ios-production.sh`
- [ ] ✅ Bundle ID is `com.spicey.app` (not base44)
- [ ] ✅ GoogleService-Info.plist has correct bundle ID
- [ ] ✅ Xcode is installed (latest version)
- [ ] ✅ Apple Developer Account active ($99/year)
- [ ] ✅ Physical iPhone connected via USB
- [ ] ✅ iPhone is logged in with Apple ID
- [ ] ✅ Firebase has APNs Key uploaded
- [ ] ✅ Firebase has VoIP Certificate uploaded

---

## 🧪 TESTING SESSION - STEP BY STEP

### Part 1: Build & Install

#### 1.1 Open in Xcode
```bash
cd ios/App
open App.xcworkspace
```

#### 1.2 Configure Signing
- [ ] Select project in left sidebar
- [ ] Select target "App"
- [ ] Go to "Signing & Capabilities"
- [ ] Select your Team
- [ ] Bundle Identifier: `com.spicey.app`
- [ ] Provisioning Profile: Automatic

#### 1.3 Select Device
- [ ] Connect iPhone via USB
- [ ] Trust computer on iPhone
- [ ] In Xcode, select iPhone from device dropdown (NOT simulator)

#### 1.4 Clean & Build
- [ ] Product → Clean Build Folder (Shift+Cmd+K)
- [ ] Product → Build (Cmd+B)
- [ ] Wait for "Build Succeeded"

#### 1.5 Install on iPhone
- [ ] Xcode will automatically install app
- [ ] Look for Spicey icon on iPhone home screen
- [ ] App should have Spicey logo (not Base44)

---

### Part 2: App Launch & Authentication

#### 2.1 First Launch
- [ ] Tap Spicey icon
- [ ] App opens directly to Spicey (NOT Base44 website)
- [ ] No Safari browser opens
- [ ] No "base44.app" URL visible
- [ ] Loading screen shows Spicey branding

#### 2.2 Login/Signup
- [ ] Tap "Sign Up" or "Login"
- [ ] Form appears within app (not external browser)
- [ ] Enter email: your test email
- [ ] Enter password
- [ ] Tap "Sign Up"
- [ ] No redirect to base44.app
- [ ] Login succeeds within app
- [ ] Redirects to Feed page inside app

#### 2.3 Stay Logged In
- [ ] Close app completely (swipe up from bottom)
- [ ] Reopen app
- [ ] Should still be logged in
- [ ] No login screen appears again

**❌ FAIL IF:**
- App opens Safari/browser
- URL shows "base44.app"
- Login redirects outside app
- Gets stuck on Base44 error page

---

### Part 3: Push Notifications (App Closed)

#### 3.1 Enable Notifications
- [ ] First time: iOS asks for notification permission
- [ ] Tap "Allow"
- [ ] Settings → Spicey → Notifications → Enabled

#### 3.2 Test Message Notification
1. **Close app completely** (swipe up from home)
2. From another device/account:
   - [ ] Send message to your test account
3. On test iPhone:
   - [ ] **Notification appears** with message preview
   - [ ] **Sound plays** (ding)
   - [ ] **Phone vibrates**
   - [ ] Lock screen shows notification
   - [ ] Notification Center shows notification
4. **Tap notification**:
   - [ ] App opens directly to Messages page
   - [ ] Message is visible

#### 3.3 Test Post Notification
1. **Keep app closed**
2. From another account:
   - [ ] Create a post
   - [ ] Or like your post
3. On test iPhone:
   - [ ] **Notification appears**
   - [ ] Shows who liked/posted
   - [ ] Sound and vibration
4. **Tap notification**:
   - [ ] App opens to Feed
   - [ ] Post is visible

#### 3.4 Test Comment Notification
1. **App closed**
2. Someone comments on your post
3. On test iPhone:
   - [ ] Notification appears
   - [ ] Shows commenter name and text
   - [ ] Sound plays
4. **Tap**:
   - [ ] Opens to post with comments

**❌ FAIL IF:**
- No notification appears
- Notification silent (no sound/vibration)
- Notification doesn't show when app closed
- Tapping notification doesn't open app

---

### Part 4: VoIP Calls (App Closed) - CRITICAL

#### 4.1 Setup
- [ ] Ensure VoIP certificate uploaded to Firebase
- [ ] Ensure app has background modes: VoIP, Remote Notifications
- [ ] Login to app on test iPhone
- [ ] **Close app completely** (swipe up)

#### 4.2 Incoming Call Test
1. From another device/account:
   - [ ] Initiate video call to test account
2. On test iPhone (app CLOSED):
   - [ ] **CallKit UI appears** (native iPhone call screen)
   - [ ] **Ringtone plays** (loud, continuous)
   - [ ] **Phone vibrates** repeatedly
   - [ ] Screen shows: "Spicey" + caller name
   - [ ] Green answer button
   - [ ] Red decline button
   - [ ] Call screen stays visible

3. **Answer call**:
   - [ ] Tap green button
   - [ ] Call connects
   - [ ] Video appears
   - [ ] Audio works (can hear caller)
   - [ ] Camera works (caller sees you)
   - [ ] Call controls visible (mute, camera flip, end)

4. **During call**:
   - [ ] Mute button works
   - [ ] Camera flip works
   - [ ] Speaker toggle works
   - [ ] Video toggle works

5. **End call**:
   - [ ] Tap red button
   - [ ] Call ends
   - [ ] Returns to app

#### 4.3 Decline Call
1. **App closed**
2. Incoming call arrives
3. **Tap red decline**:
   - [ ] Call rejected
   - [ ] Caller sees "Declined"
   - [ ] Phone stops ringing

#### 4.4 Missed Call
1. **App closed**
2. Incoming call rings
3. **Don't answer** (let it ring out)
4. After 30 seconds:
   - [ ] Call stops ringing
   - [ ] **Missed call notification** appears
   - [ ] Shows caller name
   - [ ] Shows "Spicey Missed Call"

**❌ FAIL IF:**
- No CallKit UI appears
- No ringtone when app closed
- Call doesn't connect
- No audio/video
- CallKit shows but no sound

---

### Part 5: Background Behavior

#### 5.1 App in Background (Not Closed)
1. Open app, login
2. Press home button (app goes to background)
3. From another device:
   - [ ] Send message
   - [ ] Initiate call
4. On test iPhone:
   - [ ] Notification appears
   - [ ] CallKit UI appears
   - [ ] App wakes up properly

#### 5.2 App Fully Closed
1. Close app completely (swipe up)
2. Wait 10 seconds
3. From another device:
   - [ ] Send message
   - [ ] Initiate call
4. On test iPhone:
   - [ ] Notification appears
   - [ ] CallKit UI appears
   - [ ] Tapping notification opens app

**❌ FAIL IF:**
- Notifications only work when app is open
- Calls only work when app is open
- App doesn't open from notification tap

---

### Part 6: In-App Features

#### 6.1 Feed
- [ ] Posts load correctly
- [ ] Images display properly
- [ ] Videos play
- [ ] Like button works
- [ ] Comment button works
- [ ] Share button works

#### 6.2 Create Post
- [ ] Tap Create (+)
- [ ] Select photo
- [ ] Add caption
- [ ] Post publishes
- [ ] Appears in feed

#### 6.3 Messages
- [ ] Chat list loads
- [ ] Can send messages
- [ ] Can receive messages
- [ ] Images send/receive
- [ ] Real-time delivery

#### 6.4 Profile
- [ ] Profile page loads
- [ ] Avatar displays
- [ ] Posts count correct
- [ ] Followers/following visible
- [ ] Edit profile works

#### 6.5 Explore
- [ ] Explore page loads
- [ ] Search works
- [ ] Results display

---

### Part 7: Edge Cases

#### 7.1 Network Switching
- [ ] On WiFi: receive notification
- [ ] Switch to cellular: still receive
- [ ] Airplane mode: notification queued
- [ ] Disable airplane: notifications arrive

#### 7.2 Lock Screen
- [ ] Phone locked
- [ ] Notification arrives
- [ ] Shows on lock screen
- [ ] Swipe to open → app opens
- [ ] Call arrives → ringtone plays
- [ ] Slide to answer → call connects

#### 7.3 Do Not Disturb
- [ ] DND enabled
- [ ] Notifications still arrive (silent)
- [ ] Calls still come through (iOS may silence)
- [ ] Check Notification Center

#### 7.4 Multiple Apps
- [ ] Using another app (e.g., Safari)
- [ ] Notification arrives
- [ ] Banner shows at top
- [ ] Can tap to switch to Spicey
- [ ] Call arrives → interrupts current app

---

## 📊 TEST RESULTS TEMPLATE

```
Date: ___________
Tester: ___________
iPhone Model: ___________
iOS Version: ___________
App Version: 1.0.0

✅ PASS / ❌ FAIL

[ ] App launches correctly (not Base44)
[ ] Login works without redirects
[ ] Stay logged in after restart
[ ] Message notifications (app closed)
[ ] Post notifications (app closed)
[ ] Comment notifications (app closed)
[ ] VoIP calls ring (app closed)
[ ] CallKit UI appears
[ ] Call connects with audio/video
[ ] Call controls work
[ ] Notifications have sound
[ ] Notifications have vibration
[ ] Tap notification → opens app
[ ] Feed loads
[ ] Create post works
[ ] Messages work
[ ] Profile works

CRITICAL ISSUES:
- 

NOTES:
- 
```

---

## 🐛 TROUBLESHOOTING

### Issue: App opens Base44 website
**Fix:**
- Check capacitor.config.json has no "server" section
- Rebuild: `bash scripts/build-ios-production.sh`
- Clean Xcode: Product → Clean Build Folder
- Reinstall app

### Issue: Login redirects to browser
**Fix:**
- Ensure no external URLs in auth flow
- Check SpiceyAuthModal component
- Verify base44.auth is using in-app webview

### Issue: No notifications when app closed
**Fix:**
- Check Firebase has APNs key
- Check GoogleService-Info.plist in Xcode
- Verify bundle ID matches everywhere
- Check Background Modes enabled
- Ensure user granted notification permission

### Issue: VoIP calls don't ring
**Fix:**
- Check Firebase has VoIP certificate
- Verify Background Modes: Voice over IP
- Check AppDelegate has PushKit registry
- Ensure payload has `content_available: true`
- Test on real device (not simulator)

### Issue: CallKit UI doesn't appear
**Fix:**
- Check CallKitManager.swift exists
- Verify provider.reportNewIncomingCall called
- Ensure completion() called in PushKit delegate
- Check iOS permissions

---

## ✅ PRODUCTION CRITERIA

App is ready for TestFlight/App Store when:

- [ ] ✅ All tests PASS
- [ ] ✅ Zero CRITICAL ISSUES
- [ ] ✅ Login works without redirects
- [ ] ✅ Notifications work (app closed)
- [ ] ✅ VoIP calls ring (app closed)
- [ ] ✅ CallKit UI appears
- [ ] ✅ Audio/video calls connect
- [ ] ✅ No Base44 branding visible
- [ ] ✅ All in-app features work
- [ ] ✅ Tested on at least 2 different iPhones
- [ ] ✅ Tested on iOS 15+ and iOS 17+

---

**When all criteria met → Ready for App Store submission!** 🎉