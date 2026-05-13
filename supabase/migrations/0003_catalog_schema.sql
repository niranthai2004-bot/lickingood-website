-- Phase B — Square Catalog sync per merchant.
--
-- Catalog data is split into normalized tables so:
--   1. Per-location availability can be tracked independently
--   2. Variation prices are queryable
--   3. Inventory state can be refreshed without rewriting item rows
--   4. RLS naturally scopes everything to the owning merchant
--
-- Owning merchant flows transitively: variation → item → merchant_id,
-- inventory → variation → item → merchant_id. We denormalize merchant_id
-- onto inventory rows for efficient RLS predicates and indexing.

-- ─── Categories (Donuts, Kolaches, Coffee, etc.) ───
create table if not exists public.merchant_catalog_categories (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  square_category_id text not null,
  name text not null,
  ordinal integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (merchant_id, square_category_id)
);

create index if not exists merchant_catalog_categories_merchant_idx
  on public.merchant_catalog_categories(merchant_id);

-- ─── Items ───
create table if not exists public.merchant_catalog_items (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  square_item_id text not null,
  square_category_id text,
  category_id uuid references public.merchant_catalog_categories(id) on delete set null,
  name text not null,
  description text,
  image_url text,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (merchant_id, square_item_id)
);

create index if not exists merchant_catalog_items_merchant_idx
  on public.merchant_catalog_items(merchant_id);
create index if not exists merchant_catalog_items_category_idx
  on public.merchant_catalog_items(category_id);

-- ─── Variations (Single / Half Dozen / Dozen, or just "Regular") ───
create table if not exists public.merchant_catalog_item_variations (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.merchant_catalog_items(id) on delete cascade,
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  square_variation_id text not null unique,
  name text not null,
  price_cents integer,
  currency text not null default 'USD',
  ordinal integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists merchant_catalog_variations_item_idx
  on public.merchant_catalog_item_variations(item_id);
create index if not exists merchant_catalog_variations_merchant_idx
  on public.merchant_catalog_item_variations(merchant_id);

-- ─── Per-location availability for each item ───
-- Square's `present_at_all_locations` / `present_at_location_ids` / `absent_at_location_ids`
-- collapse into one boolean per (item, location).
create table if not exists public.merchant_catalog_item_locations (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.merchant_catalog_items(id) on delete cascade,
  location_id uuid not null references public.merchant_locations(id) on delete cascade,
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  is_available boolean not null default true,
  updated_at timestamptz not null default now(),
  unique (item_id, location_id)
);

create index if not exists merchant_catalog_item_locations_item_idx
  on public.merchant_catalog_item_locations(item_id);
create index if not exists merchant_catalog_item_locations_location_idx
  on public.merchant_catalog_item_locations(location_id);

-- ─── Inventory counts per variation per location ───
create table if not exists public.merchant_catalog_inventory (
  id uuid primary key default gen_random_uuid(),
  variation_id uuid not null references public.merchant_catalog_item_variations(id) on delete cascade,
  location_id uuid not null references public.merchant_locations(id) on delete cascade,
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  stock_count integer,
  state text,
  updated_at timestamptz not null default now(),
  unique (variation_id, location_id)
);

create index if not exists merchant_catalog_inventory_variation_idx
  on public.merchant_catalog_inventory(variation_id);
create index if not exists merchant_catalog_inventory_location_idx
  on public.merchant_catalog_inventory(location_id);

-- ─── updated_at triggers ───
drop trigger if exists merchant_catalog_categories_set_updated_at
  on public.merchant_catalog_categories;
create trigger merchant_catalog_categories_set_updated_at
  before update on public.merchant_catalog_categories
  for each row execute function public.set_updated_at();

drop trigger if exists merchant_catalog_items_set_updated_at
  on public.merchant_catalog_items;
create trigger merchant_catalog_items_set_updated_at
  before update on public.merchant_catalog_items
  for each row execute function public.set_updated_at();

drop trigger if exists merchant_catalog_variations_set_updated_at
  on public.merchant_catalog_item_variations;
create trigger merchant_catalog_variations_set_updated_at
  before update on public.merchant_catalog_item_variations
  for each row execute function public.set_updated_at();

drop trigger if exists merchant_catalog_item_locations_set_updated_at
  on public.merchant_catalog_item_locations;
create trigger merchant_catalog_item_locations_set_updated_at
  before update on public.merchant_catalog_item_locations
  for each row execute function public.set_updated_at();

drop trigger if exists merchant_catalog_inventory_set_updated_at
  on public.merchant_catalog_inventory;
create trigger merchant_catalog_inventory_set_updated_at
  before update on public.merchant_catalog_inventory
  for each row execute function public.set_updated_at();

-- ─── RLS — only owning merchant can read; writes via service role ───
alter table public.merchant_catalog_categories enable row level security;
alter table public.merchant_catalog_items enable row level security;
alter table public.merchant_catalog_item_variations enable row level security;
alter table public.merchant_catalog_item_locations enable row level security;
alter table public.merchant_catalog_inventory enable row level security;

drop policy if exists "catalog_categories_select_own"
  on public.merchant_catalog_categories;
create policy "catalog_categories_select_own"
  on public.merchant_catalog_categories
  for select using (
    merchant_id in (select id from public.merchants where user_id = auth.uid())
  );

drop policy if exists "catalog_items_select_own"
  on public.merchant_catalog_items;
create policy "catalog_items_select_own"
  on public.merchant_catalog_items
  for select using (
    merchant_id in (select id from public.merchants where user_id = auth.uid())
  );

drop policy if exists "catalog_variations_select_own"
  on public.merchant_catalog_item_variations;
create policy "catalog_variations_select_own"
  on public.merchant_catalog_item_variations
  for select using (
    merchant_id in (select id from public.merchants where user_id = auth.uid())
  );

drop policy if exists "catalog_item_locations_select_own"
  on public.merchant_catalog_item_locations;
create policy "catalog_item_locations_select_own"
  on public.merchant_catalog_item_locations
  for select using (
    merchant_id in (select id from public.merchants where user_id = auth.uid())
  );

drop policy if exists "catalog_inventory_select_own"
  on public.merchant_catalog_inventory;
create policy "catalog_inventory_select_own"
  on public.merchant_catalog_inventory
  for select using (
    merchant_id in (select id from public.merchants where user_id = auth.uid())
  );
