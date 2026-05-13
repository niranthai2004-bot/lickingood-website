"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  MapPin,
  Minus,
  Phone,
  Plus,
  ShoppingBag,
  X,
} from "lucide-react";
import {
  availabilityChip,
  availabilityLabel,
  calculateBundlePrice,
  type PickupItem,
} from "@/data/menuFull";
import { FoodImage } from "@/components/ui/FoodImage";
import { FadeIn } from "@/components/ui/Reveal";
import {
  DesktopTracker,
  MobileTracker,
  type BundleBuildLine,
  type BundleSize,
  type CartBundleLine,
  type CartLine,
} from "@/components/pickup/BoxBuilder";
import { BundleModule } from "@/components/pickup/BundleModule";
import { MiniCart } from "@/components/pickup/MiniCart";

type ActiveId = string;

type LocationHeader = {
  slug: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string | null;
  mapUrl: string;
};

type DynamicCategory = { id: string; label: string };

type MenuResponse = {
  location: LocationHeader;
  categories: DynamicCategory[];
  items: PickupItem[];
};

export default function PickupMenuPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";

  const [location, setLocation] = useState<LocationHeader | null>(null);
  const [categories, setCategories] = useState<DynamicCategory[]>([]);
  const [items, setItems] = useState<PickupItem[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "notfound">(
    "loading",
  );

  const [active, setActive] = useState<ActiveId>("all");
  // Global cart can hold both items and bundles.
  const [cart, setCart] = useState<CartLine[]>([]);
  // Bundle is a fully isolated build state — only commits to cart on confirm.
  const [bundleBuild, setBundleBuild] = useState<BundleBuildLine[]>([]);
  const [bundleMode, setBundleMode] = useState(false);
  const [bundleSize, setBundleSize] = useState<BundleSize>(12);
  const gridRef = useRef<HTMLDivElement>(null);
  const firstCategoryRef = useRef<HTMLDivElement>(null);

  // Fetch this location's menu (location header + categories + items) from
  // the synced Square data via the public API. Replaces the previous direct
  // import of hardcoded menuFull.ts content.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/public/locations/${encodeURIComponent(slug)}/menu`,
          { cache: "no-store" },
        );
        if (!res.ok) {
          if (cancelled) return;
          setStatus("notfound");
          return;
        }
        const json = (await res.json()) as MenuResponse;
        if (cancelled) return;
        setLocation(json.location);
        setCategories(json.categories);
        setItems(json.items);
        setStatus("ready");
      } catch {
        if (cancelled) return;
        setStatus("notfound");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Tab order — "All" pinned first, then dynamic categories from Square.
  const filterOrder: { id: ActiveId; label: string }[] = [
    { id: "all", label: "All" },
    ...categories.map((c) => ({ id: c.id, label: c.label })),
  ];

  // Auto-highlight tab on scroll
  useEffect(() => {
    if (status !== "ready") return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const targetY = 200;
        let found: ActiveId = "all";
        for (const cat of categories) {
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
  }, [categories, status]);

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

  /* ---------- Cart-vs-Bundle routing ---------- */

  const onIncrement = (id: string) => {
    const item = items.find((m) => m.id === id);
    if (!item) return;
    if (bundleMode && item.dozenEligible) {
      setBundleBuild((prev) => {
        const existing = prev.find((l) => l.item.id === id);
        if (existing) {
          return prev.map((l) =>
            l.item.id === id ? { ...l, qty: l.qty + 1 } : l,
          );
        }
        return [...prev, { item, qty: 1 }];
      });
    } else {
      setCart((prev) => {
        const existing = prev.find(
          (l): l is Extract<CartLine, { kind: "item" }> =>
            l.kind === "item" && l.item.id === id,
        );
        if (existing) {
          return prev.map((l) =>
            l.kind === "item" && l.item.id === id
              ? { ...l, qty: l.qty + 1 }
              : l,
          );
        }
        return [...prev, { kind: "item", item, qty: 1 }];
      });
    }
  };

  const onDecrement = (id: string) => {
    const item = items.find((m) => m.id === id);
    if (!item) return;
    if (bundleMode && item.dozenEligible) {
      setBundleBuild((prev) => {
        const existing = prev.find((l) => l.item.id === id);
        if (!existing) return prev;
        if (existing.qty <= 1) return prev.filter((l) => l.item.id !== id);
        return prev.map((l) =>
          l.item.id === id ? { ...l, qty: l.qty - 1 } : l,
        );
      });
    } else {
      setCart((prev) => {
        const next: CartLine[] = [];
        for (const line of prev) {
          if (line.kind === "item" && line.item.id === id) {
            if (line.qty > 1) {
              next.push({ ...line, qty: line.qty - 1 });
            }
            // else drop the line entirely
          } else {
            next.push(line);
          }
        }
        return next;
      });
    }
  };

  const onClearCart = () => setCart([]);
  const onClearBundleBuild = () => setBundleBuild([]);

  const onRemoveBundleFromCart = (bundleId: string) => {
    setCart((prev) =>
      prev.filter((l) => !(l.kind === "bundle" && l.id === bundleId)),
    );
  };

  // Card qty pulls from whichever pool is currently being targeted.
  const cardQty = (id: string): number => {
    const item = items.find((m) => m.id === id);
    if (!item) return 0;
    if (bundleMode && item.dozenEligible) {
      return bundleBuild.find((l) => l.item.id === id)?.qty ?? 0;
    }
    const itemLine = cart.find(
      (l): l is Extract<CartLine, { kind: "item" }> =>
        l.kind === "item" && l.item.id === id,
    );
    return itemLine?.qty ?? 0;
  };

  // Slot count for the building bundle (respects slotSize for fritter/roll)
  const dozenSlotsFilled = bundleBuild.reduce(
    (sum, l) => sum + l.qty * (l.item.slotSize ?? 1),
    0,
  );

  const handleStartCustomize = () => {
    setBundleMode(true);
    requestAnimationFrame(() => {
      firstCategoryRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const handleConfirmBundle = () => {
    if (bundleBuild.length === 0) {
      setBundleMode(false);
      return;
    }
    const unitPrice = calculateBundlePrice(bundleBuild, bundleSize);
    const totalDonuts = bundleBuild.reduce(
      (sum, l) => sum + l.qty * (l.item.slotSize ?? 1),
      0,
    );
    const sizeLabel = bundleSize === 6 ? "Half Dozen" : "Dozen";
    const newBundle: CartBundleLine = {
      kind: "bundle",
      id: `bundle-${Date.now()}`,
      size: bundleSize,
      contents: bundleBuild.map((l) => ({ item: l.item, qty: l.qty })),
      unitPrice,
      qty: 1,
      label: `Custom ${sizeLabel}`,
      summary: `${totalDonuts} assorted donut${totalDonuts === 1 ? "" : "s"}`,
    };
    setCart((prev) => [...prev, newBundle]);
    setBundleBuild([]);
    setBundleMode(false);
  };

  const handleCancelBundle = () => {
    setBundleBuild([]);
    setBundleMode(false);
  };

  // ─── Loading skeleton ───
  if (status === "loading") {
    return (
      <section className="pt-32 pb-32 max-w-3xl mx-auto px-4 text-center">
        <Loader2
          size={24}
          className="animate-spin text-cocoa-900 mx-auto mb-4"
        />
        <p className="text-sm text-cocoa-700">Loading menu…</p>
      </section>
    );
  }

  // ─── Location not found ───
  if (status === "notfound" || !location) {
    return (
      <section className="pt-32 pb-32 max-w-3xl mx-auto px-4 text-center">
        <h1 className="font-display text-4xl font-black text-cocoa-900">
          Location not found.
        </h1>
        <p className="mt-4 text-cocoa-700">
          We couldn&apos;t find a Lickin&apos; Good with that slug.
        </p>
        <Link
          href="/order/pickup"
          className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-cocoa-900 text-cream-50 font-bold"
        >
          <ArrowLeft size={16} /> Pick a different shop
        </Link>
      </section>
    );
  }

  return (
    <>
      {/* ───── Selected location header ───── */}
      <section className="relative pt-28 sm:pt-32 lg:pt-36 pb-8 lg:pb-10 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-cream-100 via-cream-50 to-cream-50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <Link
              href="/order/pickup"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-cocoa-700 hover:text-cocoa-900 transition-colors mb-4"
            >
              <ArrowLeft size={14} /> Change location
            </Link>
          </FadeIn>
          <FadeIn delay={0.05}>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-cocoa-700 mb-3">
              Pickup{location.state ? ` · ${location.state}` : ""}
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-cocoa-900 leading-[0.95] tracking-tight">
              {location.name}
            </h1>
            <p className="mt-2 text-base text-cocoa-700">
              {location.city
                ? `${location.city}${location.state ? `, ${location.state}` : ""}`
                : location.state}
            </p>
          </FadeIn>
          <FadeIn delay={0.15} className="mt-5">
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-cocoa-700">
              {location.address && (
                <li className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-cocoa-900" />
                  <a
                    href={location.mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold hover:text-cocoa-900"
                  >
                    {location.address}
                  </a>
                </li>
              )}
              {location.phone && (
                <li className="flex items-center gap-1.5">
                  <Phone size={14} className="text-cocoa-900" />
                  <a
                    href={`tel:${location.phone}`}
                    className="font-semibold hover:text-cocoa-900"
                  >
                    {location.phone}
                  </a>
                </li>
              )}
            </ul>
          </FadeIn>
        </div>
      </section>

      {/* ───── Empty-state when this location has no synced items yet ───── */}
      {items.length === 0 && (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 lg:pb-32">
          <div className="rounded-card bg-cream-100 border border-cream-200 px-8 py-14 text-center">
            <ShoppingBag
              size={22}
              className="text-cocoa-700 mx-auto mb-3"
              strokeWidth={1.75}
            />
            <p className="font-display text-2xl font-black text-cocoa-900">
              Online ordering coming soon for this shop.
            </p>
            <p className="mt-2 text-base text-cocoa-700 max-w-md mx-auto">
              This location is getting connected to the new ordering system.
              In the meantime, swing by — fresh donuts every morning.
            </p>
            <Link
              href="/order/pickup"
              className="mt-7 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-cocoa-900 hover:bg-cocoa-800 text-cream-50 font-bold transition-colors"
            >
              <ArrowLeft size={14} /> Pick a different shop
            </Link>
          </div>
        </section>
      )}

      {items.length > 0 && (
        <>
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

          {/* ───── Bundle-mode banner with X to exit ───── */}
          {bundleMode && (
            <div className="sticky top-[121px] sm:top-[145px] z-20 bg-cocoa-900 text-cream-50 border-b border-cocoa-800">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cream-100/80">
                    Building bundle
                  </p>
                  <p className="text-sm font-bold truncate">
                    {dozenSlotsFilled} / {bundleSize} selected
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCancelBundle}
                  aria-label="Exit bundle building"
                  className="w-8 h-8 rounded-full bg-cocoa-800 hover:bg-cocoa-700 flex items-center justify-center text-cream-100 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>
            </div>
          )}

          {/* ───── Two-column body ───── */}
          <section
            ref={gridRef}
            className="relative py-8 lg:py-12 pb-32 lg:pb-16"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div
                className={
                  bundleMode
                    ? "lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8 xl:gap-10"
                    : ""
                }
              >
                <main className="min-w-0">
                  <FadeIn className="mb-8 lg:mb-10">
                    <BundleModule
                      bundleSize={bundleSize}
                      bundleMode={bundleMode}
                      onChange={setBundleSize}
                      onCustomize={handleStartCustomize}
                    />
                  </FadeIn>

                  <div className="space-y-14 lg:space-y-20">
                    {categories.map((cat, ci) => {
                      const itemsInCat = items.filter(
                        (item) => item.category === cat.id,
                      );
                      if (itemsInCat.length === 0) return null;
                      return (
                        <div
                          key={cat.id}
                          id={cat.id}
                          ref={ci === 0 ? firstCategoryRef : undefined}
                          className="scroll-mt-40 sm:scroll-mt-44"
                        >
                          <FadeIn delay={ci * 0.04}>
                            <div className="mb-8">
                              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-cocoa-900 tracking-tight leading-[0.95]">
                                {cat.label}
                              </h2>
                            </div>
                          </FadeIn>
                          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6 auto-rows-fr">
                            {itemsInCat.map((item, i) => (
                              <PickupItemCard
                                key={item.id}
                                item={item}
                                index={i}
                                qty={cardQty(item.id)}
                                bundleMode={bundleMode}
                                onIncrement={onIncrement}
                                onDecrement={onDecrement}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}

                    <FadeIn>
                      <p className="text-center text-xs text-cocoa-700 max-w-xl mx-auto pt-4">
                        Menu items, pricing, and availability vary by location.
                      </p>
                    </FadeIn>
                  </div>
                </main>

                {/* Right sticky bundle tracker — only in bundle mode (lg+) */}
                {bundleMode && (
                  <aside className="hidden lg:block">
                    <DesktopTracker
                      buildItems={bundleBuild}
                      bundleSize={bundleSize}
                      onIncrement={onIncrement}
                      onDecrement={onDecrement}
                      onClear={onClearBundleBuild}
                      onAddToCart={handleConfirmBundle}
                    />
                  </aside>
                )}
              </div>
            </div>
          </section>

          {/* Mobile bundle tracker — only in bundle mode */}
          {bundleMode && (
            <MobileTracker
              buildItems={bundleBuild}
              bundleSize={bundleSize}
              onIncrement={onIncrement}
              onDecrement={onDecrement}
              onClear={onClearBundleBuild}
              onAddToCart={handleConfirmBundle}
            />
          )}

          {/* Always-visible global mini-cart */}
          <MiniCart
            cart={cart}
            onIncrementItem={onIncrement}
            onDecrementItem={onDecrement}
            onRemoveBundle={onRemoveBundleFromCart}
            onClear={onClearCart}
          />
        </>
      )}
    </>
  );
}

function PickupItemCard({
  item,
  index,
  qty,
  bundleMode,
  onIncrement,
  onDecrement,
}: {
  item: PickupItem;
  index: number;
  qty: number;
  bundleMode: boolean;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
}) {
  const soldOut = item.availability === "sold-out";
  const addLabel = soldOut
    ? "Sold out"
    : bundleMode && item.dozenEligible
      ? "Add to box"
      : "Add";

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{
        duration: 0.55,
        delay: Math.min(index * 0.04, 0.35),
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`group relative overflow-hidden rounded-card bg-cream-50 border border-cream-200 shadow-sm hover:shadow-xl transition-shadow duration-500 h-full flex flex-col ${
        soldOut ? "opacity-70" : ""
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
          {item.limitedTime && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-cream-50/95 text-cocoa-900 text-[10px] font-black uppercase tracking-wider shadow-sm backdrop-blur">
              Limited Time
            </span>
          )}
          {item.slotSize === 2 && item.dozenEligible && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-cocoa-900/90 text-cream-50 text-[10px] font-black uppercase tracking-wider shadow-sm backdrop-blur">
              2 slots
            </span>
          )}
        </div>
        {item.availability !== "fresh" && (
          <div className="absolute top-3 right-3 z-20">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm backdrop-blur ${availabilityChip[item.availability]}`}
            >
              {availabilityLabel[item.availability]}
            </span>
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-xl font-black text-cocoa-900 leading-tight line-clamp-2 min-h-[2lh]">
              {item.name}
            </h3>
            <span className="font-display text-xl font-black text-cocoa-900 whitespace-nowrap">
              ${item.price.toFixed(2)}
            </span>
          </div>
          <p className="mt-2 text-sm text-cocoa-700 leading-snug line-clamp-2 min-h-[2lh]">
            {item.description}
          </p>
          {item.calories && (
            <p className="mt-2 text-xs text-cocoa-700/80">
              {item.calories} cal
            </p>
          )}
        </div>

        <div className="mt-auto pt-5">
          {qty === 0 ? (
            <button
              type="button"
              disabled={soldOut}
              onClick={() => onIncrement(item.id)}
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-cocoa-900 hover:bg-cocoa-800 disabled:bg-cream-200 disabled:text-cocoa-700 disabled:cursor-not-allowed text-cream-50 text-sm font-bold transition-all duration-300 hover:scale-[1.01]"
            >
              <Plus size={14} />
              {addLabel}
            </button>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 bg-cream-100 rounded-full p-1">
                <button
                  type="button"
                  onClick={() => onDecrement(item.id)}
                  aria-label={`Remove one ${item.name}`}
                  className="w-9 h-9 rounded-full bg-cream-50 hover:bg-cream-200 flex items-center justify-center text-cocoa-800 transition-colors"
                >
                  <Minus size={15} />
                </button>
                <span className="min-w-[1.75rem] text-center text-sm font-black text-cocoa-900 tabular-nums">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => onIncrement(item.id)}
                  aria-label={`Add one more ${item.name}`}
                  className="w-9 h-9 rounded-full bg-cocoa-900 hover:bg-cocoa-800 flex items-center justify-center text-cream-50 transition-colors"
                >
                  <Plus size={15} />
                </button>
              </div>
              <span className="font-display text-sm font-black text-cocoa-900 tabular-nums">
                ${(item.price * qty).toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}
