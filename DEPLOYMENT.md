# Production deployment — Vercel + Porkbun + Square

Step-by-step. Do these in order.

---

## 1. Push to GitHub

If your project isn't on GitHub yet:

```bash
cd "C:\Users\thain\OneDrive\Desktop\Lickin Good Donuts\lickingood-website"
git add .
git commit -m "Prep for Vercel deployment"
git push
```

If you've never set up a remote: create a private GitHub repo named `lickingood-website` (or whatever you want), then:

```bash
git remote add origin https://github.com/YOUR-USERNAME/lickingood-website.git
git branch -M main
git push -u origin main
```

> ⚠️ Confirm `.env.local` is NOT in the repo. It's in `.gitignore` already — don't override.

---

## 2. Create the Vercel project

1. Go to https://vercel.com/new
2. Sign in with GitHub
3. **Import** your `lickingood-website` repo
4. Framework preset: Next.js (auto-detected)
5. Leave Build/Output settings as defaults
6. **DON'T click Deploy yet** — add env vars first (next step)

---

## 3. Add production environment variables in Vercel

In the import screen (or **Project Settings → Environment Variables** if already deployed), add these. Mark each as available for **Production**, **Preview**, and **Development** unless noted:

| Variable | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://tunybfxlndhlvaqjyaed.supabase.co` | Same as local |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_jTkvMyNcP9CR4BXJnR4VxQ_7PEZqyVS` | Same as local |
| `SUPABASE_SERVICE_ROLE_KEY` | *(your service role key)* | Server-only — keep secret |
| `NEXT_PUBLIC_APP_URL` | `https://lickingooddonuts.net` | **Production only** |
| `NEXT_PUBLIC_SQUARE_APP_ID` | *(production Square App ID — see step 5)* | starts with `sq0idp-` |
| `SQUARE_APP_SECRET` | *(production Square App Secret)* | starts with `sq0csp-` |
| `SQUARE_ENVIRONMENT` | `production` | Was `sandbox` locally |
| `ADMIN_EMAILS` | *(your email)* | Lets you into `/admin` |

For **Preview** deploys you can keep sandbox values — they're useful when testing PRs.

Click **Deploy**. Wait for the build to finish.

You'll get a URL like `lickingood-website-xxx.vercel.app`. Test it works (homepage loads). Don't worry that OAuth doesn't work yet — we still need to point the domain and update Square.

---

## 4. Connect Porkbun domain to Vercel

### A — In Vercel

1. **Project → Settings → Domains**
2. Type `lickingooddonuts.net` → **Add**
3. Vercel will show DNS records you need to add at your registrar. Note them down — you'll see either:
   - **A record** pointing the apex to `76.76.21.21`, OR
   - **Two ALIAS/CNAME records** for `@` and `www`
4. Also add `www.lickingooddonuts.net` (Vercel may suggest making one the primary and redirecting the other — pick `www` redirects to apex, or apex redirects to www — your call)

### B — In Porkbun

1. Sign in to https://porkbun.com → **Domain Management** → click `lickingooddonuts.net`
2. Click **DNS Records** (or the DNS icon next to the domain)
3. **Delete any existing A or CNAME records on `@` and `www`** if they conflict
4. Add these records:

For the apex `@` (root domain):
- **Type**: `A`
- **Host**: leave blank or `@`
- **Answer**: `76.76.21.21`
- **TTL**: `600` (or default)

For `www`:
- **Type**: `CNAME`
- **Host**: `www`
- **Answer**: `cname.vercel-dns.com`
- **TTL**: `600`

5. Save records

### C — Wait for DNS propagation + SSL

Back in Vercel → **Settings → Domains**, the status next to `lickingooddonuts.net` will go from "Invalid Configuration" → "Verifying" → "Valid". Usually 1–15 minutes, can take up to a few hours.

Once it shows **Valid Configuration**, Vercel auto-issues a free Let's Encrypt SSL cert. After 1–2 more minutes, https://lickingooddonuts.net loads with a valid lock icon.

Sanity check:
```
https://lickingooddonuts.net          → your homepage
https://lickingooddonuts.net/merchant → merchant landing
```

---

## 5. Switch Square to Production

In https://developer.squareup.com/apps → your `LIckInGoodDonuts` app:

1. At the top of the page, **flip the toggle from Sandbox → Production**
2. Click **Credentials** in the left sidebar (production view now)
3. Copy the **Production Application ID** (starts with `sq0idp-`)
4. Click **Show** next to **Production Application Secret**, copy it (starts with `sq0csp-`)

> ⚠️ Paste these directly into Vercel's env var panel — don't share production secrets in chat or commit them anywhere. Update:
> - `NEXT_PUBLIC_SQUARE_APP_ID` → the production App ID
> - `SQUARE_APP_SECRET` → the production secret
> - `SQUARE_ENVIRONMENT` → `production`

5. In the left sidebar, click **OAuth** (production view still)
6. Add the **Production Redirect URL**:
   ```
   https://lickingooddonuts.net/auth/callback
   ```
