-- Spicey iOS push + VoIP schema additions.
-- Safe to run after schema_import_minimal.sql. No deletes, no truncates.

alter table public.profiles add column if not exists push_token text;
alter table public.profiles add column if not exists voip_push_token text;
alter table public.profiles add column if not exists platform text;
alter table public.notifications add column if not exists chat_id uuid;

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
  check (status in ('ringing', 'accepted', 'declined', 'ended', 'missed'))
);

create index if not exists call_sessions_caller_id_created_at_idx
on public.call_sessions(caller_id, created_at desc);

create index if not exists call_sessions_receiver_id_status_created_at_idx
on public.call_sessions(receiver_id, status, created_at desc);

create unique index if not exists call_sessions_legacy_base44_id_idx
on public.call_sessions(legacy_base44_id)
where legacy_base44_id is not null;

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
