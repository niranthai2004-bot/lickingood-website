"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { FoodImage } from "@/components/ui/FoodImage";
import { FadeIn, Line } from "@/components/ui/Reveal";

const u = (tags: string, lock: number, w = 1400, h = 1750) =>
  `https://loremflickr.com/${w}/${h}/${tags}?lock=${lock}`;

export default function AboutPage() {
  const reduceMotion = useReducedMotion();

  return (
    <>
      {/* ───── Hero ───── */}
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

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-cocoa-700 mb-4">
              Our Story
            </p>
          </FadeIn>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-cocoa-900 leading-[0.92] tracking-tighter max-w-5xl">
            <Line>From a Texas kitchen</Line>
            <Line delay={0.08}>to the Gulf Coast.</Line>
          </h1>
          <FadeIn delay={0.4} className="mt-8 max-w-3xl">
            <p className="text-xl sm:text-2xl text-cocoa-700 font-medium leading-snug">
              A family recipe, three states, and a slow-rising story — still
              hand-mixed before sunrise.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ───── Chapter 1: Texas roots ───── */}
      <Chapter
        marker="Where it began"
        title="Texas roots."
        body="The story starts in a Texas kitchen. A family recipe, a worn rolling pin, and a way of frying donuts that traveled with us. Through Louisiana. Through Mississippi. Across the Gulf, slowly, until we landed somewhere it felt like home."
        imageTags="bakery,vintage,texas,kitchen"
        imageLock={3001}
        side="right"
        reduceMotion={!!reduceMotion}
      />

      {/* ───── Chapter 2: Mobile ───── */}
      <Chapter
        marker="Settled in Mobile"
        title="The first shop."
        body="The first Lickin' Good Donuts opened in the Mobile and Saraland area. One fryer, one family, and a handful of regulars who started showing up before sunrise — same names, same orders. They're still showing up."
        imageTags="bakery,mobile,storefront,morning"
        imageLock={3002}
        side="left"
        reduceMotion={!!reduceMotion}
      />

      {/* ───── Stat / pull quote ───── */}
      <section className="relative py-20 lg:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <p className="text-center text-sm font-bold uppercase tracking-[0.2em] text-cocoa-700 mb-6">
              Made daily, since day one
            </p>
            <p className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-cocoa-900 tracking-tight leading-[1.05] text-center max-w-4xl mx-auto">
              &ldquo;Every donut still gets mixed before sunrise — by hands
              that know your name.&rdquo;
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ───── Chapter 3: 2017 expansion ───── */}
      <Chapter
        marker="2017"
        title="Across Mobile Bay."
        body="By 2017, a slow rise turned into a real one. New shops opened across Mobile Bay, into Baldwin County, and over the state line into Pensacola and the Florida Panhandle. The recipe stayed the same. The hands changed, but the discipline didn't — every batch, every morning."
        imageTags="bakery,coastal,sunrise,donuts"
        imageLock={3003}
        side="right"
        reduceMotion={!!reduceMotion}
      />

      {/* ───── Family-owned values ───── */}
      <section className="relative py-20 lg:py-28 bg-cream-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5">
            <FadeIn>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-cocoa-700 mb-3">
                Family-owned
              </p>
            </FadeIn>
            <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black text-cocoa-900 tracking-tight leading-[0.92]">
              <Line>Still the</Line>
              <Line delay={0.08}>same family.</Line>
            </h2>
          </div>
          <div className="lg:col-span-7">
            <FadeIn delay={0.2}>
              <p className="text-xl text-cocoa-700 font-medium leading-snug">
                Lickin&apos; Good is still owned and run by the same family
                that started it. We hire from our neighborhoods, source what we
                can locally, and keep our hours the way our grandfathers ran
                their counters — open before sunrise, close when the last
                donut sells.
              </p>
              <p className="mt-5 text-lg text-cocoa-700 leading-snug">
                Every shop is a little different — local Conecuh sausage in
                Mobile, fresh Florida berries in Pensacola, the same dough
                everywhere. That&apos;s on purpose.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ───── Looking ahead ───── */}
      <section className="relative py-24 lg:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-cocoa-700 mb-4">
              Looking ahead
            </p>
          </FadeIn>
          <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black text-cocoa-900 tracking-tight leading-[0.92]">
            <Line>The next batch is</Line>
            <Line delay={0.08}>already rising.</Line>
          </h2>
          <FadeIn delay={0.4}>
            <p className="mt-7 text-xl text-cocoa-700 font-medium leading-snug max-w-2xl mx-auto">
              We&apos;re still scouting hometowns across the Gulf Coast — small
              towns, busy streets, neighborhoods that show up early. If
              that&apos;s yours, come say hi.
            </p>
          </FadeIn>
          <FadeIn delay={0.55} className="mt-9">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/locations"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-cocoa-900 hover:bg-cocoa-800 text-cream-50 font-bold text-base transition-all duration-500 ease-out hover:scale-[1.03]"
              >
                Find a shop
                <ArrowUpRight
                  size={18}
                  className="transition-transform duration-500 group-hover:translate-x-0.5"
                />
              </Link>
              <Link
                href="/menu"
                className="inline-flex items-center justify-center px-7 py-4 rounded-full bg-cream-100 hover:bg-cream-200 text-cocoa-900 font-bold text-base border border-cream-300 transition-all duration-500 ease-out hover:scale-[1.03]"
              >
                See the menu
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}

function Chapter({
  marker,
  title,
  body,
  imageTags,
  imageLock,
  side,
  reduceMotion,
}: {
  marker: string;
  title: string;
  body: string;
  imageTags: string;
  imageLock: number;
  side: "left" | "right";
  reduceMotion: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const scaleVal = useTransform(scrollYProgress, [0, 0.5, 1], [1.08, 1, 1.08]);
  const scale = reduceMotion ? 1 : scaleVal;

  return (
    <section className="relative py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-12 items-center">
        <div
          className={`lg:col-span-5 ${
            side === "right" ? "lg:order-1" : "lg:order-2"
          }`}
        >
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-[4/5] rounded-card overflow-hidden shadow-2xl"
          >
            <motion.div style={{ scale }} className="w-full h-full will-change-transform">
              <FoodImage
                src={u(imageTags, imageLock)}
                alt={title}
                fallbackBg="bg-amber-100"
                className="w-full h-full"
              />
            </motion.div>
          </motion.div>
        </div>
        <div
          className={`lg:col-span-7 ${
            side === "right" ? "lg:order-2" : "lg:order-1"
          }`}
        >
          <FadeIn>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-cocoa-700 mb-4">
              {marker}
            </p>
          </FadeIn>
          <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-cocoa-900 tracking-tight leading-[0.92]">
            <Line>{title}</Line>
          </h2>
          <FadeIn delay={0.3} className="mt-7 max-w-2xl">
            <p className="text-xl text-cocoa-700 font-medium leading-snug">
              {body}
            </p>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
