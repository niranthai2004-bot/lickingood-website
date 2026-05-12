"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { Coffee, Heart, Sun, Users } from "lucide-react";
import { FoodImage } from "@/components/ui/FoodImage";
import { FadeIn, Line } from "@/components/ui/Reveal";

const u = (tags: string, lock: number, w = 1200, h = 1500) =>
  `https://loremflickr.com/${w}/${h}/${tags}?lock=${lock}`;

const pillars = [
  { Icon: Sun, title: "Made daily", body: "Dough mixed before sunrise, every morning, every shop." },
  { Icon: Heart, title: "Family-owned", body: "Started by one family. Still run by the same one today." },
  { Icon: Users, title: "Community-first", body: "Hiring, sourcing, and partnering with our Alabama neighbors." },
  { Icon: Coffee, title: "Craft coffee", body: "Specialty beans roasted in-state. Pulled by trained baristas." },
];

export function Story() {
  const reduceMotion = useReducedMotion();
  const photoRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: photoRef,
    offset: ["start end", "end start"],
  });
  const photoScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.08, 1, 1.08]);
  const scale = reduceMotion ? 1 : photoScale;

  return (
    <section id="about" className="relative py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-12 items-center">
        {/* Editorial photo block */}
        <div className="lg:col-span-5 relative">
          <motion.div
            ref={photoRef}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-[4/5] rounded-card overflow-hidden shadow-2xl ring-1 ring-cream-200"
          >
            <motion.div style={{ scale }} className="w-full h-full will-change-transform">
              <FoodImage
                src={u("donuts,bakery,tray", 401)}
                alt="Fresh donuts on display"
                fallbackBg="bg-amber-100"
                className="w-full h-full"
              />
            </motion.div>
          </motion.div>

          <FadeIn
            delay={0.25}
            className="absolute -bottom-6 -right-4 sm:-right-8 bg-cream-50 border border-cream-200 rounded-card p-5 shadow-xl w-52"
          >
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-cocoa-700">
              Family-owned
            </p>
            <p className="font-display text-2xl font-black text-cocoa-900 leading-tight mt-1">
              Across the Gulf Coast.
            </p>
          </FadeIn>
        </div>

        <div className="lg:col-span-7">
          <FadeIn>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-cocoa-700 mb-3">
              Our Story
            </p>
          </FadeIn>
          <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-cocoa-900 tracking-tight leading-[0.92]">
            <Line>One family.</Line>
            <Line delay={0.08}>One recipe.</Line>
            <Line delay={0.16}>Made fresh daily.</Line>
          </h2>
          <FadeIn delay={0.4} className="mt-7 max-w-2xl">
            <p className="text-xl text-cocoa-700 font-medium leading-snug">
              Lickin&apos; Good started with one fryer, one family, and a recipe
              we still use today. Every donut still gets mixed before sunrise —
              by hands that know your name.
            </p>
          </FadeIn>

          <ul className="mt-10 grid sm:grid-cols-2 gap-5">
            {pillars.map(({ Icon, title, body }, i) => (
              <motion.li
                key={title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-8%" }}
                transition={{
                  duration: 0.55,
                  delay: i * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={reduceMotion ? {} : { y: -4 }}
                className="rounded-card bg-cream-50 border border-cream-200 p-6 hover:shadow-md transition-shadow duration-300"
              >
                <div className="w-11 h-11 rounded-full bg-amber-100 border border-amber-200 text-cocoa-900 flex items-center justify-center mb-4">
                  <Icon size={20} />
                </div>
                <p className="font-display font-black text-cocoa-900 text-xl">
                  {title}
                </p>
                <p className="text-sm text-cocoa-700 mt-1.5 leading-snug">
                  {body}
                </p>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