7. Click **Save**

8. Redeploy on Vercel (Deployments tab → "…" → **Redeploy**) so the new env vars take effect.

---

## 6. Square production app review

By default, production OAuth only works for **Square sellers you've explicitly invited** to your app (Square's anti-fraud measure). For a private beta of 1–3 shops, that's fine — your app stays unpublished and you add Authorized Sellers manually.

To open it up to anyone on the public internet, you'd submit the app for Square's review:

- Square Developer Dashboard → your app → **App details** (left sidebar)
- Fill in: app name, description, website URL, support email, privacy policy URL, terms of service URL
- Upload app icon + screenshots
- Click **Submit for review**

Approval typically takes 5–10 business days. Until you're approved, an Authorized-Sellers-only approach is the way to go.

---

## 7. Test the merchant flow end-to-end

After steps 1–5:

1. Sign in to **your** merchant account at https://lickingooddonuts.net/merchant/login
2. Navigate to the dashboard
3. Click **Continue with Square**
4. You should be redirected to **`connect.squareup.com`** (NOT sandbox)
5. Sign in with the real Square account you want to test with
6. Approve permissions
7. Square redirects to `https://lickingooddonuts.net/auth/callback`
8. App lands you on `/merchant/connecting` then `/merchant/dashboard?connected=1`
9. Dashboard shows **Connected to Square** with location count populated

If anything fails, check Vercel **Logs** for the production server console output — every step of the OAuth flow has `[Auth Callback]` / `[Square OAuth]` log lines.

---

## 8. Architecture confirmation (multi-tenant)

What's already in place — no changes needed:

- Each merchant has their own `auth.users` row, their own `merchants` row, their own `square_connections` row with their own tokens, their own `merchant_locations` rows
- **RLS policies** mean merchant A can never read merchant B's data — even if they somehow guess UUIDs
- **Each location's orders route to that merchant's Square POS** via `getValidAccessToken(merchant_id)` → uses that merchant's token
- **You never see merchant passwords** — Square handles seller sign-in
- **You never touch their money** — payouts go directly into their Square accounts, taxes are handled by Square, banking is theirs

You're a thin frontend on top of Square's existing money/inventory infrastructure. That's the legally-cleaner architecture.

---

## 9. Adding `lickingooddonuts.com` later

When the `.com` is yours:

1. Buy `lickingooddonuts.com` on Porkbun
2. In Vercel → **Settings → Domains** → add `lickingooddonuts.com`
3. Set up the same DNS records on Porkbun's side (A record `76.76.21.21` on apex + CNAME on www)
4. In Vercel's Domains panel, **make `lickingooddonuts.com` the primary domain** (use the "Set as primary" / "Redirect to primary" option)
5. Vercel will automatically 308 redirect `lickingooddonuts.net` → `lickingooddonuts.com` (you choose the direction)
6. **Update `NEXT_PUBLIC_APP_URL` env var to `https://lickingooddonuts.com`** and redeploy
7. **In Square Developer Dashboard**, update the production Redirect URL to `https://lickingooddonuts.com/auth/callback` (or add the .com alongside the .net for a transition period)
8. **In Supabase**, update the Redirect URLs allowlist (Authentication → URL Configuration) to include `.com` URLs

Old `.net` links keep working forever via Vercel's redirect — no broken bookmarks.

---

## 10. Vercel + GitHub: ongoing workflow

Once deployed, every `git push` to `main` auto-deploys to production. Every PR auto-deploys a preview URL. To make changes safely:

```bash
# in your local repo
git checkout -b some-feature
# ...edit files...
git add .
git commit -m "Add some feature"
git push -u origin some-feature
# open a PR on GitHub
# wait for Vercel preview URL in the PR
# merge to main when ready
```

---

## Common gotchas

| Symptom | Fix |
|---|---|
| `Couldn't exchange the authorization code with Square` | Verify Square's production redirect URL exactly matches `NEXT_PUBLIC_APP_URL + /auth/callback`. No trailing slashes, http vs https matches. |
| Invite emails not arriving | Supabase Dashboard → **Authentication → URL Configuration** → add both `https://lickingooddonuts.net/merchant/accept-invite` AND your `.vercel.app` preview URL to **Redirect URLs**. |
| `/admin` redirects you to login | Confirm your email is in `ADMIN_EMAILS` in Vercel env vars. Case-insensitive, comma-separated. |
| Build fails on Vercel | Check Vercel build logs. Usually means an env var is missing or there's a TypeScript error. The build runs `npm run build` exactly. |
| `useSearchParams()` Suspense error | Wrap the consuming component in `<Suspense fallback={null}>` — see `merchant/connect-square/page.tsx` for the pattern. |
| Square shows "Application is not authorized to access this seller's account" | The seller isn't on your Authorized Sellers list and your app isn't approved yet. Add them in Square Developer Dashboard → OAuth → Production tab. |
