-- Phase E — hours + fulfillment per location.
--
-- Pulls in the data we already had access to from Square's
-- /v2/locations response but weren't storing:
--   timezone        : IANA tz, needed for "Open now?" computation
--   business_hours  : JSONB array of {day_of_week, start_local_time,
--                     end_local_time} periods exactly as Square returns
--   business_email  : surfaced on contact / merchant pages
--   description     : merchant's shop blurb (optional)
--
-- Plus two merchant-controllable flags so a merchant can disable a
-- single fulfillment channel without disabling the whole location:
--   pickup_enabled
--   delivery_enabled
--
-- These default to TRUE on insert. Sync explicitly does NOT include them
-- in the upsert payload, so re-syncing from Square preserves the merchant's
-- choices.

alter table public.merchant_locations
  add column if not exists timezone text;

alter table public.merchant_locations
  add column if not exists business_hours jsonb;

alter table public.merchant_locations
  add column if not exists business_email text;

alter table public.merchant_locations
  add column if not exists description text;

alter table public.merchant_locations
  add column if not exists pickup_enabled boolean not null default true;

alter table public.merchant_locations
  add column if not exists delivery_enabled boolean not null default true;
