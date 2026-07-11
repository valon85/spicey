# iOS Bundle Fix - Complete Profile Screen Removed

## Problem
The "Complete your profile to get started" screen was appearing after login even though Onboarding.jsx was deleted. This was because iOS was loading a cached bundle from a previous build.

## Solution

### Option 1: Run the script (recommended)
```bash
chmod +x scripts/rebuild-ios.sh
./scripts/rebuild-ios.sh
```

### Option 2: Manual steps
```bash
# 1. Build the web app
npm run build

# 2. Sync to iOS
npx cap sync ios

# 3. Open Xcode
npx cap open ios
```

### Option 3: Clean rebuild (if still showing old screen)
```bash
# Remove old iOS build
rm -rf ios/App/App/public/*
rm -rf ios/App/Build/*

# Fresh build and sync
npm run build
npx cap sync ios

# Open Xcode and clean build
npx cap open ios
# Then: Product → Clean Build Folder (Shift+Cmd+K)
# Then: Rebuild and run
```

## What Changed
- ✅ Deleted `pages/Onboarding.jsx` completely
- ✅ No routes to onboarding exist in App.jsx
- ✅ Authentication flow: `user?.id` → Feed (no profile completion gate)
- ✅ Profile completion is now optional in Settings

## Verification
After rebuilding, the iOS bundle in `ios/App/App/public` should NOT contain:
- "Complete your profile to get started"
- "First Name" / "Last Name" form fields
- "Confirm Email" field

The web preview should work immediately. iOS requires a new TestFlight build.