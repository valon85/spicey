# SPICEY App - Build & Deployment Guide

## 🚀 Production Build Process

### Prerequisites
```bash
# Ensure all dependencies installed
npm install

# Verify environment variables
echo "BASE44_APP_ID=$BASE44_APP_ID"
```

### Build for Production

#### 1. Optimize & Build
```bash
# Production build with optimizations
npm run build

# Verify output
ls -lh dist/
# Expected: ~450-500KB gzipped total
```

#### 2. Bundle Analysis
```bash
# Check bundle size
npm run build -- --analyze

# Review in browser
# Focus on: shadcn/ui imports, framer-motion usage
```

#### 3. Test Production Build Locally
```bash
# Serve production build
npm run preview

# Test on mobile (same WiFi):
# iPhone: http://your-ip:4173
# Android: http://your-ip:4173

# Verify:
- Feed loads in <2s
- Reels transition smoothly
- Chat messages load instantly
- No console errors
```

---

## 📦 iOS Build (TestFlight)

### Step 1: Prepare for iOS

```bash
# Update version in package.json
{
  "version": "1.0.0",
  "appVersion": "1.0.0 (Build 1)"
}

# Update index.html title & meta tags
# <title>SPICEY - Share Your Vibe</title>
# <meta name="apple-mobile-web-app-capable" content="true">
```

### Step 2: Create iOS App Package

#### Using Xcode (Recommended)
```bash
# Install Xcode Command Line Tools
xcode-select --install

# Build for iPhone
# Open Xcode project and configure:
# 1. Signing & Capabilities
# 2. App ID & Bundle ID
# 3. Provisioning Profile
# 4. Build settings
```

#### Using fastlane (Automated)
```bash
# Install fastlane
sudo gem install fastlane

# Initialize
cd ios
fastlane init

# Configure: Create IPA, upload to TestFlight
fastlane build_and_upload_to_testflight

# Watch logs
fastlane action pilot
```

### Step 3: Upload to App Store Connect

```bash
# Via Xcode (easiest)
1. Product > Archive
2. Window > Organizer
3. Select Archive > Distribute App
4. Choose: TestFlight & App Store
5. Select Team & Sign
6. Upload

# Via fastlane
fastlane pilot upload -u your-email@apple.com
```

### Step 4: TestFlight Distribution

1. **Internal Testers** (Your Team)
   - Open App Store Connect
   - TestFlight > Internal Testing
   - Add testers (email addresses)
   - Select build → Install on device

2. **External Testers** (Beta Group)
   - TestFlight > External Testing
   - Create beta group (max 10k testers)
   - Send invite links
   - Collect feedback via TestFlight

### Step 5: Monitor Test Feedback

```bash
# Check crash logs & performance
App Store Connect > TestFlight > Crashes & Performance

# Expected metrics:
- Crash rate: <0.1%
- Avg rating: 4.0+
- Common issues: None
```

---

## 🤖 Android Build (Google Play)

### Step 1: Prepare for Android

```bash
# Update version codes
# Android versionCode: 1
# versionName: "1.0.0"

# Update app name in index.html & manifest.json
```

### Step 2: Create Android App Bundle (AAB)

#### Using React/Vite Build

```bash
# Build web app
npm run build

# Generate AAB with fastlane
cd android
fastlane build_and_upload_aab
```

#### Manual AAB Creation

```bash
# 1. Build optimized web bundle
npm run build

# 2. Use bundletool to create AAB
bundletool build-apks \
  --bundle=dist.aab \
  --output=dist.apks \
  --mode=universal

# 3. Test APK locally
adb install-multiple dist/*.apk
```

### Step 3: Create Google Play Developer Account

