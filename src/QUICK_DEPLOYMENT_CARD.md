# SPICEY - Deployment Quick Reference Card

## 📱 iOS TestFlight & App Store (3 Steps)

### Step 1: Prepare Build
```bash
npm run build                    # Build web assets
# Open in Xcode: Product → Archive
```

### Step 2: Upload to TestFlight
```
Xcode Organizer:
1. Select archive
2. "Distribute App"
3. "TestFlight & App Store"
4. Auto-signing enabled
5. Click "Upload"
(Wait 10-15 minutes)
```

### Step 3: Submit to App Store
```
App Store Connect:
1. Complete metadata (name, description, keywords)
2. Upload icon (1024×1024) & screenshots (1170×2532)
3. Build → "Submit for Review"
(Wait 24-48 hours for approval)
→ Release when approved
```

**Timeline:** 1-2 weeks total (TestFlight + App Store)

---

## 🤖 Android Google Play (2 Steps)

### Step 1: Build & Upload
```bash
npm run build
# Use Android Studio or bundletool to create app-release.aab
# Upload AAB to Google Play Console
```

### Step 2: Submit to Google Play
```
Google Play Console:
1. Complete metadata (name, description, keywords)
2. Upload icon (512×512) & feature (1024×500)
3. Upload 5+ screenshots (1080×1920)
4. Write release notes
5. Submit for review (staged rollout 5%)
(Wait 2-4 hours for approval)
→ Monitor crashes for 24h
→ Expand to 100% if stable
```

**Timeline:** 2-4 hours (much faster than iOS!)

---

## 🎨 Assets Needed (Prepare First!)

| Asset | Size | Format | Needed For |
|-------|------|--------|-----------|
| App Icon | 1024×1024 | PNG | Both |
| Splash Screen | 1024×2048 | PNG | Both |
| Screenshots | 1170×2532 (iOS) 1080×1920 (Android) | PNG | Both |
| Feature Graphic | 1024×500 | PNG | Android only |
| Promo Video | 1080×1920 | MP4 | Optional |

**Time to create:** 4-6 hours

---

## 📝 Text Content (Prepare First!)

```
App Name: SPICEY
Tagline: Share Your Vibe

Short Description (80 chars):
Real people. Real reactions. Real connections.

Keywords:
social media, messaging, video, reels, feed, reactions, live chat, communities

Full Description (4000 chars):
[See APP_STORE_SUBMISSION.md or GOOGLE_PLAY_SUBMISSION.md]

Support Email: info@spicey.live
Privacy Policy: https://spicey.live/privacy
Terms: https://spicey.live/terms
```

---

## 🔐 Accounts Needed

```
APPLE DEVELOPER ACCOUNT
├─ Cost: $99/year
├─ Time to set up: 1-2 hours
├─ Get at: developer.apple.com
└─ Need: Apple ID + payment method

GOOGLE PLAY ACCOUNT  
├─ Cost: $25 one-time
├─ Time to set up: 30 minutes
├─ Get at: play.google.com/console
└─ Need: Google account + payment method
```

---

## ⏱️ Timeline at a Glance

```
Today:     Create accounts, design assets
+1 day:    Build & TestFlight upload
+3 days:   TestFlight testing complete
+5 days:   App Store submitted
+7 days:   Google Play submitted  
+10 days:  Both approved
+11 days:  Launch day 🚀
```

**Real timeline:** Usually 2-3 weeks total

---

## ✅ Pre-Submission Checklist (Must Do First!)

```
Assets:
☐ Icons (1024×1024 master)
☐ Splash screen (1024×2048)
☐ Screenshots (5+)
☐ Feature graphic (1024×500 Android)

Accounts:
☐ Apple Developer account ($99)
☐ Google Play account ($25)

Content:
☐ App name & tagline
☐ Short description
☐ Full description (4000 chars)
☐ Keywords
☐ Privacy Policy URL working
☐ Terms of Service URL working

Build:
☐ npm run build (passes)
☐ Version number set
☐ Build number set
☐ No console errors

Testing:
☐ App tested on device/simulator
☐ All features working
☐ No crashes

Demo:
☐ Demo account created
☐ Test data (posts, messages, etc.)
```

---

## 🎯 Key Metrics to Monitor

### Day 1 (Launch)
- App available on both stores
- Can download & install
- App doesn't crash on launch

### Week 1
- 100+ downloads per platform
- 4.0+ rating
- <0.2% crash rate
- Support email monitored

### Month 1
- 500+ downloads per platform
- 4.2+ rating
- <0.1% crash rate
- 50%+ user retention

---

## 🚨 If Something Goes Wrong

| Problem | Solution | Time |
|---------|----------|------|
| App crashes on launch | Fix bug, new build, resubmit | 2-24 hours |
| Missing privacy policy | Add link in settings, resubmit | 1-2 hours |
| Icon not right size | Resize asset, new build, resubmit | 30 mins |
| Bad reviews | Fix issues, v1.0.1 update, resubmit | 24-48 hours |
| Rejected by Apple/Google | Address rejection reason, resubmit | 24-48 hours |

---

## 📞 Emergency Contact

**Support Email:** info@spicey.live  
**Response Time:** <24 hours  
**Available:** 24/7

---

## 🔗 Important Links

```
Apple App Store Connect:
https://appstoreconnect.apple.com/

Google Play Console:
https://play.google.com/console/

Apple Developer:
https://developer.apple.com/

Google Play Policies:
https://play.google.com/about/developer-content-policy/
```

---

## 📚 Detailed Guides

For step-by-step instructions, see:

1. **TESTFLIGHT_SUBMISSION.md** - Full iOS TestFlight guide
2. **APP_STORE_SUBMISSION.md** - Full App Store submission guide
3. **GOOGLE_PLAY_SUBMISSION.md** - Full Google Play submission guide
4. **ASSETS_GUIDE.md** - How to create/generate all assets
5. **DEPLOYMENT_REFERENCE.md** - Complete reference & troubleshooting

---

## 💡 One-Minute Decision Guide

**Q: Should I do TestFlight first?**  
A: Yes! Catches issues before App Store submission.

**Q: Should I start at 5% on Google Play?**  
A: Yes! Safer to expand gradually than risk all users.

**Q: How long before approval?**  
A: iOS: 24-48 hours | Android: 2-4 hours

**Q: Can I change things after submission?**  
A: No. Create new build if you need changes.

**Q: What if rejected?**  
A: Fix issue and resubmit. Usually approved next try.

**Q: Do I need to price my app?**  
A: No. Set to "Free" (in-app purchases optional).

---

## 🚀 Ready to Launch?

1. ✅ Gathered all prerequisites?
2. ✅ Created all assets?
3. ✅ Built & tested locally?
4. ✅ Completed app metadata?
5. ✅ Created demo account?

→ Start with **TestFlight** first!

---

**Good luck launching SPICEY! 🔥**

**Questions?** See the detailed guides above.

**Need support?** Email info@spicey.live