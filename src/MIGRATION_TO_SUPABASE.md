# 🚀 Spicey — Base44 → Supabase Migration Plan

> **Status:** Planning Phase  
> **Goal:** Zero-downtime migration. Base44 stays live until every feature is verified on Supabase.  
> **Strategy:** Parallel-run (both backends active), migrate one domain at a time, then cut over.

---

## 1. What Base44 Provides Today

### 1a. Auth (`base44.auth`)
| Usage | File(s) |
|---|---|
| `base44.auth.me()` | AuthContext, PostCard, AccountSettings, backend functions |
| `base44.auth.isAuthenticated()` | backend functions |
| `base44.auth.updateMe(data)` | EditProfileSheet |
| `base44.auth.logout()` | AuthContext, AccountSettings |
| `base44.auth.setToken(t)` | base44Client.js |
| `base44.auth.redirectToLogin()` | base44Client.js (blocked on iOS) |
| Token storage | Capacitor Preferences + localStorage (base44_access_token, token) |
| User invite | `base44.users.inviteUser(email, role)` |

### 1b. Entities / Database (`base44.entities.*`)
Every call is `.list()`, `.filter()`, `.get()`, `.create()`, `.update()`, `.delete()`, `.bulkCreate()`, `.updateMany()`, `.deleteMany()`, `.subscribe()`.

| Entity | Key fields |
|---|---|
| **Post** | author_id, author_name, author_username, author_avatar, caption, post_type, visibility, image_url, image_urls[], video_url, video_link, likes_count, fire_count, wow_count, comments_count, shares_count, hashtags[], location, map_visible, map_city, music_* |
| **Reaction** | post_id, user_id, type (like/fire/wow/thinking/playful/cool/sparkle) |
| **Comment** | post_id, author_id, text, author_name, author_username, author_avatar, likes_count |
| **Follow** | follower_id, following_id, follower_username, following_username |
| **FollowRequest** | requester_id, target_id, requester_username, requester_name, requester_avatar, status |
| **UserProfile** | user_id, username, full_name, bio, avatar_url, cover_url, is_private, followers_count, following_count, post_count, is_vip, is_verified, vip_tier, theme |
| **Notification** | user_id, type, actor_id, actor_username, actor_avatar, content_id, message, read |
| **Message** | chat_id, sender_id, sender_username, sender_avatar, text, image_url, read_by[], reactions{} |
| **Chat** | participant_ids[], participant_usernames[], last_message, last_message_time, is_group, group_name, group_avatar |
| **Story** | (referenced in admin functions) |
| **Block** | blocker_id, blocked_id, blocked_username |
| **Report** | (moderation) |
| **LiveSession** | broadcaster_id, broadcaster_name, broadcaster_username, title, status, viewer_count, started_at, ended_at, replay_url |
| **CallSession** | caller_id, receiver_id, type, status, offer_sdp, answer_sdp, caller_ice[], receiver_ice[] |
| **MissedCall** | receiver_id, caller_id, caller_name, caller_avatar, call_type, seen |
| **Subscription** | user_id, status, plan, stripe_subscription_id |
| **CuratedReel** | title, video_url, youtube_video_id, thumbnail_url, author_name, source, category, is_active |
| **StockVideo** | (admin video library) |
| **AdCampaign** | user_id, campaign_name, budget, duration_days, status |
| **PostBoost** | post_id, user_id, boost_amount, duration_days, status |
| **ProfileCategory** | user_id, name, post_ids[] |
| **ProfilePhotoComment** | user_id, photo_type, commenter_id, text |
| **ProfilePhotoReaction** | user_id, photo_type, reactor_id, type |
| **PresetAvatar** | image_url, label, gender, sort_order, is_active |
| **LegalConsent** | user_id, accepted_at, terms_version, platform |

### 1c. Backend Functions (`base44.functions.invoke(name, payload)`)
All 90+ functions in `base44/functions/*/entry.ts` (Deno Deploy).

**Critical ones (must be re-implemented as Supabase Edge Functions):**
- `toggleReaction` — core feed interaction
- `toggleFollow` — follow/unfollow
- `sendMessage` / `getChatMessages` / `getOrCreateChat` — messaging
- `initiateCall` / `sendVoIPCall` / `notifyMissedCall` — calls
- `aiChat` / `aiVoiceChat` / `aiVoiceRealtime` — AI features
- `stripeCheckout` / `stripeWebhook` — payments
- `deleteUserAccount` — account deletion
- `adminModerateUser` — moderation
- `sendPushNotification` / `sendApnsPush` — push notifications
- `syncProfileName` — profile sync
- `getReelsFeed` / `getYouTubeReels` — reels
- `searchUsers` — search

