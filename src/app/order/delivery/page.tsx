"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  Bike,
  MapPin,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";
import type { PublicLocation } from "@/lib/locations/types";
import { FadeIn, Line } from "@/components/ui/Reveal";

// Address suggestions are aggregated from the merchant locations we've
// actually synced (treats their cities/streets as known address hints).
// Real Google Places autocomplete lands in Phase D-b.
const SAMPLE_ADDRESS_HINTS = [
  "Mobile, AL",
  "Fairhope, AL",
  "Gulf Shores, AL",
  "Pensacola, FL",
];

export default function DeliveryPickerPage() {
  const [locations, setLocations] = useState<PublicLocation[]>([]);
  const [query, setQuery] = useState("");
  const [openDropdown, setOpenDropdown] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Pull the live merchant-locations list once on mount. Only shops with
  // delivery_enabled = true are eligible. Phase D-b will add geocoding +
  // haversine ranking so we actually compute distance from the customer.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/public/locations", { cache: "no-store" });
        const json = (await res.json()) as { locations?: PublicLocation[] };
        if (cancelled) return;
        setLocations(
          (json.locations ?? []).filter((l) => l.delivery !== false),
        );
      } catch {
        if (cancelled) return;
        setLocations([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Build address suggestions from the merchant addresses we've already
  // synced, plus a handful of broader regional hints.
  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    const fromLocations = locations
      .map((l) => ({ label: l.address }))
      .filter((s) => !!s.label);
    const fromHints = SAMPLE_ADDRESS_HINTS.map((label) => ({ label }));
    const all = [...fromLocations, ...fromHints];
    if (!q) return all.slice(0, 6);
    return all.filter((s) => s.label.toLowerCase().includes(q)).slice(0, 6);
  }, [query, locations]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // After address selection, surface the most-relevant shops. Real
  // distance ranking ships in Phase D-b (geocoding + haversine); for
  // now we filter by state extracted from the address string.
  const nearestLocations = useMemo<PublicLocation[]>(() => {
    if (!selectedAddress) return [];
    const isFL = /\bFL\b/i.test(selectedAddress);
    const isAL = /\bAL\b/i.test(selectedAddress);
    if (isFL) return locations.filter((l) => l.state === "FL");
    if (isAL) return locations.filter((l) => l.state === "AL");
    // No state hint — just show every delivery-enabled location.
    return locations;
  }, [selectedAddress, locations]);

  const handleSelectAddress = (label: string) => {
    setSelectedAddress(label);
    setQuery(label);
    setOpenDropdown(false);
  };

  return (
    <>
      {/* ───── Mode toggle + address search ───── */}
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

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black text-cocoa-900 leading-[0.95] tracking-tight">
            <Line>Where should we</Line>
            <Line delay={0.08}>deliver to?</Line>
          </h1>

          {/* Pickup / Delivery toggle */}
          <FadeIn delay={0.4} className="mt-9">
            <div
              role="tablist"
              className="inline-flex p-1.5 bg-cream-100 border border-cream-200 rounded-full gap-1 shadow-sm"
            >
              <Link
                href="/order/pickup"
                role="tab"
                aria-selected="false"
                className="px-6 py-2.5 rounded-full text-cocoa-800 hover:bg-cream-200 text-sm font-bold inline-flex items-center gap-2 transition-colors"
              >
                <ShoppingBag size={14} /> Pickup
              </Link>
              <span
                role="tab"
                aria-selected="true"
                className="px-6 py-2.5 rounded-full bg-cocoa-900 text-cream-50 text-sm font-black inline-flex items-center gap-2 shadow-md"
              >
                <Bike size={14} /> Delivery
              </span>
            </div>
          </FadeIn>

          {/* Address autocomplete */}
          <FadeIn delay={0.5} className="mt-8">
            <div ref={wrapperRef} className="relative">
              <div
                className={`relative flex items-center bg-cream-50 border-2 rounded-full transition-all duration-300 shadow-lg ${
                  openDropdown
                    ? "border-cocoa-900 shadow-xl"
                    : "border-cream-200 hover:border-cream-300"
                }`}
              >
                <Search
                  size={20}
                  className="absolute left-5 text-cocoa-700 pointer-events-none"
                />
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setOpenDropdown(true);
                    if (selectedAddress && e.target.value !== selectedAddress)
                      setSelectedAddress(null);
                  }}
                  onFocus={() => setOpenDropdown(true)}
                  placeholder="Enter your delivery address"
                  autoComplete="off"
                  className="flex-1 pl-14 pr-12 py-4 sm:py-5 rounded-full bg-transparent text-cocoa-900 text-base sm:text-lg placeholder:text-cocoa-700/50 focus:outline-none"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setSelectedAddress(null);
                      inputRef.current?.focus();
                    }}
                    aria-label="Clear search"
                    className="absolute right-4 w-8 h-8 rounded-full bg-cream-100 hover:bg-cream-200 flex items-center justify-center text-cocoa-800 transition-colors"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              <AnimatePresence>
                {openDropdown && suggestions.length > 0 && !selectedAddress && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scaleY: 0.98 }}
                    animate={{ opacity: 1, y: 0, scaleY: 1 }}
                    exit={{ opacity: 0, y: -10, scaleY: 0.98 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    style={{ transformOrigin: "top center" }}
                    className="absolute top-full left-0 right-0 mt-3 bg-cream-50 border border-cream-200 rounded-3xl shadow-2xl overflow-hidden z-30 text-left"
                  >
                    <div className="px-6 pt-5 pb-3 flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cocoa-700">
                        {query.trim() ? "Suggested addresses" : "Try one of these"}
                      </p>
                      <p className="text-[10px] font-bold text-cocoa-700/70">
                        {suggestions.length} {suggestions.length === 1 ? "result" : "results"}
                      </p>
                    </div>
                    <ul className="max-h-[min(70vh,560px)] overflow-y-auto pb-3">
                      {suggestions.map((s, i) => (
                        <li key={`${s.label}-${i}`}>
                          <button
                            type="button"
                            onClick={() => handleSelectAddress(s.label)}
                            className="group w-full text-left px-6 py-3.5 flex items-center gap-4 hover:bg-cream-100 transition-colors"
                          >
                            <span className="w-11 h-11 rounded-full bg-cream-100 group-hover:bg-cream-200 flex items-center justify-center shrink-0 transition-colors">
                              <MapPin size={17} className="text-cocoa-900" />
                            </span>
                            <span className="flex-1 min-w-0 font-medium text-cocoa-900 text-sm truncate">
                              {s.label}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="px-6 py-3.5 border-t border-cream-200 bg-cream-100/40">
                      <p className="text-[10px] text-cocoa-700">
                        Live address autocomplete connects to Google Places at
                        launch.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <p className="mt-3 text-sm text-cocoa-700">
              Start typing — we&apos;ll match your address and surface the
              nearest shops.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ───── Nearest shops surface after selection ───── */}
      {selectedAddress && (
        <section className="relative pb-20 lg:pb-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <div className="mb-8">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cocoa-700 mb-1.5">
                  Delivering from your nearest shops
                </p>
                <h2 className="font-display text-3xl sm:text-4xl font-black text-cocoa-900 tracking-tight leading-[0.95]">
                  Pick your spot.
                </h2>
                <p className="mt-3 text-sm text-cocoa-700">
                  Delivering to <strong>{selectedAddress}</strong>
                </p>
              </div>
            </FadeIn>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
              {nearestLocations.length === 0 && (
                <p className="text-sm text-cocoa-700 sm:col-span-2 lg:col-span-3">
                  No delivery shops near that address yet. Try another address
                  or switch to pickup.
                </p>
              )}
              {nearestLocations.map((loc, i) => (
                <motion.article
                  key={loc.slug}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{
                    duration: 0.5,
                    delay: Math.min(i * 0.04, 0.3),
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="rounded-card overflow-hidden bg-cream-50 border border-cream-200 shadow-sm hover:shadow-xl transition-shadow duration-500 p-5"
                >
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {loc.state && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-cream-100 text-cocoa-900 text-[10px] font-black uppercase tracking-wider">
                        {loc.state}
                      </span>
                    )}
                    {loc.todayLabel &&
                      loc.todayLabel !== "Hours not available" && (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            loc.isOpenNow
                              ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                              : "bg-stone-100 text-stone-700 border-stone-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              loc.isOpenNow ? "bg-emerald-500" : "bg-stone-400"
                            }`}
                          />
                          {loc.isOpenNow ? "Open" : "Closed"}
                        </span>
                      )}
                  </div>
                  <h3 className="font-display text-xl font-black text-cocoa-900 leading-tight">
                    {loc.name}
                  </h3>
                  <p className="text-xs text-cocoa-700 mt-1 truncate">
                    {loc.address}
                  </p>
                  {/* Delivery selection routes to /order/pickup/[slug] for now —
                      the menu is the same; fulfillment is decided at checkout. */}
                  <Link
                    href={`/order/pickup/${loc.slug}`}
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-cocoa-900 hover:bg-cocoa-800 text-cream-50 text-xs font-bold transition-colors"
                  >
                    <Bike size={12} /> Start delivery order
                    <ArrowUpRight size={12} />
                  </Link>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
