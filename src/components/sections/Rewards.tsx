"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Cake, Gift, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import { CountUp } from "@/components/ui/CountUp";
import { FadeIn, Line } from "@/components/ui/Reveal";
import { SocialIcon, type SocialIconName } from "@/components/ui/SocialIcon";

const perks = [
  { Icon: Star, title: "1 point per $1", body: "Every order earns. Pickup, delivery, in-store." },
  { Icon: Gift, title: "Free donut at 100", body: "Redeem your favorite — original glazed or specialty." },
  { Icon: Cake, title: "Birthday treat", body: "A free dozen on us, every year. No exceptions." },
];

// App-style icon row at the bottom of the phone screen.
// Future-clickable — wire `href` to real destinations when available.
const phoneApps: {
  id: SocialIconName;
  label: string;
  href: string;
  /** Tailwind classes for the icon's tile background + text color */
  tile: string;
}[] = [
  { id: "instagram", label: "Instagram", href: "#", tile: "bg-gradient-to-br from-amber-400 via-rose-500 to-violet-600 text-white" },
  { id: "facebook", label: "Facebook", href: "#", tile: "bg-blue-500 text-white" },
  { id: "tiktok", label: "TikTok", href: "#", tile: "bg-cocoa-900 text-white" },
  { id: "appstore", label: "App Store", href: "#", tile: "bg-cream-100 text-cocoa-900 border border-cream-200" },
];

const notifications = [
  { id: 1, title: "+12 pts earned", sub: "Original Glazed × 6" },
  { id: 2, title: "2× points today", sub: "Every kolache, all day" },
  { id: 3, title: "Free donut unlocked", sub: "Redeem at any location" },
];