### 1d. Integrations (`base44.integrations.Core.*`)
| Integration | Used for |
|---|---|
| `InvokeLLM` | AI chat, AI generator page, AI orb |
| `SendEmail` | Notifications, welcome emails |
| `UploadFile` | Post images, avatars, cover photos |
| `GenerateImage` | AI generator page |
| `GenerateSpeech` | AI voice features |
| `TranscribeAudio` | AI voice chat |

**Replacement:** OpenAI API (already have `OPENAI_API_KEY`), Resend for email (have `RESEND_API_KEY`), Supabase Storage for files.

### 1e. Real-time (`base44.entities.X.subscribe()`)
Used in:
- `AuthContext.jsx` — CallSession, MissedCall subscriptions
- `Messages.jsx` / `ChatView.jsx` — Message subscriptions
- Various other components

**Replacement:** Supabase Realtime (Postgres CDC channels).

### 1f. Analytics (`base44.analytics.track()`)
Used in PostCard for reaction tracking.  
**Replacement:** Keep as no-op or add Posthog/Mixpanel later.

### 1g. AI Agents (`base44.agents.*`)
Used in `AIGenerator.jsx` for conversation management.  
**Replacement:** Direct OpenAI Assistants API.

### 1h. Environment Variables (Secrets)
All already accessible in Deno functions via `Deno.env.get()`:
- STRIPE_SECRET_KEY / STRIPE_PUBLISHABLE_KEY
- OPENAI_API_KEY
- RESEND_API_KEY
- YOUTUBE_API_KEY
- CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_STREAM_API_TOKEN
- BANUBA_CLIENT_TOKEN
- APN_AUTH_KEY / APN_ENV / APN_BUNDLE_ID / APN_TEAM_ID / APN_KEY_ID
- FIREBASE_API_KEY / FIREBASE_PROJECT_ID
- PEXELS_API_KEY / PIXABAY_API_KEY

---

## 2. Target Architecture (Post-Migration)

```
Frontend (React + Vite + Capacitor)
    │
    ├── Supabase JS Client (auth, db, storage, realtime)
    ├── Supabase Edge Functions (replaces Base44 backend functions)
    ├── OpenAI API (replaces InvokeLLM, GenerateSpeech, TranscribeAudio)
    ├── Resend (email — already used via RESEND_API_KEY)
    ├── Cloudflare Stream (video — already used)
    ├── Stripe (payments — already integrated)
    └── Firebase/APNs (push — already integrated)
```

---

## 3. Supabase Schema (SQL)

