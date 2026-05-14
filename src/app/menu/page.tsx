"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Plus, X } from "lucide-react";
import {
  coreMenu,
  coreMenuCategories,
  type CoreMenuItem,
  type CoreCategory,
} from "@/data/coreMenu";
import { FoodImage } from "@/components/ui/FoodImage";
import { FadeIn, Line } from "@/components/ui/Reveal";
import { FlavorRequest } from "@/components/sections/FlavorRequest";

type ActiveId = CoreCategory | "all";

const filterOrder: { id: ActiveId; label: string }[] = [
  { id: "all", label: "All" },
  ...coreMenuCategories.map((c) => ({ id: c.id as ActiveId, label: c.label })),
];

export default function MenuPage() {
  const [active, setActive] = useState<ActiveId>("all");
  const [openItem, setOpenItem] = useState<CoreMenuItem | null>(null);
  const reduceMotion = useReducedMotion();
  const gridRef = useRef<HTMLDivElement>(null);

  // Auto-highlight tab on scroll
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const targetY = 200;
        let found: ActiveId = "all";
        for (const cat of coreMenuCategories) {
          const el = document.getElementById(cat.id);
          if (!el) continue;
          if (el.getBoundingClientRect().top <= targetY) {
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

  // Lock body scroll while modal is open
  useEffect(() => {
    if (openItem) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [openItem]);

  const handleTabClick = (id: ActiveId) => {
    setActive(id);
    requestAnimationFrame(() => {
      if (id === "all") {
        gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        document.getElementById(id)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
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
              Our core lineup, organized clean. Flavors and variants live
              inside each card — tap to peek.
            </p>
          </FadeIn>
          <FadeIn delay={0.55} className="mt-3 max-w-2xl">
            <p className="text-sm text-cocoa-700">
              Specials, seasonal items, and exclusive flavors may vary by
              location.
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

      {/* ───── Items grid (sections per category) ───── */}
      <section ref={gridRef} className="relative py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16 lg:space-y-20">
            {coreMenuCategories.map((cat, ci) => {
              const items = coreMenu.filter((item) => item.category === cat.id);
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
                  <ItemsGrid
                    items={items}
                    reduceMotion={!!reduceMotion}
                    onOpenVariants={setOpenItem}
                  />
                </div>
              );
            })}
          </div>

          <FadeIn className="mt-16">
            <p className="text-center text-sm text-cocoa-700 max-w-xl mx-auto">
              Menu items and pricing may vary by location. Some items are
              seasonal or available for a limited time.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ───── Variant picker modal ───── */}
      <AnimatePresence>
        {openItem && (
          <VariantsModal item={openItem} onClose={() => setOpenItem(null)} />
        )}
      </AnimatePresence>

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
  onOpenVariants,
}: {
  items: CoreMenuItem[];
  reduceMotion: boolean;
  onOpenVariants: (item: CoreMenuItem) => void;
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-7">
      {items.map((item, i) => (
        <ItemCard
          key={item.id}
          item={item}
          index={i}
          reduceMotion={reduceMotion}
          onOpenVariants={onOpenVariants}
        />
      ))}
    </div>
  );
}

function ItemCard({
  item,
  index,
  reduceMotion,
  onOpenVariants,
}: {
  item: CoreMenuItem;
  index: number;
  reduceMotion: boolean;
  onOpenVariants: (item: CoreMenuItem) => void;
}) {
  const hasVariants = !!item.variants && item.variants.length > 0;

  // Whole-card click opens variants for items that have them; for single
  // items, the card is still a focal element but doesn't open anything.
  const onCardClick = () => {
    if (hasVariants) onOpenVariants(item);
  };

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
      onClick={onCardClick}
      role={hasVariants ? "button" : undefined}
      tabIndex={hasVariants ? 0 : undefined}
      onKeyDown={(e) => {
        if (!hasVariants) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenVariants(item);
        }
      }}
      className={`group relative overflow-hidden rounded-card ${item.tone} border border-cream-200 shadow-sm hover:shadow-xl transition-shadow duration-500 h-full flex flex-col ${
        hasVariants ? "cursor-pointer" : ""
      }`}
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
          {item.seasonal && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-cream-50/95 text-cocoa-900 text-[10px] font-black uppercase tracking-wider shadow-sm backdrop-blur">
              Seasonal
            </span>
          )}
        </div>
        {hasVariants && (
          <span className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 inline-flex items-center gap-0.5 sm:gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-cocoa-900/90 text-cream-50 text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow-sm backdrop-blur">
            <Plus size={9} className="sm:hidden" />
            <Plus size={10} className="hidden sm:block" />
            <span className="sm:hidden">{item.variants!.length}</span>
            <span className="hidden sm:inline">
              {item.variants!.length} flavors
            </span>
          </span>
        )}
      </div>
      <div className="p-4 sm:p-6 flex-1 flex flex-col">
        <h3 className="font-display text-base sm:text-xl lg:text-2xl font-black text-cocoa-900 leading-tight line-clamp-2 min-h-[2lh]">
          {item.name}
        </h3>
        <p className="mt-1 sm:mt-2 text-xs sm:text-base text-cocoa-700 leading-snug line-clamp-2 min-h-[2lh]">
          {item.description}
        </p>

        {hasVariants && (
          <div className="mt-3 sm:mt-4">
            <span className="inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-bold text-cocoa-900 group-hover:gap-2 transition-all duration-300">
              See all flavors
              <ChevronDown size={12} className="rotate-[-90deg] sm:hidden" />
              <ChevronDown
                size={13}
                className="rotate-[-90deg] hidden sm:block"
              />
            </span>
          </div>
        )}
      </div>
    </motion.article>
  );
}

function VariantsModal({
  item,
  onClose,
}: {
  item: CoreMenuItem;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      className="fixed inset-0 z-[70] bg-cocoa-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center px-0 sm:px-4 py-0 sm:py-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-cream-50 sm:rounded-3xl rounded-t-3xl border-t sm:border border-cream-200 shadow-2xl overflow-hidden max-h-[88vh] flex flex-col"
      >
        {/* Header image */}
        <div className="relative aspect-[16/9] overflow-hidden">
          <FoodImage
            src={item.image}
            alt={item.name}
            fallbackBg={item.tone}
            className="w-full h-full"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-cream-50/95 hover:bg-cream-50 flex items-center justify-center text-cocoa-900 shadow-md backdrop-blur transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 sm:p-7 overflow-y-auto">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cocoa-700 mb-1.5">
            {item.variants?.length ?? 0} flavors available
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-cocoa-900 leading-tight">
            {item.name}
          </h2>
          <p className="mt-2 text-base text-cocoa-700">{item.description}</p>

          <ul className="mt-6 grid sm:grid-cols-2 gap-2.5">
            {item.variants?.map((v) => (
              <li
                key={v.id}
                className="flex items-start gap-3 rounded-2xl border border-cream-200 bg-cream-50 px-4 py-3"
              >
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cocoa-900 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-cocoa-900 leading-tight">
                    {v.name}
                  </p>
                  {v.hint && (
                    <p className="text-xs text-cocoa-700 mt-0.5">{v.hint}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-5 text-xs text-cocoa-700">
            Availability varies by location. To order, head to your local
            shop&apos;s pickup page.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
