"use client";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Heart,
  Loader2,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import { FadeIn } from "@/components/ui/Reveal";
import { supabase } from "@/lib/supabaseClient";

type Suggestion = {
  id: string;
  name: string;
  description: string | null;
  vote_count: number;
  has_voted: boolean;
  created_at: string;
};

/**
 * Community flavor voting — homepage section.
 *
 * Anyone (signed in or not) sees the current list and vote counts. Voting
 * and submitting both require a signed-in account; the UI redirects to the
 * customer auth page when needed.
 *
 * Spam protection: composite PK on (suggestion_id, user_id) in the votes
 * table makes "one vote per user per suggestion" a database invariant.
 */
export function FlavorVotes() {
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [submitOpen, setSubmitOpen] = useState(false);

  // Pending vote toggles so we can show a per-card spinner without blocking
  // the rest of the list.
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSignedIn(!!data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setSignedIn(!!session);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const refresh = async () => {
    try {
      const res = await fetch("/api/community/suggestions", {
        cache: "no-store",
      });
      const json = (await res.json()) as { suggestions?: Suggestion[] };
      setSuggestions(json.suggestions ?? []);
    } catch {
      setSuggestions([]);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleVote = async (s: Suggestion) => {
    if (!signedIn) {
      // Bounce to sign-in. Keep it lightweight; could carry a next= param later.
      window.location.href = "/auth";
      return;
    }
    if (pendingId) return;
    setPendingId(s.id);

    // Optimistic local update so the heart fills instantly
    setSuggestions((prev) =>
      (prev ?? []).map((p) =>
        p.id === s.id
          ? {
              ...p,
              has_voted: !p.has_voted,
              vote_count: p.has_voted
                ? Math.max(0, p.vote_count - 1)
                : p.vote_count + 1,
            }
          : p,
      ),
    );

    try {
      const res = await fetch("/api/community/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suggestion_id: s.id }),
      });
      if (!res.ok) {
        // Roll back optimistic update on failure
        await refresh();
      } else {
        const json = (await res.json()) as {
          vote_count: number;
          has_voted: boolean;
        };
        setSuggestions((prev) =>
          (prev ?? []).map((p) =>
            p.id === s.id
              ? { ...p, vote_count: json.vote_count, has_voted: json.has_voted }
              : p,
          ),
        );
      }
    } catch {
      await refresh();
    } finally {
      setPendingId(null);
    }
  };

  const loading = suggestions === null;
  const showing = (suggestions ?? []).slice(0, 9);

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-cream-50" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(45% 40% at 90% 10%, rgba(251,191,154,0.18) 0%, transparent 70%), radial-gradient(35% 45% at 10% 90%, rgba(245,222,179,0.22) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cocoa-700 mb-4">
            Community
          </p>
        </FadeIn>
        <div className="grid lg:grid-cols-2 gap-8 items-end mb-12">
          <FadeIn delay={0.05}>
            <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black text-cocoa-900 tracking-tight leading-[0.95]">
              Where should we
              <br /> bake next?
            </h2>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg text-cocoa-700 leading-snug max-w-xl">
              Drop a flavor idea. Upvote the ones you&apos;d eat tomorrow.
              The top picks become real menu trials — limited runs across
              our shops.
            </p>
            <button
              type="button"
              onClick={() => {
                if (!signedIn) {
                  window.location.href = "/auth";
                  return;
                }
                setSubmitOpen(true);
              }}
              className="mt-5 inline-flex items-center gap-1.5 px-6 py-3 rounded-full bg-cocoa-900 hover:bg-cocoa-800 text-cream-50 font-bold text-sm transition-all duration-300 hover:scale-[1.02]"
            >
              <Plus size={15} /> Submit a flavor
            </button>
          </FadeIn>
        </div>

        {/* Grid */}
        {loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-cream-100 border border-cream-200 h-32 animate-pulse"
              />
            ))}
          </div>
        )}

        {!loading && showing.length === 0 && (
          <FadeIn>
            <div className="rounded-card bg-cream-100 border border-cream-200 px-8 py-14 text-center max-w-xl mx-auto">
              <Sparkles
                size={22}
                className="text-cocoa-700 mx-auto mb-3"
                strokeWidth={1.75}
              />
              <p className="font-display text-2xl font-black text-cocoa-900">
                Be the first.
              </p>
              <p className="mt-2 text-base text-cocoa-700">
                No flavor ideas yet. Drop yours and watch the votes roll in.
              </p>
            </div>
          </FadeIn>
        )}

        {!loading && showing.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {showing.map((s, i) => (
              <motion.article
                key={s.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{
                  duration: 0.5,
                  delay: Math.min(i * 0.04, 0.3),
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group rounded-2xl bg-cream-50 border border-cream-200 p-5 hover:shadow-lg transition-shadow flex flex-col"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display text-xl font-black text-cocoa-900 leading-tight">
                      {s.name}
                    </p>
                    {s.description && (
                      <p className="mt-1.5 text-sm text-cocoa-700 leading-snug">
                        {s.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-auto pt-5 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => handleVote(s)}
                    disabled={pendingId === s.id}
                    aria-pressed={s.has_voted}
                    aria-label={
                      s.has_voted ? "Remove your vote" : "Upvote this flavor"
                    }
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                      s.has_voted
                        ? "bg-cocoa-900 text-cream-50"
                        : "bg-cream-100 hover:bg-cream-200 text-cocoa-900"
                    } disabled:opacity-60`}
                  >
                    {pendingId === s.id ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Heart
                        size={13}
                        className={s.has_voted ? "fill-current" : ""}
                      />
                    )}
                    <span className="tabular-nums">{s.vote_count}</span>
                  </button>
                  {!signedIn && (
                    <Link
                      href="/auth"
                      className="text-[11px] font-bold text-cocoa-700 hover:text-cocoa-900"
                    >
                      Sign in to vote →
                    </Link>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {submitOpen && (
          <SubmitFlavorModal
            onClose={() => setSubmitOpen(false)}
            onSubmitted={async () => {
              setSubmitOpen(false);
              await refresh();
            }}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function SubmitFlavorModal({
  onClose,
  onSubmitted,
}: {
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError("Give it a name (at least 2 characters).");
      return;
    }
    if (trimmed.length > 80) {
      setError("Keep the name under 80 characters.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/community/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed, description }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        const errMap: Record<string, string> = {
          sign_in_required: "Please sign in to submit a flavor.",
          name_too_short: "Give it a name (at least 2 characters).",
          name_too_long: "Keep the name under 80 characters.",
          description_too_long: "Keep the description under 280 characters.",
        };
        setError(errMap[json.error] ?? "Couldn't submit — try again.");
        setBusy(false);
        return;
      }
      setSuccess(true);
      setTimeout(onSubmitted, 900);
    } catch {
      setError("Network issue — please try again.");
      setBusy(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      className="fixed inset-0 z-[70] bg-cocoa-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center px-0 sm:px-4 py-0 sm:py-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-cream-50 sm:rounded-3xl rounded-t-3xl border-t sm:border border-cream-200 shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-cream-200">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cocoa-700">
              Community
            </p>
            <p className="font-display text-2xl font-black text-cocoa-900 leading-tight">
              Submit a flavor
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full bg-cream-100 hover:bg-cream-200 flex items-center justify-center text-cocoa-900 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          <Field
            label="Flavor name"
            value={name}
            onChange={setName}
            placeholder="e.g. Honey Lavender Glaze"
            maxLength={80}
            required
          />
          <Field
            label="Description"
            value={description}
            onChange={setDescription}
            placeholder="Optional — what makes it special?"
            maxLength={280}
            multiline
          />

          {error && (
            <p className="text-sm text-rose-900 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {success && (
            <p className="flex items-center gap-2 text-sm text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              <CheckCircle2 size={14} />
              Submitted. Bake squad will see it.
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full bg-cream-100 hover:bg-cream-200 text-cocoa-900 text-sm font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy || success}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-cocoa-900 hover:bg-cocoa-800 disabled:opacity-60 text-cream-50 text-sm font-bold transition-all hover:scale-[1.02]"
            >
              {busy ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Plus size={13} />
              )}
              {busy ? "Submitting…" : "Submit"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function Field({
  label,
  multiline,
  ...inputProps
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  required?: boolean;
  multiline?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-bold uppercase tracking-[0.18em] text-cocoa-700 mb-1.5">
        {label}
      </span>
      {multiline ? (
        <textarea
          value={inputProps.value}
          onChange={(e) => inputProps.onChange(e.target.value)}
          placeholder={inputProps.placeholder}
          maxLength={inputProps.maxLength}
          rows={3}
          className="w-full rounded-xl border border-cream-300 bg-cream-50 px-4 py-3 text-cocoa-900 text-sm focus:outline-none focus:border-cocoa-900 transition-colors resize-none"
        />
      ) : (
        <input
          type="text"
          {...inputProps}
          onChange={(e) => inputProps.onChange(e.target.value)}
          className="w-full rounded-xl border border-cream-300 bg-cream-50 px-4 py-3 text-cocoa-900 text-sm focus:outline-none focus:border-cocoa-900 transition-colors"
        />
      )}
    </label>
  );
}
