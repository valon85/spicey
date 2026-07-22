-- Fix Spicey video/voice calls on Supabase.
-- Run this once in Supabase SQL Editor, then rebuild/sync the iOS app.

alter table public.profiles add column if not exists push_token text;
alter table public.profiles add column if not exists voip_push_token text;
alter table public.profiles add column if not exists platform text;
alter table public.notifications add column if not exists chat_id uuid;

create table if not exists public.push_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token text not null unique,
  token_type text not null default 'apns',
  platform text not null default 'ios',
  device_id text,
  bundle_id text not null default 'com.base69fe90d3bbe7ad47925e4a0a.app',
  app_version text,
  environment text not null default 'production',
  enabled boolean not null default true,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (token_type in ('apns', 'voip'))
);

create index if not exists push_devices_user_type_enabled_idx
on public.push_devices(user_id, token_type, enabled);

create index if not exists push_devices_token_type_idx
on public.push_devices(token_type);

alter table public.push_devices enable row level security;

drop policy if exists "Users can read own push devices" on public.push_devices;
create policy "Users can read own push devices"
on public.push_devices
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can register own push devices" on public.push_devices;
create policy "Users can register own push devices"
on public.push_devices
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own push devices" on public.push_devices;
create policy "Users can update own push devices"
on public.push_devices
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create index if not exists profiles_push_token_idx
on public.profiles(push_token)
where push_token is not null;

create index if not exists profiles_voip_push_token_idx
on public.profiles(voip_push_token)
where voip_push_token is not null;

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
  legacy_base44_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (type in ('voice', 'video')),
  check (status in ('ringing', 'accepted', 'declined', 'ended', 'missed', 'cancelled'))
);

-- Existing installations may already have the older status check. Replace it
-- idempotently so caller cancellation can propagate to both devices.
do $$
declare
  constraint_name text;
begin
  for constraint_name in
    select conname
    from pg_constraint
    where conrelid = 'public.call_sessions'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%status%ringing%'
  loop
    execute format('alter table public.call_sessions drop constraint %I', constraint_name);
  end loop;
end $$;

alter table public.call_sessions
  add constraint call_sessions_status_check
  check (status in ('ringing', 'accepted', 'declined', 'ended', 'missed', 'cancelled'));

create index if not exists call_sessions_caller_id_created_at_idx
on public.call_sessions(caller_id, created_at desc);

create index if not exists call_sessions_receiver_id_status_created_at_idx
on public.call_sessions(receiver_id, status, created_at desc);

create unique index if not exists call_sessions_legacy_base44_id_idx
on public.call_sessions(legacy_base44_id)
where legacy_base44_id is not null;

alter table public.call_sessions enable row level security;

drop policy if exists "Call participants can read sessions" on public.call_sessions;
create policy "Call participants can read sessions"
on public.call_sessions
for select
to authenticated
using ((select auth.uid()) = caller_id or (select auth.uid()) = receiver_id);

drop policy if exists "Users can create outgoing call sessions" on public.call_sessions;
create policy "Users can create outgoing call sessions"
on public.call_sessions
for insert
to authenticated
with check ((select auth.uid()) = caller_id);

drop policy if exists "Call participants can update sessions" on public.call_sessions;
create policy "Call participants can update sessions"
on public.call_sessions
for update
to authenticated
using ((select auth.uid()) = caller_id or (select auth.uid()) = receiver_id)
with check ((select auth.uid()) = caller_id or (select auth.uid()) = receiver_id);

create table if not exists public.missed_calls (
  id uuid primary key default gen_random_uuid(),
  receiver_id uuid not null references auth.users(id) on delete cascade,
  caller_id uuid references auth.users(id) on delete set null,
  caller_name text,
  caller_avatar text,
  call_type text not null default 'voice',
  call_session_id uuid references public.call_sessions(id) on delete set null,
  seen boolean not null default false,
  legacy_base44_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (call_type in ('voice', 'video'))
);

create index if not exists missed_calls_receiver_id_seen_created_at_idx
on public.missed_calls(receiver_id, seen, created_at desc);

create index if not exists missed_calls_call_session_id_idx
on public.missed_calls(call_session_id);

create unique index if not exists missed_calls_legacy_base44_id_idx
on public.missed_calls(legacy_base44_id)
where legacy_base44_id is not null;

alter table public.missed_calls enable row level security;

drop policy if exists "Receivers can read own missed calls" on public.missed_calls;
create policy "Receivers can read own missed calls"
on public.missed_calls
for select
to authenticated
using ((select auth.uid()) = receiver_id);

drop policy if exists "Receivers can create own missed calls" on public.missed_calls;
create policy "Receivers can create own missed calls"
on public.missed_calls
for insert
to authenticated
with check ((select auth.uid()) = receiver_id);

drop policy if exists "Receivers can update own missed calls" on public.missed_calls;
create policy "Receivers can update own missed calls"
on public.missed_calls
for update
to authenticated
using ((select auth.uid()) = receiver_id)
with check ((select auth.uid()) = receiver_id);

grant select, insert, update, delete on public.call_sessions to authenticated;
grant select, insert, update, delete on public.missed_calls to authenticated;
grant select, insert, update, delete on public.push_devices to authenticated;

-- Polling remains available, but Realtime requires explicit publication.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'call_sessions'
  ) then
    alter publication supabase_realtime add table public.call_sessions;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;

notify pgrst, 'reload schema';
