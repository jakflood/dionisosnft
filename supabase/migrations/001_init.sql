-- Dionisos MVP schema (Supabase Postgres)

create extension if not exists "uuid-ossp";

-- updated_at helper
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Partners (wineries, merchants, storage facilities)
create table if not exists partners (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  kind text not null check (kind in ('winery','merchant','storage','event_host')),
  created_at timestamptz not null default now()
);

-- Bottle/case passports (off-chain canonical metadata)
create table if not exists passports (
  id uuid primary key default uuid_generate_v4(),
  tag_id text not null unique,
  standard text check (standard in ('ERC721','ERC1155')),
  chain_id int,
  contract_address text,
  token_id text,

  producer text not null,
  label text not null,
  vintage int,
  region text,
  country text,
  size_ml int not null default 750,
  lot text,
  notes text,

  custody text not null default 'in_hand' check (custody in ('in_hand','in_storage','redeemed','disputed')),

  front_image_url text,
  back_image_url text,
  capsule_image_url text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Query helpers
create index if not exists passports_tag_id_idx on passports (tag_id);
create index if not exists passports_contract_token_idx on passports (contract_address, token_id);

drop trigger if exists passports_set_updated_at on passports;
create trigger passports_set_updated_at
before update on passports
for each row
execute procedure set_updated_at();

-- Append-only custody timeline
create table if not exists custody_events (
  id uuid primary key default uuid_generate_v4(),
  passport_id uuid not null references passports(id) on delete cascade,
  event_type text not null check (event_type in ('check_in','check_out','redeem','dispute','resolve')),
  from_state text,
  to_state text,
  partner_id uuid references partners(id),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists custody_events_passport_created_idx on custody_events (passport_id, created_at desc);

-- Signed partner attestations
create table if not exists attestations (
  id uuid primary key default uuid_generate_v4(),
  passport_id uuid not null references passports(id) on delete cascade,
  partner_id uuid not null references partners(id) on delete restrict,
  attestation_type text not null check (attestation_type in ('condition','storage_check_in','storage_check_out','origin','transfer_verification')),
  payload jsonb not null,
  signer_address text not null,
  signature text not null,
  created_at timestamptz not null default now()
);

create index if not exists attestations_passport_created_idx on attestations (passport_id, created_at desc);
create index if not exists attestations_partner_created_idx on attestations (partner_id, created_at desc);

-- Events & reservations
create table if not exists events (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  city text not null,
  venue text,
  starts_at timestamptz not null,
  capacity int not null,
  min_tier text check (min_tier in ('access','cellar','patron')),
  requires_wallet boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists events_starts_at_idx on events (starts_at);

create table if not exists reservations (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references events(id) on delete cascade,
  user_id uuid not null,
  seats int not null default 1,
  status text not null default 'reserved' check (status in ('reserved','cancelled','checked_in','no_show')),
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

-- Storage entitlements (derived from membership tier and/or explicit grants)
create table if not exists entitlements (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null,
  slots int not null,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- RLS (minimal, MVP-safe)
-- ---------------------------------------------------------------------------

alter table partners enable row level security;
alter table passports enable row level security;
alter table custody_events enable row level security;
alter table attestations enable row level security;
alter table events enable row level security;
alter table reservations enable row level security;
alter table entitlements enable row level security;

-- Public read for passports and verification data.
drop policy if exists "public read passports" on passports;
create policy "public read passports" on passports
for select to anon, authenticated
using (true);

drop policy if exists "public read custody events" on custody_events;
create policy "public read custody events" on custody_events
for select to anon, authenticated
using (true);

drop policy if exists "public read attestations" on attestations;
create policy "public read attestations" on attestations
for select to anon, authenticated
using (true);

drop policy if exists "public read events" on events;
create policy "public read events" on events
for select to anon, authenticated
using (true);

-- User-scoped reservations and entitlements (used later).
drop policy if exists "user read own reservations" on reservations;
create policy "user read own reservations" on reservations
for select to authenticated
using (auth.uid() = user_id);

drop policy if exists "user write own reservations" on reservations;
create policy "user write own reservations" on reservations
for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "user update own reservations" on reservations;
create policy "user update own reservations" on reservations
for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "user read own entitlements" on entitlements;
create policy "user read own entitlements" on entitlements
for select to authenticated
using (auth.uid() = user_id);
