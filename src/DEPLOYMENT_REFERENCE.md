# SPICEY App - Deployment Reference & Quick Start

## 🚀 Quick Start Timeline

```
Phase 1: Preparation (1-2 days)
├─ Build assets (icons, splash, screenshots)
├─ Set up Apple Developer account ($99)
├─ Set up Google Play account ($25)
└─ Create demo account for testing

Phase 2: TestFlight (3-5 days)
├─ Create iOS archive
├─ Upload to App Store Connect
├─ Distribute to internal testers
└─ Gather feedback & fix issues

Phase 3: App Store & Google Play (5-10 days)
├─ Complete App Store metadata
├─ Submit to App Store review
├─ Complete Google Play metadata
├─ Submit to Google Play (staged 5%)
└─ Monitor & expand rollout

Phase 4: Launch (Immediate)
├─ App Store: "Approved" → Release
├─ Google Play: 5% → 100% rollout
├─ Marketing & announcement
└─ Monitor crash rates & reviews

Total Timeline: 2-3 weeks from start to full launch
```

---

## 📋 Complete Checklist

### Pre-Build (Assets & Accounts)
- [ ] Apple Developer Account created ($99)
- [ ] Google Play Developer Account created ($25)
- [ ] App icons designed (1024×1024 master)
- [ ] Splash screens designed (1024×2048)
- [ ] 5+ screenshots captured (1170×2532 iOS, 1080×1920 Android)
- [ ] Feature graphic created (1024×500 for Android)
- [ ] Release notes written
- [ ] Privacy Policy URL ready
- [ ] Terms of Service URL ready
- [ ] Community Guidelines URL ready

### Build Phase
- [ ] Run `npm run build`
- [ ] Verify bundle size (~450-500KB)
- [ ] Create iOS archive in Xcode
- [ ] Create Android AAB (via Android Studio or bundletool)
- [ ] Increment version in package.json
- [ ] Set build numbers (iOS & Android)

### TestFlight Phase (iOS)
- [ ] Create App Store Connect app record
- [ ] Upload app icon & screenshots
- [ ] Write description & keywords
- [ ] Create iOS archive
- [ ] Upload to App Store Connect
- [ ] Distribute to internal testers
- [ ] Receive feedback
- [ ] Fix critical issues

### App Store Phase (iOS)
- [ ] Complete all app metadata
- [ ] Add release notes
- [ ] Set pricing & distribution
- [ ] Complete content rating
- [ ] Create demo account with test data
- [ ] Submit for review
- [ ] Monitor review status (24-48 hours)
- [ ] Release when approved

### Google Play Phase (Android)
- [ ] Create Google Play app record
- [ ] Upload app icon, feature graphic, screenshots
- [ ] Write description & keywords
- [ ] Complete content rating
- [ ] Set category & content guidelines
- [ ] Create & upload AAB
- [ ] Write release notes
- [ ] Set staged rollout (5%)
- [ ] Submit for review
- [ ] Monitor for 24 hours
- [ ] Expand to 25% → 50% → 100%

### Post-Launch (Both Platforms)
- [ ] Monitor crash reports daily
- [ ] Respond to user reviews
- [ ] Track downloads & engagement
- [ ] Monitor ratings trend
- [ ] Plan v1.1 updates
- [ ] Set up support system

---

## 🎯 Command Reference

### Build Commands
```bash
# Build web assets (required for all platforms)
npm run build

# Preview production build locally
npm run preview

# iOS build script
bash scripts/build-ios.sh

# Android build script  
bash scripts/build-android.sh

# Check bundle size
du -sh dist/
# Expected: ~450-500KB
```

### Version Management
```bash
# Update version in package.json
npm version patch        # 1.0.0 → 1.0.1
npm version minor        # 1.0.0 → 1.1.0
npm version major        # 1.0.0 → 2.0.0

# Get current version
grep '"version"' package.json
```

### File Locations

