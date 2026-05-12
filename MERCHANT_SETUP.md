# Merchant Portal — Setup Guide

The merchant portal + Square integration is built. Three things you need to do
once before the OAuth flow will actually exchange tokens:

## 1. Run the Supabase migration

Open Supabase Dashboard → SQL Editor → New query → paste the contents of
`supabase/migrations/0001_merchant_schema.sql` → Run.

This creates:

- `merchants` — one row per business owner (linked to `auth.users`)
- `merchant_locations` — shops the merchant operates (mapped to Square Location IDs)
- `square_connections` — OAuth tokens (service-role-only writes)
- `orders` — cached order records from Square
- RLS policies so merchants only see their own rows

## 2. Create the Square Developer App

1. Go to https://developer.squareup.com/apps and sign in.
2. Click **+ Create Application** → name it `Lickin' Good Donuts Platform`.
3. In the app's **OAuth** tab, add this **Redirect URL**:
   - Development: `http://localhost:3000/auth/callback`
   - Production (later): `https://yourdomain.com/auth/callback`
4. Copy the **Application ID** and **Application Secret** from the OAuth tab.

## 3. Fill in `.env.local`

```env
# Already there
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...

# Add these:
SUPABASE_SERVICE_ROLE_KEY=<from Supabase Dashboard → Project Settings → API → service_role secret>
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SQUARE_APPLICATION_ID=<from Square Developer Dashboard>
SQUARE_APPLICATION_SECRET=<from Square Developer Dashboard>
SQUARE_ENVIRONMENT=sandbox
```

Restart `npm run dev` after editing `.env.local`.

## How the flow works

1. Merchant visits `/merchant` and clicks **Create merchant account**.
2. Signup wizard: business info → first location → "Connect Square".
3. **Connect Square** button hits `/api/square/connect`. This route:
   - Generates a random CSRF `state`, drops it into an http-only cookie.
   - Redirects to `https://connect.squareup.com/oauth2/authorize?...`.
4. Merchant signs in to Square (we never see their password) and approves the
   requested scopes.
5. Square redirects back to `/auth/callback?code=...&state=...`. The handler:
   - Verifies `state` matches the cookie.
   - Calls Square's `/oauth2/token` to exchange the code for an
     `access_token` + `refresh_token` + Square `merchant_id`.
   - Looks up the current Supabase user → finds their `merchants` row.
   - Upserts a `square_connections` row with the tokens (service role bypasses
     RLS — clients can never write here).
   - Redirects to `/merchant/dashboard?connected=1`.

## What's wired up

- ✅ Supabase Auth (sign up, sign in, sign out)
- ✅ Merchant schema with RLS policies
- ✅ Square OAuth authorize → callback → token storage round-trip
- ✅ Connect-Square page with status panel (connected vs not)
- ✅ Dashboard with stat cards + connection prompt
- ✅ Sidebar shell for all merchant pages
- ✅ Customer Navbar/Footer hide on `/merchant/*` paths

## What's NOT wired yet (next iterations)

These need additional code on top of the OAuth foundation:

- **Square Catalog API sync** — call `GET /v2/catalog/list` per merchant, store
  items into a `catalog_items` table or pull live on each menu render.
- **Square Locations API sync** — call `GET /v2/locations`, upsert into
  `merchant_locations` with the real `square_location_id`s.
- **Square Inventory API sync** — call `GET /v2/inventory/counts/batch-retrieve`
  per location, expose as `availability` on each item.
- **Orders → Square POS routing** — on checkout, call `POST /v2/orders` and
  `POST /v2/payments` against the right merchant's token; store the
  `square_order_id` in our `orders` table.
- **Webhooks** — subscribe to `inventory.count.updated`,
  `catalog.version.updated`, `order.updated` for near-real-time syncs.
- **Token refresh middleware** — `refreshAccessToken()` is in `lib/square/oauth.ts`;
  add a wrapper that auto-refreshes when `expires_at < now() + 24h`.
- **Per-location customer menu** — `/order/pickup/[slug]` currently uses static
  `fullMenu`; swap to fetch from each location's Square catalog once tokens are
  stored.
- **Webhook signing key verification** — add `SQUARE_WEBHOOK_SIGNATURE_KEY` env
  var and an HMAC verifier in any webhook handlers you add.

## File index

- `supabase/migrations/0001_merchant_schema.sql` — DB schema
- `src/lib/supabase/server.ts` — server-side Supabase clients (user + service-role)
- `src/lib/square/oauth.ts` — URL builder, token exchange, refresh
- `src/app/api/square/connect/route.ts` — OAuth initiation
- `src/app/auth/callback/route.ts` — OAuth callback
- `src/app/merchant/page.tsx` — public landing
- `src/app/merchant/login/page.tsx`
- `src/app/merchant/signup/page.tsx` (3-step wizard)
- `src/app/merchant/dashboard/page.tsx`
- `src/app/merchant/connect-square/page.tsx`
- `src/app/merchant/locations/page.tsx`
- `src/app/merchant/orders/page.tsx`
- `src/app/merchant/menu/page.tsx`
- `src/app/merchant/settings/page.tsx`
- `src/components/merchant/MerchantShell.tsx`
- `src/components/layout/Navbar.tsx` (hides on `/merchant/*`)
- `src/components/layout/Footer.tsx` (hides on `/merchant/*`)
