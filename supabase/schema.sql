-- ════════════════════════════════════════════════════════════════════════
-- SPICEY — Supabase SQL Schema
-- Source: src/MIGRATION_TO_SUPABASE.md (Phase 1 reference)
-- Status: Schema only. No app code points here yet.
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
-- ════════════════════════════════════════════════════════════════════════


-- ════════════════════════════════════════════════════════════════════════
-- TABLES
-- ════════════════════════════════════════════════════════════════════════

-- ── 1. USER PROFILES ─────────────────────────────────────────────────────
-- One row per auth.users entry. Extended profile data beyond what auth provides.
create table public.user_profiles (
  id              uuid        primary key references auth.users(id) on delete cascade,
  username        text        unique,
  full_name       text,
  bio             text,
  avatar_url      text,
  cover_url       text,
  is_private      boolean     default false,
  is_vip          boolean     default false,
  is_verified     boolean     default false,
  vip_tier        text,
  followers_count integer     default 0,
  following_count integer     default 0,
  post_count      integer     default 0,
  role            text        default 'user',
  theme           text,
  location        text,
  website         text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── 2. POSTS ─────────────────────────────────────────────────────────────
-- Feed, reels, and stories all use this table (differentiated by post_type).
create table public.posts (
  id                 uuid        primary key default gen_random_uuid(),
  author_id          uuid        references auth.users(id) on delete cascade,
  author_name        text,
  author_username    text,
  author_avatar      text,
  caption            text,
  post_type          text        default 'feed' check (post_type in ('feed', 'reel', 'story')),
  visibility         text        default 'public' check (visibility in ('public', 'friends', 'private')),
  image_url          text,
  image_urls         text[],
  video_url          text,
  video_link         text,
  location           text,
  map_visible        boolean     default false,
  map_city           text,
  tags               text,
  hashtags           text[],
  likes_count        integer     default 0,
  fire_count         integer     default 0,
  wow_count          integer     default 0,
  comments_count     integer     default 0,
  shares_count       integer     default 0,
  music_title        text,
  music_artist       text,
  music_preview_url  text,
  music_artwork_url  text,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);

-- ── 3. REACTIONS ─────────────────────────────────────────────────────────
-- Per-user, per-post reactions. UNIQUE constraint prevents duplicates.
create table public.reactions (
  id         uuid        primary key default gen_random_uuid(),
  post_id    uuid        references public.posts(id) on delete cascade,
  user_id    uuid        references auth.users(id) on delete cascade,
  type       text        check (type in ('like', 'fire', 'wow', 'thinking', 'playful', 'cool', 'sparkle')),
  created_at timestamptz default now(),
  unique (post_id, user_id, type)
);

-- ── 4. COMMENTS ──────────────────────────────────────────────────────────
create table public.comments (
  id               uuid        primary key default gen_random_uuid(),
  post_id          uuid        references public.posts(id) on delete cascade,
  author_id        uuid        references auth.users(id) on delete cascade,
  author_name      text,
  author_username  text,
  author_avatar    text,
  text             text        not null,
  likes_count      integer     default 0,
  created_at       timestamptz default now()
);

-- ── 5. FOLLOWS ───────────────────────────────────────────────────────────
create table public.follows (
  id                 uuid        primary key default gen_random_uuid(),
  follower_id        uuid        references auth.users(id) on delete cascade,
  following_id       uuid        references auth.users(id) on delete cascade,
  follower_username  text,
  following_username text,
  created_at         timestamptz default now(),
  unique (follower_id, following_id)
);

-- ── 6. FOLLOW REQUESTS ───────────────────────────────────────────────────
-- Used when target account is private.
create table public.follow_requests (
  id                 uuid        primary key default gen_random_uuid(),
  requester_id       uuid        references auth.users(id) on delete cascade,
  target_id          uuid        references auth.users(id) on delete cascade,
  requester_username text,
  requester_name     text,
  requester_avatar   text,
  status             text        default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at         timestamptz default now()
);

-- ── 7. NOTIFICATIONS ─────────────────────────────────────────────────────
create table public.notifications (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        references auth.users(id) on delete cascade,
  type            text        check (type in ('like', 'comment', 'follow', 'follow_request', 'message', 'share')),
  actor_id        uuid        references auth.users(id),
  actor_username  text,
  actor_avatar    text,
  content_id      uuid,
  message         text,
  read            boolean     default false,
  created_at      timestamptz default now()
);

-- ── 8. CHATS ─────────────────────────────────────────────────────────────
-- 1-to-1 and group conversations.
create table public.chats (
  id                    uuid        primary key default gen_random_uuid(),
  participant_ids       uuid[],
  participant_usernames text[],
  last_message          text,
  last_message_time     timestamptz,
  is_group              boolean     default false,
  group_name            text,
  group_avatar          text,
  created_at            timestamptz default now()
);

-- ── 9. MESSAGES ──────────────────────────────────────────────────────────
create table public.messages (
  id               uuid        primary key default gen_random_uuid(),
  chat_id          uuid        references public.chats(id) on delete cascade,
  sender_id        uuid        references auth.users(id) on delete cascade,
  sender_username  text,
  sender_avatar    text,
  text             text,
  image_url        text,
  read_by          uuid[],
  reactions        jsonb,
  created_at       timestamptz default now()
);

-- ── 10. BLOCKS ───────────────────────────────────────────────────────────
create table public.blocks (
  id               uuid        primary key default gen_random_uuid(),
  blocker_id       uuid        references auth.users(id) on delete cascade,
  blocked_id       uuid        references auth.users(id) on delete cascade,
  blocked_username text,
  created_at       timestamptz default now(),
  unique (blocker_id, blocked_id)
);

-- ── 11. REPORTS ──────────────────────────────────────────────────────────
create table public.reports (
  id               uuid        primary key default gen_random_uuid(),
  reporter_id      uuid        references auth.users(id),
  reported_user_id uuid        references auth.users(id),
  post_id          uuid        references public.posts(id),
  reason           text,
  status           text        default 'pending',
  created_at       timestamptz default now()
);

-- ── 12. STORIES ──────────────────────────────────────────────────────────
-- Expires automatically via expires_at; enforce cleanup with a scheduled Edge Function.
create table public.stories (
  id               uuid        primary key default gen_random_uuid(),
  author_id        uuid        references auth.users(id) on delete cascade,
  author_name      text,
  author_username  text,
  author_avatar    text,
  media_url        text,
  media_type       text        default 'image',
  caption          text,
  viewers          uuid[],
  expires_at       timestamptz default (now() + interval '24 hours'),
  created_at       timestamptz default now()
);

-- ── 13. LIVE SESSIONS ────────────────────────────────────────────────────
create table public.live_sessions (
  id                    uuid        primary key default gen_random_uuid(),
  broadcaster_id        uuid        references auth.users(id),
  broadcaster_name      text,
  broadcaster_username  text,
  broadcaster_avatar    text,
  title                 text,
  status                text        default 'active' check (status in ('active', 'ended')),
  viewer_count          integer     default 0,
  started_at            timestamptz default now(),
  ended_at              timestamptz,
  replay_url            text,
  thumbnail_url         text
);

-- ── 14. CALL SESSIONS ────────────────────────────────────────────────────
-- WebRTC signalling: SDP offer/answer + ICE candidates.
create table public.call_sessions (
  id           uuid        primary key default gen_random_uuid(),
  caller_id    uuid        references auth.users(id),
  receiver_id  uuid        references auth.users(id),
  type         text        check (type in ('voice', 'video')),
  status       text        default 'ringing',
  offer_sdp    text,
  answer_sdp   text,
  caller_ice   text[],
  receiver_ice text[],
  accepted_at  timestamptz,
  ended_at     timestamptz,
  created_at   timestamptz default now()
);

-- ── 15. MISSED CALLS ─────────────────────────────────────────────────────
create table public.missed_calls (
  id              uuid        primary key default gen_random_uuid(),
  receiver_id     uuid        references auth.users(id),
  caller_id       uuid        references auth.users(id),
  caller_name     text,
  caller_avatar   text,
  call_type       text,
  call_session_id uuid,
  seen            boolean     default false,
  created_at      timestamptz default now()
);

-- ── 16. SUBSCRIPTIONS ────────────────────────────────────────────────────
-- VIP / Stripe subscription records.
create table public.subscriptions (
  id                     uuid        primary key default gen_random_uuid(),
  user_id                uuid        references auth.users(id) on delete cascade,
  status                 text        default 'active',
  plan                   text,
  stripe_customer_id     text,
  stripe_subscription_id text,
  current_period_end     timestamptz,
  created_at             timestamptz default now()
);

-- ── 17. CURATED REELS ────────────────────────────────────────────────────
create table public.curated_reels (
  id               uuid        primary key default gen_random_uuid(),
  title            text,
  video_url        text,
  youtube_video_id text,
  thumbnail_url    text,
  author_name      text,
  author_username  text,
  author_avatar    text,
  caption          text,
  source           text        check (source in ('youtube_shorts', 'admin_upload', 'creator_permission')),
  category         text        check (category in ('trending','music','comedy','dance','sports','nature','tech','fashion','food','travel')),
  is_active        boolean     default true,
  views_count      integer     default 0,
  likes_count      integer     default 0,
  added_by_admin_id uuid,
  created_at       timestamptz default now()
);

-- ── 18. STOCK VIDEOS ─────────────────────────────────────────────────────
-- Admin-managed video library for reels / background content.
create table public.stock_videos (
  id            uuid        primary key default gen_random_uuid(),
  title         text,
  video_url     text,
  thumbnail_url text,
  category      text,
  duration      integer,
  is_active     boolean     default true,
  created_at    timestamptz default now()
);

-- ── 19. AD CAMPAIGNS ─────────────────────────────────────────────────────
create table public.ad_campaigns (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        references auth.users(id),
  campaign_name   text,
  budget          numeric,
  duration_days   integer,
  target_audience jsonb,
  ad_content      jsonb,
  status          text        default 'draft' check (status in ('draft','active','paused','completed','rejected')),
  impressions     integer     default 0,
  clicks          integer     default 0,
  conversions     integer     default 0,
  spent           numeric     default 0,
  expires_at      timestamptz,
  created_at      timestamptz default now()
);

-- ── 20. POST BOOSTS ──────────────────────────────────────────────────────
create table public.post_boosts (
  id               uuid        primary key default gen_random_uuid(),
  post_id          uuid        references public.posts(id) on delete cascade,
  user_id          uuid        references auth.users(id),
  boost_amount     numeric,
  duration_days    integer,
  target_audience  text,
  status           text        default 'active' check (status in ('active','completed','paused')),
  started_at       timestamptz,
  expires_at       timestamptz,
  estimated_reach  integer,
  actual_reach     integer     default 0,
  impressions      integer     default 0,
  created_at       timestamptz default now()
);

-- ── 21. PROFILE CATEGORIES ───────────────────────────────────────────────
-- User-defined photo albums visible on their profile.
create table public.profile_categories (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        references auth.users(id) on delete cascade,
  name        text        check (name in ('Moments','Travel','Night','Food','Drip')),
  description text,
  cover_image_url text,
  post_ids    uuid[],
  is_public   boolean     default true,
  created_at  timestamptz default now()
);

-- ── 22. PROFILE PHOTO COMMENTS ───────────────────────────────────────────
create table public.profile_photo_comments (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        references auth.users(id) on delete cascade,
  photo_type      text        check (photo_type in ('avatar', 'cover')),
  commenter_id    uuid        references auth.users(id),
  commenter_name  text,
  commenter_avatar text,
  text            text        not null,
  created_at      timestamptz default now()
);

-- ── 23. PROFILE PHOTO REACTIONS ──────────────────────────────────────────
create table public.profile_photo_reactions (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        references auth.users(id) on delete cascade,
  photo_type  text        check (photo_type in ('avatar', 'cover')),
  reactor_id  uuid        references auth.users(id),
  type        text        check (type in ('like', 'fire')),
  created_at  timestamptz default now(),
  unique (user_id, photo_type, reactor_id, type)
);

-- ── 24. PRESET AVATARS ───────────────────────────────────────────────────
create table public.preset_avatars (
  id          uuid    primary key default gen_random_uuid(),
  image_url   text,
  label       text,
  gender      text    default 'unisex' check (gender in ('male','female','unisex')),
  sort_order  integer default 0,
  is_active   boolean default true
);

-- ── 25. LEGAL CONSENTS ───────────────────────────────────────────────────
create table public.legal_consents (
  id                  uuid        primary key default gen_random_uuid(),
  user_id             uuid        references auth.users(id),
  accepted_at         timestamptz,
  ip_address          text,
  user_agent          text,
  platform            text,
  terms_version       text        default '2.0',
  privacy_version     text        default '2.0',
  guidelines_version  text        default '2.0',
  app_version         text        default '1.0.0',
  consent_method      text        default 'onboarding',
  re_consent_reason   text,
  created_at          timestamptz default now()
);


-- ════════════════════════════════════════════════════════════════════════
-- INDEXES
-- ════════════════════════════════════════════════════════════════════════

-- posts: feed queries (author, type, time)
create index idx_posts_author_id       on public.posts (author_id);
create index idx_posts_post_type       on public.posts (post_type);
create index idx_posts_created_at      on public.posts (created_at desc);
create index idx_posts_map_city        on public.posts (map_city) where map_visible = true;
create index idx_posts_hashtags        on public.posts using gin(hashtags);

-- reactions: per-post counts + per-user lookups
create index idx_reactions_post_id     on public.reactions (post_id);
create index idx_reactions_user_id     on public.reactions (user_id);

-- comments: per-post lookups
create index idx_comments_post_id      on public.comments (post_id);

-- follows: both directions
create index idx_follows_follower_id   on public.follows (follower_id);
create index idx_follows_following_id  on public.follows (following_id);

-- notifications: unread inbox
create index idx_notifications_user_id on public.notifications (user_id, read, created_at desc);

-- messages: per-chat feed
create index idx_messages_chat_id      on public.messages (chat_id, created_at desc);

-- chats: participant lookup (GIN for array containment)
create index idx_chats_participants    on public.chats using gin(participant_ids);

-- call_sessions: real-time signalling
create index idx_calls_caller_id       on public.call_sessions (caller_id);
create index idx_calls_receiver_id     on public.call_sessions (receiver_id);
create index idx_calls_status          on public.call_sessions (status);

-- missed_calls: inbox
create index idx_missed_calls_receiver on public.missed_calls (receiver_id, seen);

-- subscriptions: VIP check
create index idx_subscriptions_user_id on public.subscriptions (user_id, status);

-- stories: active stories only
create index idx_stories_expires_at    on public.stories (expires_at);
create index idx_stories_author_id     on public.stories (author_id);

-- blocks: per-user block list
create index idx_blocks_blocker_id     on public.blocks (blocker_id);

-- user_profiles: username search
create index idx_user_profiles_username on public.user_profiles (username);


-- ════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ════════════════════════════════════════════════════════════════════════

alter table public.user_profiles        enable row level security;
alter table public.posts                 enable row level security;
alter table public.reactions             enable row level security;
alter table public.comments              enable row level security;
alter table public.follows               enable row level security;
alter table public.follow_requests       enable row level security;
alter table public.notifications         enable row level security;
alter table public.chats                 enable row level security;
alter table public.messages              enable row level security;
alter table public.blocks                enable row level security;
alter table public.reports               enable row level security;
alter table public.stories               enable row level security;
alter table public.live_sessions         enable row level security;
alter table public.call_sessions         enable row level security;
alter table public.missed_calls          enable row level security;
alter table public.subscriptions         enable row level security;
alter table public.curated_reels         enable row level security;
alter table public.stock_videos          enable row level security;
alter table public.ad_campaigns          enable row level security;
alter table public.post_boosts           enable row level security;
alter table public.profile_categories    enable row level security;
alter table public.profile_photo_comments enable row level security;
alter table public.profile_photo_reactions enable row level security;
alter table public.preset_avatars        enable row level security;
alter table public.legal_consents        enable row level security;

-- ── user_profiles ─────────────────────────────────────────────────────
create policy "Public profiles are viewable"
  on public.user_profiles for select using (true);

create policy "Users can insert own profile"
  on public.user_profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.user_profiles for update using (auth.uid() = id);

-- ── posts ─────────────────────────────────────────────────────────────
create policy "Public posts are viewable"
  on public.posts for select using (visibility = 'public' or author_id = auth.uid());

create policy "Users can create posts"
  on public.posts for insert with check (author_id = auth.uid());

create policy "Users can update own posts"
  on public.posts for update using (author_id = auth.uid());

create policy "Users can delete own posts"
  on public.posts for delete using (author_id = auth.uid());

-- ── reactions ─────────────────────────────────────────────────────────
create policy "Anyone can view reactions"
  on public.reactions for select using (true);

create policy "Authenticated users can react"
  on public.reactions for insert with check (user_id = auth.uid());

create policy "Users can remove own reactions"
  on public.reactions for delete using (user_id = auth.uid());

-- ── comments ──────────────────────────────────────────────────────────
create policy "Anyone can view comments"
  on public.comments for select using (true);

create policy "Authenticated users can comment"
  on public.comments for insert with check (author_id = auth.uid());

create policy "Users can delete own comments"
  on public.comments for delete using (author_id = auth.uid());

-- ── follows ───────────────────────────────────────────────────────────
create policy "Anyone can view follows"
  on public.follows for select using (true);

create policy "Users can follow others"
  on public.follows for insert with check (follower_id = auth.uid());

create policy "Users can unfollow"
  on public.follows for delete using (follower_id = auth.uid());

-- ── follow_requests ───────────────────────────────────────────────────
create policy "Participants can view follow requests"
  on public.follow_requests for select
  using (requester_id = auth.uid() or target_id = auth.uid());

create policy "Users can send follow requests"
  on public.follow_requests for insert with check (requester_id = auth.uid());

create policy "Target can update follow request status"
  on public.follow_requests for update using (target_id = auth.uid());

create policy "Requester can cancel follow request"
  on public.follow_requests for delete using (requester_id = auth.uid());

-- ── notifications ─────────────────────────────────────────────────────
create policy "Users see own notifications"
  on public.notifications for select using (user_id = auth.uid());

create policy "System can insert notifications"
  on public.notifications for insert with check (true);

create policy "Users can mark notifications read"
  on public.notifications for update using (user_id = auth.uid());

-- ── chats ─────────────────────────────────────────────────────────────
create policy "Participants can view their chats"
  on public.chats for select
  using (auth.uid() = any(participant_ids));

create policy "Authenticated users can create chats"
  on public.chats for insert with check (auth.uid() = any(participant_ids));

create policy "Participants can update chat metadata"
  on public.chats for update using (auth.uid() = any(participant_ids));

-- ── messages ──────────────────────────────────────────────────────────
create policy "Participants can read messages"
  on public.messages for select using (
    sender_id = auth.uid() or
    exists (
      select 1 from public.chats
      where id = chat_id and auth.uid() = any(participant_ids)
    )
  );

create policy "Users can send messages"
  on public.messages for insert with check (sender_id = auth.uid());

create policy "Sender can delete own messages"
  on public.messages for delete using (sender_id = auth.uid());

-- ── blocks ────────────────────────────────────────────────────────────
create policy "Users see own blocks"
  on public.blocks for select using (blocker_id = auth.uid());

create policy "Users can block others"
  on public.blocks for insert with check (blocker_id = auth.uid());

create policy "Users can unblock"
  on public.blocks for delete using (blocker_id = auth.uid());

-- ── reports ───────────────────────────────────────────────────────────
create policy "Users can file reports"
  on public.reports for insert with check (reporter_id = auth.uid());

create policy "Reporters see own reports"
  on public.reports for select using (reporter_id = auth.uid());

-- ── stories ───────────────────────────────────────────────────────────
create policy "Non-expired stories are viewable"
  on public.stories for select using (expires_at > now());

create policy "Users can create stories"
  on public.stories for insert with check (author_id = auth.uid());

create policy "Users can delete own stories"
  on public.stories for delete using (author_id = auth.uid());

-- ── call_sessions ─────────────────────────────────────────────────────
create policy "Participants can view calls"
  on public.call_sessions for select
  using (caller_id = auth.uid() or receiver_id = auth.uid());

create policy "Caller can create call sessions"
  on public.call_sessions for insert with check (caller_id = auth.uid());

create policy "Participants can update call sessions"
  on public.call_sessions for update
  using (caller_id = auth.uid() or receiver_id = auth.uid());

-- ── missed_calls ──────────────────────────────────────────────────────
create policy "Users see own missed calls"
  on public.missed_calls for select using (receiver_id = auth.uid());

create policy "System can create missed call records"
  on public.missed_calls for insert with check (true);

create policy "Receiver can mark seen"
  on public.missed_calls for update using (receiver_id = auth.uid());

-- ── subscriptions ─────────────────────────────────────────────────────
create policy "Users see own subscriptions"
  on public.subscriptions for select using (user_id = auth.uid());

-- Note: inserts/updates via Edge Function using service_role key (bypasses RLS)

-- ── curated_reels ─────────────────────────────────────────────────────
create policy "Active reels are publicly viewable"
  on public.curated_reels for select using (is_active = true);

-- ── stock_videos ──────────────────────────────────────────────────────
create policy "Active stock videos are publicly viewable"
  on public.stock_videos for select using (is_active = true);

-- ── ad_campaigns ──────────────────────────────────────────────────────
create policy "Users see own ad campaigns"
  on public.ad_campaigns for select using (user_id = auth.uid());

create policy "Users can create ad campaigns"
  on public.ad_campaigns for insert with check (user_id = auth.uid());

create policy "Users can update own ad campaigns"
  on public.ad_campaigns for update using (user_id = auth.uid());

-- ── post_boosts ───────────────────────────────────────────────────────
create policy "Users see own post boosts"
  on public.post_boosts for select using (user_id = auth.uid());

create policy "Users can create post boosts"
  on public.post_boosts for insert with check (user_id = auth.uid());

-- ── profile_categories ────────────────────────────────────────────────
create policy "Public categories are viewable"
  on public.profile_categories for select using (is_public = true or user_id = auth.uid());

create policy "Users can manage own categories"
  on public.profile_categories for insert with check (user_id = auth.uid());

create policy "Users can update own categories"
  on public.profile_categories for update using (user_id = auth.uid());

create policy "Users can delete own categories"
  on public.profile_categories for delete using (user_id = auth.uid());

-- ── profile_photo_comments ────────────────────────────────────────────
create policy "Anyone can view profile photo comments"
  on public.profile_photo_comments for select using (true);

create policy "Authenticated users can comment on profile photos"
  on public.profile_photo_comments for insert with check (commenter_id = auth.uid());

create policy "Commenter or profile owner can delete"
  on public.profile_photo_comments for delete
  using (commenter_id = auth.uid() or user_id = auth.uid());

-- ── profile_photo_reactions ───────────────────────────────────────────
create policy "Anyone can view profile photo reactions"
  on public.profile_photo_reactions for select using (true);

create policy "Authenticated users can react to profile photos"
  on public.profile_photo_reactions for insert with check (reactor_id = auth.uid());

create policy "Users can remove own profile photo reactions"
  on public.profile_photo_reactions for delete using (reactor_id = auth.uid());

-- ── preset_avatars ────────────────────────────────────────────────────
create policy "Active preset avatars are publicly viewable"
  on public.preset_avatars for select using (is_active = true);

-- ── legal_consents ────────────────────────────────────────────────────
create policy "Users see own consents"
  on public.legal_consents for select using (user_id = auth.uid());

create policy "Users can record their consent"
  on public.legal_consents for insert with check (user_id = auth.uid());


-- ════════════════════════════════════════════════════════════════════════
-- STORAGE BUCKETS
-- (Run these in Supabase Dashboard → Storage, or use the Storage API)
-- ════════════════════════════════════════════════════════════════════════

-- NOTE: Storage buckets cannot be created via SQL. Create each one manually
-- in the Supabase Dashboard → Storage → New Bucket, then set policies below.
--
-- Required buckets:
--
--   avatars       public   User profile photos
--   covers        public   Profile cover photos
--   posts         public   Post images and videos
--   stories       public   Story media (24h lifecycle — add expiry rule in dashboard)
--   messages      private  Message attachments (participant-only access)
--   stock-videos  public   Admin stock video library
--
-- Example storage policies (paste into Dashboard → Storage → Policies):
--
-- INSERT on avatars:
--   ((storage.foldername(name))[1] = auth.uid()::text)
--
-- SELECT on messages (private bucket — service_role only for now):
--   false  -- frontend fetches via signed URLs generated by Edge Function
-- ════════════════════════════════════════════════════════════════════════