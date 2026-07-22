-- Emergency privacy lock for Spicey chat.
-- Every chat/message read or write must be limited to authenticated participants.

alter table public.chats enable row level security;
alter table public.messages enable row level security;

drop policy if exists "Participants can view their chats" on public.chats;
drop policy if exists "Authenticated users can create chats" on public.chats;
drop policy if exists "Participants can update chat metadata" on public.chats;
drop policy if exists "Users can read own chats" on public.chats;
drop policy if exists "Users can create own chats" on public.chats;
drop policy if exists "Users can update own chats" on public.chats;
drop policy if exists "Users can delete own chats" on public.chats;

create policy "Users can read participant chats"
on public.chats
for select
to authenticated
using ((select auth.uid()) = any(participant_ids));

create policy "Users can create participant chats"
on public.chats
for insert
to authenticated
with check ((select auth.uid()) = any(participant_ids));

create policy "Users can update participant chats"
on public.chats
for update
to authenticated
using ((select auth.uid()) = any(participant_ids))
with check ((select auth.uid()) = any(participant_ids));

create policy "Users can delete participant chats"
on public.chats
for delete
to authenticated
using ((select auth.uid()) = any(participant_ids));

drop policy if exists "Participants can read messages" on public.messages;
drop policy if exists "Users can send messages" on public.messages;
drop policy if exists "Sender can delete own messages" on public.messages;
drop policy if exists "Users can read messages in own chats" on public.messages;
drop policy if exists "Users can send messages to own chats" on public.messages;
drop policy if exists "Users can delete own messages" on public.messages;

create policy "Users can read messages in participant chats"
on public.messages
for select
to authenticated
using (
  exists (
    select 1
    from public.chats c
    where c.id = messages.chat_id
      and (select auth.uid()) = any(c.participant_ids)
  )
);

create policy "Users can send messages in participant chats"
on public.messages
for insert
to authenticated
with check (
  sender_id = (select auth.uid())
  and exists (
    select 1
    from public.chats c
    where c.id = messages.chat_id
      and (select auth.uid()) = any(c.participant_ids)
  )
);

create policy "Users can delete own messages in participant chats"
on public.messages
for delete
to authenticated
using (
  sender_id = (select auth.uid())
  and exists (
    select 1
    from public.chats c
    where c.id = messages.chat_id
      and (select auth.uid()) = any(c.participant_ids)
  )
);
