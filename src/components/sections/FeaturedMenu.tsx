"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useState } from "react";
import { featuredMenu, type MenuItem } from "@/data/menu";
import { FoodImage } from "@/components/ui/FoodImage";
import { FadeIn, Line } from "@/components/ui/Reveal";
import { MobileInfiniteCarousel } from "@/components/ui/MobileInfiniteCarousel";
import { OrderTypeModal } from "@/components/pickup/OrderTypeModal";

const cardSurfaces = [
  { bg: "bg-amber-50", border: "border-amber-100" },
  { bg: "bg-rose-50", border: "border-rose-100" },
  { bg: "bg-violet-50", border: "border-violet-100" },
  { bg: "bg-sky-50", border: "border-sky-100" },
  { bg: "bg-stone-100", border: "border-stone-200" },
  { bg: "bg-orange-50", border: "border-orange-100" },
];

export function FeaturedMenu() {
  const reduceMotion = useReducedMotion();
  const items = featuredMenu.slice(0, 6);
  const [pendingItem, setPendingItem] = useState<MenuItem | null>(null);

  return (
    <section id="menu" className="relative py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10 lg:mb-14">
          <div className="max-w-2xl">
            <FadeIn>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-cocoa-700 mb-3">
                The Menu
              </p>
            </FadeIn>
            <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-cocoa-900 leading-[0.95] tracking-tight">
              <Line>Bites worth</Line>
              <Line delay={0.1}>the drive.</Line>
            </h2>
          </div>
          <FadeIn delay={0.2} className="self-start lg:self-end">
            <Link
              href="/menu"
              className="inline-flex items-center px-6 py-3 rounded-full bg-cocoa-900 hover:bg-cocoa-800 text-cream-50 text-sm font-bold transition-all duration-500 ease-out hover:scale-[1.04]"
            >
              See full menu →
            </Link>
          </FadeIn>
        </div>

        {/* Desktop: 3-col grid */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6 lg:gap-7">
          {items.map((item, i) => {
            const surface = cardSurfaces[i % cardSurfaces.length];
            return (
              <FeaturedCard
                key={item.id}
                item={item}
                index={i}
                surface={surface}
                reduceMotion={!!reduceMotion}
                onAdd={() => setPendingItem(item)}
              />
            );
          })}
        </div>

        {/* Mobile: seamless infinite carousel */}
        <div className="lg:hidden -mx-4 px-4">
          <MobileInfiniteCarousel
            items={items}
            ariaLabel="Featured menu items"
            className="gap-4"
            itemClassName="w-[78%] sm:w-[55%]"
            renderItem={(item, idx) => {
              const surface = cardSurfaces[idx % cardSurfaces.length];
              return (
                <FeaturedCard
                  item={item}
                  index={idx}
                  surface={surface}
                  reduceMotion={!!reduceMotion}
                  onAdd={() => setPendingItem(item)}
                />
              );
            }}
          />
        </div>
      </div>

      <OrderTypeModal
        open={pendingItem !== null}
        onClose={() => setPendingItem(null)}
        itemName={pendingItem?.name}
      />
    </section>
  );
}

function FeaturedCard({
  item,
  index,
  surface,
  reduceMotion,
  onAdd,
}: {
  item: MenuItem;
  index: number;
  surface: { bg: string; border: string };
  reduceMotion: boolean;
  onAdd: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{
        duration: 0.7,
        delay: Math.min(index * 0.08, 0.4),
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group h-full"
    >
      <motion.article
        whileHover={reduceMotion ? {} : { y: -8 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
        className={`relative overflow-hidden rounded-card ${surface.bg} border ${surface.border} shadow-sm hover:shadow-2xl transition-shadow duration-500 h-full flex flex-col`}
      >
        <div className="relative aspect-[5/4] overflow-hidden">
          <FoodImage
            src={item.image}
            alt={item.name}
            fallbackBg={item.tone}
            className="w-full h-full"
            imgClassName="transition-transform duration-[1100ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-110"
          />
          <div
            aria-hidden
            className="absolute inset-0 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background:
                "linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.10) 100%)",
            }}
          />
          {item.bestSeller && (
            <span className="absolute top-4 left-4 inline-flex items-center px-3 py-1.5 rounded-full bg-cream-50/95 text-cocoa-900 text-[11px] font-black uppercase tracking-wider shadow-sm backdrop-blur z-20">
              Bestseller
            </span>
          )}
        </div>
        <div className="p-6 flex-1 flex flex-col">
          <div>
            <h3 className="font-display text-2xl font-black text-cocoa-900 leading-tight mb-2 line-clamp-2 min-h-[2lh]">
              {item.name}
            </h3>
            <p className="text-base text-cocoa-700 leading-snug line-clamp-2 min-h-[2lh]">
              {item.description}
            </p>
          </div>
          <button
            type="button"
            onClick={onAdd}
            className="group/btn relative mt-auto pt-5 inline-flex items-center justify-center gap-1.5 text-sm font-bold transition-all duration-500 ease-out"
          >
            <span className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-full bg-cocoa-900 hover:bg-cocoa-800 text-cream-50 transition-all duration-500 ease-out group-hover/btn:scale-[1.02]">
              <Plus
                size={16}
                className="transition-transform duration-500 group-hover/btn:rotate-90"
              />
              Add to order
            </span>
          </button>
        </div>
      </motion.article>
    </motion.div>
  );
}
