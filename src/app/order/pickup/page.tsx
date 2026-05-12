"use client";

import Link from "next/link";
import { ArrowUpRight, Bike, ShoppingBag } from "lucide-react";
import { locations } from "@/data/locations";
import { FadeIn, Line } from "@/components/ui/Reveal";
import { LocationSearch } from "@/components/pickup/LocationSearch";

/**
 * Search-first pickup picker.
 * No "browse the map" wall — just toggle, prominent search, and a small
 * link out to the dedicated Locations page for users who want to scroll.
 */
export default function PickupPickerPage() {
  return (
    <section className="relative pt-32 sm:pt-36 lg:pt-40 pb-32 lg:pb-40 overflow-x-clip min-h-[calc(100vh-4rem)]">
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
          <Line>Pick a shop.</Line>
          <Line delay={0.08}>Build your box.</Line>
        </h1>

        {/* Pickup / Delivery toggle */}
        <FadeIn delay={0.4} className="mt-9">
          <div
            role="tablist"
            className="inline-flex p-1.5 bg-cream-100 border border-cream-200 rounded-full gap-1 shadow-sm"
          >
            <span
              role="tab"
              aria-selected="true"
              className="px-6 py-2.5 rounded-full bg-cocoa-900 text-cream-50 text-sm font-black inline-flex items-center gap-2 shadow-md"
            >
              <ShoppingBag size={14} /> Pickup
            </span>
            <Link
              href="/order/delivery"
              role="tab"
              aria-selected="false"
              className="px-6 py-2.5 rounded-full text-cocoa-800 hover:bg-cream-200 text-sm font-bold inline-flex items-center gap-2 transition-colors"
            >
              <Bike size={14} /> Delivery
            </Link>
          </div>
        </FadeIn>

        {/* Search */}
        <FadeIn delay={0.5} className="mt-8">
          <LocationSearch
            mode="pickup"
            placeholder="Search by city, ZIP, or address"
          />
          <p className="mt-3 text-sm text-cocoa-700">
            Type your city, ZIP, or street to find your nearest shop in seconds.
          </p>
        </FadeIn>

        {/* Subtle browse-all link instead of a big map section */}
        <FadeIn delay={0.65} className="mt-10">
          <Link
            href="/locations"
            className="group inline-flex items-center gap-1.5 text-sm font-bold text-cocoa-700 hover:text-cocoa-900 transition-colors"
          >
            Or browse all {locations.length} shops on the Locations page
            <ArrowUpRight
              size={14}
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}
