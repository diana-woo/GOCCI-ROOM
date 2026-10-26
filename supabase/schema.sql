-- Run in Supabase SQL Editor. Enable Anonymous Sign-ins under Auth > Providers.
create extension if not exists pgcrypto;
create table if not exists public.rooms (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 wallpaper text not null default 'pink' check (wallpaper in ('pink','blue','green','cream')),
 furniture jsonb not null default '[{"id":"bed-1","kind":"bed","x":26,"y":49},{"id":"plant-1","kind":"plant","x":74,"y":42}]'::jsonb,
 created_at timestamptz not null default now()
);
create table if not exists public.room_members (
 room_id uuid not null references public.rooms(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 nickname text not null default '친구',
 joined_at timestamptz not null default now(),
 primary key(room_id,user_id)
);
-- Member avatar and expression selections (safe to run for existing rooms).
alter table public.room_members add column if not exists character text not null default 'chiikawa';
alter table public.room_members add column if not exists mood text not null default 'happy';
alter table public.room_members drop constraint if exists room_members_character_check;
alter table public.room_members add constraint room_members_character_check check (character in ('chiikawa','hachiware','usagi'));
alter table public.room_members drop constraint if exists room_members_mood_check;
alter table public.room_members add constraint room_members_mood_check check (mood in ('happy','shy','surprised','sleepy'));
create table if not exists public.messages (
 id bigint generated always as identity primary key,
 room_id uuid not null references public.rooms(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 body text not null check (char_length(body) between 1 and 500),
 created_at timestamptz not null default now()
);
create index if not exists messages_room_idx on public.messages(room_id,created_at);
alter table public.rooms enable row level security;
alter table public.room_members enable row level security;
alter table public.messages enable row level security;
-- Membership is verified through a SECURITY DEFINER function to avoid recursive RLS.
create or replace function public.is_room_member(p_room uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.room_members where room_id=p_room and user_id=(select auth.uid()));
$$;
revoke all on function public.is_room_member(uuid) from public;
grant execute on function public.is_room_member(uuid) to authenticated;
drop policy if exists "members read rooms" on public.rooms;
create policy "members read rooms" on public.rooms for select to authenticated using (public.is_room_member(id));
drop policy if exists "owner updates room" on public.rooms;
create policy "owner updates room" on public.rooms for update to authenticated using (owner_id=(select auth.uid())) with check (owner_id=(select auth.uid()));
drop policy if exists "members read membership" on public.room_members;
create policy "members read membership" on public.room_members for select to authenticated using (public.is_room_member(room_id));
-- Each person can change only their own profile within the room.
drop policy if exists "member updates own avatar" on public.room_members;
create policy "member updates own avatar" on public.room_members
for update to authenticated using (user_id=(select auth.uid()))
with check (user_id=(select auth.uid()));
drop policy if exists "members read messages" on public.messages;
create policy "members read messages" on public.messages for select to authenticated using (public.is_room_member(room_id));
drop policy if exists "members send messages" on public.messages;
create policy "members send messages" on public.messages for insert to authenticated with check (public.is_room_member(room_id) and user_id=(select auth.uid()));
-- Atomic creation and two-person join. Room UUID serves as unguessable invitation token.
create or replace function public.create_room(p_nickname text default '나') returns uuid
language plpgsql security definer set search_path='' as $$
declare rid uuid;
begin
 if auth.uid() is null then raise exception 'Sign in required'; end if;
 insert into public.rooms(owner_id) values(auth.uid()) returning id into rid;
 insert into public.room_members(room_id,user_id,nickname) values(rid,auth.uid(),left(coalesce(nullif(trim(p_nickname),''),'나'),20));
 return rid;
end $$;
create or replace function public.join_room(p_room uuid,p_nickname text default '친구') returns boolean
language plpgsql security definer set search_path='' as $$
declare n integer;
begin
 if auth.uid() is null then raise exception 'Sign in required'; end if;
 perform 1 from public.rooms where id=p_room for update;
 if not found then raise exception 'Room not found'; end if;
 if exists(select 1 from public.room_members where room_id=p_room and user_id=auth.uid()) then return true; end if;
 select count(*) into n from public.room_members where room_id=p_room;
 if n>=2 then raise exception 'Room is full'; end if;
 insert into public.room_members(room_id,user_id,nickname,character) values(p_room,auth.uid(),left(coalesce(nullif(trim(p_nickname),''),'친구'),20),'hachiware');
 return true;
end $$;
revoke all on function public.create_room(text) from public;
revoke all on function public.join_room(uuid,text) from public;
grant execute on function public.create_room(text),public.join_room(uuid,text) to authenticated;
-- Add tables to realtime publication once (ignore duplicate_object).
do $$ begin
 alter publication supabase_realtime add table public.rooms,public.room_members,public.messages;
exception when duplicate_object then null; end $$;
