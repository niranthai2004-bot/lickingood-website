"use client";

import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { bundlePricing } from "@/data/menuFull";
import type { BundleSize } from "./BoxBuilder";

const sizes: { value: BundleSize; label: string; sub: string }[] = [
  { value: 6, label: "Half Dozen", sub: "Office favorite" },
  { value: 12, label: "Dozen", sub: "Bring it home" },
];

/**
 * Compact Build-A-Box module — pick a size, tap Customize.
 * Pricing is summarized as a single line ("Starting at $X.XX").
 */
export function BundleModule({
  bundleSize,
  bundleMode,
  onChange,
  onCustomize,
}: {
  bundleSize: BundleSize;
  bundleMode: boolean;
  onChange: (size: BundleSize) => void;
  onCustomize: () => void;
}) {
  const activeSub = sizes.find((s) => s.value === bundleSize)?.sub ?? "";
  const startingPrice =
    bundleSize === 6 ? bundlePricing.basic.half : bundlePricing.basic.dozen;

  return (
    <section className="relative rounded-card overflow-hidden bg-gradient-to-br from-cream-50 via-cream-50 to-cream-100 border border-cream-200 shadow-sm">
      <div
        aria-hidden
        className="absolute -top-16 -right-12 w-[280px] h-[280px] rounded-full opacity-40 blur-3xl pointer-events-none"
        style={{
          background:
            "radial-gradient(closest-side, rgba(253,222,180,0.7), transparent 70%)",
        }}
      />

      <div className="relative p-5 sm:p-6 lg:p-7">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cocoa-700 mb-2">
              Featured · {activeSub}
            </p>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-cocoa-900 tracking-tight leading-[1]">
              Build your own box.
            </h2>
            <p className="mt-2 text-sm sm:text-base text-cocoa-700 max-w-md">
              Pick a size, then tap Customize to start picking your donuts.
            </p>
          </div>

          {/* Segmented size selector */}
          <div
            role="tablist"
            aria-label="Bundle size"
            className="inline-flex p-1.5 bg-cream-100 border border-cream-200 rounded-full gap-1 shadow-sm shrink-0"
          >
            {sizes.map((s) => {
              const isActive = bundleSize === s.value;
              return (
                <button
                  key={s.value}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onChange(s.value)}
                  className={`relative px-4 sm:px-5 py-2.5 rounded-full text-sm font-black transition-colors duration-200 ${
                    isActive
                      ? "text-cream-50"
                      : "text-cocoa-800 hover:text-cocoa-900"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="bundle-active-pill"
                      className="absolute inset-0 rounded-full bg-cocoa-900 shadow-md"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 34,
                      }}
                    />
                  )}
                  <span className="relative">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-5 border-t border-cream-200">
          <p className="text-xs sm:text-sm text-cocoa-700">
            Starting at{" "}
            <strong className="font-display text-base text-cocoa-900">
              ${startingPrice.toFixed(2)}
            </strong>
          </p>
          {!bundleMode && (
            <button
              type="button"
              onClick={onCustomize}
              className="group inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-cocoa-900 hover:bg-cocoa-800 text-cream-50 text-sm font-bold transition-all duration-300 hover:scale-[1.02] self-start sm:self-auto"
            >
              Customize
              <ArrowDown
                size={14}
                className="transition-transform duration-300 group-hover:translate-y-0.5"
              />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
