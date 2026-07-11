-- Spicey minimal Supabase schema for Base44 import.
-- This creates only the tables needed for the first safe import pass.
-- It does not delete, truncate, or overwrite existing data.

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
  website text,
  is_private boolean not null default false,
  is_verified boolean not null default false,
  verification_badge text,
  profile_theme text not null default 'dark',
  followers_count integer not null default 0,
  following_count integer not null default 0,
  posts_count integer not null default 0,
  legacy_base44_profile_id text,
  legacy_base44_user_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  participant_ids uuid[] not null default '{}',
  participant_usernames text[] not null default '{}',
  last_message text,
  last_message_time timestamptz,
  is_group boolean not null default false,
  group_name text,
  group_avatar text,
  legacy_base44_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  author_name text,
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
  legacy_base44_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  sender_username text,
  sender_avatar text,
  text text,
  image_url text,
  read_by uuid[] not null default '{}',
  reactions jsonb not null default '{}'::jsonb,
  legacy_base44_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  text text not null default '',
  author_name text,
  author_username text,
  author_avatar text,
  likes_count integer not null default 0,
  legacy_base44_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null default 'like',
  legacy_base44_id text,
  created_at timestamptz not null default now(),
  unique(post_id, user_id, type)
);

create table if not exists public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  follower_username text,
  following_username text,
  legacy_base44_id text,
  created_at timestamptz not null default now(),
  unique(follower_id, following_id)
);

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  username text,
  user_avatar text,
  image_url text,
  video_url text,
  caption text,
  story_type text not null default 'photo',
  location text,
  map_visible boolean not null default false,
  map_city text,
  views uuid[] not null default '{}',
  expires_at timestamptz not null,
  legacy_base44_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  actor_username text,
  actor_avatar text,
  type text not null default 'system',
  message text,
  post_id uuid references public.posts(id) on delete set null,
  read boolean not null default false,
  legacy_base44_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'active',
  plan text,
  provider text,
  granted_by_admin_email text,
  grant_reason text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  trial_used boolean not null default false,
  legacy_base44_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.legal_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  accepted_at timestamptz,
  ip_address text,
  user_agent text,
  platform text,
  terms_version text,
  privacy_version text,
  guidelines_version text,
  app_version text,
  consent_method text,
  re_consent_reason text,
  legacy_base44_id text,
  created_at timestamptz not null default now()
);

create unique index if not exists profiles_legacy_base44_profile_id_idx on public.profiles(legacy_base44_profile_id) where legacy_base44_profile_id is not null;
create unique index if not exists profiles_legacy_base44_user_id_idx on public.profiles(legacy_base44_user_id) where legacy_base44_user_id is not null;
create unique index if not exists chats_legacy_base44_id_idx on public.chats(legacy_base44_id) where legacy_base44_id is not null;
create unique index if not exists posts_legacy_base44_id_idx on public.posts(legacy_base44_id) where legacy_base44_id is not null;
create unique index if not exists messages_legacy_base44_id_idx on public.messages(legacy_base44_id) where legacy_base44_id is not null;
create unique index if not exists comments_legacy_base44_id_idx on public.comments(legacy_base44_id) where legacy_base44_id is not null;
create unique index if not exists reactions_legacy_base44_id_idx on public.reactions(legacy_base44_id) where legacy_base44_id is not null;
create unique index if not exists follows_legacy_base44_id_idx on public.follows(legacy_base44_id) where legacy_base44_id is not null;
create unique index if not exists stories_legacy_base44_id_idx on public.stories(legacy_base44_id) where legacy_base44_id is not null;
create unique index if not exists notifications_legacy_base44_id_idx on public.notifications(legacy_base44_id) where legacy_base44_id is not null;
create unique index if not exists subscriptions_legacy_base44_id_idx on public.subscriptions(legacy_base44_id) where legacy_base44_id is not null;
create unique index if not exists legal_consents_legacy_base44_id_idx on public.legal_consents(legacy_base44_id) where legacy_base44_id is not null;

alter table public.profiles enable row level security;
alter table public.chats enable row level security;
alter table public.posts enable row level security;
alter table public.messages enable row level security;
alter table public.comments enable row level security;
alter table public.reactions enable row level security;
alter table public.follows enable row level security;
alter table public.stories enable row level security;
alter table public.notifications enable row level security;
alter table public.subscriptions enable row level security;
alter table public.legal_consents enable row level security;
