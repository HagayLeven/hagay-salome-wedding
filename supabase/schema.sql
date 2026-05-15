-- Wedding Planner Supabase Schema

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- Trigger function to auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ── profiles ──────────────────────────────────────────────
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text,
  role text default 'editor',
  side text check (side in ('GROOM','BRIDE')),
  avatar text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create trigger profiles_updated_at before update on profiles
  for each row execute function update_updated_at();
alter table profiles enable row level security;
create policy "profiles_all" on profiles for all to authenticated using (true) with check (true);

-- ── guests ──────────────────────────────────────────────
create table if not exists guests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text default '',
  whatsapp text default '',
  side text not null check (side in ('GROOM','BRIDE')),
  "group" text not null check ("group" in ('FAMILY','FRIENDS','WORK','ARMY','OTHER')),
  rsvp_status text not null default 'PENDING' check (rsvp_status in ('PENDING','CONFIRMED','DECLINED')),
  invitation_sent boolean default false,
  invitation_sent_at timestamptz,
  invitation_acknowledged boolean default false,
  invitation_acknowledged_at timestamptz,
  attendance_confirmed boolean default false,
  attendance_confirmed_at timestamptz,
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create trigger guests_updated_at before update on guests
  for each row execute function update_updated_at();
alter table guests enable row level security;
create policy "guests_all" on guests for all to authenticated using (true) with check (true);

-- ── vendors ──────────────────────────────────────────────
create table if not exists vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('PHOTOGRAPHER','DJ','CATERING','DESIGN','BEAUTY','RABBI','AFTERPARTY','OTHER')),
  contact_name text,
  phone text,
  email text,
  price_quote numeric,
  rating int check (rating between 1 and 5),
  status text not null default 'SEARCHING' check (status in ('SEARCHING','MEETING','PROPOSAL','SIGNED','DEPOSIT','PAID')),
  notes text,
  photos text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create trigger vendors_updated_at before update on vendors
  for each row execute function update_updated_at();
alter table vendors enable row level security;
create policy "vendors_all" on vendors for all to authenticated using (true) with check (true);

-- ── venues ──────────────────────────────────────────────
create table if not exists venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text,
  capacity int,
  indoor boolean,
  kosher boolean,
  parking boolean,
  price_per_person numeric,
  flat_price numeric,
  contact_name text,
  phone text,
  rating int check (rating between 1 and 5),
  status text not null default 'INTERESTED' check (status in ('INTERESTED','VISITED','BOOKED','REJECTED')),
  notes text,
  photos text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create trigger venues_updated_at before update on venues
  for each row execute function update_updated_at();
alter table venues enable row level security;
create policy "venues_all" on venues for all to authenticated using (true) with check (true);

-- ── attire_items ──────────────────────────────────────────────
create table if not exists attire_items (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('DRESS','SUIT','VENUE_OUTFIT','PARTY_OUTFIT','JEWELRY','SHOES')),
  name text not null,
  designer text,
  store text,
  price numeric,
  rating int check (rating between 1 and 5),
  status text not null default 'BROWSING' check (status in ('BROWSING','TRYING','ORDERED','READY')),
  notes text,
  photos text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create trigger attire_items_updated_at before update on attire_items
  for each row execute function update_updated_at();
alter table attire_items enable row level security;
create policy "attire_items_all" on attire_items for all to authenticated using (true) with check (true);

-- ── quotes ──────────────────────────────────────────────
create table if not exists quotes (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('vendor','venue','attire')),
  entity_id uuid not null,
  entity_name text,
  title text not null,
  amount numeric not null,
  currency text not null default 'ILS',
  is_selected boolean not null default false,
  note text,
  received_at timestamptz not null default now(),
  valid_until timestamptz,
  installments jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create trigger quotes_updated_at before update on quotes
  for each row execute function update_updated_at();
alter table quotes enable row level security;
create policy "quotes_all" on quotes for all to authenticated using (true) with check (true);

-- ── budget ──────────────────────────────────────────────
create table if not exists budget (
  id uuid primary key default gen_random_uuid(),
  total_budget numeric not null default 0,
  wedding_date date,
  groom_name text,
  bride_name text,
  whatsapp_template text,
  language text default 'he',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create trigger budget_updated_at before update on budget
  for each row execute function update_updated_at();
alter table budget enable row level security;
create policy "budget_all" on budget for all to authenticated using (true) with check (true);

-- ── expenses ──────────────────────────────────────────────
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  category text not null check (category in ('VENUE','CATERING','PHOTOGRAPHY','MUSIC','ATTIRE','BEAUTY','OTHER')),
  amount numeric not null,
  is_paid boolean default false,
  date date not null,
  receipt text,
  notes text,
  linked_entity_type text,
  linked_entity_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create trigger expenses_updated_at before update on expenses
  for each row execute function update_updated_at();
alter table expenses enable row level security;
create policy "expenses_all" on expenses for all to authenticated using (true) with check (true);

-- ── media ──────────────────────────────────────────────
create table if not exists media (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  type text not null check (type in ('image','video')),
  caption text,
  entity_type text not null check (entity_type in ('vendor','venue','attire','inspiration')),
  entity_id uuid,
  entity_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create trigger media_updated_at before update on media
  for each row execute function update_updated_at();
alter table media enable row level security;
create policy "media_all" on media for all to authenticated using (true) with check (true);

-- ── tasks ──────────────────────────────────────────────
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  completed boolean default false,
  priority text not null default 'MEDIUM' check (priority in ('HIGH','MEDIUM','LOW')),
  assignee text not null default 'BOTH' check (assignee in ('HAGAY','SALOME','BOTH')),
  due_date date,
  category text,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create trigger tasks_updated_at before update on tasks
  for each row execute function update_updated_at();
alter table tasks enable row level security;
create policy "tasks_all" on tasks for all to authenticated using (true) with check (true);
