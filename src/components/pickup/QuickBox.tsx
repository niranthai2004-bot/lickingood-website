"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { bundlePricing, fullMenu, itemBundleTier } from "@/data/menuFull";
import { FoodImage } from "@/components/ui/FoodImage";
import type { CartBundleLine } from "./BoxBuilder";

/**
 * Quick Box — pre-built single-flavor bundles.
 * Customers who just want "12 glazed" or "6 maple" skip the builder entirely.
 */

const flavorIds = [
  "glazed",
  "chocolate-glazed",
  "maple-glazed",
  "cake-blueberry",
] as const;

type QuickBoxOption = {
  itemId: string;
  size: 6 | 12;
};

const options: QuickBoxOption[] = flavorIds.flatMap((id) => [
  { itemId: id, size: 6 as const },
  { itemId: id, size: 12 as const },
]);

export function QuickBox({
  onAddBundle,
}: {
  onAddBundle: (line: CartBundleLine) => void;
}) {
  const handleAdd = (opt: QuickBoxOption) => {
    const item = fullMenu.find((m) => m.id === opt.itemId);
    if (!item) return;
    const tier = itemBundleTier[item.id] ?? "basic";
    const unitPrice =
      opt.size === 6
        ? bundlePricing[tier].half
        : bundlePricing[tier].dozen;
    const sizeLabel = opt.size === 6 ? "Half Dozen" : "Dozen";

    const bundle: CartBundleLine = {
      kind: "bundle",
      id: `quick-${opt.itemId}-${opt.size}-${Date.now()}`,
      size: opt.size,
      contents: [{ item, qty: opt.size }],
      unitPrice,
      qty: 1,
      label: `${sizeLabel} ${item.name}`,
      summary: `${opt.size} ${item.name.toLowerCase()}`,
    };
    onAddBundle(bundle);
  };

  return (
    <section className="relative rounded-card bg-cream-50 border border-cream-200 shadow-sm p-5 sm:p-6 lg:p-7">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cocoa-700 mb-1">
            Order by the Dozen
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-black text-cocoa-900 tracking-tight leading-[1]">
            Quick Box
          </h2>
          <p className="mt-1.5 text-sm text-cocoa-700">
            Skip the builder — single-flavor boxes, ready in one tap.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {options.map((opt, i) => {
          const item = fullMenu.find((m) => m.id === opt.itemId);
          if (!item) return null;
          const tier = itemBundleTier[item.id] ?? "basic";
          const price =
            opt.size === 6
              ? bundlePricing[tier].half
              : bundlePricing[tier].dozen;
          const sizeLabel = opt.size === 6 ? "½ Dozen" : "Dozen";
          return (
            <motion.button
              key={`${opt.itemId}-${opt.size}`}
              type="button"
              onClick={() => handleAdd(opt)}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{
                duration: 0.5,
                delay: i * 0.04,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{ y: -3 }}
              className="group relative text-left rounded-card overflow-hidden bg-cream-50 border border-cream-200 hover:shadow-xl transition-shadow duration-500"
            >
              <div className="relative aspect-square overflow-hidden">
                <FoodImage
                  src={item.image}
                  alt={item.name}
                  fallbackBg={item.tone}
                  className="w-full h-full"
                  imgClassName="transition-transform duration-[1100ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-110"
                />
                <span className="absolute top-2 left-2 inline-flex items-center px-2 py-0.5 rounded-full bg-cream-50/95 text-cocoa-900 text-[9px] font-black uppercase tracking-wider shadow-sm backdrop-blur">
                  {sizeLabel}
                </span>
              </div>
              <div className="p-3">
                <p className="font-display text-sm font-black text-cocoa-900 leading-tight line-clamp-1">
                  {item.name}
                </p>
                <div className="mt-1.5 flex items-center justify-between gap-2">
                  <span className="font-display text-base font-black text-cocoa-900 tabular-nums">
                    ${price.toFixed(2)}
                  </span>
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-cocoa-900 text-cream-50 group-hover:bg-cocoa-800 transition-colors">
                    <Plus size={13} />
                  </span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
