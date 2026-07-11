-- Spicey Supabase starter schema.
-- Review in Supabase SQL editor before running. This file does not drop data.

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text,
  username text,
  full_name text,
  bio text,
  avatar_url text,
  avatar_3d_url text,
  cover_url text,
  location text,
  location_name text,
  latitude double precision,
  longitude double precision,
  share_location boolean not null default false,
  website text,
  is_private boolean not null default false,
  is_verified boolean not null default false,
  verification_badge text,
  account_status text not null default 'active',
  posting_disabled boolean not null default false,
  messaging_disabled boolean not null default false,
  moderation_reason text,
  moderated_by text,
  moderated_at timestamptz,
  push_token text,
  voip_push_token text,
  platform text,
  profile_theme text not null default 'dark',
  trial_used boolean not null default false,
  followers_count integer not null default 0,
  following_count integer not null default 0,
  posts_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_user_id_idx on public.profiles(user_id);
create index if not exists profiles_username_idx on public.profiles(lower(username));

alter table public.profiles
add column if not exists verification_badge text;

alter table public.profiles
add column if not exists location_name text;

alter table public.profiles
add column if not exists latitude double precision;

alter table public.profiles
add column if not exists longitude double precision;

alter table public.profiles
add column if not exists share_location boolean not null default false;

alter table public.profiles
add column if not exists push_token text;

alter table public.profiles
add column if not exists voip_push_token text;

alter table public.profiles
add column if not exists platform text;

alter table public.profiles
add column if not exists trial_used boolean not null default false;

alter table public.profiles
add column if not exists account_status text not null default 'active';

alter table public.profiles
add column if not exists posting_disabled boolean not null default false;

alter table public.profiles
add column if not exists messaging_disabled boolean not null default false;

alter table public.profiles
add column if not exists moderation_reason text;

alter table public.profiles
add column if not exists moderated_by text;

alter table public.profiles
add column if not exists moderated_at timestamptz;

create index if not exists profiles_share_location_lat_lng_idx
on public.profiles(share_location, latitude, longitude);

create index if not exists profiles_account_status_idx
on public.profiles(account_status);

alter table public.profiles enable row level security;




create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'active',
  plan text,
  provider text,
  granted_by_admin_email text,
  grant_reason text,
  cancellation_reason text,
  cancelled_at timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  trial_used boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_user_id_status_idx on public.subscriptions(user_id, status);

alter table public.subscriptions
add column if not exists granted_by_admin_email text;

alter table public.subscriptions
add column if not exists grant_reason text;

alter table public.subscriptions
add column if not exists cancellation_reason text;

alter table public.subscriptions
add column if not exists cancelled_at timestamptz;

alter table public.subscriptions
add column if not exists trial_used boolean not null default false;

alter table public.subscriptions enable row level security;


create table if not exists public.blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  blocked_username text,
  created_at timestamptz not null default now(),
  unique(blocker_id, blocked_id)
);

create index if not exists blocks_blocker_id_idx on public.blocks(blocker_id, created_at desc);
create index if not exists blocks_blocked_id_idx on public.blocks(blocked_id);

alter table public.blocks enable row level security;




create table if not exists public.profile_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  post_ids uuid[] not null default '{}',
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profile_categories_user_id_created_at_idx on public.profile_categories(user_id, created_at desc);

alter table public.profile_categories enable row level security;





create table if not exists public.ad_campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  post_id uuid references public.posts(id) on delete set null,
  campaign_name text not null,
  budget numeric(10,2) not null default 0,
  duration_days integer not null default 7,
  target_audience jsonb not null default '{}',
  estimated_reach integer not null default 0,
  status text not null default 'active',
  campaign_type text not null default 'campaign',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ad_campaigns_user_id_created_at_idx on public.ad_campaigns(user_id, created_at desc);
create index if not exists ad_campaigns_post_id_idx on public.ad_campaigns(post_id);

alter table public.ad_campaigns enable row level security;



create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  participant_ids uuid[] not null,
  participant_usernames text[] not null default '{}',
  last_message text,
  last_message_time timestamptz,
  is_group boolean not null default false,
  group_name text,
  group_avatar text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists chats_participant_ids_gin_idx on public.chats using gin(participant_ids);
create index if not exists chats_last_message_time_idx on public.chats(last_message_time desc);

alter table public.chats enable row level security;





create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  sender_username text,
  sender_avatar text,
  text text,
  image_url text,
  video_url text,
  read_by uuid[] not null default '{}',
  reactions jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists messages_chat_id_created_at_idx on public.messages(chat_id, created_at);

alter table public.messages enable row level security;




create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  author_username text,
  author_avatar text,
  caption text,
  post_type text not null default 'feed',
  visibility text not null default 'public',
  image_url text,
  image_urls text[] not null default '{}',
  video_url text,
  video_link text,
  location text,
  map_visible boolean not null default false,
  map_city text,
  tags text,
  likes_count integer not null default 0,
  fire_count integer not null default 0,
  wow_count integer not null default 0,
  comments_count integer not null default 0,
  shares_count integer not null default 0,
  hashtags text[] not null default '{}',
  music_title text,
  music_artist text,
  music_preview_url text,
  music_artwork_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_created_at_idx on public.posts(created_at desc);
create index if not exists posts_author_id_idx on public.posts(author_id);

alter table public.posts enable row level security;





create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  created_at timestamptz not null default now(),
  unique(post_id, user_id, type)
);

create index if not exists reactions_post_id_idx on public.reactions(post_id);

alter table public.reactions enable row level security;




create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  text text not null,
  author_name text,
  author_username text,
  author_avatar text,
  likes_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists comments_post_id_created_at_idx on public.comments(post_id, created_at desc);

alter table public.comments enable row level security;




