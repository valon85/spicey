# SPICEY App - TestFlight Submission Guide

## 📱 Step 1: Prepare Your iOS Build

### 1a. Prerequisites
```
Required:
✅ Apple Developer Account ($99/year)
✅ Xcode 14.0 or later (free on Mac App Store)
✅ iPhone or iPad for testing
✅ App Store Connect access
✅ Code Signing Certificate
✅ Provisioning Profile
```

### 1b. Build Web Assets
```bash
# In your terminal
npm run build

# Verify output
ls -lh dist/
# Should show: ~450-500KB total
```

### 1c. Set Build Version
```
Open package.json
Change version to match your release:
"version": "1.0.0"
```

---

## 📝 Step 2: Set Up App Store Connect

### 2a. Create App Record
1. Go to: [App Store Connect](https://appstoreconnect.apple.com/)
2. Log in with Apple ID
3. Click "+" button → "New App"
4. Fill in:
   - **Name:** SPICEY
   - **Bundle ID:** com.spicey.app (or your domain)
   - **SKU:** spicey-001 (unique identifier)
   - **Platform:** iOS
   - **Type:** Single App

5. Click "Create"

### 2b. Complete App Information
1. Go to "App Information" tab
2. Fill in:
   - **Primary Category:** Social Networking
   - **Secondary Category:** Lifestyle
   - **Subtitle:** Share Your Vibe
   - **Content Advisories:** Select appropriate ratings

---

## 🎨 Step 3: Upload Assets

### 3a. App Icon
1. In App Store Connect → App Icon
2. Upload 1024×1024 PNG image
   - No transparency
   - Neon gradient design
   - Safe area: 10% margin

### 3b. Screenshots
1. App Store Connect → Screenshots
2. For each language (English required):
   - Add 5-10 screenshots (1170×2532 px)
   - iPhone 6.5" or 6.1" sizes
   - Sequential flow showing features
   - No UI chrome (status bar hidden)
   - Add captions if desired

### 3c. Feature Graphic (Optional)
- Not required for iOS
- Can add promotional image later

### 3d. Preview Video (Optional)
1. Click "+" under App Preview
2. Upload MOV or MP4 (15-30 seconds)
3. Must be 1080×1920 px minimum
4. Show app in action

---

## ✍️ Step 4: Write App Description

### 4a. Localization
1. Click "Localization" tab
2. Add language: English (required)
3. Fill in all fields:

**Name:** SPICEY

**Subtitle:** Share Your Vibe

**Promotional Text** (170 chars max):
```
Real people. Real reactions. Real connections.
```

**Description** (4000 chars max):
```
SPICEY – Your App, Your Vibe, Your People

Share your hottest moments with a community that reacts in real time. 
No filters, no fakes – just authentic moments and genuine reactions.

FEATURES:
🔥 Post Photos & Videos – Share your fire
🔥 Real-Time Reactions – Fire, Like, Wow
💬 Direct Messaging – Chat with your crew
📹 Vertical Reels – Endless scrolling
🎥 Live Calls – Connect face-to-face

Why SPICEY?
• Real reactions instead of boring likes
• Instant messaging without delays
• Curated feeds just for you
• Direct connection to your people

Join thousands sharing their vibe every day.

Questions? Contact: info@spicey.live
```

**Keywords** (100 chars max - comma separated):
```
social media, messaging, video, reels, feed, reactions, live chat, communities
```

**Support URL:**
```
https://spicey.live/support
```

**Marketing URL:** (optional)
```
https://spicey.live
```

---

## 🔐 Step 5: Set Up Signing & Capabilities

### 5a. Create Signing Certificate (First Time Only)
1. In Xcode: Xcode → Preferences → Accounts
2. Select your Apple ID
3. Click "Manage Certificates"
4. Click "+" → "iOS Development"
5. Click "Done"

### 5b. Create App ID
1. Go to: [Apple Developer → Identifiers](https://developer.apple.com/account/resources/identifiers/list)
2. Click "+"
3. Select "App IDs"
4. Explicit App ID
5. **Bundle ID:** com.spicey.app
6. **Capabilities:** None (basic app)
7. Register

### 5c. Create Provisioning Profile
1. Go to: [Provisioning Profiles](https://developer.apple.com/account/resources/profiles/list)
2. Click "+"
3. **Type:** iOS App Development
4. **App ID:** SPICEY
5. **Certificate:** Your iOS Development cert
6. **Devices:** Select your iPhone/iPad
7. **Profile Name:** SPICEY Development
8. Download & drag into Xcode

---

## 🏗️ Step 6: Create Archive in Xcode

### 6a. Open Your Project
```bash
# Navigate to your project
cd /path/to/spicey-app

# If using Xcode (recommended for web app)
open .
```

### 6b. Create Archive
1. **In Xcode:**
   - Select Product → Archive
   - Wait for build to complete (~2 minutes)
   - Window → Organizer opens automatically

2. **Or build via CLI:**
```bash
# Build and archive (requires Xcode project setup)
xcodebuild -archive \
  -archivePath "build/SPICEY.xcarchive" \
  -scheme SPICEY \
  -configuration Release
```

### 6c. Verify Archive
1. In Organizer:
   - See SPICEY build listed
   - Check "Version: 1.0" and "Build: 1"
   - Verify size (~500MB)

---

## 📤 Step 7: Distribute to TestFlight

### 7a. Upload Archive
1. In Organizer:
   - Select SPICEY archive
   - Click "Distribute App"
   - Choose: "TestFlight & App Store"
   - Click "Next"

### 7b. Signing & Provisioning
1. **Signing Option:** Automatically manage signing
2. **Team:** Select your team
3. **Certificate:** iOS Distribution
4. Click "Next"

### 7c. Review & Upload
1. Check build details
2. Click "Upload"
3. Wait 5-10 minutes for upload completion
4. You'll get email confirmation

---

## 👥 Step 8: Add Internal Testers

### 8a. Create Internal Test Group
1. App Store Connect → TestFlight tab
2. Click "Internal Testing"
3. Click "+" to add tester
4. Enter email addresses (your team)
5. Click "Add"

### 8b. Invite Testers
1. App Store Connect → TestFlight
2. Under "Internal Testing":
   - Builds appear here automatically
   - Select build → Install via email link

3. Testers receive email:
   - Click "Open with TestFlight"
   - Install app on device
   - Can test immediately

### 8c. Monitor Test Feedback
1. TestFlight → Test Information
2. See:
   - Installation status
   - Crash data
   - Performance metrics
   - Tester feedback

---

## ✅ Step 9: Prepare for External Testing (Optional)

### 9a. Create External Test Group
1. TestFlight → "External Testing"
2. Click "+" → Create Test Group
3. **Name:** Beta Testers
4. **Max Testers:** 10,000 (limit)
5. Add description:
```
Help us test SPICEY before official launch!

We're looking for feedback on:
• Feed performance
• Messaging speed
• Video playback
• Overall stability

Please report any crashes or bugs via TestFlight.

Thank you for testing! 🔥
```

### 9b. Submit for Beta App Review
1. Build → "Add for Review"
2. Fill Review Information:
   - **Contact Email:** info@spicey.live
   - **Notes:** "First beta release for community testing"
3. Click "Submit for Review"
4. Apple reviews (24 hours typical)

### 9c. Add External Testers
1. After approval, click "+" in External Testing
2. Add email addresses
3. Send invite links
4. Testers install via TestFlight

---

## 🚨 Troubleshooting Common Issues

### Issue: "Missing Provisioning Profile"
```
Solution:
1. Xcode → Preferences → Accounts
2. Select team
3. Click "Download Manual Profiles"
4. Try Archive again
```

### Issue: "Code Signing Identity Not Found"
```
Solution:
1. Go to Apple Developer > Certificates
2. Create new iOS Development certificate
3. Download and import into Xcode
4. Clean build folder (Cmd+Shift+K)
5. Try Archive again
```

### Issue: "Upload Failed"
```
Solution:
1. Check internet connection
2. Try uploading again
3. If persists, validate app:
   - Xcode → Product → Validate App
   - Fix any warnings
   - Try again
```

### Issue: "Build Appears Stuck in Processing"
```
Solution:
1. Wait 24 hours (Apple's processing)
2. Check email for status
3. If still stuck:
   - Go to App Store Connect
   - Click build number
   - See processing status/errors
```

---

## 📋 Pre-TestFlight Checklist

Before hitting "Distribute":

- [x] Bundle ID registered in Apple Developer
- [x] App Icon 1024×1024 uploaded
- [x] Screenshots (5-10) uploaded
- [x] Description, keywords, support URL filled
- [x] Privacy Policy URL set
- [x] Terms of Service link added
- [x] Support email configured
- [x] Version number incremented
- [x] Build number incremented
- [x] Archive created successfully
- [x] No code signing errors
- [x] Bundle size verified (~500MB)

---

## 🎯 Timeline

```
Xcode Archive:          5-10 min
Upload to App Store:    10-20 min (network dependent)
Processing on Apple:    5-15 min
Available in TestFlight: Immediate
Tester installation:    5 min per device
Beta review (external): 24 hours

Total: 1-2 hours for internal testing
      24-48 hours for external testing
```

---

## ✨ What's Next?

After testers have the app:

1. **Monitor Crashes** (TestFlight Dashboard)
2. **Collect Feedback** (via email/TestFlight)
3. **Fix Critical Issues** (rebuild if needed)
4. **Repeat testing** (if major changes)
5. **Submit to App Store** (when ready - see next guide)

---

## 🔗 Useful Links

- [App Store Connect](https://appstoreconnect.apple.com/)
- [Apple Developer](https://developer.apple.com/)
- [TestFlight Documentation](https://developer.apple.com/testflight/)
- [Code Signing Guide](https://developer.apple.com/support/code-signing/)

---

**Status:** Ready for TestFlight submission ✅

**Estimated Time to Deploy:** 1-2 hours (first time)

**Next Step:** App Store Submission (see APP_STORE_SUBMISSION.md)