```sql
-- ═══════════════════════════════════════════
-- USERS (mirrors Supabase auth.users)
-- ═══════════════════════════════════════════
create table public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text,
  bio text,
  avatar_url text,
  cover_url text,
  is_private boolean default false,
  is_vip boolean default false,
  is_verified boolean default false,
  vip_tier text,
  followers_count integer default 0,
  following_count integer default 0,
  post_count integer default 0,
  role text default 'user',
  theme text,
  location text,
  website text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ═══════════════════════════════════════════
-- POSTS
-- ═══════════════════════════════════════════
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references auth.users(id) on delete cascade,
  author_name text,
  author_username text,
  author_avatar text,
  caption text,
  post_type text default 'feed' check (post_type in ('feed','reel','story')),
  visibility text default 'public' check (visibility in ('public','friends','private')),
  image_url text,
  image_urls text[],
  video_url text,
  video_link text,
  location text,
  map_visible boolean default false,
  map_city text,
  tags text,
  hashtags text[],
  likes_count integer default 0,
  fire_count integer default 0,
  wow_count integer default 0,
  comments_count integer default 0,
  shares_count integer default 0,
  music_title text,
  music_artist text,
  music_preview_url text,
  music_artwork_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ═══════════════════════════════════════════
-- REACTIONS
-- ═══════════════════════════════════════════
create table public.reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  type text check (type in ('like','fire','wow','thinking','playful','cool','sparkle')),
  created_at timestamptz default now(),
  unique(post_id, user_id, type)
);

-- ═══════════════════════════════════════════
-- COMMENTS
-- ═══════════════════════════════════════════
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade,
  author_id uuid references auth.users(id) on delete cascade,
  author_name text,
  author_username text,
  author_avatar text,
  text text not null,
  likes_count integer default 0,
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════
-- FOLLOWS
-- ═══════════════════════════════════════════
create table public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid references auth.users(id) on delete cascade,
  following_id uuid references auth.users(id) on delete cascade,
  follower_username text,
  following_username text,
  created_at timestamptz default now(),
  unique(follower_id, following_id)
);

create table public.follow_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid references auth.users(id) on delete cascade,
  target_id uuid references auth.users(id) on delete cascade,
  requester_username text,
  requester_name text,
  requester_avatar text,
  status text default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════
-- NOTIFICATIONS
-- ═══════════════════════════════════════════
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  type text check (type in ('like','comment','follow','follow_request','message','share')),
  actor_id uuid references auth.users(id),
  actor_username text,
  actor_avatar text,
  content_id uuid,
  message text,
  read boolean default false,
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════
-- CHATS & MESSAGES
-- ═══════════════════════════════════════════
create table public.chats (
  id uuid primary key default gen_random_uuid(),
  participant_ids uuid[],
  participant_usernames text[],
  last_message text,
  last_message_time timestamptz,
  is_group boolean default false,
  group_name text,
  group_avatar text,
  created_at timestamptz default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid references public.chats(id) on delete cascade,
  sender_id uuid references auth.users(id) on delete cascade,
  sender_username text,
  sender_avatar text,
  text text,
  image_url text,
  read_by uuid[],
  reactions jsonb,
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════
-- BLOCKS & REPORTS
-- ═══════════════════════════════════════════
create table public.blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid references auth.users(id) on delete cascade,
  blocked_id uuid references auth.users(id) on delete cascade,
  blocked_username text,
  created_at timestamptz default now(),
  unique(blocker_id, blocked_id)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references auth.users(id),
  reported_user_id uuid references auth.users(id),
  post_id uuid references public.posts(id),
  reason text,
  status text default 'pending',
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════
-- STORIES
-- ═══════════════════════════════════════════
create table public.stories (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references auth.users(id) on delete cascade,
  author_name text,
  author_username text,
  author_avatar text,
  media_url text,
  media_type text default 'image',
  caption text,
  viewers uuid[],
  expires_at timestamptz default (now() + interval '24 hours'),
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════
-- LIVE SESSIONS
-- ═══════════════════════════════════════════
create table public.live_sessions (
  id uuid primary key default gen_random_uuid(),
  broadcaster_id uuid references auth.users(id),
  broadcaster_name text,
  broadcaster_username text,
  broadcaster_avatar text,
  title text,
  status text default 'active' check (status in ('active','ended')),
  viewer_count integer default 0,
  started_at timestamptz default now(),
  ended_at timestamptz,
  replay_url text,
  thumbnail_url text
);

-- ═══════════════════════════════════════════
-- CALLS
-- ═══════════════════════════════════════════
create table public.call_sessions (
  id uuid primary key default gen_random_uuid(),
  caller_id uuid references auth.users(id),
  receiver_id uuid references auth.users(id),
  type text check (type in ('voice','video')),
  status text default 'ringing',
  offer_sdp text,
  answer_sdp text,
  caller_ice text[],
  receiver_ice text[],
  accepted_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz default now()
);

create table public.missed_calls (
  id uuid primary key default gen_random_uuid(),
  receiver_id uuid references auth.users(id),
  caller_id uuid references auth.users(id),
  caller_name text,
  caller_avatar text,
  call_type text,
  call_session_id uuid,
  seen boolean default false,
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════
-- SUBSCRIPTIONS (VIP/Stripe)
-- ═══════════════════════════════════════════
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  status text default 'active',
  plan text,
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════
-- CURATED REELS
-- ═══════════════════════════════════════════
create table public.curated_reels (
  id uuid primary key default gen_random_uuid(),
  title text,
  video_url text,
  youtube_video_id text,
  thumbnail_url text,
  author_name text,
  author_username text,
  author_avatar text,
  caption text,
  source text,
  category text,
  is_active boolean default true,
  views_count integer default 0,
  likes_count integer default 0,
  added_by_admin_id uuid,
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════
-- AD CAMPAIGNS
-- ═══════════════════════════════════════════
create table public.ad_campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  campaign_name text,
  budget numeric,
  duration_days integer,
  target_audience jsonb,
  ad_content jsonb,
  status text default 'draft',
  impressions integer default 0,
  clicks integer default 0,
  spent numeric default 0,
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════
-- LEGAL CONSENT
-- ═══════════════════════════════════════════
create table public.legal_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  accepted_at timestamptz,
  platform text,
  terms_version text default '2.0',
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════
-- PRESET AVATARS
-- ═══════════════════════════════════════════
create table public.preset_avatars (
  id uuid primary key default gen_random_uuid(),
  image_url text,
  label text,
  gender text default 'unisex',
  sort_order integer default 0,
  is_active boolean default true
);
```

