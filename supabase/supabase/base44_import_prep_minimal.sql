-- Spicey minimal Base44 import prep.
-- Run this after schema_import_minimal.sql.
-- It only prepares ID mapping for the first import pass.

create table if not exists public.base44_user_id_map (
  legacy_base44_id text primary key,
  supabase_user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now(),
  imported_at timestamptz not null default now()
);

create table if not exists public.base44_record_id_map (
  entity text not null,
  legacy_base44_id text not null,
  supabase_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (entity, legacy_base44_id)
);

alter table public.base44_user_id_map enable row level security;
alter table public.base44_record_id_map enable row level security;

alter table public.profiles add column if not exists legacy_base44_profile_id text;
alter table public.profiles add column if not exists legacy_base44_user_id text;
alter table public.chats add column if not exists legacy_base44_id text;
alter table public.posts add column if not exists legacy_base44_id text;
alter table public.messages add column if not exists legacy_base44_id text;
alter table public.comments add column if not exists legacy_base44_id text;
alter table public.reactions add column if not exists legacy_base44_id text;
alter table public.follows add column if not exists legacy_base44_id text;
alter table public.stories add column if not exists legacy_base44_id text;
alter table public.notifications add column if not exists legacy_base44_id text;
alter table public.subscriptions add column if not exists legacy_base44_id text;
alter table public.legal_consents add column if not exists legacy_base44_id text;

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
