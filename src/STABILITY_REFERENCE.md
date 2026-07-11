# 📌 SPICEY STABILITY REFERENCE

**Created:** 2026-06-23  
**Purpose:** Freeze working features, prevent regressions, focus only on iOS publish blocker

---

## ✅ WORKING FEATURES - DO NOT MODIFY

### Authentication Flow (FROZEN)
- **SpiceyAuthModal** - Login/signup/OTP verification working
- **AuthContext** - User state management, token persistence
- **App.jsx** - Simple render logic: `user?.id` → Feed, else → AuthModal
- **Token Storage** - Capacitor Preferences + localStorage

**Flow:**
1. User enters credentials → apiPost('/login')
2. Token saved to Capacitor + localStorage
3. Token injected into SDK + axios headers
4. `auth.me()` called with retry (3 attempts)
5. Fallback: User entity search by email
6. `auth-success` event dispatched → AuthContext sets user
7. App.jsx renders Feed

**DO NOT CHANGE:** Auth flow logic, token handling, event dispatching

---

### Core Navigation (FROZEN)
- **BottomNav** - 5 tabs: Home, Explore, Create, Reels, Profile
- **App.jsx Routes** - All core pages mapped correctly
- **Hide nav logic** - Correctly hides on create/live/reels pages

**Routes:**
- `/` → Feed
- `/explore` → Explore
- `/profile/:userId` → Profile
- `/messages` → Messages
- `/reels` → SpiceyReels
- `/create` → CreatePost
- `/live` → LiveStream

**DO NOT CHANGE:** Route structure, BottomNav visibility logic

---

### Feed & Posts (FROZEN)
- **Feed page** - Loads posts, renders PostCard components
- **PostCard** - Displays images/videos, reactions, comments
- **Reactions** - Like, Fire, Wow working
- **Comments** - View/add comments working

**DO NOT CHANGE:** Post rendering, reaction logic, comment flow

---

### Profile (FROZEN)
- **Profile page** - User info, posts grid, stats
- **Profile header** - Avatar, cover photo, follow button
- **Post grid** - 3-column layout, tab switching

**DO NOT CHANGE:** Profile layout, post grid logic

---

### Messages (FROZEN)
- **Messages page** - Chat list, missed calls
- **ChatView** - 1-on-1 messaging, real-time updates
- **CallSheet** - WebRTC voice/video calls

**DO NOT CHANGE:** Chat rendering, call flow

---

### Reels (FROZEN)
- **SpiceyReels** - Vertical video feed
- **YouTubeReelItem** - YouTube Shorts embed
- **ReelProgressBar** - Swipe navigation

**DO NOT CHANGE:** Reels playback, swipe logic

---

## ⚠️ KNOWN ISSUES - LOW PRIORITY

### iOS Login (BEING FIXED)
- **Issue:** After login, sometimes returns to Signup instead of Feed
- **Fix:** AuthContext race condition - authChecked set before auth-success fires
- **Status:** Fixed 2026-06-23 - authChecked now set ONLY after user is set

### Light Mode (DISABLED)
- **Status:** Removed for stability
- **Reason:** Was causing UI regressions
- **Decision:** Do NOT restore until core features are stable

---

## ❌ DISABLED FEATURES - DO NOT RE-ENABLE

### AI Features (DISABLED)
- AITalkMode - OpenAI Realtime API integration
- AIEggAvatar - Animated avatar
- AIContext - AI state management

**Reason:** Unstable, consuming credits, not core functionality

**DO NOT RE-ENABLE** until explicitly requested

---

### Camera/Banuba (DISABLED)
- BanubaCamera - AR face effects
- BanubaFaceARCamera - Face tracking
- BanubaARCamera - AR filters

**Reason:** iOS build issues, permission problems

**DO NOT RE-ENABLE** until explicitly requested

---

### Debug/Test Pages (REMOVED)
- DebugLogin
- TestAuthStorage
- BanubaTest/BanubaDiagnostic
- AdminAIAssistant/AdminAIPanel

**Reason:** Not needed for production

**DO NOT RE-ADD** to App.jsx routes

---

## 🎯 CURRENT FOCUS

### Priority #1: iOS Publish
1. ✅ Clean Xcode build
2. ✅ Login → Feed flow working
3. ✅ Token persistence on iOS
4. ⏳ TestFlight build verification

### Priority #2: Stability
- No new features until iOS is published
- No refactoring of working code
- Minimal console.log (only for debugging active issues)

---

## 📝 CHANGE CONTROL

### Before Modifying Any File:
1. **Is this file in the "FROZEN" list?** → DO NOT TOUCH
2. **Is this change necessary for iOS publish?** → Proceed
3. **Is this a new feature request?** → Defer until after publish

### Allowed Changes:
- Bug fixes for login/feed flow
- iOS-specific compatibility fixes
- Performance optimizations (no functional changes)

### NOT Allowed:
- UI redesigns
- New features
- Refactoring working code
- Re-enabling disabled features

---

## 🔧 AUTH FLOW TECHNICAL DETAILS

### Token Flow:
```
Login → apiPost('/login') → access_token
  ↓
Save to:
  - Capacitor Preferences (key: 'base44_access_token')
  - localStorage (keys: 'base44_access_token', 'token')
  ↓
SDK injection:
  - base44.auth.setToken(token)
  - axios.defaults.headers.common['Authorization'] = 'Bearer ${token}'
  ↓
Wait 300ms (iOS storage flush)
  ↓
Call auth.me() (retry x3)
  ↓
If fails → User.filter({ email })
  ↓
If user found → dispatch auth-success event
  ↓
AuthContext receives event → setUser(user)
  ↓
App.jsx re-renders → Feed
```

### Critical Timing:
- `authChecked` must be set ONLY after `user?.id` exists
- auth-success event listener must be attached before login completes
- Token must be in Capacitor + localStorage + SDK before auth.me() call

---

## 📞 CONTACT

If you encounter issues:
1. Check console logs for auth flow errors
2. Verify token is saved (Capacitor + localStorage)
3. Check if auth-success event fires (search console for "AUTH_CONTEXT")
4. Verify user?.id exists in AuthContext state

**DO NOT** modify auth flow without understanding the full sequence.

---

**Last Updated:** 2026-06-23  
**Status:** READY FOR iOS TESTING