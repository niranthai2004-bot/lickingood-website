"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BrandMark } from "@/components/ui/BrandMark";
import { supabase } from "@/lib/supabaseClient";

export default function MerchantLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/merchant/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/merchant"
          className="flex items-center justify-center mb-8 group"
        >
          <BrandMark tagline="Merchant Portal" />
        </Link>

        <div className="bg-cream-50 rounded-3xl shadow-lg border border-cream-200 p-8 sm:p-9">
          <h1 className="font-display text-3xl font-black text-cocoa-900">
            Welcome back.
          </h1>
          <p className="text-sm text-cocoa-700 mt-1.5">
            Sign in to manage your shop, orders, and menu sync.
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
              <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center px-5 py-3.5 rounded-full bg-cocoa-900 hover:bg-cocoa-800 disabled:opacity-60 text-cream-50 font-bold text-sm transition-all duration-300 hover:scale-[1.01]"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="mt-6 space-y-2 text-center">
            <Link
              href="/merchant/signup"
              className="block text-sm font-bold text-cocoa-900 hover:text-cocoa-800"
            >
              Create a merchant account →
            </Link>
            <button
              type="button"
              className="text-xs font-semibold text-cocoa-700 hover:text-cocoa-900"
            >
              Forgot password?
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-cocoa-700 mt-6 max-w-sm mx-auto">
          Square securely powers inventory, payments, and order syncing.
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
