"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { promotions, ticker, type Promotion } from "@/data/promotions";
import { FoodImage } from "@/components/ui/FoodImage";
import { FadeIn, Line } from "@/components/ui/Reveal";
import { MobileCarousel } from "@/components/ui/MobileCarousel";

export function Promotions() {
  const tickerLoop = [...ticker, ...ticker];

  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      {/* Refined marquee announcement bar */}
      <div className="relative -my-2 mb-12 lg:mb-16 bg-cocoa-900 text-cream-50 py-3.5 overflow-hidden border-y border-cocoa-800">
        <div className="flex w-max gap-10 animate-marquee">
          {tickerLoop.map((line, i) => (
            <span
              key={i}
              className="font-display font-bold text-base sm:text-lg whitespace-nowrap tracking-tight"
            >
              {line}
              <span className="ml-10 text-cream-300/60">·</span>
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <FadeIn>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-cocoa-700 mb-4">
                What&apos;s New
              </p>
            </FadeIn>
            <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-cocoa-900 leading-[0.95] tracking-tight">
              <Line>Drops you don&apos;t</Line>
              <Line delay={0.1}>want to miss.</Line>
            </h2>
          </div>
          <FadeIn delay={0.2} className="self-start lg:self-end">
            <Link
              href="/menu"
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-cocoa-900 hover:bg-cocoa-800 text-cream-50 text-sm font-bold transition-all duration-500 ease-out hover:scale-[1.04]"
            >
              View all specials
              <ArrowUpRight
                size={16}
                className="transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </FadeIn>
        </div>

        {/* Desktop: 3-col grid */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6 lg:gap-7">
          {promotions.map((promo, i) => (
            <PromoCard key={promo.id} promo={promo} index={i} />
          ))}
        </div>

        {/* Mobile: native horizontal swipe carousel. Finite, ends at the
            last promo. Negative margin lets the track reach viewport edges
            while px-4 inside gives the first/last card a 16px buffer. */}
        <div className="lg:hidden -mx-4">
          <MobileCarousel
            items={promotions}
            ariaLabel="Current promotions"
            className="gap-4 px-4"
            itemClassName="w-[82%] sm:w-[60%]"
            renderItem={(promo, idx) => (
              <PromoCard promo={promo} index={idx} noEntryAnim />
            )}
          />
        </div>
      </div>
    </section>
  );
}

function PromoCard({
  promo,
  index,
  noEntryAnim,
}: {
  promo: Promotion;
  index: number;
  /** Skip whileInView entry animation. Used inside the mobile carousel
      to prevent re-firing entry on every horizontal swipe. */
  noEntryAnim?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  // Scroll-driven scale: card breathes from 0.97 → 1 as it enters viewport
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 90%", "center center"],
  });
  const scrollScale = useTransform(scrollYProgress, [0, 1], [0.97, 1]);
  const scale = reduceMotion || noEntryAnim ? 1 : scrollScale;

  // Cursor-driven photo tilt — gentle, premium, not gimmicky
  const photoMx = useMotionValue(0);
  const photoMy = useMotionValue(0);
  const sx = useSpring(photoMx, { stiffness: 90, damping: 22 });
  const sy = useSpring(photoMy, { stiffness: 90, damping: 22 });
  const photoX = useTransform(sx, [-1, 1], reduceMotion ? [0, 0] : [-8, 8]);
  const photoY = useTransform(sy, [-1, 1], reduceMotion ? [0, 0] : [-6, 6]);

  const handleMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    photoMx.set((e.clientX - cx) / (rect.width / 2));
    photoMy.set((e.clientY - cy) / (rect.height / 2));
  };
  const handleLeave = () => {
    photoMx.set(0);
    photoMy.set(0);
  };

  const entryProps = noEntryAnim
    ? {}
    : {
        initial: { opacity: 0, y: 40 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-10%" },
        transition: {
          duration: 0.8,
          delay: index * 0.1,
          ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
        },
      };

  return (
    <motion.article
      ref={ref}
      {...entryProps}
      style={{ scale }}
      whileHover={reduceMotion ? {} : { y: -6 }}
      className={`group relative overflow-hidden rounded-card ${promo.bg} border ${promo.border} shadow-sm hover:shadow-2xl transition-shadow duration-500 h-full w-full`}
    >
      <div className="p-6 lg:p-7">
        <div
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
          className="relative aspect-[5/4] rounded-2xl overflow-hidden shadow-md ring-1 ring-cream-200/50"
        >
          <motion.div
            style={{ x: photoX, y: photoY }}
            className="w-full h-full will-change-transform"
          >
            <FoodImage
              src={promo.image}
              alt={promo.title}
              fallbackBg="bg-cream-100"
              className="w-full h-full"
              imgClassName="transition-transform duration-[1100ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-105"
            />
          </motion.div>
          <span className="absolute top-3 left-3 z-10 inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-cream-50/95 text-cocoa-900 shadow-sm backdrop-blur">
            {promo.badge}
          </span>
        </div>

        <h3 className="mt-7 font-display text-3xl sm:text-4xl font-black text-cocoa-900 tracking-tight leading-[1.05]">
          {promo.title}
        </h3>
        <p className="mt-3 text-base sm:text-lg text-cocoa-700 leading-snug">
          {promo.blurb}
        </p>

        <Link
          href={promo.ctaHref}
          className="group/cta mt-7 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-cocoa-900 hover:bg-cocoa-800 text-cream-50 font-bold text-sm transition-all duration-500 ease-out hover:scale-[1.04]"
        >
          {promo.cta}
          <ArrowUpRight
            size={16}
            className="transition-transform duration-500 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5"
          />
        </Link>
      </div>
    </motion.article>
  );
}
