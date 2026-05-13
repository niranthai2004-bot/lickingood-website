"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { BrandMark } from "@/components/ui/BrandMark";

/**
 * Cinematic post-OAuth screen. The token exchange already succeeded in
 * the /auth/callback route — this page is purely for UX:
 *   1. Show "Connecting…" → done
 *   2. Run the locations sync in the background → done
 *   3. Show "Finalizing…" → redirect to dashboard
 *
 * No technical data is exposed to the merchant.
 */

type StepState = "pending" | "active" | "done";
type Step = {
  id: string;
  label: string;
  state: StepState;
};

export default function MerchantConnectingPage() {
  const router = useRouter();
  const [steps, setSteps] = useState<Step[]>([
    { id: "connect", label: "Securely connecting to Square", state: "active" },
    { id: "locations", label: "Syncing your locations", state: "pending" },
    { id: "menu", label: "Importing your menu", state: "pending" },
    { id: "done", label: "Finalizing your setup", state: "pending" },
  ]);

  useEffect(() => {
    let cancelled = false;
    const advance = async () => {
      // Step 1 → done after 800ms
      await wait(800);
      if (cancelled) return;
      setSteps((s) =>
        update(s, "connect", "done", "locations", "active"),
      );

      // Step 2 — kick off real locations sync, then advance no matter what
      const locStart = Date.now();
      try {
        await fetch("/api/square/sync-locations", { method: "POST" });
      } catch {
        // Surface no error to merchant — sync runs in background and can be
        // re-tried from the dashboard.
      }
      const locElapsed = Date.now() - locStart;
      if (locElapsed < 1200) await wait(1200 - locElapsed);
      if (cancelled) return;
      setSteps((s) => update(s, "locations", "done", "menu", "active"));

      // Step 3 — catalog (items + variations + inventory + availability)
      const catStart = Date.now();
      try {
        await fetch("/api/square/sync-catalog", { method: "POST" });
      } catch {
        // Non-fatal: merchant can resync from the dashboard later.
      }
      const catElapsed = Date.now() - catStart;
      // Catalog can be slow — surface min 1.4s but no upper cap.
      if (catElapsed < 1400) await wait(1400 - catElapsed);
      if (cancelled) return;
      setSteps((s) => update(s, "menu", "done", "done", "active"));

      // Step 4 → done after 600ms
      await wait(600);
      if (cancelled) return;
      setSteps((s) =>
        s.map((step) => (step.id === "done" ? { ...step, state: "done" } : step)),
      );

      // Hold the "all done" state briefly so the merchant sees it complete
      await wait(700);
      if (cancelled) return;
      router.push("/merchant/dashboard?connected=1");
    };
    advance();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <BrandMark tagline="Merchant Portal" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="bg-cream-50 rounded-3xl border border-cream-200 shadow-xl p-8 sm:p-9"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cocoa-700 mb-2">
            One moment
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-black text-cocoa-900 leading-[1.05]">
            Setting up your shop.
          </h1>
          <p className="mt-2 text-sm text-cocoa-700">
            We&apos;re getting everything in place. This usually takes a few
            seconds.
          </p>

          <ul className="mt-7 space-y-3">
            {steps.map((step) => (
              <li
                key={step.id}
                className="flex items-center gap-3"
                aria-current={step.state === "active" ? "step" : undefined}
              >
                <StepIcon state={step.state} />
                <span
                  className={`text-sm font-bold transition-colors ${
                    step.state === "done"
                      ? "text-cocoa-900"
                      : step.state === "active"
                        ? "text-cocoa-900"
                        : "text-cocoa-700/55"
                  }`}
                >
                  {step.label}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>

        <p className="text-center text-xs text-cocoa-700 mt-6 max-w-xs mx-auto">
          Square keeps your menu, inventory, and payments — we just plug into it.
        </p>
      </div>
    </div>
  );
}

function StepIcon({ state }: { state: StepState }) {
  return (
    <span
      className={`relative w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${
        state === "done"
          ? "bg-cocoa-900 border-cocoa-900 text-cream-50"
          : state === "active"
            ? "bg-cream-50 border-cocoa-900 text-cocoa-900"
            : "bg-cream-100 border-cream-200 text-cocoa-700/40"
      }`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {state === "done" ? (
          <motion.span
            key="check"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Check size={13} />
          </motion.span>
        ) : state === "active" ? (
          <motion.span
            key="loader"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Loader2 size={13} className="animate-spin" />
          </motion.span>
        ) : (
          <motion.span
            key="dot"
            initial={false}
            animate={{ opacity: 1 }}
            className="w-1.5 h-1.5 rounded-full bg-cocoa-700/40"
          />
        )}
      </AnimatePresence>
    </span>
  );
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function update(
  steps: Step[],
  doneId: string,
  doneState: StepState,
  activateId: string,
  activateState: StepState,
): Step[] {
  return steps.map((s) => {
    if (s.id === doneId) return { ...s, state: doneState };
    if (s.id === activateId) return { ...s, state: activateState };
    return s;
  });
}
