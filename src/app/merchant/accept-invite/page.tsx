"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import { BrandMark } from "@/components/ui/BrandMark";
import { supabase } from "@/lib/supabaseClient";

/**
 * Landing page after a merchant clicks the invite link in their email.
 * Supabase auto-handles the magic-link tokens from the URL hash and signs
 * them in. We then prompt for a password and finalize their account.
 */
export default function AcceptInvitePage() {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "ready" | "no_session">("checking");
  const [email, setEmail] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // CRITICAL: an admin signing in to invite a new merchant and then
      // clicking the invite link in the same browser would otherwise see
      // their own admin session here (Supabase's auto-detect can lose the
      // race against an existing cached session). Explicitly tear down any
      // existing local session, then hydrate from the invite URL tokens.
      const hash = typeof window !== "undefined" ? window.location.hash : "";
      const inviteParams = new URLSearchParams(hash.replace(/^#/, ""));
      const access_token = inviteParams.get("access_token");
      const refresh_token = inviteParams.get("refresh_token");
      const tokenType = inviteParams.get("type");
      const isInviteLanding =
        !!access_token && !!refresh_token && tokenType === "invite";

      if (isInviteLanding) {
        // Wipe any cached session (e.g. logged-in admin) so the invited
        // merchant's session is the only one that survives.
        await supabase.auth.signOut({ scope: "local" });
        const { error: setErr } = await supabase.auth.setSession({
          access_token: access_token!,
          refresh_token: refresh_token!,
        });
        if (setErr) {
          console.error("[Accept Invite] setSession failed", setErr);
        }
        // Strip the tokens from the URL so a refresh doesn't replay them.
        if (typeof window !== "undefined") {
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname + window.location.search,
          );
        }
      }

      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (!data.session) {
        setStatus("no_session");
        return;
      }
      setEmail(data.session.user.email ?? null);
      // The admin invite carried business_name in user_metadata
      const meta = data.session.user.user_metadata as {
        business_name?: string;
      };
      setBusinessName(meta?.business_name ?? null);
      setStatus("ready");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
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
        <Link href="/merchant" className="flex items-center justify-center mb-8">
          <BrandMark tagline="Merchant Portal" />
        </Link>

        <div className="bg-cream-50 rounded-3xl shadow-lg border border-cream-200 p-8 sm:p-9">
          {status === "checking" && (
            <div className="text-center py-6">
              <Loader2 size={20} className="animate-spin text-cocoa-900 mx-auto" />
              <p className="mt-3 text-sm text-cocoa-700">
                Confirming your invite…
              </p>
            </div>
          )}

          {status === "no_session" && (
            <div>
              <h1 className="font-display text-2xl font-black text-cocoa-900">
                This invite has expired.
              </h1>
              <p className="mt-2 text-sm text-cocoa-700">
                Invitation links expire after a short time. Ask your platform
                admin to send a new invite.
              </p>
              <Link
                href="/merchant/login"
                className="mt-6 inline-flex items-center justify-center px-5 py-3 rounded-full bg-cocoa-900 text-cream-50 text-sm font-bold"
              >
                Go to sign in
              </Link>
            </div>
          )}

          {status === "ready" && (
            <>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cocoa-700 mb-1.5">
                Welcome
              </p>
              <h1 className="font-display text-3xl font-black text-cocoa-900 leading-[1.05]">
                {businessName ? `Welcome, ${businessName}.` : "Set your password."}
              </h1>
              <p className="mt-2 text-sm text-cocoa-700">
                Create a password to finish setting up your merchant account.
              </p>

              {email && (
                <div className="mt-5 rounded-2xl bg-cream-100 border border-cream-200 px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cocoa-700">
                    You are signing up as
                  </p>
                  <p className="font-display text-base font-black text-cocoa-900 break-all leading-tight mt-0.5">
                    {email}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <Field
                  label="New password"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  autoComplete="new-password"
                  minLength={8}
                />
                <Field
                  label="Confirm password"
                  type="password"
                  value={confirm}
                  onChange={setConfirm}
                  autoComplete="new-password"
                  minLength={8}
                />

                {error && (
                  <p className="text-sm text-rose-900 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-cocoa-900 hover:bg-cocoa-800 disabled:opacity-60 text-cream-50 font-bold text-sm transition-all hover:scale-[1.01]"
                >
                  {busy ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Setting up…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={15} />
                      Set password & continue
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs text-cocoa-700 mt-6 max-w-sm mx-auto">
          Lickin&apos; Good Merchant Portal is invite-only. Square securely
          powers inventory, payments, and order syncing.
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
  autoComplete?: string;
  minLength?: number;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-bold uppercase tracking-[0.18em] text-cocoa-700 mb-1.5">
        {label}
      </span>
      <input
        {...inputProps}
        required
        onChange={(e) => inputProps.onChange(e.target.value)}
        className="w-full rounded-xl border border-cream-300 bg-cream-50 px-4 py-3 text-cocoa-900 text-sm focus:outline-none focus:border-cocoa-900 transition-colors"
      />
    </label>
  );
}