---

## 4. Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
alter table public.user_profiles enable row level security;
alter table public.posts enable row level security;
alter table public.reactions enable row level security;
alter table public.comments enable row level security;
alter table public.follows enable row level security;
alter table public.notifications enable row level security;
alter table public.messages enable row level security;
alter table public.chats enable row level security;
alter table public.blocks enable row level security;
alter table public.call_sessions enable row level security;
alter table public.missed_calls enable row level security;

-- user_profiles: anyone can read public profiles; only owner can update
create policy "Public profiles are viewable" on public.user_profiles for select using (true);
create policy "Users can update own profile" on public.user_profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.user_profiles for insert with check (auth.uid() = id);

-- posts: public posts viewable by all; friends-only/private filtered
create policy "Public posts viewable" on public.posts for select using (visibility = 'public' or author_id = auth.uid());
create policy "Users can create posts" on public.posts for insert with check (author_id = auth.uid());
create policy "Users can update own posts" on public.posts for update using (author_id = auth.uid());
create policy "Users can delete own posts" on public.posts for delete using (author_id = auth.uid());

-- reactions
create policy "Anyone can view reactions" on public.reactions for select using (true);
create policy "Users can react" on public.reactions for insert with check (user_id = auth.uid());
create policy "Users can remove own reactions" on public.reactions for delete using (user_id = auth.uid());

-- comments
create policy "Anyone can view comments" on public.comments for select using (true);
create policy "Users can comment" on public.comments for insert with check (author_id = auth.uid());
create policy "Users can delete own comments" on public.comments for delete using (author_id = auth.uid());

-- notifications: only owner can see theirs
create policy "Users see own notifications" on public.notifications for select using (user_id = auth.uid());
create policy "System can insert notifications" on public.notifications for insert with check (true);
create policy "Users can mark read" on public.notifications for update using (user_id = auth.uid());

-- messages: only participants
create policy "Participants can read messages" on public.messages for select using (
  sender_id = auth.uid() or
  exists (select 1 from public.chats where id = chat_id and auth.uid() = any(participant_ids))
);
create policy "Users can send messages" on public.messages for insert with check (sender_id = auth.uid());

-- call_sessions
create policy "Participants can view calls" on public.call_sessions for select using (caller_id = auth.uid() or receiver_id = auth.uid());
create policy "Users can create calls" on public.call_sessions for insert with check (caller_id = auth.uid());
create policy "Participants can update calls" on public.call_sessions for update using (caller_id = auth.uid() or receiver_id = auth.uid());
```

---

## 5. Supabase Storage Buckets

```
avatars/          → user profile photos (public)
covers/           → cover photos (public)
posts/            → post images/videos (public)
stories/          → story media (public, auto-expire via lifecycle rule)
messages/         → message attachments (private, participant-only)
stock-videos/     → admin stock video library (public)
```

---

## 6. Migration Steps (Ordered, Safe)

### Phase 1: Setup (No changes to working app)
- [ ] Create Supabase project
- [ ] Run SQL schema above
- [ ] Set environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- [ ] Install `@supabase/supabase-js`
- [ ] Create `src/lib/supabaseClient.js` (parallel to base44Client.js)
- [ ] Create `src/lib/supabaseAuth.js` wrapper

### Phase 2: Data Export from Base44
- [ ] Use Base44 admin panel or SDK to export all entities as JSON
- [ ] Run import scripts (see Section 7) to load into Supabase
- [ ] Verify row counts match

### Phase 3: Auth Migration
- [ ] Add Supabase email/password auth alongside Base44
- [ ] New users register on Supabase
- [ ] Existing users: password-reset flow to migrate
- [ ] Keep Base44 auth for existing logged-in users (token in Capacitor Preferences)

### Phase 4: Feature Migration (one at a time)
1. **Read-only feed** — replace `base44.entities.Post.filter()` with Supabase select
2. **Reactions** — replace `toggleReaction` function with Supabase edge function
3. **Comments** — replace comment CRUD
4. **User profiles** — replace UserProfile entity
5. **Follow/unfollow** — replace Follow entity + toggleFollow function
6. **Messages/Chat** — replace Chat + Message entities + real-time
7. **Notifications** — replace Notification entity + real-time
8. **Stories** — replace Story entity
9. **Reels** — replace CuratedReel entity
10. **Live streams** — replace LiveSession entity
11. **Calls (WebRTC signaling)** — replace CallSession entity + real-time
12. **Payments** — replace stripeCheckout/stripeWebhook functions
13. **AI features** — replace InvokeLLM with direct OpenAI calls
14. **File uploads** — replace UploadFile with Supabase Storage
15. **Admin features** — replace all admin functions
16. **Push notifications** — replace sendPushNotification with direct APNs/FCM

### Phase 5: Cut Over
- [ ] All features verified on Supabase
- [ ] Base44 removed from `package.json`
- [ ] All `@base44/sdk` imports removed
- [ ] iOS Capacitor rebuild + TestFlight submission
- [ ] Monitor for 1 week before fully closing Base44

---

## 7. Data Export & Import Scripts

### Export from Base44 (run in browser console or Node.js)
```js
// Export all posts
const posts = await base44.entities.Post.list();
// Save as posts_export.json

