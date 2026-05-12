"use client";

import { useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import Link from "next/link";
import { FoodImage } from "@/components/ui/FoodImage";
import { FadeIn, Line } from "@/components/ui/Reveal";

const u = (tags: string, lock: number, w = 1200, h = 1200) =>
  `https://loremflickr.com/${w}/${h}/${tags}?lock=${lock}`;

const heroPhotos = {
  main: u("donut,glazed,bakery", 301, 1200, 1400),
  accent: u("donut,pink,sprinkles", 302, 600, 600),
  detail: u("donut,coffee", 303, 600, 600),
};

const ease = [0.22, 1, 0.36, 1] as const;

type AccentId = "top" | "bottom";

export function Hero() {
  const stageRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  // Once an accent photo has been hovered, it stays elevated forward.
  // It never snaps back behind the main image.
  const [elevated, setElevated] = useState<Set<AccentId>>(new Set());
  const elevate = (id: AccentId) => {
    setElevated((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  // Cursor parallax
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 70, damping: 22, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 70, damping: 22, mass: 0.6 });

  const mainX = useTransform(sx, [-1, 1], reduceMotion ? [0, 0] : [-14, 14]);
  const mainY = useTransform(sy, [-1, 1], reduceMotion ? [0, 0] : [-10, 10]);
  const accentX = useTransform(sx, [-1, 1], reduceMotion ? [0, 0] : [-30, 30]);
  const accentY = useTransform(sy, [-1, 1], reduceMotion ? [0, 0] : [-22, 22]);
  const detailX = useTransform(sx, [-1, 1], reduceMotion ? [0, 0] : [-24, 24]);
  const detailY = useTransform(sy, [-1, 1], reduceMotion ? [0, 0] : [-18, 18]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    mx.set((e.clientX - cx) / (rect.width / 2));
    my.set((e.clientY - cy) / (rect.height / 2));
  };
  const handleMouseLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <section className="relative pt-28 sm:pt-32 lg:pt-36 pb-20 lg:pb-32 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-cream-100 via-cream-50 to-cream-50" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(50% 45% at 80% 5%, rgba(251,191,154,0.30) 0%, transparent 65%), radial-gradient(45% 50% at 8% 35%, rgba(245,222,179,0.35) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-12 items-center">
        {/* Left column — copy */}
        <div className="lg:col-span-6 z-10">
          <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tighter text-cocoa-900 leading-[0.92]">
            <Line>Fresh donuts.</Line>
            <Line delay={0.1}>Made daily.</Line>
          </h1>

          <FadeIn delay={0.4} className="mt-7 max-w-xl">
            <p className="text-xl sm:text-2xl text-cocoa-700 font-medium leading-snug">
              Donuts, kolaches, breakfast sandwiches, and craft coffee —{" "}
              <strong className="text-cocoa-900">hand-made fresh every morning</strong>.
            </p>
          </FadeIn>

          <FadeIn delay={0.55} className="mt-9">
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/order/pickup"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-cocoa-900 text-cream-50 font-bold text-lg shadow-lg shadow-cocoa-900/15 transition-all duration-500 ease-out hover:scale-[1.03] hover:shadow-xl hover:bg-cocoa-800"
              >
                Start Order
              </Link>
              <Link
                href="/menu"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-cream-100 hover:bg-cream-200 text-cocoa-900 font-bold text-lg border border-cream-300 transition-all duration-500 ease-out hover:scale-[1.03]"
              >
                View Full Menu
              </Link>
            </div>
          </FadeIn>
        </div>

        {/* Right column — interactive photo composition */}
        <div
          ref={stageRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="lg:col-span-6 relative h-[460px] sm:h-[560px] lg:h-[640px]"
        >
          <div
            aria-hidden
            className="absolute inset-0 rounded-full blur-3xl opacity-60"
            style={{
              background:
                "radial-gradient(closest-side, rgba(251,191,154,0.55), transparent 70%)",
            }}
          />

          {/* Main hero photo — main visual anchor */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, ease }}
            style={{ x: mainX, y: mainY }}
            className="absolute inset-y-4 left-[6%] right-[10%] z-20 rounded-[2.5rem] overflow-hidden shadow-2xl will-change-transform"
          >
            <FoodImage
              src={heroPhotos.main}
              alt="Fresh glazed donut, close up"
              fallbackBg="bg-amber-100"
              className="w-full h-full"
            />
          </motion.div>

          {/* Accent photo — top right (deepest parallax)
              Inner photo wrapper is over-sized via -inset-3 so the floating
              animation never exposes the fallback background — the image
              always fully covers the visible card area. */}
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease }}
            whileHover={reduceMotion ? {} : { scale: 1.04 }}
            style={{ x: accentX, y: accentY }}
            onMouseEnter={() => elevate("top")}
            className={`hidden sm:block absolute top-0 right-0 w-44 h-44 lg:w-56 lg:h-56 rounded-3xl overflow-hidden shadow-2xl will-change-transform cursor-pointer ${
              elevated.has("top") ? "z-30" : "z-10"
            }`}
          >
            <motion.div
              animate={reduceMotion ? {} : { y: [0, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -inset-3"
            >
              <FoodImage
                src={heroPhotos.accent}
                alt="Strawberry frosted donut"
                fallbackBg="bg-rose-100"
                className="w-full h-full"
              />
            </motion.div>
          </motion.div>

          {/* Detail photo — bottom left */}
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.3, ease }}
            whileHover={reduceMotion ? {} : { scale: 1.04 }}
            style={{ x: detailX, y: detailY }}
            onMouseEnter={() => elevate("bottom")}
            className={`hidden sm:block absolute bottom-0 left-0 w-40 h-40 lg:w-52 lg:h-52 rounded-3xl overflow-hidden shadow-2xl will-change-transform cursor-pointer ${
              elevated.has("bottom") ? "z-30" : "z-10"
            }`}
          >
            <motion.div
              animate={reduceMotion ? {} : { y: [0, 8, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -inset-3"
            >
              <FoodImage
                src={heroPhotos.detail}
                alt="Tray of fresh donuts"
                fallbackBg="bg-stone-100"
                className="w-full h-full"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
