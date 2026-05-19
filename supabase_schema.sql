-- WC2026 Pool — Supabase schema
-- Run this in your Supabase SQL Editor.
--
-- Authentication is handled by Supabase Auth (auth.users). This script:
--   1. (Re)creates app tables: entries, results, leagues, league_members
--   2. Sets up Row Level Security (RLS)
--   3. Adds a SECURITY DEFINER function `join_league(code)` for safe joining
--   4. Adds a trigger so a league's creator is auto-added as a member

-- ---------------------------------------------------------------------------
-- Clean slate (safe to run repeatedly during dev)
-- ---------------------------------------------------------------------------
-- Drop tables first with CASCADE; that automatically removes the trigger on
-- public.leagues. (We don't drop the trigger explicitly because
-- `drop trigger ... on public.leagues` errors out when the table itself
-- doesn't exist yet — `if exists` only guards the trigger name, not the
-- table reference.)
drop table if exists public.league_members cascade;
drop table if exists public.leagues        cascade;
drop table if exists public.entries        cascade;
drop table if exists public.results        cascade;

drop function if exists public.add_creator_as_member() cascade;
drop function if exists public.join_league(text)        cascade;

-- ---------------------------------------------------------------------------
-- entries: ONE bracket per user, shared across all leagues they join.
-- ---------------------------------------------------------------------------
create table public.entries (
  user_id           uuid        primary key references auth.users(id) on delete cascade,
  name              text        not null,
  group_picks       jsonb       default '{}'::jsonb,
  third_place_picks jsonb       default '{}'::jsonb,
  knockout_picks    jsonb       default '{}'::jsonb,
  champion          text,
  golden_boot       text,
  golden_glove      text,
  golden_ball       text,
  dark_horse        text,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- results: ONE global row (id = 1). The admin (password-gated) updates this.
-- ---------------------------------------------------------------------------
create table public.results (
  id          int          primary key,
  data        jsonb        default '{}'::jsonb,
  updated_at  timestamptz  default now()
);
insert into public.results (id, data) values (1, '{}'::jsonb)
  on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- leagues: invite-only groupings of users
-- ---------------------------------------------------------------------------
create table public.leagues (
  id           uuid        primary key default gen_random_uuid(),
  name         text        not null,
  invite_code  text        unique not null,
  created_by   uuid        not null references auth.users(id) on delete cascade,
  created_at   timestamptz default now()
);
create index leagues_invite_code_idx on public.leagues (invite_code);

-- ---------------------------------------------------------------------------
-- league_members: user ↔ league join table
-- ---------------------------------------------------------------------------
create table public.league_members (
  league_id  uuid        references public.leagues(id) on delete cascade,
  user_id    uuid        references auth.users(id)    on delete cascade,
  joined_at  timestamptz default now(),
  primary key (league_id, user_id)
);
create index league_members_user_idx on public.league_members (user_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.entries        enable row level security;
alter table public.results        enable row level security;
alter table public.leagues        enable row level security;
alter table public.league_members enable row level security;

-- entries: any authenticated user can read (so league leaderboards work).
-- Only the owner can insert or update their row.
create policy "entries_read_auth"   on public.entries
  for select to authenticated using (true);
create policy "entries_insert_own"  on public.entries
  for insert to authenticated with check (auth.uid() = user_id);
create policy "entries_update_own"  on public.entries
  for update to authenticated using (auth.uid() = user_id);

-- results: public read (so anyone can compute scores). Writes still gated
-- by the admin password in the client (no per-row auth here — keep simple).
create policy "results_read_public" on public.results
  for select using (true);
create policy "results_write_any"   on public.results
  for all using (true) with check (true);

-- leagues: any authenticated user can read all leagues. (Trade-off: minimal,
-- since league NAMES leak but joining still requires the invite code.)
-- Creating a league requires created_by = auth.uid().
create policy "leagues_read_auth"   on public.leagues
  for select to authenticated using (true);
create policy "leagues_insert_own"  on public.leagues
  for insert to authenticated with check (created_by = auth.uid());

-- league_members: authenticated users can read all rows. Writes go through
-- the join_league() function (security definer), so no direct insert policy.
create policy "members_read_auth"   on public.league_members
  for select to authenticated using (true);

-- ---------------------------------------------------------------------------
-- join_league(code): looks up league by invite_code and adds caller as member.
-- SECURITY DEFINER so it can insert into league_members (which has no insert
-- policy for normal users). Raises if code invalid.
-- ---------------------------------------------------------------------------
create or replace function public.join_league(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_league_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select id into v_league_id
    from public.leagues
   where invite_code = upper(trim(p_code));

  if v_league_id is null then
    raise exception 'Invalid invite code';
  end if;

  insert into public.league_members (league_id, user_id)
    values (v_league_id, auth.uid())
    on conflict do nothing;

  return v_league_id;
end;
$$;

grant execute on function public.join_league(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Trigger: auto-add league creator as a member
-- ---------------------------------------------------------------------------
create or replace function public.add_creator_as_member()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.league_members (league_id, user_id)
    values (new.id, new.created_by)
    on conflict do nothing;
  return new;
end;
$$;

create trigger leagues_creator_as_member
  after insert on public.leagues
  for each row execute function public.add_creator_as_member();
