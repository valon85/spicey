# Spicey — React Native (Expo) Technical Handoff Document

**Prepared for:** React Native / Expo Developer  
**Date:** May 2026  
**Purpose:** Full technical reference to rebuild the Spicey frontend in React Native (Expo) while reusing the existing Base44 backend without modification.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Backend Platform — Base44](#2-backend-platform--base44)
3. [Authentication Flow](#3-authentication-flow)
4. [Data Models / Entities](#4-data-models--entities)
5. [Backend Functions (API Endpoints)](#5-backend-functions-api-endpoints)
6. [Real-Time Subscriptions](#6-real-time-subscriptions)
7. [Messaging Architecture](#7-messaging-architecture)
8. [Calls Architecture (WebRTC)](#8-calls-architecture-webrtc)
9. [Notifications Architecture](#9-notifications-architecture)
10. [Media / File Storage](#10-media--file-storage)
11. [AI Integrations](#11-ai-integrations)
12. [Key Business Logic](#12-key-business-logic)
13. [React Native Implementation Guide](#13-react-native-implementation-guide)
14. [Native iOS Features Required](#14-native-ios-features-required)
15. [Environment Variables & Secrets](#15-environment-variables--secrets)

---

## 1. Project Overview

**Spicey** is a social media platform combining Instagram-style image/video posts, real-time messaging, voice/video calls, AI-generated content, Stories, Reels, and a live streaming feature.

**Stack:**
- **Backend:** Base44 (BaaS — database, auth, file storage, serverless functions, real-time)
- **Current Frontend:** React + Vite (web only)
- **Target Frontend:** React Native (Expo) — iOS & Android

**Base44 App ID:** Available in `src/api/base44Client.js` as `appId`

---

## 2. Backend Platform — Base44

Base44 is a Backend-as-a-Service. The React Native app will communicate with it via the **Base44 JavaScript SDK**.

### SDK Installation
```bash
npm install @base44/sdk
```

### SDK Initialization
```js
import { Base44Client } from '@base44/sdk';

const base44 = new Base44Client({
  appId: 'YOUR_APP_ID_HERE', // from src/api/base44Client.js
});

export default base44;
```

### What Base44 Provides
| Feature | Base44 Method |
|---|---|
| Authentication | `base44.auth.me()`, `base44.auth.logout()` |
| Database (CRUD) | `base44.entities.EntityName.list/filter/create/update/delete()` |
| Real-time | `base44.entities.EntityName.subscribe(callback)` |
| File Upload | `base44.integrations.Core.UploadFile({ file })` |
| Backend Functions | `base44.functions.invoke('functionName', payload)` |
| AI / LLM | `base44.integrations.Core.InvokeLLM({ prompt, ... })` |
| Email | `base44.integrations.Core.SendEmail({ to, subject, body })` |

### SDK Entity Methods
```js
// List all
await base44.entities.Post.list('-created_date', 20);

// Filter
await base44.entities.Post.filter({ author_id: userId }, '-created_date', 10);

// Create
await base44.entities.Post.create({ caption: 'Hello', author_id: '...' });

// Update
await base44.entities.Post.update(recordId, { likes_count: 5 });

// Delete
await base44.entities.Post.delete(recordId);

// Real-time subscription
const unsubscribe = base44.entities.Message.subscribe((event) => {
  // event.type: 'create' | 'update' | 'delete'
  // event.data: the entity record
  // event.id: the record id
});
// Call unsubscribe() on cleanup
```

---

## 3. Authentication Flow

Base44 manages all authentication. Users cannot be created manually — they must be invited via the Base44 dashboard or programmatically via `base44.users.inviteUser(email, role)`.

### Login
Base44 handles login via a hosted login page. From React Native, redirect to:
```js
base44.auth.redirectToLogin(returnUrl);
// OR for in-app WebView login:
const loginUrl = base44.auth.getLoginUrl(returnUrl);
```

**Recommended approach for React Native:** Open the Base44 login URL in an in-app browser (Expo `expo-web-browser`), capture the redirect callback, and extract the session token.

### Get Current User
```js
const user = await base44.auth.me();
// Returns: { id, email, full_name, role, onboarding_completed, avatar_url, ... }
// Returns null if not authenticated
```

### Update Current User
```js
await base44.auth.updateMe({ bio: 'New bio', avatar_url: '...' });
```

### Logout
```js
await base44.auth.logout();
```

### Onboarding Gate
After login, check `user.onboarding_completed`. If `false` or missing, show the onboarding flow (username setup, legal consent). On completion, set:
```js
await base44.auth.updateMe({ onboarding_completed: true });
```

### User Roles
- `admin` — full access, can manage all content
- `user` — standard user

---

## 4. Data Models / Entities

All entities have built-in fields: `id`, `created_date`, `updated_date`, `created_by` (email).

---

### UserProfile
Extends the built-in User with social profile data.

| Field | Type | Description |
|---|---|---|
| `user_id` | string | Links to User.id |
| `username` | string | Unique @handle |
| `full_name` | string | Display name |
| `bio` | string | Profile bio |
| `avatar_url` | string | Profile photo URL |
| `cover_url` | string | Cover photo URL |
| `website` | string | Website URL |
| `location` | string | Location text |
| `followers_count` | number | Total followers |
| `following_count` | number | Total following |
| `posts_count` | number | Total posts |
| `verified` | boolean | Verified badge |
| `is_private` | boolean | Private account (requires follow approval) |

---

### Post
| Field | Type | Description |
|---|---|---|
| `author_id` | string | User ID |
| `author_name` | string | Denormalized name |
| `author_username` | string | Denormalized username |
| `author_avatar` | string | Denormalized avatar URL |
| `caption` | string | Post text |
| `image_url` | string | Uploaded image URL |
| `youtube_url` | string | YouTube embed URL |
| `youtube_video_id` | string | Extracted YouTube ID |
| `youtube_title` | string | YouTube title |
| `youtube_thumbnail` | string | YouTube thumbnail |
| `location` | string | Location tag |
| `tags` | string | Tagged @usernames |
| `hashtags` | array[string] | Hashtag array |
| `likes_count` | number | Like count |
| `fire_count` | number | Fire reaction count |
| `wow_count` | number | Wow reaction count |
| `comments_count` | number | Comment count |
| `shares_count` | number | Share count |

---

### Comment
| Field | Type | Description |
|---|---|---|
| `post_id` | string | Parent post ID |
| `author_id` | string | User ID |
| `author_name` | string | Denormalized |
| `author_username` | string | Denormalized |
| `author_avatar` | string | Denormalized |
| `text` | string | Comment body |
| `likes_count` | number | Likes on comment |

---

### Reaction
| Field | Type | Description |
|---|---|---|
| `post_id` | string | Post being reacted to |
| `user_id` | string | Reactor user ID |
| `type` | enum | `like` \| `fire` |

**Deduplication rule:** Always query `filter({ post_id, created_by: user.email, type })` before creating — delete all existing before re-creating to prevent duplicates.

---

### Follow
| Field | Type | Description |
|---|---|---|
| `follower_id` | string | Who is following |
| `following_id` | string | Who is being followed |
| `follower_username` | string | Denormalized |
| `following_username` | string | Denormalized |

---

### FollowRequest
For private accounts. Status: `pending` → `approved` / `rejected`.

| Field | Type | Description |
|---|---|---|
| `requester_id` | string | Who wants to follow |
| `target_id` | string | Private account owner |
| `requester_username` | string | Denormalized |
| `requester_name` | string | Denormalized |
| `requester_avatar` | string | Denormalized |
| `status` | enum | `pending` \| `approved` \| `rejected` |

---

### Notification
| Field | Type | Description |
|---|---|---|
| `user_id` | string | Recipient user ID |
| `type` | enum | `like` \| `comment` \| `follow` \| `follow_request` \| `message` \| `share` |
| `actor_id` | string | Who triggered it |
| `actor_username` | string | Denormalized |
| `actor_avatar` | string | Denormalized |
| `content_id` | string | Related post/comment ID |
| `message` | string | Notification text |
| `read` | boolean | Read status |

---

### Chat
| Field | Type | Description |
|---|---|---|
| `participant_ids` | array[string] | User IDs in chat |
| `participant_usernames` | array[string] | Denormalized usernames |
| `last_message` | string | Preview text |
| `last_message_time` | datetime | For sorting |
| `is_group` | boolean | Group chat flag |
| `group_name` | string | Group name |
| `group_avatar` | string | Group avatar |

---

### Message
| Field | Type | Description |
|---|---|---|
| `chat_id` | string | Parent chat ID |
| `sender_id` | string | User ID |
| `sender_username` | string | Denormalized |
| `sender_avatar` | string | Denormalized |
| `text` | string | Message body |
| `image_url` | string | Optional image attachment |
| `read_by` | array[string] | User IDs who read it |
| `reactions` | object | `{ emoji: [userId, ...] }` |

---

### CallSession
Used for WebRTC signaling. Access is restricted — users can only read/update calls where they are `caller_id` or `receiver_id`.

| Field | Type | Description |
|---|---|---|
| `caller_id` | string | Initiator |
| `receiver_id` | string | Recipient |
| `type` | enum | `voice` \| `video` |
| `status` | enum | `ringing` \| `accepted` \| `declined` \| `ended` \| `missed` |
| `offer_sdp` | string | WebRTC SDP offer |
| `answer_sdp` | string | WebRTC SDP answer |
| `caller_ice` | array[string] | ICE candidates (JSON strings) |
| `receiver_ice` | array[string] | ICE candidates (JSON strings) |
| `accepted_at` | datetime | — |
| `ended_at` | datetime | — |

---

### MissedCall
| Field | Type | Description |
|---|---|---|
| `receiver_id` | string | Who missed it |
| `caller_id` | string | Who called |
| `caller_name` | string | Denormalized |
| `caller_avatar` | string | Denormalized |
| `call_type` | enum | `voice` \| `video` |
| `call_session_id` | string | Reference to CallSession |
| `seen` | boolean | Seen status |

---

### Block
| Field | Type | Description |
|---|---|---|
| `blocker_id` | string | Who blocked |
| `blocked_id` | string | Who was blocked |
| `blocked_username` | string | Denormalized |

---

### Report
| Field | Type | Description |
|---|---|---|
| `reporter_id` | string | Who reported |
| `reported_user_id` | string | Reported user |
| `post_id` | string | Reported post (optional) |
| `reason` | enum | `spam` \| `harassment` \| `hate_speech` \| `nudity` \| `violence` \| `false_information` \| `other` |
| `details` | string | Extra info |
| `status` | enum | `pending` \| `reviewed` \| `actioned` \| `dismissed` |

---

### LegalConsent
| Field | Type | Description |
|---|---|---|
| `user_id` | string | Who accepted |
| `accepted_at` | datetime | Timestamp |
| `ip_address` | string | IP at acceptance |
| `user_agent` | string | Device string |
| `platform` | string | `web` \| `ios` \| `android` |
| `terms_version` | string | e.g. `"1.0"` |
| `privacy_version` | string | e.g. `"1.0"` |
| `guidelines_version` | string | e.g. `"1.0"` |

---

### ProfilePhotoReaction / ProfilePhotoComment
Reactions and comments on avatar and cover photos specifically (separate from Post reactions).

---

## 5. Backend Functions (API Endpoints)

All invoked via:
```js
const response = await base44.functions.invoke('functionName', payload);
// response.data contains the return value
```

| Function | Purpose | Key Payload Fields |
|---|---|---|
| `getUserProfile` | Fetch a user's full profile + follow status | `{ userId }` |
| `initializeUserProfile` | Create UserProfile record on first login | `{ username, full_name }` |
| `searchUsers` | Search users by username/name | `{ query, limit }` |
| `toggleFollow` | Follow or unfollow a user | `{ targetUserId }` |
| `getOrCreateChat` | Get existing DM chat or create new one | `{ otherUserId }` |
| `getChatMessages` | Paginated message history for a chat | `{ chatId, limit, offset }` |
| `sendMessage` | Send a message + update chat metadata | `{ chatId, text, imageUrl? }` |
| `sendDirectMessage` | Send DM + create chat if needed | `{ toUserId, text }` |
| `notifyNewMessage` | Creates a Notification record for message | `{ toUserId, message }` |
| `initiateCall` | Creates CallSession record | `{ receiverId, type: 'voice'\|'video' }` |
| `sendCallNotification` | Sends push notification for incoming call | `{ callSessionId, receiverId }` |
| `repairPostOwnership` | Admin: fix posts with missing author data | `{}` |
| `deleteUserAccount` | Permanently delete current user account | `{}` |

---

## 6. Real-Time Subscriptions

Base44 provides WebSocket-based real-time events. Subscribe to any entity:

```js
// Subscribe to new messages in a chat
const unsub = base44.entities.Message.subscribe((event) => {
  if (event.type === 'create' && event.data.chat_id === currentChatId) {
    // add message to UI
  }
});

// Subscribe to incoming calls
const unsub = base44.entities.CallSession.subscribe((event) => {
  if (event.data?.receiver_id === currentUserId && event.data?.status === 'ringing') {
    // show incoming call UI
  }
});

// Subscribe to notifications
const unsub = base44.entities.Notification.subscribe((event) => {
  if (event.data?.user_id === currentUserId) {
    // show badge / alert
  }
});
```

**Important:** Always call `unsub()` on component unmount to avoid memory leaks.

---

## 7. Messaging Architecture

### Chat Flow
1. User taps "Message" on a profile → call `getOrCreateChat({ otherUserId })`
2. Navigate to chat screen with `chatId`
3. Load history: `getChatMessages({ chatId, limit: 30 })`
4. Subscribe to `Message` entity for real-time updates
5. Send: `sendMessage({ chatId, text })` → optimistically append to UI
6. Mark as read: `base44.entities.Message.update(msgId, { read_by: [...existing, currentUserId] })`

### Image Messages
1. Upload image: `await base44.integrations.Core.UploadFile({ file })`
2. Get back `{ file_url }`
3. Send: `sendMessage({ chatId, text: '', imageUrl: file_url })`

### Group Chats
Create a Chat with `is_group: true`, `participant_ids: [id1, id2, id3]`, `group_name: '...'`.

---

## 8. Calls Architecture (WebRTC)

The current implementation uses **Base44 entities as a WebRTC signaling channel**. This is functional but should be upgraded to **PushKit + CallKit** in React Native.

### Current Signaling Flow
```
Caller                          Base44 DB                        Receiver
  |                                 |                                |
  |-- initiateCall() ------------> CallSession{status:ringing} ---> |
  |                                 |                    (subscribe detects)
  |-- update offer_sdp ----------> CallSession -----------------> receiver reads offer
  |                                 |
  |                              receiver accepts
  |                                 |
  | <-- update answer_sdp --------- CallSession <--- receiver writes answer
  |                                 |
  |-- update caller_ice ----------> CallSession ---> receiver reads ICE
  | <-- update receiver_ice ------- CallSession <--- receiver writes ICE
  |                                 |
  |         [WebRTC P2P Connected]  |
```

### React Native WebRTC
Use `react-native-webrtc` package. The signaling logic stays the same — just replace the web `RTCPeerConnection` with the React Native equivalent.

```bash
npm install react-native-webrtc
```

### Call Status Values
- `ringing` → receiver sees incoming call
- `accepted` → both sides connect WebRTC
- `declined` → caller notified
- `ended` → call terminated
- `missed` → timeout (55 seconds) without answer

### Missed Call Detection
After 55 seconds without `accepted` status, the caller side:
1. Updates CallSession status to `missed`
2. Creates a `MissedCall` record for the receiver

---

## 9. Notifications Architecture

### Current (Web Only)
- Browser `Notification` API — only works when browser is open
- Real-time subscription polling as fallback

### Required for React Native (iOS/Android)

#### iOS — APNs + PushKit + CallKit
You need:

1. **Apple Developer Account** — $99/year
2. **APNs Certificate** or **APNs Auth Key** (`.p8` file)
3. **VoIP Certificate** for PushKit (separate from regular APNs)
4. **`react-native-callkeep`** — CallKit integration
5. **`@react-native-firebase/messaging`** — for regular push notifications

#### Android — Firebase FCM
1. **Firebase project** (free)
2. **`@react-native-firebase/messaging`**
3. FCM Server Key stored as a Base44 secret

#### Push Flow for Incoming Calls

```
React Native App registers → gets FCM/APNs device token
                           ↓
Store token: base44.auth.updateMe({ push_token: token, push_platform: 'ios' })
                           ↓
Caller initiates call → backend function `sendCallNotification`
                           ↓
Backend reads receiver's push_token + platform
                           ↓
Sends VoIP push via APNs/PushKit (iOS) or FCM (Android)
                           ↓
iOS: CallKit shows native incoming call screen (locked screen works ✅)
Android: FCM high-priority notification wakes app ✅
```

#### Required Entity Update — Add to UserProfile
```json
{
  "push_token": { "type": "string", "description": "FCM or APNs device token" },
  "push_platform": { "type": "string", "enum": ["ios", "android", "web"] }
}
```

#### Required Backend Function Update — `sendCallNotification`
This function needs to be updated to:
1. Read the receiver's `push_token` from their UserProfile
2. Send a **VoIP push** via APNs PushKit (for iOS CallKit)
3. Send a **high-priority FCM push** (for Android)

The backend function already exists — it just needs the APNs/FCM sending logic added. Secrets needed:
- `APNS_KEY_ID`
- `APNS_TEAM_ID`
- `APNS_AUTH_KEY` (contents of .p8 file)
- `FCM_SERVER_KEY`

#### Notification Types to Handle
| Type | Trigger | Native Behavior |
|---|---|---|
| `incoming_call` | New CallSession for user | CallKit screen (iOS) / FCM wakeup (Android) |
| `message` | New Message for user | Standard push notification |
| `like` | New like Notification | Standard push notification |
| `comment` | New comment Notification | Standard push notification |
| `follow` | New follow Notification | Standard push notification |
| `follow_request` | New follow request | Standard push notification |

---

## 10. Media / File Storage

### Upload Files
```js
// From React Native, pick image using expo-image-picker
const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images' });
const file = { uri: result.assets[0].uri, name: 'photo.jpg', type: 'image/jpeg' };

const { file_url } = await base44.integrations.Core.UploadFile({ file });
// Store file_url in Post.image_url, UserProfile.avatar_url, etc.
```

### Private Files (Signed URLs)
For sensitive content:
```js
const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
// Later, to access:
const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri, expires_in: 300 });
```

### Media Guidelines
- Profile avatars: stored as public URLs in `UserProfile.avatar_url`
- Post images: stored as public URLs in `Post.image_url`
- Message images: stored as public URLs in `Message.image_url`
- Videos (Reels): stored as public URLs
- Max recommended file size: 25MB

---

## 11. AI Integrations

### AI Content Generation (AIGenerator page)
```js
const result = await base44.integrations.Core.InvokeLLM({
  prompt: 'Generate a spicy social media caption for...',
  response_json_schema: {
    type: 'object',
    properties: {
      caption: { type: 'string' },
      hashtags: { type: 'array', items: { type: 'string' } }
    }
  }
});
```

### AI Image Generation
```js
const { url } = await base44.integrations.Core.GenerateImage({
  prompt: 'Detailed description of image to generate'
});
```

### Audio Transcription
```js
const { file_url } = await base44.integrations.Core.UploadFile({ file: audioFile });
const transcript = await base44.integrations.Core.TranscribeAudio({ audio_url: file_url });
```

### Text-to-Speech
```js
const { url } = await base44.integrations.Core.GenerateSpeech({
  text: 'Hello world',
  voice: 'river' // Options: river, honey, sunny, storm, spark
});
```

---

## 12. Key Business Logic

### Feed
- Fetch posts: `base44.entities.Post.list('-created_date', 20)`
- For followed-only feed: fetch Follow records for current user, then filter posts by `author_id`
- Pagination: use `skip` parameter → `base44.entities.Post.list('-created_date', 20, 20)` (skip=20 for page 2)

### Follow System
- **Public accounts:** Create Follow record directly via `toggleFollow` function
- **Private accounts:** Create FollowRequest record, owner approves/rejects
- On approval: create Follow record + update both UserProfile follower/following counts

### Reactions (Deduplicate)
Always check before creating:
```js
const existing = await base44.entities.Reaction.filter({
  post_id: postId,
  created_by: user.email,
  type: 'like'
});
if (existing.length > 0) {
  // Unlike: delete all
  await Promise.all(existing.map(r => base44.entities.Reaction.delete(r.id)));
} else {
  // Like: create one
  await base44.entities.Reaction.create({ post_id: postId, user_id: user.id, type: 'like' });
}
```

### Blocking
- Check blocks before showing content: filter `Block` entity for `{ blocker_id: currentUser }` or `{ blocked_id: currentUser }`
- Don't show posts/messages/profiles from blocked users

### Private Accounts
- Check `UserProfile.is_private` before showing posts
- If private + not following → show locked profile, follow request button
- Use `FollowRequest` entity for pending requests

---

## 13. React Native Implementation Guide

### Recommended Stack
```
Expo SDK 51+
expo-router (file-based navigation)
@tanstack/react-query (data fetching + caching)
react-native-webrtc (calls)
react-native-callkeep (CallKit)
@react-native-firebase/messaging (push notifications)
expo-image-picker (media selection)
expo-av (audio/video playback)
expo-notifications (local notifications)
react-native-reanimated (animations)
@shopify/flash-list (high-performance lists — critical for feed)
```

### Navigation Structure
```
(auth)/
  login.tsx
  onboarding.tsx
(app)/
  (tabs)/
    index.tsx          → Feed
    explore.tsx        → Explore
    create.tsx         → Create Post
    ai.tsx             → AI Generator
    profile.tsx        → Own Profile
  messages/
    index.tsx          → Chat List
    [chatId].tsx       → Chat View
  profile/
    [userId].tsx       → User Profile
  notifications.tsx
  reels.tsx
  stories.tsx
  settings.tsx
  live.tsx
```

### Performance Tips
- Use `@shopify/flash-list` instead of `FlatList` for the feed — critical for smooth scrolling
- Lazy-load reaction status (don't load all reactions on mount)
- Cache user profile: store in AsyncStorage / React Query, refresh on focus
- Paginate messages: load 30 at a time, load more on scroll up

---

## 14. Native iOS Features Required

### CallKit + PushKit Setup
```bash
npm install react-native-callkeep
# iOS: add VoIP capability in Xcode
# Add PushKit framework
# Add CallKit framework
```

**`Info.plist` additions:**
```xml
<key>UIBackgroundModes</key>
<array>
  <string>voip</string>
  <string>remote-notification</string>
  <string>audio</string>
</array>
```

**Entitlements:**
- `com.apple.developer.pushkit.voip` — VoIP push
- `aps-environment: production` — APNs

### CallKit Integration Flow
```js
import RNCallKeep from 'react-native-callkeep';

// On app start
RNCallKeep.setup({
  ios: { appName: 'Spicey' },
  android: { alertTitle: 'Permissions required', ... }
});

// When VoIP push arrives (app closed/backgrounded):
// PushKit delivers payload → call RNCallKeep.displayIncomingCall(uuid, handle, name)
// User answers → RNCallKeep fires 'answerCall' event → join WebRTC session

// When call ends:
RNCallKeep.endCall(uuid);
```

### APNs VoIP Push Payload
```json
{
  "aps": {},
  "call_session_id": "abc123",
  "caller_name": "Jane Doe",
  "caller_avatar": "https://...",
  "call_type": "video"
}
```
This payload is sent by the updated `sendCallNotification` backend function.

### App Capabilities (Xcode)
- ✅ Push Notifications
- ✅ Background Modes → VoIP, Remote notifications, Audio
- ✅ Sign in with Apple (optional)

---

## 15. Environment Variables & Secrets

Stored in Base44 dashboard → Settings → Environment Variables.

| Secret Name | Purpose | Where Used |
|---|---|---|
| (auto) `BASE44_APP_ID` | App identifier | SDK init |
| `APNS_KEY_ID` | APNs auth key ID | `sendCallNotification` function |
| `APNS_TEAM_ID` | Apple Developer Team ID | `sendCallNotification` function |
| `APNS_AUTH_KEY` | Contents of `.p8` file | `sendCallNotification` function |
| `FCM_SERVER_KEY` | Firebase Cloud Messaging | `sendCallNotification` function |
| `APNS_BUNDLE_ID` | iOS app bundle ID | `sendCallNotification` function |

---

## Quick Start Checklist for React Native Developer

- [ ] Get Base44 App ID from `src/api/base44Client.js`
- [ ] Install `@base44/sdk` and initialize client
- [ ] Implement auth flow (login → onboarding gate → main app)
- [ ] Build Feed screen using `Post` entity
- [ ] Build Profile screen using `UserProfile` + `getUserProfile` function
- [ ] Build Messages using `Chat` + `Message` entities + real-time subscription
- [ ] Build Call screen using `CallSession` entity + `react-native-webrtc`
- [ ] Set up Firebase project → get FCM key → store in Base44 secrets
- [ ] Set up Apple Developer account → create VoIP certificate → store in Base44 secrets
- [ ] Update `sendCallNotification` backend function to send APNs VoIP push
- [ ] Add `push_token` + `push_platform` fields to UserProfile entity
- [ ] Register push token on app launch → save to UserProfile
- [ ] Integrate `react-native-callkeep` for CallKit
- [ ] Test end-to-end call with locked screen
- [ ] Submit to App Store

---

*This document was generated from the live Spicey Base44 project. The backend requires no changes — all entity schemas, functions, and real-time subscriptions are production-ready.*