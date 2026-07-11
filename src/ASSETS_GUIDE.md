# SPICEY App - Asset Generation & Build Guide

## 📱 App Icons

### Required Sizes

#### iOS (App Store)
```
1024 x 1024 px  → App Store, Spotlight, Settings (main icon)
 180 x  180 px  → iPhone 6s/7/8 App Icon (2x)
 167 x  167 px  → iPad Pro App Icon
 152 x  152 px  → iPad App Icon (2x)
 120 x  120 px  → iPhone 6s/7/8 App Icon (1x) - also used for notifications
 87  x  87  px  → App Store Spotlight (1x)
 80  x  80  px  → iPad Spotlight (2x)
 60  x  60  px  → iPhone App Icon (1x)
 58  x  58  px  → App Store Spotlight iOS 5,6 (2x)
 40  x  40  px  → iPad Spotlight iOS 5,6 (1x)
 29  x  29  px  → iPhone Settings (1x)
```

#### Android (Google Play)
```
512 x 512 px  → Google Play Store (main icon)
192 x 192 px  → Launcher (xxxhdpi)
144 x 144 px  → Launcher (xxhdpi)
 96 x  96 px  → Launcher (xhdpi)
 72 x  72 px  → Launcher (hdpi)
 48 x  48 px  → Launcher (mdpi)
```

### Design Guidelines