export function Rewards() {
  const reduceMotion = useReducedMotion();
  const [notifIndex, setNotifIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const id = setInterval(() => {
      setNotifIndex((i) => (i + 1) % notifications.length);
    }, 4000);
    return () => clearInterval(id);
  }, [reduceMotion]);

  const currentNotif = notifications[notifIndex];

  return (
    <section
      id="rewards"
      className="relative py-20 lg:py-28 bg-cream-100 overflow-hidden"
    >
      {/* Soft warm decorative blurs */}
      <div
        aria-hidden
        className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(253,222,180,0.7), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="absolute bottom-0 right-0 w-[340px] h-[340px] rounded-full opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(247,224,139,0.6), transparent 70%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <FadeIn>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-cocoa-700 mb-4">
              Lickin&apos; Good Rewards
            </p>
          </FadeIn>
          <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-cocoa-900 tracking-tight leading-[0.92]">
            <Line>Earn free donuts</Line>
            <Line delay={0.1}>every visit.</Line>
          </h2>
          <FadeIn delay={0.3} className="mt-7 max-w-xl">
            <p className="text-xl text-cocoa-700 font-medium leading-snug">
              Sign up free. Order how you like. Stack points toward donuts,
              kolaches, drinks — and a free birthday dozen, every year.
            </p>
          </FadeIn>

          <FadeIn delay={0.4} className="mt-9">
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/auth"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-cocoa-900 hover:bg-cocoa-800 text-cream-50 font-bold text-lg shadow-lg shadow-cocoa-900/15 transition-all duration-500 ease-out hover:scale-[1.03]"
              >
                Join Rewards
              </Link>
              <Link
                href="/rewards"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-cream-50 hover:bg-white text-cocoa-900 font-bold text-lg border border-cream-300 transition-all duration-500 ease-out hover:scale-[1.03]"
              >
                How it works
              </Link>
            </div>
          </FadeIn>

          <ul className="mt-10 grid sm:grid-cols-3 gap-5">
            {perks.map(({ Icon, title, body }, i) => (
              <motion.li
                key={title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-8%" }}
                transition={{ duration: 0.55, delay: 0.5 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                whileHover={reduceMotion ? {} : { y: -3 }}
                className="bg-cream-50 rounded-2xl p-5 border border-cream-200 hover:shadow-md transition-shadow duration-300"
              >
                <div className="w-10 h-10 rounded-full bg-amber-100 text-cocoa-900 flex items-center justify-center mb-4 border border-amber-200">
                  <Icon size={18} />
                </div>
                <p className="font-display font-black text-cocoa-900 text-lg">
                  {title}
                </p>
                <p className="text-sm text-cocoa-700 mt-1.5 leading-snug">{body}</p>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Phone mockup with floating UI elements */}
        <div className="relative flex justify-center lg:justify-end">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-[280px] sm:w-[320px]"
          >
            <motion.div
              animate={reduceMotion ? {} : { y: [0, -10, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="relative will-change-transform"
            >
              {/* Floating notification toast above the phone */}
              <div className="absolute -top-8 left-0 right-0 flex justify-center pointer-events-none z-20">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentNotif.id}
                    initial={{ opacity: 0, y: -12, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.95 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="rounded-2xl bg-cream-50 border border-cream-200 shadow-xl px-4 py-3 flex items-center gap-3 max-w-[85%]"
                  >
                    <span className="w-9 h-9 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
                      <Sparkles size={14} className="text-cocoa-900" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-display font-black text-cocoa-900 text-sm leading-tight truncate">
                        {currentNotif.title}
                      </span>
                      <span className="block text-xs text-cocoa-700 truncate">
                        {currentNotif.sub}
                      </span>
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Phone shell */}
              <div className="rounded-[2.5rem] bg-cocoa-900 p-3 shadow-2xl">
                <div className="rounded-[2rem] bg-cream-50 overflow-hidden aspect-[9/19]">
                  <div className="h-6 flex items-center justify-center bg-cocoa-900">
                    <div className="w-20 h-4 rounded-full bg-cocoa-900" />
                  </div>
                  <div className="p-5">
                    <p className="text-[10px] uppercase tracking-widest text-cocoa-700 font-bold">
                      Your Rewards
                    </p>
                    <div className="flex items-baseline gap-1 mt-1">
                      <CountUp
                        to={247}
                        className="font-display text-6xl font-black text-cocoa-900 tabular-nums"
                      />
                      <span className="text-sm text-cocoa-700 font-bold">pts</span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-cream-200 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "47%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.4, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full bg-amber-300"
                      />
                    </div>
                    <p className="mt-2 text-xs text-cocoa-700">
                      53 pts to your next free donut
                    </p>

                    <div className="mt-6 rounded-2xl p-4 bg-amber-100 border border-amber-200">
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-900 mb-2">
                        Today&apos;s Bonus
                      </p>
                      <p className="font-display font-black text-cocoa-900 text-lg leading-tight">
                        2× points today
                      </p>
                      <p className="text-xs text-cocoa-700">
                        Every kolache, all day.
                      </p>
                    </div>

                    <ul className="mt-5 space-y-3">
                      {[
                        { name: "Original Glazed", pts: "+12" },
                        { name: "Cold Brew", pts: "+5" },
                        { name: "Maple Bacon", pts: "+8" },
                      ].map((row, i) => (
                        <motion.li
                          key={row.name}
                          initial={{ opacity: 0, x: -8 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="font-semibold text-cocoa-800">
                            {row.name}
                          </span>
                          <span className="font-black text-cocoa-900">
                            {row.pts}
                          </span>
                        </motion.li>
                      ))}
                    </ul>

                    {/* App-style icon row — designed for future linking */}
                    <div className="mt-6 pt-4 border-t border-cream-200">
                      <div className="flex items-center justify-between gap-2.5">
                        {phoneApps.map((app) => (
                          <a
                            key={app.id}
                            href={app.href}
                            aria-label={app.label}
                            onClick={(e) => e.preventDefault()}
                            className={`flex-1 aspect-square rounded-[14px] ${app.tile} flex items-center justify-center shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md`}
                          >
                            <SocialIcon name={app.id} size={18} />
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
