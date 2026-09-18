-- Run this once in the Supabase project's SQL Editor
-- (https://supabase.com/dashboard/project/_/sql/new) to set up the tables
-- backing the "Pasukan & pemain" and "Pengadil" dashboard sections.

create extension if not exists "pgcrypto";

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  team_id text not null,
  name text not null,
  jersey_number int,
  created_at timestamptz not null default now()
);

create table if not exists referees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  level text,
  created_at timestamptz not null default now()
);

alter table players enable row level security;
alter table referees enable row level security;

-- Anyone can read (the public tournament site shows rosters to all visitors).
create policy "public read players" on players for select using (true);
create policy "public read referees" on referees for select using (true);

-- Only signed-in urusetia accounts can add, edit, or delete.
create policy "authenticated write players" on players for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "authenticated write referees" on referees for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Live match state (scores, status, quarter/clock, XY draw, tie-breaks,
-- shootouts) as a single shared row, so every visitor's phone sees the same
-- live updates the urusetia dashboard makes -- not just whichever browser
-- made the change. Only ever one row, id = 'main'.
create table if not exists tournament_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table tournament_state enable row level security;

create policy "public read tournament_state" on tournament_state for select using (true);

create policy "authenticated write tournament_state" on tournament_state for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Enables realtime change notifications for this table (Database > Replication
-- in the Supabase dashboard does the same thing) so every open browser
-- receives updates the instant urusetia saves a score.
alter publication supabase_realtime add table tournament_state;
