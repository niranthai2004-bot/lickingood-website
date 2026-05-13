"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  Loader2,
  MapPin,
  Navigation,
  Search,
  X,
} from "lucide-react";
import type { PublicLocation } from "@/lib/locations/types";
import { FoodImage } from "@/components/ui/FoodImage";

type GeoState = "idle" | "loading" | "ready" | "denied";

export function LocationSearch({
  mode,
  placeholder,
}: {
  mode: "pickup" | "delivery";
  placeholder?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [openDropdown, setOpenDropdown] = useState(false);
  const [geo, setGeo] = useState<GeoState>("idle");
  const [locations, setLocations] = useState<PublicLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Fetch the live merchant locations once on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/public/locations", { cache: "no-store" });
        const json = (await res.json()) as { locations?: PublicLocation[] };
        if (cancelled) return;
        setLocations(json.locations ?? []);
      } catch {
        if (cancelled) return;
        setLocations([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q && geo === "ready") {
      return locations.slice(0, 3);
    }
    if (!q) {
      return locations.slice(0, 8);
    }
    return locations
      .filter((l) => {
        const haystack = `${l.city} ${l.name} ${l.state} ${l.address}`.toLowerCase();
        return haystack.includes(q);
      })
      .slice(0, 12);
  }, [query, geo, locations]);

  /** Mock distance until a real geocoder is wired in (Phase D). */
  const mockDistance = (index: number) =>
    `${(2.1 + index * 1.3).toFixed(1)} mi`;

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

  const goTo = (loc: PublicLocation) => {
    setOpenDropdown(false);
    setQuery("");
    router.push(`/order/${mode}/${loc.slug}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && matches.length > 0) {
      goTo(matches[0]);
    } else if (e.key === "Escape") {
      setOpenDropdown(false);
      inputRef.current?.blur();
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGeo("denied");
      return;
    }
    setGeo("loading");
    navigator.geolocation.getCurrentPosition(
      () => {
        // Real distance ranking lands in Phase D (geocoding + haversine).
        setGeo("ready");
        setOpenDropdown(true);
      },
      () => setGeo("denied"),
      { timeout: 8000 },
    );
  };

  return (
    <div ref={wrapperRef} className="relative text-left">
      {/* Big search input */}
      <div
        className={`relative flex items-center bg-cream-50 border-2 rounded-full transition-all duration-300 shadow-lg ${
          openDropdown
            ? "border-cocoa-900 shadow-xl"
            : "border-cream-200 hover:border-cream-300"
        }`}
      >
        <Search size={20} className="absolute left-5 text-cocoa-700 pointer-events-none" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpenDropdown(true);
          }}
          onFocus={() => setOpenDropdown(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder ?? "Search by city, ZIP, or address"}
          autoComplete="off"
          className="flex-1 pl-14 pr-12 py-4 sm:py-5 rounded-full bg-transparent text-cocoa-900 text-base sm:text-lg placeholder:text-cocoa-700/50 focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="absolute right-4 w-9 h-9 rounded-full bg-cream-100 hover:bg-cream-200 flex items-center justify-center text-cocoa-800 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Immersive dropdown */}
      <AnimatePresence>
        {openDropdown && matches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scaleY: 0.97 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -8, scaleY: 0.98 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "top center" }}
            className="absolute top-full left-0 right-0 mt-3 bg-cream-50 border border-cream-200 rounded-3xl shadow-2xl overflow-hidden z-30"
          >
            {/* Use my location chip */}
            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={geo === "loading"}
              className="w-full flex items-center gap-3 px-6 py-4 border-b border-cream-100 hover:bg-cream-100 transition-colors text-left disabled:opacity-70 disabled:cursor-progress"
            >
              <span className="w-11 h-11 rounded-full bg-cocoa-900 text-cream-50 flex items-center justify-center shrink-0">
                {geo === "loading" ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <Navigation size={16} />
                )}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block font-display font-black text-cocoa-900 text-sm leading-tight">
                  {geo === "ready" ? "Sorted by your location" : "Use my location"}
                </span>
                <span className="block text-xs text-cocoa-700">
                  {geo === "denied"
                    ? "Permission denied — enter a city or ZIP instead."
                    : geo === "ready"
                      ? "Showing closest shops."
                      : "Find your closest shops automatically."}
                </span>
              </span>
            </button>

            <div className="px-6 pt-4 pb-2 flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cocoa-700">
                {query.trim()
                  ? `Matching "${query.trim()}"`
                  : geo === "ready"
                    ? "Closest shops near you"
                    : "Nearby shops"}
              </p>
              <p className="text-[10px] font-bold text-cocoa-700/70">
                {matches.length} {matches.length === 1 ? "result" : "results"}
              </p>
            </div>

            <ul className="max-h-[min(85vh,700px)] overflow-y-auto overscroll-contain pb-3">
              {matches.map((loc, i) => (
                <li key={loc.slug}>
                  <button
                    type="button"
                    onClick={() => goTo(loc)}
                    className="group w-full text-left px-6 py-4 flex items-center gap-4 hover:bg-cream-100 transition-colors"
                  >
                    <span className="w-14 h-14 rounded-xl overflow-hidden bg-cream-100 shrink-0 ring-1 ring-cream-200">
                      <FoodImage
                        src={loc.image}
                        alt=""
                        fallbackBg="bg-stone-200"
                        className="w-full h-full"
                      />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="flex items-center gap-2 mb-0.5">
                        <span className="font-display font-black text-cocoa-900 text-base sm:text-lg leading-tight truncate">
                          {loc.name}
                        </span>
                        {loc.state && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-cream-100 text-cocoa-700 text-[9px] font-black uppercase tracking-wider shrink-0">
                            {loc.state}
                          </span>
                        )}
                        {geo === "ready" && !query.trim() && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[9px] font-black uppercase tracking-wider shrink-0">
                            {mockDistance(i)}
                          </span>
                        )}
                      </span>
                      <span className="block text-xs sm:text-sm text-cocoa-700 truncate">
                        {loc.city ? `${loc.city} · ` : ""}
                        {loc.address}
                      </span>
                    </span>
                    <ArrowUpRight
                      size={18}
                      className="shrink-0 text-cocoa-700 group-hover:text-cocoa-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300"
                    />
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {openDropdown && matches.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="absolute top-full left-0 right-0 mt-3 bg-cream-50 border border-cream-200 rounded-3xl shadow-2xl px-6 py-10 text-center z-30"
          >
            <MapPin size={20} className="text-cocoa-700 mx-auto mb-2" />
            <p className="text-base text-cocoa-900 font-bold mb-1">
              {query
                ? `No shops match "${query}"`
                : "No shops are open yet — check back soon."}
            </p>
            {query && (
              <p className="text-sm text-cocoa-700">
                Try a different city, ZIP, or street name.
              </p>
            )}
          </motion.div>
        )}

        {openDropdown && loading && matches.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="absolute top-full left-0 right-0 mt-3 bg-cream-50 border border-cream-200 rounded-3xl shadow-2xl px-6 py-10 text-center z-30"
          >
            <Loader2
              size={20}
              className="animate-spin text-cocoa-700 mx-auto mb-2"
            />
            <p className="text-sm text-cocoa-700">Loading nearby shops…</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
