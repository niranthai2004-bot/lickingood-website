-- Lickin' Good Donuts — Merchant Portal Schema
-- Run this in Supabase SQL Editor (or via `supabase db push`)
--
-- Tables: merchants, merchant_locations, square_connections, orders
-- Auth model: Merchants own a Supabase auth.users row (separate from Square).
-- Square OAuth tokens are stored server-side in square_connections.

-- ─────────────────────────────────────────────────────────────────────────────
-- Tables
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.merchants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  business_name text not null,
  owner_name text not null,
  email text not null,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists merchants_user_id_idx on public.merchants(user_id);

create table if not exists public.merchant_locations (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  -- Square Location ID — populated after OAuth + Locations API fetch
  square_location_id text,
  location_name text not null,
  address text,
  city text,
  state text,
  zip text,
  -- Used to map this merchant_location to a customer-facing slug
  slug text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(merchant_id, square_location_id)
);

create index if not exists merchant_locations_merchant_idx
  on public.merchant_locations(merchant_id);

create table if not exists public.square_connections (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade unique,
  access_token text not null,
  refresh_token text not null,
  -- Square's merchant_id (their identifier, distinct from ours)
  merchant_square_id text not null,
  expires_at timestamptz not null,
  scopes text[] not null default '{}',
  -- "sandbox" or "production" — for future audit / debugging
  environment text not null default 'sandbox',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  location_id uuid references public.merchant_locations(id) on delete set null,
  -- Square's order_id from Orders API
  square_order_id text not null unique,
  customer_email text,
  order_total_cents integer,
  -- mirrors Square order state: OPEN | COMPLETED | CANCELED | DRAFT
  status text not null default 'OPEN',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_merchant_idx on public.orders(merchant_id);
create index if not exists orders_location_idx on public.orders(location_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- updated_at triggers
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists merchants_set_updated_at on public.merchants;
create trigger merchants_set_updated_at
  before update on public.merchants
  for each row execute function public.set_updated_at();

drop trigger if exists square_connections_set_updated_at on public.square_connections;
create trigger square_connections_set_updated_at
  before update on public.square_connections
  for each row execute function public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- Row-level security
-- Merchants can only read/write their own rows.
-- square_connections is service-role only (no client write paths).
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.merchants enable row level security;
alter table public.merchant_locations enable row level security;
alter table public.square_connections enable row level security;
alter table public.orders enable row level security;

-- merchants
drop policy if exists "merchants_select_own" on public.merchants;
create policy "merchants_select_own" on public.merchants
  for select using (auth.uid() = user_id);

drop policy if exists "merchants_insert_own" on public.merchants;
create policy "merchants_insert_own" on public.merchants
  for insert with check (auth.uid() = user_id);

drop policy if exists "merchants_update_own" on public.merchants;
create policy "merchants_update_own" on public.merchants
  for update using (auth.uid() = user_id);

-- merchant_locations
drop policy if exists "locations_select_own" on public.merchant_locations;
create policy "locations_select_own" on public.merchant_locations
  for select using (
    merchant_id in (select id from public.merchants where user_id = auth.uid())
  );

drop policy if exists "locations_insert_own" on public.merchant_locations;
create policy "locations_insert_own" on public.merchant_locations
  for insert with check (
    merchant_id in (select id from public.merchants where user_id = auth.uid())
  );

drop policy if exists "locations_update_own" on public.merchant_locations;
create policy "locations_update_own" on public.merchant_locations
  for update using (
    merchant_id in (select id from public.merchants where user_id = auth.uid())
  );

-- square_connections — read your own, no client mutations
drop policy if exists "connections_select_own" on public.square_connections;
create policy "connections_select_own" on public.square_connections
  for select using (
    merchant_id in (select id from public.merchants where user_id = auth.uid())
  );

-- orders — read your own
drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own" on public.orders
  for select using (
    merchant_id in (select id from public.merchants where user_id = auth.uid())
  );
