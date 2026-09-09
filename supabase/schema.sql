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