```
Web Assets: dist/
└─ index.html
└─ main.js (~350KB gzipped)
└─ styles.css (~50KB)
└─ assets/

iOS Archive: ~/Library/Developer/Xcode/Archives/
├─ SPICEY.xcarchive
└─ Can be re-exported multiple times

Android AAB: android/app/release/
└─ app-release.aab (~40-60MB)

Assets: assets/
├─ icons/
│   ├─ master-1024x1024.png
│   ├─ ios/ [all iOS sizes]
│   └─ android/ [all Android sizes]
├─ splash/
│   ├─ master-1024x2048.png
│   ├─ ios/ [all iOS sizes]
│   └─ android/ [all Android sizes]
└─ screenshots/
    ├─ ios/ [5-10 screenshots]
    └─ android/ [5-10 screenshots]
```

---

## 📊 Platform Specifications

### iOS (Apple App Store)

**Build Requirements:**
- Xcode 14.0+
- iOS 13.0+ minimum target
- Bundle ID: com.spicey.app
- Code Signing: Required

**Asset Sizes:**
- App Icon: 1024×1024 PNG
- Screenshots: 1170×2532 (iPhone 12 Pro Max)
- Preview Video: 1080×1920 MP4
- App Preview: Optional (15-30s)

**Review Time:** 24-48 hours typical
**Review Cost:** Free
**Price:** Free (in-app purchases optional)

**Submit via:**
1. Xcode Organizer → Distribute App
2. Or use fastlane pilot upload

---

### Android (Google Play)

**Build Requirements:**
- Android Studio or bundletool
- Android 8.0+ (API 26) minimum
- Package name: com.example.spicey
- Signed with release keystore

**Asset Sizes:**
- App Icon: 512×512 PNG
- Feature Graphic: 1024×500 PNG
- Screenshots: 1080×1920 (Phone)
- Promo Video: 1080×1920 MP4

**Review Time:** 2-4 hours typical
**Review Cost:** Free ($25 one-time account)
**Price:** Free (in-app purchases optional)

**Submit via:**
- Google Play Console → Upload AAB
- Or use fastlane supply

---

## 🔑 Account Information to Gather

### Apple Developer
```
Required:
- Apple ID: your-email@apple.com
- Apple ID Password: ***
- Team ID: (auto-generated)
- Bundle ID: com.spicey.app
- Certificates: iOS Development + Distribution
- Provisioning Profiles: For app
- App Store Connect access: You're the owner
```

### Google Play
```
Required:
- Google Account: your-email@gmail.com
- Developer Account registered
- Payment method: Visa/Mastercard
- Package Name: com.example.spicey
- Release keystore: release.keystore
- Keystore password: ***
```

---

## ⚠️ Common Issues & Solutions

### iOS Issues

**Issue: "Missing Provisioning Profile"**
```
Solution:
1. Xcode → Preferences → Accounts
2. Select Apple ID
3. Click "Manage Certificates"
4. Create iOS Development & Distribution certs
5. Download provisioning profiles
6. Clean build folder (Cmd+Shift+K)
7. Try again
```

**Issue: "Code Signing Identity Not Found"**
```
Solution:
1. Get new certificate from Apple Developer
2. Download + import into Xcode
3. Xcode → Project → Signing & Capabilities
4. Check "Automatically manage signing"
5. Select team
6. Try again
```

**Issue: "Upload Failed - Invalid Bundle"**
```
Solution:
1. Validate app in Xcode:
   Product → Validate App
2. Fix any warnings
3. Try uploading again
4. If still fails, try Transporter app:
   App Store Connect → Transporter
```

### Android Issues

**Issue: "Wrong Build Type"**
```
Solution:
Make sure building RELEASE variant:
./gradlew bundleRelease (not bundleDebug)
```

**Issue: "APK Not Signed"**
```
Solution:
1. Create or get release keystore
2. Sign APK/AAB with release keystore
3. Use correct password
4. Verify signed before uploading
```

**Issue: "Version Code Too Low"**
```
Solution:
Google Play requires version code increase
Last version: 1
New version: 2
Update in build.gradle:
versionCode 2
versionName "1.0.1"
```

---

## 📞 Support Contacts

**Apple**
- Developer Support: developer.apple.com/support
- App Review Support: In App Store Connect
- Technical Issues: Contact Apple Developer

**Google**
- Google Play Console Help: support.google.com/googleplay
- Policy Questions: play.google.com/about/developer-content-policy
- Technical Issues: Google Play Console → Help

**SPICEY Support**
- Email: info@spicey.live
- Response Time: <24 hours
- Available: 24/7

