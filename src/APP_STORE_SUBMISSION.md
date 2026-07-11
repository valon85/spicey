# SPICEY App - Apple App Store Submission Guide

## 📋 Overview

This guide walks you through submitting SPICEY to the Apple App Store after successful TestFlight testing.

**Timeline:** 1-2 weeks (Apple review: 24-48 hours typical)

---

## ✅ Step 1: Pre-Submission Checklist

Before submitting to App Store, verify:

### Technical Requirements
- [x] App runs without crashes
- [x] All features functional
- [x] iOS 13.0+ compatible
- [x] Supports iPhone & iPad
- [x] Safe areas properly implemented
- [x] No private API usage
- [x] No security vulnerabilities
- [x] HTTPS for all API calls

### Content Requirements
- [x] Privacy Policy posted & accessible
- [x] Terms of Service posted
- [x] Community Guidelines visible
- [x] Delete Account functionality working
- [x] Support email: info@spicey.live

### Store Listing
- [x] App Icon 1024×1024
- [x] Screenshots (5-10 per size class)
- [x] App Preview Video (optional but recommended)
- [x] Description & keywords
- [x] Support URL (https://spicey.live/support)
- [x] Privacy Policy URL
- [x] Category selected (Social Networking)

### Testing
- [x] Tested on iPhone (minimum 2 sizes)
- [x] Tested on iPad
- [x] Tested landscape orientation
- [x] No console errors
- [x] No memory leaks
- [x] Performance acceptable (60fps)
- [x] Battery usage reasonable

---

## 📝 Step 2: Complete App Metadata

### 2a. Version & Build Info
1. App Store Connect → Pricing & Availability
2. **Version Number:** 1.0.0
3. **Build Number:** 1
4. **Release:** Manual (don't auto-release)

### 2b. Pricing & Distribution
1. **Price Tier:** Free
2. **In-App Purchases:** None (for initial launch)
3. **Availability:** Worldwide
4. **Date:** Leave as default

### 2c. Content Rights
1. **Content Rights:** 
   - ✅ "Yes, I own/have rights to all content"
2. **Advertising:** 
   - ✅ "Yes, this app displays advertisements" (if applicable)
   - Actually: No ads in SPICEY → Select "No"

---

## 🔍 Step 3: Complete App Review Information

### 3a. Review Information
1. App Store Connect → App Review Information
2. **Contact Email:** info@spicey.live
3. **Phone:** Your phone number
4. **Demo Account:**
   - Email: demo@spicey.live
   - Password: DemoPassword123!
   - (Create this test account before submission)

### 3b. Notes for Reviewer
```
SPICEY v1.0 - First Release

What's New:
• Real-time social feed with genuine reactions
• Direct messaging system
• Video reels vertical feed
• Live video/voice calls
• User profiles with followers

Testing Instructions:
1. Launch app
2. Sign up with test account (demo@spicey.live / DemoPassword123!)
3. Browse feed - create test posts
4. Try messaging, calls, reels
5. Check profile page

Features to Test:
✅ Feed loading & posting
✅ Real-time reactions (fire/like/wow)
✅ Chat messaging
✅ Video reels
✅ User profiles
✅ Account settings
✅ Privacy/Terms/Guidelines pages

No beta features or incomplete sections.

Contact: info@spicey.live
```

### 3c. Upload Test Screenshots
Not required but helpful:
1. Screenshot showing app in use
2. Screenshot of key feature (reactions)
3. Screenshot of messaging

---

## 🎯 Step 4: Content Rating

### 4a. Complete Questionnaire
1. App Store Connect → Content Rating
2. Click "Edit" 
3. Answer rating questions:

```
Questions typically include:

Frequency of Use of Profanity:
→ "Infrequent/Mild" or "None"

Frequency of Violent Content:
→ "None"

Frequency of Mature/Suggestive Themes:
→ "Infrequent/Mild"

Alcohol/Tobacco Use:
→ "None" or "Infrequent"

Medical/Treatment Information:
→ "None"

Privacy Issues (location, contacts):
→ "Significant" (app has messaging/profiles)
```

4. Click "Save"
5. Ratings appear: ESRB, PEGI, etc.

**Expected Rating:** Age 12+ (PEGI 12) or Age 17+ if user-generated content

---

## 🏆 Step 5: Prepare for Submission

### 5a. Create Demo Account
Before submitting, create test account:

```
Email: demo@spicey.live
Password: DemoPassword123!
Full Name: SPICEY Demo
Username: spiceydemov1
Bio: This is a demo account for testing
```

**Create some test posts:**
1. Text post with caption
2. Image post with reactions
3. Video reel
4. Test messaging (optional)

**Make account follow others (if possible)**

### 5b. Final Verification
1. Test complete user flow:
   - Sign in with demo account
   - Browse feed
   - Create post
   - React to posts
   - Send message
   - Make call
   - View profile
   - Access settings

2. Verify compliance pages:
   - Settings → Account & Safety
   - Privacy Policy link works
   - Terms of Service link works
   - Delete Account button present

3. Check for crashes:
   - Monitor console (DevTools)
   - Test all interactions
   - Try edge cases (offline, slow network)

---

## 📤 Step 6: Submit to App Store

### 6a. Build & Archive (Final Build)
```bash
# Final build
npm run build

# In Xcode:
# Product → Archive
# Wait for completion
```

### 6b. Distribute to App Store
1. In Xcode Organizer:
   - Select SPICEY archive
   - Click "Distribute App"
   - Choose "App Store Connect"
   - Click "Next"

2. Signing:
   - Select "Automatically manage signing"
   - Choose your team
   - Click "Next"

3. Submission:
   - Review details
   - Click "Submit"
   - Wait 5-15 minutes for upload

### 6c. Confirm Submission
1. App Store Connect → App Store → Build
2. Wait for processing (5-30 min)
3. Check build status:
   - "Processing" → Upload accepted
   - "Ready to Submit" → Ready for review
   - "In Review" → Apple is reviewing
   - "Approved" → Live on App Store!

---

## 🚀 Step 7: Submit for App Store Review

### 7a. Complete Release Notes
1. App Store Connect → What's New in This Version
2. Add release notes:
```
SPICEY v1.0

🔥 Welcome to the launch of SPICEY!

New Features:
• Share photos and videos instantly
• React with genuine reactions (Fire, Like, Wow)
• Real-time messaging with friends
• Vertical video reels feed
• Live video and voice calls
• Discover new people

Thank you for being part of our community!

Have feedback? Email: info@spicey.live
```

### 7b. Add Consent
1. Check "This app uses IDFA" (if applicable)
   - SPICEY doesn't require IDFA → Leave unchecked
2. Check "Does your app use encryption?" → No
3. Check "Does your app qualify for reduced review time?" → No

### 7c. Submit for Review
1. App Store Connect → App Store → Build
2. Build shows "Ready to Submit"
3. Click build → "Submit for Review"
4. Confirmation appears

### 7d. Submit for Review (Action)
1. App Store Connect → Overview
2. Scroll to "Build" section
3. Click the build → "Submit for Review"
4. Confirm submission
5. Get email confirmation

---

## ⏳ Step 8: Monitor Review Status

### 8a. Check Review Status
1. App Store Connect → App Store
2. "Status & Version" section shows:
   - **"Waiting for Review"** → In Apple's queue (2-24 hours)
   - **"In Review"** → Apple actively reviewing
   - **"Approved"** → Ready to release!
   - **"Rejected"** → Issues found (see reason)

### 8b. Understanding Review Times
```
Typical Timeline:
Day 1: Submit → "Waiting for Review"
Day 1-2: Apple processes → "In Review"
Day 2-3: Apple decides → "Approved" or "Rejected"

Fast Track (rare):
- Can be approved in 24 hours
- Usually within 48 hours
```

### 8c. Set Release Date
When approved:
1. Click "Approved" build
2. **Release Option:**
   - "Automatically release this version" → Auto-live
   - "Manually release this version" → You choose when
3. For launch, choose manual release
4. Release when ready (big announcement!)

---

## ❌ Handling Rejection

If rejected, Apple provides reason:

### Common Rejection Reasons

**1. Content Policy Violation**
```
Issue: User-generated content policies
Solution:
- Add content moderation
- Add reporting feature
- Update guidelines
- Resubmit
```

**2. Privacy Issues**
```
Issue: Missing privacy policy or data collection unclear
Solution:
- Ensure privacy policy accessible in-app
- Document all data collected
- Explain why data is needed
- Resubmit
```

**3. Crash on Launch**
```
Issue: App crashes immediately
Solution:
- Verify build is correct
- Test on device/simulator
- Check console for errors
- Create new archive
- Resubmit
```

**4. Incomplete Functionality**
```
Issue: Core features don't work
Solution:
- Test all features thoroughly
- Fix bugs
- Verify with demo account
- Resubmit
```

### Resubmission
1. Fix the issue
2. Increment build number: 1 → 2
3. Archive & distribute new build
4. Submit for review again

---

## 🎉 Step 9: Release to App Store

### 9a. Approve Release
When build shows "Approved":

1. App Store Connect → App Store
2. **Version Release Information:**
   - Release Option: "Manually release this version"
   - Set release date (can be today or future date)

3. Click "Release this Version"
4. Confirm release

### 9b. Go Live
1. **Immediate:** Version goes live instantly
2. **Staged:** Can take 1-2 hours to propagate globally
3. Users can find app in App Store search
4. Marketing begins!

### 9c. Post-Launch Monitoring

**First 24 Hours:**
- Monitor crash reports
- Check user reviews (coming in)
- Track downloads
- Watch for 1-star reviews

**Daily:**
- Respond to reviews
- Monitor performance
- Track ratings trend
- Fix urgent bugs

**Weekly:**
- Analyze user feedback
- Plan v1.1 improvements
- Monitor retention

---

## 📊 Useful Metrics

### Track in App Store Connect:

1. **App Store Analytics**
   - Impressions (how many saw it)
   - Page Views
   - Conversions (install rate)
   - Downloads
   - Revenue (if paid)

2. **Performance**
   - Crash logs
   - Performance metrics
   - Battery/memory usage
   - Network performance

3. **User Feedback**
   - Ratings (target: 4.0+)
   - Reviews (read frequently)
   - Crash reports
   - Performance feedback

---

## ✅ Post-Submission Checklist

After submission:

- [x] Check submission confirmed in email
- [x] Monitor status in App Store Connect
- [x] Have demo account ready (testers may ask)
- [x] Prepare marketing announcement
- [x] Plan launch day activities
- [x] Set up support email monitoring
- [x] Plan v1.1 features (based on feedback)

---

## 🔗 Quick Links

- [App Store Connect](https://appstoreconnect.apple.com/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [App Store Resource Center](https://developer.apple.com/resources/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)

---

## 🚀 What Happens Next?

**Hours:**
- Email confirmation of submission
- Build moves to Apple's review queue

**24-48 Hours:**
- Apple begins review
- Status changes to "In Review"

**48-72 Hours:**
- Decision made
- Status: "Approved" or "Rejected"

**If Approved:**
- Release version
- App goes live in ~1-2 hours
- Users can download!

**If Rejected:**
- Fix issue
- Resubmit with new build

---

**Status:** Ready for App Store submission ✅

**Next Step:** Google Play Console submission (see GOOGLE_PLAY_SUBMISSION.md)

**Estimated Time:** 2-3 weeks total (submission to launch)