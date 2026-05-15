-- Locations: archive support (soft-delete).
--
-- Three states a location can be in:
--   1. Live + active   : archived_at IS NULL AND is_active = true
--                        → visible to customers + appears in merchant portal
--   2. Live + hidden   : archived_at IS NULL AND is_active = false
--                        → hidden from customers (Square IDs stay synced;
--                          merchant just disabled it temporarily)
--   3. Archived        : archived_at IS NOT NULL
--                        → hidden from customers AND hidden by default in
--                          the merchant portal. Soft-delete: Square sync
--                          won't unarchive (we filter archived rows out
--                          during upsert so re-pulling from Square doesn't
--                          resurrect old/test stores)
--
-- We keep archived rows around (not hard-deleted) because Square's
-- location IDs are stable — if a merchant un-archives later, we want the
-- row + all of its catalog joins still intact.

alter table public.merchant_locations
  add column if not exists archived_at timestamptz;

create index if not exists merchant_locations_archived_at_idx
  on public.merchant_locations(archived_at);

-- Partial index for the most common query (customer-facing public read):
-- "active, non-archived locations only".
create index if not exists merchant_locations_visible_idx
  on public.merchant_locations(merchant_id)
  where is_active = true and archived_at is null;
