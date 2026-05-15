"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, Bike, Clock, MapPin, Phone, ShoppingBag } from "lucide-react";
import type { PublicLocation } from "@/lib/locations/types";
import { FoodImage } from "@/components/ui/FoodImage";
import { FadeIn, Line } from "@/components/ui/Reveal";

type ActiveState = "all" | "AL" | "FL";

const tabs: { id: ActiveState; label: string; sectionId?: string }[] = [
  { id: "all", label: "All locations" },
  { id: "AL", label: "Alabama", sectionId: "AL" },
  { id: "FL", label: "Florida", sectionId: "FL" },
];

const stateGroups: { id: "AL" | "FL"; label: string; sub: string }[] = [
  { id: "AL", label: "Alabama", sub: "Mobile + Baldwin County" },
  { id: "FL", label: "Florida", sub: "Pensacola + Bellview" },
];

export default function LocationsPage() {
  const [active, setActive] = useState<ActiveState>("all");
  const [locations, setLocations] = useState<PublicLocation[] | null>(null);
  const reduceMotion = useReducedMotion();
  const gridRef = useRef<HTMLDivElement>(null);

  // Fetch real merchant locations from the public API on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/public/locations", {
          cache: "no-store",
        });
        const json = (await res.json()) as { locations?: PublicLocation[] };
        if (cancelled) return;
        setLocations(json.locations ?? []);
      } catch {
        if (cancelled) return;
        setLocations([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Group state-bucketed locations once.
  const grouped = useMemo(() => {
    const buckets: Record<"AL" | "FL", PublicLocation[]> = { AL: [], FL: [] };
    for (const loc of locations ?? []) {
      const k = (loc.state || "").toUpperCase();
      if (k === "AL" || k === "FL") buckets[k].push(loc);
    }
    return buckets;
  }, [locations]);

  // Auto-highlight tab based on which state section is below the sticky bar.
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const targetY = 200;
        let found: ActiveState = "all";
        for (const group of stateGroups) {
          const el = document.getElementById(group.id);
          if (!el) continue;
          if (el.getBoundingClientRect().top <= targetY) {
            found = group.id;
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

  const handleTabClick = (tab: { id: ActiveState; sectionId?: string }) => {
    setActive(tab.id);
    requestAnimationFrame(() => {
      if (tab.sectionId) {
        document.getElementById(tab.sectionId)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      } else {
        gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  };

  const totalCount = locations?.length ?? 0;
  const loading = locations === null;

  return (
    <>
      {/* ───── Intro ───── */}
      <section className="relative pt-32 sm:pt-36 lg:pt-40 pb-12 lg:pb-14 overflow-hidden">
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
              Locations
            </p>
          </FadeIn>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-cocoa-900 leading-[0.95] tracking-tight max-w-5xl">
            <Line>Find your local</Line>
            <Line delay={0.08}>Lickin&apos; Good.</Line>
          </h1>
          <FadeIn delay={0.4} className="mt-7 max-w-2xl">
            <p className="text-xl text-cocoa-700 font-medium leading-snug">
              Shops across Alabama and the Florida Panhandle — opening before
              sunrise, baking until the last donut sells.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ───── Sticky filter tabs ───── */}
      <div className="sticky top-16 sm:top-20 z-30 bg-cream-50/85 backdrop-blur-xl border-y border-cream-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-4 px-2 sm:px-3">
            {tabs.map((tab) => {
              const isActive = active === tab.id;
              const count =
                tab.id === "all"
                  ? totalCount
                  : grouped[tab.id as "AL" | "FL"].length;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabClick(tab)}
                  className={`shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ease-out ${
                    isActive
                      ? "bg-cocoa-900 text-cream-50 shadow-md scale-[1.03]"
                      : "bg-cream-100 text-cocoa-800 hover:bg-cream-200"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`inline-flex items-center justify-center min-w-[1.25rem] px-1.5 h-5 rounded-full text-[11px] font-black ${
                      isActive
                        ? "bg-cream-50/20 text-cream-50"
                        : "bg-cream-50 text-cocoa-700"
                    }`}
                  >
                    {loading ? "…" : count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ───── Grouped grids / states ───── */}
      <section ref={gridRef} className="relative pt-12 lg:pt-14 pb-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 lg:space-y-20">
          {loading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {!loading && totalCount === 0 && (
            <div className="rounded-card bg-cream-100 border border-cream-200 px-10 py-14 text-center">
              <MapPin
                size={22}
                className="text-cocoa-700 mx-auto mb-3"
                strokeWidth={1.75}
              />
              <p className="font-display text-2xl font-black text-cocoa-900">
                Locations coming soon.
              </p>
              <p className="mt-2 text-base text-cocoa-700 max-w-md mx-auto">
                Our shops are getting connected to the new ordering system.
                Check back in a moment.
              </p>
            </div>
          )}

          {!loading &&
            totalCount > 0 &&
            stateGroups.map((group, gi) => {
              const items = grouped[group.id];
              if (items.length === 0) return null;
              return (
                <div
                  key={group.id}
                  id={group.id}
                  className="scroll-mt-40 sm:scroll-mt-44"
                >
                  <FadeIn delay={gi * 0.04}>
                    <div className="mb-8">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-cocoa-700 mb-1.5">
                        {group.sub}
                      </p>
                      <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-cocoa-900 tracking-tight leading-[0.95]">
                        {group.label}
                      </h2>
                    </div>
                  </FadeIn>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
                    {items.map((loc, i) => (
                      <LocationCard
                        key={loc.slug}
                        loc={loc}
                        index={i}
                        reduceMotion={!!reduceMotion}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      </section>

      {/* ───── Coming soon ───── */}
      <section className="relative pb-24 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="relative overflow-hidden rounded-card bg-cream-100 border border-cream-200 p-10 sm:p-14 lg:p-16">
              <div
                aria-hidden
                className="absolute -top-20 -right-20 w-[420px] h-[420px] rounded-full opacity-50 blur-3xl"
                style={{
                  background:
                    "radial-gradient(closest-side, rgba(253,222,180,0.7), transparent 70%)",
                }}
              />
              <div className="relative grid lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7">
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-cocoa-700 mb-3">
                    Growing across the Gulf Coast
                  </p>
                  <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-cocoa-900 tracking-tight leading-[0.95]">
                    More locations coming soon.
                  </h2>
                  <p className="mt-5 text-lg text-cocoa-700 max-w-xl leading-snug">
                    We&apos;re scouting hometowns across Alabama, Florida, and
                    beyond. Have a town that needs a Lickin&apos; Good? Let us
                    know — we&apos;re listening.
                  </p>
                </div>
                <div className="lg:col-span-5 flex lg:justify-end">
                  <a
                    href="mailto:hello@lickingooddonuts.com"
                    className="group inline-flex items-center gap-2 px-7 py-4 rounded-full bg-cocoa-900 hover:bg-cocoa-800 text-cream-50 font-bold text-base transition-all duration-500 ease-out hover:scale-[1.03]"
                  >
                    Suggest a location
                    <ArrowUpRight
                      size={18}
                      className="transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </a>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}

function LocationCard({
  loc,
  index,
  reduceMotion,
}: {
  loc: PublicLocation;
  index: number;
  reduceMotion: boolean;
}) {
  const cityLabel = loc.city || loc.state;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{
        duration: 0.55,
        delay: Math.min(index * 0.04, 0.4),
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={reduceMotion ? {} : { y: -4 }}
      className="group relative rounded-card overflow-hidden bg-cream-50 border border-cream-200 shadow-sm hover:shadow-xl transition-shadow duration-500 flex flex-col h-full"
    >
      {/* Photo */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <FoodImage
          src={loc.image}
          alt={`${loc.name}, ${loc.state}`}
          fallbackBg="bg-stone-200"
          className="w-full h-full"
          imgClassName="transition-transform duration-[1100ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-105"
        />
        {loc.state && (
          <span className="absolute top-3 right-3 inline-flex items-center px-2.5 py-1 rounded-full bg-cream-50/95 text-cocoa-900 text-[10px] font-black uppercase tracking-wider shadow-sm backdrop-blur">
            {loc.state}
          </span>
        )}
        {/* Open / Closed pill — top-left over the photo */}
        <span
          className={`absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm backdrop-blur ${
            loc.isOpenNow
              ? "bg-emerald-50/95 text-emerald-900 border border-emerald-200"
              : "bg-stone-100/95 text-stone-700 border border-stone-200"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              loc.isOpenNow ? "bg-emerald-500" : "bg-stone-400"
            }`}
          />
          {loc.isOpenNow ? "Open now" : "Closed"}
        </span>
      </div>

      {/* Body */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col">
        <h3 className="font-display text-2xl font-black text-cocoa-900 leading-tight">
          {loc.name}
        </h3>
        <p className="text-sm text-cocoa-700 mt-1">
          {cityLabel}
          {loc.city && loc.state ? `, ${loc.state}` : ""}
        </p>

        <ul className="mt-4 space-y-2 text-sm text-cocoa-700">
          {loc.todayLabel && loc.todayLabel !== "Hours not available" && (
            <li className="flex items-start gap-2">
              <Clock size={14} className="mt-0.5 shrink-0 text-cocoa-900" />
              <span>{loc.todayLabel}</span>
            </li>
          )}
          {loc.address && (
            <li className="flex items-start gap-2">
              <MapPin size={14} className="mt-0.5 shrink-0 text-cocoa-900" />
              <span>{loc.address}</span>
            </li>
          )}
          {loc.phone && (
            <li className="flex items-center gap-2">
              <Phone size={14} className="shrink-0 text-cocoa-900" />
              <a
                href={`tel:${loc.phone}`}
                className="hover:text-cocoa-900 font-semibold"
              >
                {loc.phone}
              </a>
            </li>
          )}
        </ul>

        {/* Action pills — gated on merchant's per-channel toggles */}
        <div className="mt-auto pt-5 flex flex-wrap gap-2">
          {loc.pickup && (
            <Link
              href={`/order/pickup/${loc.slug}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-cocoa-900 hover:bg-cocoa-800 text-cream-50 text-xs font-bold transition-colors"
            >
              <ShoppingBag size={13} /> Pickup
            </Link>
          )}
          {loc.delivery && (
            <Link
              href="/order/delivery"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-cream-100 hover:bg-cream-200 text-cocoa-900 text-xs font-bold transition-colors"
            >
              <Bike size={13} /> Delivery
            </Link>
          )}
          <a
            href={loc.mapUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-cream-100 hover:bg-cream-200 text-cocoa-900 text-xs font-bold transition-colors"
          >
            <ArrowUpRight size={13} /> Directions
          </a>
        </div>
      </div>
    </motion.article>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-card overflow-hidden bg-cream-50 border border-cream-200 shadow-sm">
      <div className="aspect-[16/10] bg-cream-100 animate-pulse" />
      <div className="p-5 sm:p-6 space-y-3">
        <div className="h-6 bg-cream-100 rounded-md w-2/3 animate-pulse" />
        <div className="h-3 bg-cream-100 rounded-md w-1/2 animate-pulse" />
        <div className="h-3 bg-cream-100 rounded-md w-4/5 animate-pulse" />
        <div className="h-3 bg-cream-100 rounded-md w-2/5 animate-pulse" />
      </div>
    </div>
  );
}
