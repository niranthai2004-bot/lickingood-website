-- Phase A — make merchant_locations directly drive the customer site.
--
-- Adds the columns needed for public listing (phone, coordinates) plus a
-- globally-unique URL slug. Public reads happen through the service-role
-- /api/public/locations endpoint (sanitized) rather than direct RLS access,
-- so we don't need a public select policy here.

-- ─── New columns ───
alter table public.merchant_locations
  add column if not exists phone text;

alter table public.merchant_locations
  add column if not exists latitude numeric(9, 6);  -- safe for ±90.000000

alter table public.merchant_locations
  add column if not exists longitude numeric(10, 6); -- safe for ±180.000000

-- ─── Slug constraints ───
-- Slug must be unique across the platform so /order/pickup/[slug] is unambiguous.
-- Partial unique index lets us keep rows with NULL slug temporarily during
-- migration / initial sync.
create unique index if not exists merchant_locations_slug_unique_idx
  on public.merchant_locations(slug)
  where slug is not null;

-- Quick lookup index for the public listing endpoint
create index if not exists merchant_locations_active_idx
  on public.merchant_locations(is_active)
  where is_active = true;

-- ─── updated_at column + trigger ───
-- We didn't add one originally; we want to surface "last refreshed" data.
alter table public.merchant_locations
  add column if not exists updated_at timestamptz not null default now();

drop trigger if exists merchant_locations_set_updated_at on public.merchant_locations;
create trigger merchant_locations_set_updated_at
  before update on public.merchant_locations
  for each row execute function public.set_updated_at();
