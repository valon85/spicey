-- Restore the authenticated social write paths without weakening RLS.

alter table public.posts enable row level security;
alter table public.profiles enable row level security;
alter table public.follows enable row level security;
alter table public.notifications enable row level security;
alter table public.stories enable row level security;
alter table public.comments enable row level security;

drop policy if exists "posts_read_visible" on public.posts;
create policy "posts_read_visible" on public.posts for select to authenticated
using (visibility = 'public' or author_id = (select auth.uid()));
drop policy if exists "posts_insert_own" on public.posts;
create policy "posts_insert_own" on public.posts for insert to authenticated
with check (author_id = (select auth.uid()));
drop policy if exists "posts_update_own" on public.posts;
create policy "posts_update_own" on public.posts for update to authenticated
using (author_id = (select auth.uid())) with check (author_id = (select auth.uid()));
drop policy if exists "posts_delete_own" on public.posts;
create policy "posts_delete_own" on public.posts for delete to authenticated
using (author_id = (select auth.uid()));

drop policy if exists "profiles_read_authenticated" on public.profiles;
create policy "profiles_read_authenticated" on public.profiles for select to authenticated using (true);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert to authenticated
with check (user_id = (select auth.uid()));
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update to authenticated
using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy if exists "follows_read_authenticated" on public.follows;
create policy "follows_read_authenticated" on public.follows for select to authenticated using (true);
drop policy if exists "follows_insert_own" on public.follows;
create policy "follows_insert_own" on public.follows for insert to authenticated
with check (follower_id = (select auth.uid()) and follower_id <> following_id);
drop policy if exists "follows_delete_own" on public.follows;
create policy "follows_delete_own" on public.follows for delete to authenticated
using (follower_id = (select auth.uid()));

drop policy if exists "notifications_read_own" on public.notifications;
create policy "notifications_read_own" on public.notifications for select to authenticated
using (user_id = (select auth.uid()));
drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own" on public.notifications for update to authenticated
using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists "notifications_delete_own" on public.notifications;
create policy "notifications_delete_own" on public.notifications for delete to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "stories_read_active" on public.stories;
create policy "stories_read_active" on public.stories for select to authenticated
using (user_id = (select auth.uid()) or expires_at > now());
drop policy if exists "stories_insert_own" on public.stories;
create policy "stories_insert_own" on public.stories for insert to authenticated
with check (user_id = (select auth.uid()));
drop policy if exists "stories_update_own" on public.stories;
create policy "stories_update_own" on public.stories for update to authenticated
using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists "stories_delete_own" on public.stories;
create policy "stories_delete_own" on public.stories for delete to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "comments_read_authenticated" on public.comments;
create policy "comments_read_authenticated" on public.comments for select to authenticated using (true);
drop policy if exists "comments_insert_own" on public.comments;
create policy "comments_insert_own" on public.comments for insert to authenticated
with check (author_id = (select auth.uid()));
drop policy if exists "comments_update_own" on public.comments;
create policy "comments_update_own" on public.comments for update to authenticated
using (author_id = (select auth.uid())) with check (author_id = (select auth.uid()));
drop policy if exists "comments_delete_own" on public.comments;
create policy "comments_delete_own" on public.comments for delete to authenticated
using (author_id = (select auth.uid()));

-- The client has explicit connected/cancelled states; keep the database contract aligned.
alter table public.call_sessions add column if not exists connected_at timestamptz;
alter table public.call_sessions drop constraint if exists call_sessions_status_check;
alter table public.call_sessions add constraint call_sessions_status_check
check (status in ('ringing', 'accepted', 'connected', 'declined', 'ended', 'missed', 'cancelled'));

create index if not exists posts_author_created_idx on public.posts (author_id, created_at desc);
create index if not exists follows_follower_idx on public.follows (follower_id);
create index if not exists follows_following_idx on public.follows (following_id);
create index if not exists notifications_user_created_idx on public.notifications (user_id, created_at desc);
