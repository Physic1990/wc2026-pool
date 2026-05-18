-- Run this in your Supabase SQL Editor

-- Table: entries (player predictions)
create table if not exists entries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  group_picks jsonb default '{}',
  third_place_picks jsonb default '[]',
  knockout_picks jsonb default '{}',
  champion text,
  golden_boot text,
  golden_glove text,
  golden_ball text,
  dark_horse text,
  created_at timestamptz default now()
);

-- Table: results (admin updates this after each match)
create table if not exists results (
  id int primary key,
  data jsonb default '{}',
  updated_at timestamptz default now()
);

-- Seed empty results row
insert into results (id, data) values (1, '{}') on conflict (id) do nothing;

-- Enable public read for leaderboard
alter table entries enable row level security;
alter table results enable row level security;

create policy "Public read entries" on entries for select using (true);
create policy "Public insert entries" on entries for insert with check (true);
create policy "Public read results" on results for select using (true);
create policy "Public upsert results" on results for all using (true);
