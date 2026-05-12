import { createBrowserClient } from "@supabase/ssr";

// Accept either env var name — Supabase renamed the public key from
// NEXT_PUBLIC_SUPABASE_ANON_KEY to NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.
// Both still refer to the same value.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY",
  );
}

export const supabase = createBrowserClient(supabaseUrl, supabaseKey);
