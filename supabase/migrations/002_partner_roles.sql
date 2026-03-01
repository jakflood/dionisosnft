-- Dionisos MVP: partner users + partner-gated writes

-- Link Supabase auth users to partners.
create table if not exists partner_users (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  partner_id uuid not null references partners(id) on delete cascade,
  role text not null check (role in ('admin','staff')),
  created_at timestamptz not null default now(),
  unique (user_id, partner_id)
);

create index if not exists partner_users_user_idx on partner_users (user_id);
create index if not exists partner_users_partner_idx on partner_users (partner_id);

alter table partner_users enable row level security;

-- Allow partner members to read their partner records (for UI display).
drop policy if exists "partner members read partners" on partners;
create policy "partner members read partners" on partners
for select to authenticated
using (
  exists (
    select 1 from partner_users pu
    where pu.user_id = auth.uid() and pu.partner_id = partners.id
  )
);

-- Issuer partner on passports.
alter table passports add column if not exists issuer_partner_id uuid references partners(id);
create index if not exists passports_issuer_partner_idx on passports (issuer_partner_id);

-- Persist the signed message used for verification.
alter table attestations add column if not exists message text;

-- Helper: is the current user a member of the partner?
create or replace function is_partner_member(p_partner_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from partner_users pu
    where pu.user_id = auth.uid() and pu.partner_id = p_partner_id
  );
$$;

-- ---------------------------------------------------------------------------
-- RLS policies
-- ---------------------------------------------------------------------------

-- Partner members can see their own memberships.
drop policy if exists "partner users read own" on partner_users;
create policy "partner users read own" on partner_users
for select to authenticated
using (auth.uid() = user_id);

-- Writes are intentionally NOT allowed from the client for partner_users.
-- Create partner_users via service role / SQL editor (admin) only.

-- Passports: allow partner members to insert passports for their partner.
drop policy if exists "partner insert passports" on passports;
create policy "partner insert passports" on passports
for insert to authenticated
with check (
  issuer_partner_id is not null and is_partner_member(issuer_partner_id)
);

-- Custody events: allow partner members to insert events for passports they issued.
-- partner_id must match the issuer partner.
drop policy if exists "partner insert custody events" on custody_events;
create policy "partner insert custody events" on custody_events
for insert to authenticated
with check (
  partner_id is not null
  and is_partner_member(partner_id)
  and exists (
    select 1 from passports p
    where p.id = custody_events.passport_id and p.issuer_partner_id = custody_events.partner_id
  )
);

-- Attestations: allow partner members to insert attestations for passports they issued.
drop policy if exists "partner insert attestations" on attestations;
create policy "partner insert attestations" on attestations
for insert to authenticated
with check (
  is_partner_member(partner_id)
  and exists (
    select 1 from passports p
    where p.id = attestations.passport_id and p.issuer_partner_id = attestations.partner_id
  )
);

-- Events: allow event_host partners to create events.
drop policy if exists "partner insert events" on events;
create policy "partner insert events" on events
for insert to authenticated
with check (
  exists (
    select 1
    from partner_users pu
    join partners par on par.id = pu.partner_id
    where pu.user_id = auth.uid() and par.kind = 'event_host'
  )
);

-- ---------------------------------------------------------------------------
-- Keep passports.custody consistent: update on custody_events insert.
-- We do this with a SECURITY DEFINER trigger to avoid client-side passport updates.
-- ---------------------------------------------------------------------------

create or replace function apply_custody_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  next_state text;
begin
  -- prefer explicit to_state if provided
  next_state := new.to_state;

  if next_state is null then
    if new.event_type in ('check_in') then
      next_state := 'in_storage';
    elsif new.event_type in ('check_out') then
      next_state := 'in_hand';
    elsif new.event_type in ('redeem') then
      next_state := 'redeemed';
    elsif new.event_type in ('dispute') then
      next_state := 'disputed';
    elsif new.event_type in ('resolve') then
      next_state := coalesce(new.from_state, 'in_hand');
    end if;
  end if;

  if next_state is not null then
    update passports set custody = next_state where id = new.passport_id;
  end if;
  return new;
end;
$$;

drop trigger if exists custody_events_apply_state on custody_events;
create trigger custody_events_apply_state
after insert on custody_events
for each row
execute procedure apply_custody_event();
