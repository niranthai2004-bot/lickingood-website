"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { fullMenu, fullMenuCategories } from "@/data/menuFull";
import type { Category, MenuItem } from "@/data/menu";
import { FoodImage } from "@/components/ui/FoodImage";
import { FadeIn, Line } from "@/components/ui/Reveal";
import { FlavorRequest } from "@/components/sections/FlavorRequest";

type ActiveId = Category | "all";

const filterOrder: { id: ActiveId; label: string }[] = [
  { id: "all", label: "All" },
  ...fullMenuCategories.map((c) => ({ id: c.id as ActiveId, label: c.label })),
];

const surfaces = [
  { bg: "bg-amber-50", border: "border-amber-100" },
  { bg: "bg-rose-50", border: "border-rose-100" },
  { bg: "bg-violet-50", border: "border-violet-100" },
  { bg: "bg-sky-50", border: "border-sky-100" },
  { bg: "bg-stone-100", border: "border-stone-200" },
  { bg: "bg-orange-50", border: "border-orange-100" },
];

export default function MenuPage() {
  const [active, setActive] = useState<ActiveId>("all");
  const reduceMotion = useReducedMotion();
  const gridRef = useRef<HTMLDivElement>(null);

  // Auto-highlight the tab whose section is currently below the sticky tab bar.
  // Uses a throttled scroll listener — IntersectionObserver was less reliable
  // for tracking "which section is currently nearest the top of viewport".
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        // Target line: just below sticky tab bar (~ navbar + tabs height)
        const targetY = 200;
        let found: ActiveId = "all";
        for (const cat of fullMenuCategories) {
          const el = document.getElementById(cat.id);
          if (!el) continue;
          const top = el.getBoundingClientRect().top;
          if (top <= targetY) {
            found = cat.id;
          } else {
            break;
          }
        }
        setActive((prev) => (prev === found ? prev : found));
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Tab click — smooth-scroll to the matching section (or to the grid top for "All").
  const handleTabClick = (id: ActiveId) => {
    setActive(id);
    requestAnimationFrame(() => {
      if (id === "all") {
        gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        const el = document.getElementById(id);
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  };

  return (
    <>
      {/* ───── Intro ───── */}
      <section className="relative pt-32 sm:pt-36 lg:pt-40 pb-12 lg:pb-16 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-cream-100 via-cream-50 to-cream-50" />
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            backgroundImage:
              "radial-gradient(50% 45% at 80% 5%, rgba(251,191,154,0.25) 0%, transparent 65%), radial-gradient(40% 50% at 8% 30%, rgba(245,222,179,0.30) 0%, transparent 70%)",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-cocoa-700 mb-4">
              The Menu
            </p>
          </FadeIn>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-cocoa-900 leading-[0.95] tracking-tight max-w-5xl">
            <Line>Browse what&apos;s</Line>
            <Line delay={0.08}>currently baking.</Line>
          </h1>
          <FadeIn delay={0.4} className="mt-7 max-w-2xl">
            <p className="text-xl text-cocoa-700 font-medium leading-snug">
              Seasonal favorites, classic donuts, breakfast bites, and craft
              coffee — pulled fresh every morning.
            </p>
          </FadeIn>
          <FadeIn delay={0.55} className="mt-3 max-w-2xl">
            <p className="text-sm text-cocoa-700">
              Seasonal and limited-time offerings may vary by location.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ───── Sticky category tabs ───── */}
      <div className="sticky top-16 sm:top-20 z-30 bg-cream-50/85 backdrop-blur-xl border-y border-cream-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-4 px-2 sm:px-3">
            {filterOrder.map((cat) => {
              const isActive = active === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleTabClick(cat.id)}
                  className={`shrink-0 inline-flex items-center px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ease-out ${
                    isActive
                      ? "bg-cocoa-900 text-cream-50 shadow-md scale-[1.03]"
                      : "bg-cream-100 text-cocoa-800 hover:bg-cream-200"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ───── Items grid (always shows all sections; tabs are scroll anchors) ───── */}
      <section ref={gridRef} className="relative py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16 lg:space-y-20">
            {fullMenuCategories.map((cat, ci) => {
              const items = fullMenu.filter((item) => item.category === cat.id);
              if (items.length === 0) return null;
              return (
                <div
                  key={cat.id}
                  id={cat.id}
                  className="scroll-mt-40 sm:scroll-mt-44"
                >
                  <FadeIn delay={ci * 0.04}>
                    <SectionHeading label={cat.label} sub={cat.sub} />
                  </FadeIn>
                  <ItemsGrid items={items} reduceMotion={!!reduceMotion} />
                </div>
              );
            })}
          </div>

          {/* Bottom note */}
          <FadeIn className="mt-16">
            <p className="text-center text-sm text-cocoa-700 max-w-xl mx-auto">
              Menu items and pricing may vary by location. Some items are
              seasonal or available for a limited time.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ───── Community section ───── */}
      <FlavorRequest />
    </>
  );
}

function SectionHeading({ label, sub }: { label: string; sub: string }) {
  return (
    <div className="mb-8">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-cocoa-700 mb-1.5">
        {sub}
      </p>
      <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-cocoa-900 tracking-tight leading-[0.95]">
        {label}
      </h2>
    </div>
  );
}

function ItemsGrid({
  items,
  reduceMotion,
}: {
  items: MenuItem[];
  reduceMotion: boolean;
}) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
      {items.map((item, i) => (
        <ItemCard
          key={item.id}
          item={item}
          index={i}
          reduceMotion={reduceMotion}
        />
      ))}
    </div>
  );
}

function ItemCard({
  item,
  index,
  reduceMotion,
}: {
  item: MenuItem;
  index: number;
  reduceMotion: boolean;
}) {
  const surface = surfaces[index % surfaces.length];

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{
        duration: 0.6,
        delay: Math.min(index * 0.04, 0.4),
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={reduceMotion ? {} : { y: -6 }}
      className={`group relative overflow-hidden rounded-card ${surface.bg} border ${surface.border} shadow-sm hover:shadow-xl transition-shadow duration-500 h-full flex flex-col`}
    >
      <div className="relative aspect-[5/4] overflow-hidden">
        <FoodImage
          src={item.image}
          alt={item.name}
          fallbackBg={item.tone}
          className="w-full h-full"
          imgClassName="transition-transform duration-[1100ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-110"
        />
        <div className="absolute top-3 left-3 z-20 flex flex-wrap gap-1.5">
          {item.bestSeller && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-cream-50/95 text-cocoa-900 text-[10px] font-black uppercase tracking-wider shadow-sm backdrop-blur">
              Bestseller
            </span>
          )}
          {item.limitedTime && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-cream-50/95 text-cocoa-900 text-[10px] font-black uppercase tracking-wider shadow-sm backdrop-blur">
              Limited Time
            </span>
          )}
          {item.seasonal && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-cream-50/95 text-cocoa-900 text-[10px] font-black uppercase tracking-wider shadow-sm backdrop-blur">
              Seasonal
            </span>
          )}
        </div>
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="font-display text-xl sm:text-2xl font-black text-cocoa-900 leading-tight line-clamp-2 min-h-[2lh]">
          {item.name}
        </h3>
        <p className="mt-2 text-base text-cocoa-700 leading-snug line-clamp-2 min-h-[2lh]">
          {item.description}
        </p>
      </div>
    </motion.article>
  );
}
