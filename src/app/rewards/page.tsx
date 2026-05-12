"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Cake, Gift, Star } from "lucide-react";
import { FadeIn, Line } from "@/components/ui/Reveal";

const perks = [
  {
    Icon: Star,
    title: "Earn on every order",
    body: "Pickup, delivery, in-store — every visit stacks toward free donuts.",
  },
  {
    Icon: Gift,
    title: "Member-only drops",
    body: "Early access to limited-time flavors and seasonal collabs.",
  },
  {
    Icon: Cake,
    title: "Free birthday dozen",
    body: "Sign up once, get a free dozen on us every year.",
  },
];

export default function RewardsPage() {
  const reduceMotion = useReducedMotion();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    setEmail("");
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <>
      {/* ───── Intro ───── */}
      <section className="relative pt-32 sm:pt-36 lg:pt-40 pb-16 lg:pb-24 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-cream-100 via-cream-50 to-cream-50" />
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            backgroundImage:
              "radial-gradient(50% 45% at 80% 5%, rgba(251,191,154,0.30) 0%, transparent 65%), radial-gradient(40% 50% at 8% 30%, rgba(245,222,179,0.30) 0%, transparent 70%)",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <FadeIn>
              <span className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-cocoa-900 text-cream-50 text-xs font-black uppercase tracking-[0.18em] mb-6 shadow-sm">
                Coming Soon
              </span>
            </FadeIn>
            <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-black text-cocoa-900 leading-[0.92] tracking-tighter">
              <Line>Rewards,</Line>
              <Line delay={0.1}>incoming.</Line>
            </h1>
            <FadeIn delay={0.4} className="mt-7 max-w-xl">
              <p className="text-xl sm:text-2xl text-cocoa-700 font-medium leading-snug">
                Earn points on every order, unlock seasonal drops, and get a
                free birthday dozen on us. Coming this season.
              </p>
            </FadeIn>

            {/* Email signup */}
            <FadeIn delay={0.55} className="mt-9 max-w-lg">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-cocoa-700 mb-3">
                Be the first to know
              </p>
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="flex-1 rounded-full px-5 py-3.5 bg-cream-50 border border-cream-200 text-cocoa-900 placeholder:text-cocoa-700/50 focus:outline-none focus:border-cocoa-900 transition-colors"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-cocoa-900 hover:bg-cocoa-800 text-cream-50 font-bold transition-all duration-300 hover:scale-[1.02]"
                >
                  Notify me
                </button>
              </form>
              <AnimatePresence>
                {submitted && (
                  <motion.p
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mt-3 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2"
                  >
                    You&apos;re on the list. We&apos;ll email when rewards go live.
                  </motion.p>
                )}
              </AnimatePresence>
              <p className="mt-3 text-xs text-cocoa-700">
                Powered by Square Loyalty (launching this season).
              </p>
            </FadeIn>
          </div>

          {/* Phone teaser mockup */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.88 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-[280px] sm:w-[320px]"
            >
              <motion.div
                animate={
                  reduceMotion
                    ? {}
                    : { y: [0, -12, 0], rotate: [-0.6, 0.6, -0.6] }
                }
                transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
                className="relative will-change-transform"
              >
                <div className="rounded-[2.5rem] bg-cocoa-900 p-3 shadow-2xl">
                  <div className="rounded-[2rem] bg-cream-50 overflow-hidden aspect-[9/19]">
                    <div className="h-6 flex items-center justify-center bg-cocoa-900">
                      <div className="w-20 h-4 rounded-full bg-cocoa-900" />
                    </div>
                    <div className="p-5">
                      <p className="text-[10px] uppercase tracking-widest text-cocoa-700 font-bold">
                        Lickin&apos; Good Rewards
                      </p>

                      {/* Big CTA card */}
                      <div className="mt-3 rounded-2xl p-5 bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-200">
                        <div className="w-9 h-9 rounded-full bg-cocoa-900 text-cream-50 flex items-center justify-center mb-3">
                          <Gift size={16} />
                        </div>
                        <p className="font-display text-lg font-black text-cocoa-900 leading-tight">
                          Free dozen on us.
                        </p>
                        <p className="text-xs text-cocoa-700 mt-1">
                          On your birthday, every year.
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <p className="text-[10px] uppercase tracking-widest text-cocoa-700 font-bold">
                          Recent earnings
                        </p>
                        <span className="text-[10px] font-black text-cocoa-700">
                          Preview
                        </span>
                      </div>
                      <ul className="mt-3 space-y-2.5">
                        {[
                          { name: "Glazed × 6", pts: "+6" },
                          { name: "Iced Latte", pts: "+5" },
                          { name: "Sausage Kolache", pts: "+3" },
                        ].map((row) => (
                          <li
                            key={row.name}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="font-semibold text-cocoa-800">
                              {row.name}
                            </span>
                            <span className="font-black text-cocoa-900">
                              {row.pts}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-5 pt-4 border-t border-cream-200 text-center">
                        <p className="text-[10px] uppercase tracking-widest text-cocoa-700 font-bold">
                          Available
                        </p>
                        <p className="font-display text-xl font-black text-cocoa-900 mt-0.5">
                          This season
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ───── Perks teaser ───── */}
      <section className="relative pb-24 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-cocoa-900 tracking-tight leading-[0.95] max-w-3xl">
              Earn on every visit.
            </h2>
            <p className="mt-5 text-lg text-cocoa-700 max-w-2xl">
              A free birthday dozen, member-only drops, and points that stack
              toward your favorites. Launching this season.
            </p>
          </FadeIn>

          <ul className="mt-12 grid md:grid-cols-3 gap-5 lg:gap-6">
            {perks.map(({ Icon, title, body }, i) => (
              <motion.li
                key={title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={reduceMotion ? {} : { y: -5 }}
                className="rounded-card bg-cream-50 border border-cream-200 p-7 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-12 h-12 rounded-full bg-amber-100 border border-amber-200 text-cocoa-900 flex items-center justify-center mb-5">
                  <Icon size={20} />
                </div>
                <p className="font-display text-2xl font-black text-cocoa-900 leading-tight">
                  {title}
                </p>
                <p className="mt-2 text-base text-cocoa-700 leading-snug">
                  {body}
                </p>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
