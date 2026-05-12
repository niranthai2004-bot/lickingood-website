"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Mode = "signin" | "signup";

export default function AuthPage() {
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
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        router.push("/");
        router.refresh();
      }
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else if (data.user && !data.session) {
        setInfo("Check your email for a confirmation link to finish signing up.");
      } else {
        // Create the customer_profiles row so this account is enrolled in rewards
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
    }

    setLoading(false);
  }

  const isSignIn = mode === "signin";

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#FFF7E8] px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="block text-center text-3xl font-extrabold tracking-tight text-[#FF6B1A] mb-8"
        >
          Lickin&apos; Good
        </Link>

        <div className="bg-white rounded-2xl shadow-lg border border-[#F4E4C1] p-8">
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">
            {isSignIn ? "Welcome back" : "Create an account"}
          </h1>
          <p className="text-sm text-neutral-600 mb-6">
            {isSignIn
              ? "Sign in to track orders and save favorites."
              : "Sign up to save your orders and earn rewards."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-800 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 outline-none focus:border-[#FF6B1A] focus:ring-2 focus:ring-[#FF6B1A]/30"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-800 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                autoComplete={isSignIn ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 outline-none focus:border-[#FF6B1A] focus:ring-2 focus:ring-[#FF6B1A]/30"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </p>
            )}
            {info && (
              <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
                {info}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#FF6B1A] hover:bg-[#E85F12] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 transition-colors"
            >
              {loading ? "Please wait..." : isSignIn ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-neutral-600">
            {isSignIn ? "New to Lickin' Good?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setMode(isSignIn ? "signup" : "signin");
                setError(null);
                setInfo(null);
              }}
              className="text-[#FF6B1A] hover:text-[#E85F12] font-semibold"
            >
              {isSignIn ? "Sign up" : "Sign in"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