create table if not exists public.comment_reactions (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.comments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null default 'like',
  created_at timestamptz not null default now(),
  unique(comment_id, user_id, type)
);

create index if not exists comment_reactions_comment_id_idx on public.comment_reactions(comment_id);

alter table public.comment_reactions enable row level security;




create table if not exists public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  follower_username text,
  following_username text,
  follower_avatar text,
  following_avatar text,
  created_at timestamptz not null default now(),
  unique(follower_id, following_id),
  check (follower_id <> following_id)
);

create index if not exists follows_follower_id_idx on public.follows(follower_id);
create index if not exists follows_following_id_idx on public.follows(following_id);

alter table public.follows enable row level security;




create table if not exists public.follow_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  target_id uuid not null references auth.users(id) on delete cascade,
  requester_username text,
  requester_avatar text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(requester_id, target_id),
  check (requester_id <> target_id),
  check (status in ('pending', 'approved', 'rejected'))
);

create index if not exists follow_requests_target_status_idx on public.follow_requests(target_id, status);
create index if not exists follow_requests_requester_idx on public.follow_requests(requester_id);

alter table public.follow_requests enable row level security;





create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  username text,
  user_avatar text,
  image_url text,
  video_url text,
  caption text,
  story_type text not null default 'photo',
  bg_preset text,
  bg_value text,
  font_family text,
  font_id text,
  text_alignment text,
  font_size integer,
  location text,
  map_visible boolean not null default false,
  map_city text,
  views uuid[] not null default '{}',
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists stories_user_id_idx on public.stories(user_id);
create index if not exists stories_expires_at_idx on public.stories(expires_at);

alter table public.stories enable row level security;





create table if not exists public.legal_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  accepted_at timestamptz not null default now(),
  ip_address text,
  user_agent text,
  platform text,
  terms_version text,
  privacy_version text,
  guidelines_version text,
  app_version text,
  consent_method text,
  re_consent_reason text,
  created_at timestamptz not null default now()
);

create index if not exists legal_consents_user_id_accepted_at_idx on public.legal_consents(user_id, accepted_at desc);

alter table public.legal_consents enable row level security;



create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reported_user_id uuid references auth.users(id) on delete set null,
  post_id uuid references public.posts(id) on delete set null,
  reason text not null,
  status text not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status in ('pending', 'reviewed', 'actioned', 'dismissed'))
);

create index if not exists reports_reporter_id_created_at_idx on public.reports(reporter_id, created_at desc);
create index if not exists reports_status_created_at_idx on public.reports(status, created_at desc);
create index if not exists reports_reported_user_id_idx on public.reports(reported_user_id);
create index if not exists reports_post_id_idx on public.reports(post_id);

alter table public.reports enable row level security;



create table if not exists public.live_sessions (
  id uuid primary key default gen_random_uuid(),
  broadcaster_id uuid not null references auth.users(id) on delete cascade,
  broadcaster_name text,
  broadcaster_username text,
  broadcaster_avatar text,
  status text not null default 'active',
  viewer_count integer not null default 0,
  title text,
  stream_url text,
  replay_url text,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status in ('active', 'ended'))
);

create index if not exists live_sessions_status_started_at_idx on public.live_sessions(status, started_at desc);
create index if not exists live_sessions_broadcaster_id_idx on public.live_sessions(broadcaster_id);

alter table public.live_sessions enable row level security;





create table if not exists public.call_sessions (
  id uuid primary key default gen_random_uuid(),
  caller_id uuid not null references auth.users(id) on delete cascade,
  receiver_id uuid not null references auth.users(id) on delete cascade,
  type text not null default 'voice',
  status text not null default 'ringing',
  caller_name text,
  caller_avatar text,
  receiver_name text,
  receiver_avatar text,
  offer_sdp text,
  answer_sdp text,
  caller_ice text[] not null default '{}',
  receiver_ice text[] not null default '{}',
  accepted_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (type in ('voice', 'video')),
  check (status in ('ringing', 'accepted', 'declined', 'ended', 'missed'))
);

create index if not exists call_sessions_caller_id_created_at_idx on public.call_sessions(caller_id, created_at desc);
create index if not exists call_sessions_receiver_id_status_created_at_idx on public.call_sessions(receiver_id, status, created_at desc);

alter table public.call_sessions enable row level security;




create table if not exists public.missed_calls (
  id uuid primary key default gen_random_uuid(),
  receiver_id uuid not null references auth.users(id) on delete cascade,
  caller_id uuid references auth.users(id) on delete set null,
  caller_name text,
  caller_avatar text,
  call_type text not null default 'voice',
  call_session_id uuid references public.call_sessions(id) on delete set null,
  seen boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (call_type in ('voice', 'video'))
);

create index if not exists missed_calls_receiver_id_seen_created_at_idx on public.missed_calls(receiver_id, seen, created_at desc);
create index if not exists missed_calls_call_session_id_idx on public.missed_calls(call_session_id);

alter table public.missed_calls enable row level security;




create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  actor_username text,
  actor_avatar text,
  type text not null default 'system',
  message text,
  post_id uuid references public.posts(id) on delete set null,
  chat_id uuid references public.chats(id) on delete set null,
  read boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notifications_user_id_read_created_at_idx on public.notifications(user_id, read, created_at desc);
create index if not exists notifications_actor_id_idx on public.notifications(actor_id);

alter table public.notifications enable row level security;




create table if not exists public.preset_avatars (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  label text,
  gender text not null default 'unisex',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists preset_avatars_active_sort_idx on public.preset_avatars(is_active, sort_order);

alter table public.preset_avatars enable row level security;


insert into storage.buckets (id, name, public)
values ('spicey-media', 'spicey-media', true)
on conflict (id) do nothing;