// Export all users/profiles
const profiles = await base44.entities.UserProfile.list();
// Save as profiles_export.json

// Repeat for each entity...
```

### Import to Supabase (Node.js script)
```js
import { createClient } from '@supabase/supabase-js';
import postsData from './posts_export.json';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Import posts (in batches of 100)
for (let i = 0; i < postsData.length; i += 100) {
  const batch = postsData.slice(i, i + 100).map(p => ({
    id: p.id, // preserve original IDs
    author_id: p.author_id,
    caption: p.caption,
    // ... map all fields
    created_at: p.created_date,
  }));
  await supabase.from('posts').insert(batch);
}
```

---

## 8. Supabase Client Setup (to add in Phase 1)

```js
// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: window.localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // important for Capacitor
  },
});
```

---

## 9. Supabase Edge Function Template (replaces Base44 backend functions)

```ts
// supabase/functions/toggleReaction/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  
  const authHeader = req.headers.get('Authorization');
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader! } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });

  const { post_id, type } = await req.json();
  // ... reaction logic using supabase client
  return new Response(JSON.stringify({ action: 'added', newCount: 5 }), { headers: corsHeaders });
});
```

---

## 10. iOS Capacitor Notes for Supabase

1. **Auth storage:** Use `@capacitor/preferences` for Supabase session token (same pattern as current Base44 token storage).
2. **CORS:** Supabase REST API supports Capacitor origins out of the box.
3. **Realtime on iOS:** Supabase Realtime uses WebSockets — works on Capacitor if `capacitor://` origin is whitelisted in Supabase dashboard.
4. **Info.plist:** Add `supabase.co` to ATS exception domains alongside existing `base44.com`.

---

## 11. What Does NOT Change

- All UI components (PostCard, Feed, Profile, Messages, etc.)
- Capacitor plugins (@capacitor/camera, push-notifications, preferences, share)
- Cloudflare Stream video infrastructure
- Stripe payment integration (just re-point to new edge function URLs)
- Banuba AR camera
- Firebase/APNs push infrastructure
- YouTube API integration
- All CSS/design system/Tailwind
- iOS bundle ID and signing

---

## 12. Estimated Effort

| Phase | Effort | Risk |
|---|---|---|
| Schema + Supabase setup | 1 day | Low |
| Data export/import | 1-2 days | Medium |
| Auth migration | 2-3 days | High |
| Feed + reactions | 1 day | Low |
| Messaging + realtime | 2 days | Medium |
| Calls (WebRTC signaling) | 2 days | High |
| AI features | 1 day | Low |
| File uploads | 1 day | Low |
| Payments | 1 day | Low |
| Admin features | 2 days | Low |
| Push notifications | 1 day | Medium |
| iOS rebuild + testing | 2-3 days | Medium |
| **Total** | **~18-22 days** | |

---

*Generated: 2026-06-30. Do not delete — this is the canonical migration reference.*