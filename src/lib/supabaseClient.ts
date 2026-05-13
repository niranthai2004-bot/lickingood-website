import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// Accept either env var name — Supabase renamed the public key from
// NEXT_PUBLIC_SUPABASE_ANON_KEY to NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.
// Both still refer to the same value.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

/**
 * Throw lazily on first method access if env vars weren't injected.
 *
 * Throwing eagerly at module load broke unrelated prerender steps during
 * `next build` (e.g. /_not-found) on Vercel projects that don't actually
 * have the Supabase env vars set — even though no real rendered page on
 * those projects needs Supabase. Lazy stub: build passes, real callers
 * still get a loud error the moment they touch supabase.*.
 */
function makeLazyClient(): SupabaseClient {
  if (supabaseUrl && supabaseKey) {
    return createBrowserClient(supabaseUrl, supabaseKey);
  }
  const err = new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY",
  );
  return new Proxy({} as SupabaseClient, {
    get() {
      throw err;
    },
  });
}

export const supabase = makeLazyClient();