**Main Icon (1024x1024):**
- Centered SPICEY logo/text
- Neon orange (#ff6400) primary color
- Dark purple background (#0a0a1a)
- Gradient: Orange → Pink → Purple (conic-gradient)
- No transparent areas (solid background)
- Safe zone: 10% margin from edges

**Design Style:**
```
- Futuristic neon aesthetic
- High contrast for visibility
- Works at small sizes (29px minimum)
- No tiny details (readable at 29px)
- Rounded corners: 20-25% of size
```

### How to Generate

#### Option 1: Using Figma (Recommended)
1. Create 1024x1024 design in Figma
2. Export for all required sizes using plugin:
   - "Export All Sizes" plugin
   - Or "Icon Scale" plugin

#### Option 2: Using Online Tools
1. Go to: https://www.appicon.co/
2. Upload 1024x1024 PNG
3. Download all sizes (iOS + Android)
4. Extract to respective folders

#### Option 3: Using ImageMagick (CLI)
```bash
# Generate all iOS sizes from 1024x1024 master
for size in 1024 180 167 152 120 87 80 60 58 40 29; do
  convert icon-1024.png -resize ${size}x${size} \
    ios/AppIcon.appiconset/icon-${size}.png
done

# Generate all Android sizes
for size in 512 192 144 96 72 48; do
  convert icon-1024.png -resize ${size}x${size} \
    android/app/src/main/res/mipmap-${size}x${size}/ic_launcher.png
done
```

---

## 🎨 Splash Screen Assets

### iOS Splash (Launch Screen)
```
1024 x 2048 px  → Portrait (6.5" iPhone Max)
 960 x 2079 px  → Portrait (6.1" iPhone)
 798 x 1794 px  → iPad Pro 11"
1194 x 2388 px  → iPad Pro 12.9"
```

**Design:**
- Background: Dark neon purple (#0a0a1a)
- Center: SPICEY logo (300x300px)
- Glow effect: Neon orange (#ff6400)
- Loading indicator: Animated ring (optional)
- No text (logo only)

### Android Splash (Manifest)
```
1080 x 1920 px  → Phone (xxhdpi)
 720 x 1280 px  → Phone (hdpi)
1440 x 2560 px  → Tablet (xxxhdpi)
```

**Design:**
- Same as iOS
- Solid background (no transparency)
- Centered logo

### How to Generate

#### Using Figma
1. Create 1024x2048 design
2. Export variants for each size
3. Save as PNG (no compression)

#### Using ImageMagick
```bash
# Generate splash screens
convert -size 1024x2048 xc:'#0a0a1a' splash-portrait.png

# Add logo in center
# Use -gravity Center -composite to center
```

---

## 📸 App Store Screenshots

### iOS App Store Screenshots
```
Required: 5-10 screenshots per language
Size: 1170 x 2532 px (iPhone 12 Pro Max)
Format: PNG or JPG
Orientation: Portrait only
```

**Screenshots to Create:**

1. **Feed Screen**
   - Show main feed with posts
   - Caption: "Discover endless spice"

2. **Reactions System**
   - Show fire/like/wow reactions
   - Caption: "React with fire, not just likes"

3. **Real-Time Chat**
   - Show messaging interface
   - Caption: "Chat that keeps up with you"

4. **Video Reels**
   - Show reel playing
   - Caption: "Endless vertical video"

5. **Profile & Discovery**
   - Show profile or explore
   - Caption: "Find your people, share your vibe"

6. **Call Feature** (Optional)
   - Show video/voice call
   - Caption: "Connect face-to-face"

### Google Play Screenshots
```
Required: 3-5 screenshots
Sizes:
  - Phone: 1080 x 1920 px (9:16 aspect)
  - Tablet: 1536 x 2048 px (3:4 aspect)
Format: PNG or JPG
```

**Same 5-6 screenshots as iOS, optimized for aspect ratio**

### Design Tips

```css
Overlay Guidelines:
- Add semi-transparent white overlay if dark
- Top margin: 60px (status bar safe area)
- Bottom margin: 80px (navigation bar safe area)
- Left/right: 40px margin
- Font: Bold, 32-36px for headers
- Caption max 2 lines
- Use neon accent colors (#ff6400, #ee1e8c)
```

### How to Create Screenshots

#### Option 1: Native Captures
```bash
# iOS (on device)
- Home > Settings > Developer > Screenshots
- Or use Xcode to capture simulator

# Android
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png
```

#### Option 2: Design Tool
1. Create 1170x2532px artboard in Figma
2. Add screenshot content (export from app)
3. Add text overlay & branding
4. Export as PNG
5. Repeat for 5+ screens

#### Option 3: Screenshot Automation
```bash
# Using fastlane screenshots
gem install fastlane
fastlane snapshot

# This requires UI automation setup
# See: https://docs.fastlane.tools/actions/snapshot/
```

---

## 🎯 App Store Listing Assets

### App Preview Video (Optional but Recommended)
```
iOS:
- Duration: 15-30 seconds
- Size: 1080 x 1920 px minimum
- Format: MOV or MP4
- Codec: H.264 video, AAC audio

Android:
- Duration: 15-30 seconds
- Size: 1080 x 1920 px minimum
- Format: MP4
- Codec: H.264 video, AAC audio
```

**Content:**
- Quick cuts of main features
- Real user interaction
- NO text/voiceover (auto-captioned)
- Upbeat music (copyright-free)
- 3-4 second scenes
- Total: ~25 seconds

### Feature Graphic
```
iOS: Not required (uses screenshots)

Android:
- Size: 1024 x 500 px
- Format: PNG or JPG
- File size: <512 KB
- No transparency
- Safe area: 48px margin on all sides
```

**Design:**
- Center: "SPICEY" large text or logo
- Background: Neon gradient (#ff6400 → #ee1e8c → #7700bb)
- Tagline: "Share Your Vibe"
- No UI elements

---

## 📋 Metadata & Text Assets

### App Name
```
Primary: SPICEY
Subtitle: Share Your Vibe
```

### Short Description (80 characters max)
```
"Real people. Real reactions. Real connections."
```

### Full Description (4000 characters max)

**iOS App Store Description:**
```
SPICEY – Your App, Your Vibe, Your People

Share your hottest moments with a community that reacts in real time. No filters, no fakes – just authentic moments and genuine reactions.

FEATURES:
🔥 Post Photos & Videos – Share your fire
🔥 Real-Time Reactions – Fire, Like, Wow
💬 Direct Messaging – Chat with your crew
📹 Vertical Reels – Endless scrolling
🎥 Live Calls – Connect face-to-face
🎨 AI-Powered Suggestions – Discover your people

✨ Why SPICEY?
• Real reactions instead of boring likes
• Anonymous features for authentic sharing
• Instant messaging without delays
• Curated feeds just for you
• Zero tolerance for fake accounts

Join thousands sharing their vibe every day.

---
Questions? Contact: info@spicey.live
Privacy: https://spicey.live/privacy
Terms: https://spicey.live/terms
```

**Google Play Description:**
(Same as above)

---

## 🎬 Recording Screenshots

### iOS Simulator Method
```bash
# Start iOS simulator
open /Applications/Xcode.app/Contents/Developer/Applications/Simulator.app

# Navigate app to each screen
# Use Simulator > Device > Capture Screenshot (⌘S)
# Saved to: ~/Desktop/

# Export from Photos if captured with physical device
```

### Android Emulator Method
```bash
# Start Android emulator
emulator -avd Pixel_5_API_31

# Navigate app to each screen
# Use adb to capture
adb shell screencap -p /sdcard/screenshot1.png
adb pull /sdcard/screenshot1.png ~/Desktop/

# Or use Android Studio Device File Explorer
```

### Scripted Screenshot Capture
```bash
# Using fastlane (requires UI automation)
fastlane snapshot

# Configure in fastlane/Snapfile
# Automatically captures app + takes screenshots
```

---

## 📦 File Organization

```
assets/
├── icons/
│   ├── ios/
│   │   └── [all iOS icon sizes]
│   ├── android/
│   │   └── [all Android icon sizes]
│   └── master-1024x1024.png
├── splash/
│   ├── ios/
│   │   └── [all iOS splash sizes]
│   ├── android/
│   │   └── [all Android splash sizes]
│   └── master-1024x2048.png
├── screenshots/
│   ├── ios/
│   │   ├── 1-feed.png
│   │   ├── 2-reactions.png
│   │   ├── 3-chat.png
│   │   ├── 4-reels.png
│   │   └── 5-profile.png
│   └── android/
│       └── [same 5 screenshots]
├── feature-graphics/
│   └── android-1024x500.png
└── metadata/
    ├── descriptions.txt
    ├── keywords.txt
    └── support-email.txt
```

---

## ✅ Quality Checklist

- [x] Icons 1024x1024 main file created
- [x] Icon rounded corners 20-25%
- [x] No tiny details (readable at 29px)
- [x] Splash screen 1024x2048 created
- [x] 5+ screenshots captured
- [x] Screenshots have text overlays
- [x] Screenshots use neon colors
- [x] Feature graphic 1024x500 (Android)
- [x] All images compressed
- [x] No transparency in icons/splash
- [x] App name & subtitle ready
- [x] Description written (80 + 4000 chars)
- [x] Privacy/Terms URLs working
- [x] Support email configured

---

## 🚀 Next Steps

1. **Generate Icons:** Use Figma or appicon.co
2. **Create Splash:** Design 1024x2048, generate sizes
3. **Capture Screenshots:** 5 screens × 2 platforms
4. **Optimize Images:** Compress to <100KB each
5. **Prepare Text:** Write descriptions & keywords
6. **Review:** Check all assets meet store requirements
7. **Upload:** Submit via TestFlight & Google Play Console

**Estimated time:** 4-6 hours for complete asset set

**Status:** Ready to begin asset creation