"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, X } from "lucide-react";

const STORAGE_KEY = "lgd-rewards-prompt-shown";
const DELAY_MS = 18_000; // ~18s of browsing before the soft nudge appears

/**
 * Soft rewards prompt — appears once per session after a brief delay.
 * Non-intrusive: dismissible with a clear "Continue as Guest" CTA.
 */
export function RewardsPrompt() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    const id = setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem(STORAGE_KEY, "1");
    }, DELAY_MS);
    return () => clearTimeout(id);
  }, []);

  const close = () => setOpen(false);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={close}
          className="fixed inset-0 z-[60] bg-cocoa-900/40 backdrop-blur-sm flex items-center justify-center px-4 py-8"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl bg-cream-50 border border-cream-200 shadow-2xl overflow-hidden"
          >
            {/* Soft warm glow */}
            <div
              aria-hidden
              className="absolute -top-20 -right-20 w-[280px] h-[280px] rounded-full opacity-50 blur-3xl pointer-events-none"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(253,222,180,0.7), transparent 70%)",
              }}
            />

            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-cream-100 hover:bg-cream-200 flex items-center justify-center text-cocoa-800 transition-colors"
            >
              <X size={16} />
            </button>

            <div className="relative p-7 sm:p-9">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cocoa-900 text-cream-50 text-[10px] font-black uppercase tracking-[0.18em] mb-5">
                <Sparkles size={11} />
                Coming Soon
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-cocoa-900 leading-[1.05] tracking-tight">
                Earn free donuts every visit.
              </h2>
              <p className="mt-3 text-base text-cocoa-700 leading-snug">
                Sign up free to stack points toward donuts, kolaches, drinks —
                and a free birthday dozen, every year.
              </p>

              <div className="mt-6 space-y-2.5">
                <Link
                  href="/auth"
                  onClick={close}
                  className="w-full inline-flex items-center justify-center px-5 py-3.5 rounded-full bg-cocoa-900 hover:bg-cocoa-800 text-cream-50 font-bold text-sm transition-all duration-300 hover:scale-[1.01]"
                >
                  Join Rewards
                </Link>
                <Link
                  href="/auth"
                  onClick={close}
                  className="w-full inline-flex items-center justify-center px-5 py-3.5 rounded-full bg-cream-100 hover:bg-cream-200 text-cocoa-900 font-bold text-sm border border-cream-300 transition-colors"
                >
                  Sign In
                </Link>
                <button
                  type="button"
                  onClick={close}
                  className="w-full inline-flex items-center justify-center px-5 py-3 text-cocoa-700 hover:text-cocoa-900 font-semibold text-sm transition-colors"
                >
                  Continue as guest
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