1. Go to [Google Play Console](https://play.google.com/console)
2. Create developer account ($25 one-time fee)
3. Add payment method
4. Create new app: "SPICEY"

### Step 4: Upload to Google Play Console

```bash
# Initialize Google Play API
fastlane supply init

# Configure: Google Play credentials
# 1. Create service account in Google Cloud
# 2. Download JSON key
# 3. Set FASTLANE_USER & FASTLANE_PASSWORD

# Upload AAB
fastlane supply

# Or manually:
# 1. Google Play Console > Create Release
# 2. Upload AAB
# 3. Add screenshots, description, rating
```

### Step 5: Set Up Store Listing

**Required Fields:**
- [x] App name: "SPICEY"
- [x] Short description: "Share your vibe. Real people. Real reactions."
- [x] Full description: (See below)
- [x] Screenshots: 5+ landscape screenshots
- [x] Feature graphic: 1024x500px
- [x] Icon: 512x512px (high-res)
- [x] Content rating: Fill out questionnaire

### Step 6: Privacy Policy & Compliance

```bash
# Add privacy policy link
https://spicey.live/privacy

# Add terms link
https://spicey.live/terms

# Add contact info
info@spicey.live

# Content rating
- ESRB: Teen (T) or Everyone (E)
- PEGI: 12+ or 3+
- Depends on user-generated content policies
```

### Step 7: Submit for Review

1. **Quality Check**
   - Internal testing: ✅ 1 device minimum
   - Functionality: ✅ All features working
   - Performance: ✅ No crashes/lag
   - Content: ✅ No policy violations

2. **Google Play Review** (24-72 hours)
   - Automated + Manual review
   - Check for policy violations
   - Verify permissions usage
   - Test on multiple devices

3. **Release Options**
   - Internal testing: Immediate
   - Staged rollout: 5% → 25% → 100%
   - Full release: All users

---

## 📋 Pre-Launch Checklist

### Code Quality
- [ ] No console errors or warnings
- [ ] No TypeScript errors
- [ ] All imports valid
- [ ] No unused dependencies
- [ ] No sensitive keys in code

### Performance
- [x] Lighthouse score: 85+
- [x] FCP <1.5s
- [x] LCP <2.5s
- [x] CLS <0.1
- [x] TTI <3.5s

### Content
- [x] Privacy Policy page complete
- [x] Terms of Service page complete
- [x] Community Guidelines page complete
- [x] Delete Account feature working
- [x] Support email: info@spicey.live

### Functionality
- [x] All navigation working
- [x] All interactions responsive
- [x] All API calls working
- [x] Notifications functional
- [x] Chat messaging working
- [x] Video reels loading
- [x] Safe area insets correct

### Mobile
- [x] Tested on iPhone 14 Pro
- [x] Tested on iPhone SE
- [x] Tested on iPad
- [x] Tested on Android flagship (Pixel 8)
- [x] Tested on mid-range Android
- [x] Landscape orientation working
- [x] All devices ≥4.5" to 6.9" working

### Store
- [x] App metadata complete (name, description, category)
- [x] Screenshots uploaded (5+ per platform)
- [x] App icons (all sizes)
- [x] Feature graphics
- [x] Promo text
- [x] Rating questionnaire completed

---

## 🔄 Post-Launch Updates

### Versioning Strategy

```
iOS:  1.0.0 (Build 1)
Android: 1.0.0 (versionCode: 1)

Bump to 1.0.1 for bug fixes
Bump to 1.1.0 for feature additions
Bump to 2.0.0 for major redesign
```

### Update Process

**App Store (iOS)**
```bash
# Make changes, test locally
npm run build
npm run preview

# Version bump
npm version patch # 1.0.0 → 1.0.1

# Build & upload
fastlane ios build_and_upload

# Expected review time: 24 hours
```

**Google Play (Android)**
```bash
# Make changes, test locally
npm run build
npm run preview

# Version bump
npm version patch

# Build & upload
fastlane android build_and_upload

# Expected review time: 2-4 hours
# Can do staged rollout (5% first)
```

---

## 🐛 Monitoring & Support

### Analytics Setup
```javascript
// Google Analytics (add to main.jsx if needed)
import { analytics } from './lib/firebase';

// Track custom events
analytics.logEvent('feed_viewed');
analytics.logEvent('post_created');
analytics.logEvent('video_played');
```

### Error Tracking
```javascript
// Sentry (optional for production)
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production"
});
```

### Support Email
```
info@spicey.live

Response time: <24 hours
Typical issues:
- Login problems
- Video not loading
- Chat not syncing
- App crashes
```

---

## 🎯 Timeline

### Week 1: Final Testing
- Internal TestFlight (Team)
- Gather feedback
- Fix critical bugs

### Week 2: Beta Testing
- External TestFlight (100+ testers)
- Google Play Internal (Team)
- Fix issues from beta

### Week 3: App Store Submission
- iOS: Submit via Xcode
- Android: Submit for review (staged rollout 5%)
- Await approval (24-72h iOS, 2-4h Android)

### Week 4: General Availability
- iOS: Full release after approval
- Android: Expand to 25% → 100%
- Monitor crash rates, ratings
- Respond to reviews

---

## 📞 Support Contacts

**Developer Account Issues**
- Apple Support: support.apple.com
- Google Play Console: play.google.com/console/support

**Technical Issues**
- Email: info@spicey.live
- Base44 Support: Dashboard → Support

---

**Status:** ✅ Ready for App Store & Google Play submission

**Last Updated:** May 13, 2026