---

## 📚 Reference Documents

This deployment includes:

1. **PRODUCTION_READY_CHECKLIST.md**
   - Complete readiness verification
   - Success metrics & timeline

2. **TESTFLIGHT_SUBMISSION.md**
   - Step-by-step TestFlight guide
   - iOS build & distribution
   - Tester management

3. **APP_STORE_SUBMISSION.md**
   - Apple App Store submission
   - Metadata completion
   - Review handling & troubleshooting

4. **GOOGLE_PLAY_SUBMISSION.md**
   - Google Play Console setup
   - Android AAB submission
   - Staged rollout strategy

5. **ASSETS_GUIDE.md**
   - Icon specifications (all sizes)
   - Screenshot guidelines
   - Asset creation tools & methods

6. **DEPLOYMENT_REFERENCE.md** (This file)
   - Quick reference & quick start
   - Command reference
   - Common issues & solutions

---

## 🎬 Next Steps (In Order)

### Week 1: Preparation
```
Day 1-2: Create accounts & assets
├─ Set up Apple Developer
├─ Set up Google Play
├─ Design icons & splash
└─ Capture screenshots

Day 3: Prepare for build
├─ npm run build (verify)
├─ Create demo account
└─ Complete metadata
```

### Week 2: TestFlight & Testing
```
Day 1-2: Build & upload to TestFlight
├─ Create iOS archive
├─ Distribute to team
└─ Get feedback

Day 3-4: Fix issues & prepare for submission
├─ Fix critical bugs
├─ Finalize all metadata
└─ Create demo account with test data
```

### Week 3: App Store Submission
```
Day 1: Submit to App Store
├─ Complete metadata
├─ Submit for review
└─ Monitor status

Day 2: Submit to Google Play
├─ Complete metadata
├─ Upload AAB
└─ Submit for review (5% staged)
```

### Week 4: Launch & Monitoring
```
Day 1: App Store approved
├─ Release to App Store
└─ Marketing announcement

Day 2-3: Google Play review
├─ Monitor crash reports
├─ Gather user feedback
└─ Plan fixes if needed

Day 4: Google Play launch
├─ Expand to 25%
├─ Monitor stability
└─ Full rollout to 100%

Day 5+: Post-launch
├─ Respond to reviews
├─ Monitor metrics
└─ Plan v1.1 updates
```

---

## 🎯 Success Criteria

### Launch Day
- [x] App available on App Store (iOS)
- [x] App available on Google Play (Android)
- [x] Can download and install
- [x] App launches without crashing
- [x] Basic functionality working

### Week 1
- [x] 100+ downloads per platform
- [x] 4.0+ average rating (both platforms)
- [x] Crash rate <0.2%
- [x] Support email monitored
- [x] Major bugs documented

### Month 1
- [x] 500+ downloads per platform
- [x] 4.2+ average rating (both platforms)
- [x] Crash rate <0.1%
- [x] Active user retention >50%
- [x] v1.1 features identified

---

## 💡 Pro Tips

1. **Start with TestFlight**
   - Catch issues before App Store
   - Get feedback from real testers
   - Fix critical bugs early

2. **Use Staged Rollout**
   - Don't launch to 100% immediately
   - Start at 5%, expand gradually
   - Monitor crash rates before expanding

3. **Monitor from Day 1**
   - Check crash reports hourly
   - Read reviews immediately
   - Respond to feedback quickly

4. **Plan v1.1 Early**
   - Collect feature requests
   - Track bug reports
   - Prioritize improvements

5. **Maintain Marketing List**
   - Track launch metrics
   - Document lessons learned
   - Plan next release

---

## 📊 Metrics to Track

**Daily (First Week):**
- Downloads per hour
- Crash rate
- First-day retention
- 1-star reviews (why?)

**Weekly (First Month):**
- Total downloads
- Active users
- Average rating
- User retention (Day 1, 7, 30)

**Monthly:**
- Total downloads
- Revenue (if paid)
- User churn rate
- Feature usage

---

**Status:** ✅ Complete deployment guide ready

**Ready to execute?** Follow the checklists above in order.

**Questions?** Contact: info@spicey.live

**Start date:** Today! Begin with Week 1 Preparation.