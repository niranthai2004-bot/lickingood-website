"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { BrandMark } from "@/components/ui/BrandMark";
import { supabase } from "@/lib/supabaseClient";

/**
 * Dedicated admin login page. Completely isolated from the merchant auth
 * flow — admins never get routed through merchant onboarding / signup.
 *
 * Auth gate is server-side via /api/admin/whoami which checks ADMIN_EMAILS.
 * This page just collects credentials and verifies admin status on submit.
 */

const errorMessages: Record<string, string> = {
  not_admin: "That account isn't an admin. Sign in with an admin email.",
  not_signed_in: "Please sign in to access the admin console.",
};

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginInner />
    </Suspense>
  );
}

function AdminLoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialError = searchParams?.get("error") ?? null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    initialError ? errorMessages[initialError] ?? initialError : null,
  );
  const [loading, setLoading] = useState(false);
  const [bootChecked, setBootChecked] = useState(false);

  // If an admin is already signed in, skip the login form.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;
      if (user) {
        const res = await fetch("/api/admin/whoami", { cache: "no-store" });
        if (cancelled) return;
        if (res.ok) {
          router.replace("/admin");
          return;
        }
      }
      setBootChecked(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // 1. Authenticate against Supabase
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInErr) {
      setLoading(false);
      setError(signInErr.message);
      return;
    }

    // 2. Verify admin allowlist via server-side check
    const res = await fetch("/api/admin/whoami", { cache: "no-store" });
    setLoading(false);

    if (res.status === 403) {
      // Sign out so a non-admin doesn't keep a half-authenticated session
      await supabase.auth.signOut({ scope: "local" });
      setError(
        "That account is signed in but isn't an admin. If you're a merchant, use the merchant portal instead.",
      );
      return;
    }
    if (!res.ok) {
      setError("Couldn't verify admin status. Try again in a moment.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  if (!bootChecked) return null;

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center mb-8 group">
          <BrandMark tagline="Admin Console" />
        </Link>

        <div className="bg-cream-50 rounded-3xl shadow-lg border border-cream-200 p-8 sm:p-9">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck size={16} className="text-cocoa-900" />
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cocoa-700">
              Restricted access
            </p>
          </div>
          <h1 className="font-display text-3xl font-black text-cocoa-900">
            Admin sign in.
          </h1>
          <p className="text-sm text-cocoa-700 mt-1.5">
            Sign in with your admin email to manage merchants and locations.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Field
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
              required
            />
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
              required
              minLength={6}
            />

            {error && (
              <p className="text-sm text-rose-900 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center px-5 py-3.5 rounded-full bg-cocoa-900 hover:bg-cocoa-800 disabled:opacity-60 text-cream-50 font-bold text-sm transition-all duration-300 hover:scale-[1.01]"
            >
              {loading ? "Signing in…" : "Sign in to admin"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-cocoa-700 mt-6 max-w-sm mx-auto">
          Not an admin?{" "}
          <Link
            href="/merchant/login"
            className="font-bold text-cocoa-900 hover:text-cocoa-800"
          >
            Merchant sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  ...inputProps
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-bold uppercase tracking-[0.18em] text-cocoa-700 mb-1.5">
        {label}
      </span>
      <input
        {...inputProps}
        onChange={(e) => inputProps.onChange(e.target.value)}
        className="w-full rounded-xl border border-cream-300 bg-cream-50 px-4 py-3 text-cocoa-900 text-sm focus:outline-none focus:border-cocoa-900 transition-colors"
      />
    </label>
  );
}
