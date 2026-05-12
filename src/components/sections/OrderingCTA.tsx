"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Bike, Smartphone, Store, Sun, Zap } from "lucide-react";
import { FoodImage } from "@/components/ui/FoodImage";
import { FadeIn, Line } from "@/components/ui/Reveal";

const u = (tags: string, lock: number, w = 1200, h = 720) =>
  `https://loremflickr.com/${w}/${h}/${tags}?lock=${lock}`;

const perks = [
  { Icon: Zap, label: "Ready in minutes" },
  { Icon: Smartphone, label: "Order in the app" },
  { Icon: Store, label: "Curbside pickup" },
  { Icon: Sun, label: "Made fresh daily" },
];

export function OrderingCTA() {
  return (
    <section className="relative py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[2rem] lg:rounded-[2.5rem] bg-cream-100 border border-cream-200 p-10 sm:p-14 lg:p-20 grid lg:grid-cols-2 gap-12 items-center"
        >
          <div
            aria-hidden
            className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full opacity-60 blur-3xl"
            style={{
              background:
                "radial-gradient(closest-side, rgba(253,222,180,0.6), transparent 70%)",
            }}
          />

          <div className="relative">
            <FadeIn>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-cocoa-700 mb-4">
                Pickup · Delivery
              </p>
            </FadeIn>
            <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-cocoa-900 tracking-tight leading-[0.92]">
              <Line>Order fresh.</Line>
              <Line delay={0.1}>Skip the line.</Line>
            </h2>
            <FadeIn delay={0.3} className="mt-7 max-w-xl">
              <p className="text-xl text-cocoa-700 font-medium leading-snug">
                Hot-and-ready in minutes. Pickup at your nearest Gulf Coast
                shop or delivery to your door — fresh near you, daily.
              </p>
            </FadeIn>

            <FadeIn delay={0.4}>
              <ul className="mt-8 flex flex-wrap gap-3">
                {perks.map(({ Icon, label }) => (
                  <li
                    key={label}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cream-50 border border-cream-200 text-sm font-bold text-cocoa-800 hover:-translate-y-0.5 transition-transform duration-300"
                  >
                    <Icon size={14} className="text-cocoa-700" />
                    {label}
                  </li>
                ))}
              </ul>
            </FadeIn>

            <FadeIn delay={0.5} className="mt-9">
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/order/pickup"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-cocoa-900 hover:bg-cocoa-800 text-cream-50 font-bold text-lg shadow-lg shadow-cocoa-900/15 transition-all duration-500 ease-out hover:scale-[1.03]"
                >
                  <Store size={18} className="mr-2" /> Order Pickup
                </Link>
                <Link
                  href="/order/delivery"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-cream-50 hover:bg-white text-cocoa-900 font-bold text-lg border border-cream-300 transition-all duration-500 ease-out hover:scale-[1.03]"
                >
                  <Bike size={18} className="mr-2" /> Order Delivery
                </Link>
              </div>
            </FadeIn>
          </div>

          <div className="relative">
            <motion.div
              initial={{ opacity: 0, x: 32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-auto max-w-sm rounded-3xl bg-cream-50 border border-cream-200 text-cocoa-900 p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-cocoa-700">
                  Your order
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-black border border-amber-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Ready in 6 min
                </span>
              </div>

              <div className="mt-4 relative aspect-[5/3] rounded-2xl overflow-hidden">
                <FoodImage
                  src={u("donut,coffee,box", 501)}
                  alt="Order preview"
                  fallbackBg="bg-amber-100"
                  className="w-full h-full"
                />
              </div>

              <ul className="mt-5 space-y-3">
                {[
                  { name: "Original Glazed × 6", price: "$8.94" },
                  { name: "Maple Bacon Bar", price: "$3.50" },
                  { name: "Iced Vanilla Latte", price: "$4.75" },
                ].map((row) => (
                  <li
                    key={row.name}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="font-bold">{row.name}</span>
                    <span className="font-black">{row.price}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 pt-4 border-t border-cream-200 flex items-center justify-between">
                <span className="text-sm text-cocoa-700 font-semibold">Subtotal</span>
                <span className="font-display text-2xl font-black">$17.19</span>
              </div>

              <button
                type="button"
                className="mt-4 w-full py-3 rounded-full bg-cocoa-900 hover:bg-cocoa-800 text-cream-50 font-bold text-sm transition-all duration-500 ease-out hover:scale-[1.02]"
              >
                Checkout
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
