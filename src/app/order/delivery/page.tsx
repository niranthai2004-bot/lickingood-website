"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
import { locations, type Location } from "@/data/locations";
import { FadeIn, Line } from "@/components/ui/Reveal";

// Mock recent / saved address suggestions until Google Places is wired in.
const sampleAddresses = [
  { label: "8600 Cottage Hill Rd, Mobile, AL 36695" },
  { label: "300 Government St, Mobile, AL 36602" },
  { label: "200 Eastern Shore Center, Fairhope, AL 36532" },
  { label: "1600 Gulf Shores Pkwy, Gulf Shores, AL 36542" },
  { label: "100 N Palafox St, Pensacola, FL 32502" },
];

export default function DeliveryPickerPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [openDropdown, setOpenDropdown] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Address suggestions: filter sample addresses, plus any matches from real
  // location addresses (treats them as known addresses in the area).
  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sampleAddresses;
    const fromLocations = locations
      .map((l) => ({ label: l.address }))
      .filter((s) => s.label.toLowerCase().includes(q));
    const fromSamples = sampleAddresses.filter((s) =>
      s.label.toLowerCase().includes(q),
    );
    return [...fromLocations, ...fromSamples].slice(0, 6);
  }, [query]);

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

  // After address selection, surface the closest shops as suggestions.
  // (Real distance ranking will come from a geocoding API; for now show all
  // shops grouped by state matching the selected address's state.)
  const nearestLocations = useMemo<Location[]>(() => {
    if (!selectedAddress) return [];
    const isFL = /FL/i.test(selectedAddress);
    return isFL
      ? locations.filter((l) => l.state === "FL")
      : locations.filter((l) => l.state === "AL");
  }, [selectedAddress]);

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
          <FadeIn>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-cocoa-700 mb-4">
              Order
            </p>
          </FadeIn>
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
              {nearestLocations.map((loc, i) => (
                <motion.article
                  key={loc.id}
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
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-cream-100 text-cocoa-900 text-[10px] font-black uppercase tracking-wider mb-3">
                    {loc.state} · ~ {Math.round(2 + Math.random() * 8)} min away
                  </span>
                  <h3 className="font-display text-xl font-black text-cocoa-900 leading-tight">
                    {loc.neighborhood ?? loc.city}
                  </h3>
                  <p className="text-xs text-cocoa-700 mt-1 truncate">
                    {loc.address}
                  </p>
                  <Link
                    onClick={() => router.refresh()}
                    href={`/order/pickup/${loc.id}`}
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
