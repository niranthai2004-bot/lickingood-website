"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BrandMark } from "@/components/ui/BrandMark";
import { supabase } from "@/lib/supabaseClient";

type Mode = "signin" | "signup";

export default function CustomerAuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      router.push("/");
      router.refresh();
      return;
    }

    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data.user && !data.session) {
      setInfo("Check your email for a confirmation link to finish signing up.");
      return;
    }
    const userId = data.user?.id ?? data.session?.user.id;
    if (userId) {
      await supabase
        .from("customer_profiles")
        .insert({ user_id: userId })
        .select()
        .maybeSingle();
    }
    router.push("/");
    router.refresh();
  }

  const isSignIn = mode === "signin";

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center mb-8 group">
          <BrandMark />
        </Link>

        <div className="bg-cream-50 rounded-3xl shadow-lg border border-cream-200 p-8 sm:p-9">
          <h1 className="font-display text-3xl font-black text-cocoa-900">
            {isSignIn ? "Welcome back." : "Create your account."}
          </h1>
          <p className="text-sm text-cocoa-700 mt-1.5">
            {isSignIn
              ? "Sign in to track orders and save your favorites."
              : "Save your orders, earn rewards, and order faster next time."}
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
              autoComplete={isSignIn ? "current-password" : "new-password"}
              required
              minLength={6}
            />

            {error && (
              <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            {info && (
              <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                {info}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center px-5 py-3.5 rounded-full bg-cocoa-900 hover:bg-cocoa-800 disabled:opacity-60 text-cream-50 font-bold text-sm transition-all duration-300 hover:scale-[1.01]"
            >
              {loading
                ? "Please wait…"
                : isSignIn
                  ? "Sign in"
                  : "Create account"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-cocoa-700">
            {isSignIn ? "New to Lickin' Good?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setMode(isSignIn ? "signup" : "signin");
                setError(null);
                setInfo(null);
              }}
              className="font-bold text-cocoa-900 hover:text-cocoa-800"
            >
              {isSignIn ? "Sign up" : "Sign in"}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-cocoa-700 mt-6 max-w-sm mx-auto">
          By signing in you agree to our terms. We&apos;ll never share your
          info — donuts only.
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
