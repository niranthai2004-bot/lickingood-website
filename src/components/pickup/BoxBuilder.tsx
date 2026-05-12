"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronUp, Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { FoodImage } from "@/components/ui/FoodImage";
import { calculateBundlePrice, type PickupItem } from "@/data/menuFull";

/* ---------- Cart line types (discriminated union) ---------- */

export type CartItemLine = {
  kind: "item";
  item: PickupItem;
  qty: number;
};

export type CartBundleLine = {
  kind: "bundle";
  /** Unique id for this bundle instance */
  id: string;
  size: BundleSize;
  contents: { item: PickupItem; qty: number }[];
  /** Per-box price (already calculated) */
  unitPrice: number;
  /** How many of this bundle are in the cart (usually 1) */
  qty: number;
  /** Display label, e.g. "Custom Dozen" or "Half Dozen Glazed" */
  label: string;
  /** Short summary, e.g. "12 assorted donuts" */
  summary: string;
};

export type CartLine = CartItemLine | CartBundleLine;

/* ---------- Bundle building (item-only) ---------- */

export type BundleSize = 6 | 12;

export type BundleBuildLine = {
  item: PickupItem;
  qty: number;
};

export type BundleTrackerProps = {
  buildItems: BundleBuildLine[];
  bundleSize: BundleSize;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onClear: () => void;
  onAddToCart: () => void;
};

/* ---------- Shared math ---------- */

function summarizeBuild(buildItems: BundleBuildLine[], bundleSize: BundleSize) {
  const dozenSlots = buildItems.reduce(
    (sum, l) => sum + l.qty * (l.item.slotSize ?? 1),
    0,
  );
  const totalItems = buildItems.reduce((sum, l) => sum + l.qty, 0);
  const remaining = Math.max(0, bundleSize - dozenSlots);
  const boxPrice = calculateBundlePrice(buildItems, bundleSize);
  return { dozenSlots, totalItems, remaining, boxPrice };
}

/* ---------- Desktop sidebar tracker ---------- */

export function DesktopTracker(props: BundleTrackerProps) {
  const { buildItems, bundleSize, onIncrement, onDecrement, onClear, onAddToCart } =
    props;
  const { dozenSlots, totalItems, remaining, boxPrice } = summarizeBuild(
    buildItems,
    bundleSize,
  );

  return (
    // Sticky shell. Header + box visualization + footer stay pinned;
    // only the line-items section scrolls internally.
    <div className="sticky top-24 max-h-[calc(100vh-7rem)] flex flex-col rounded-card bg-cream-50 border border-cream-200 shadow-sm overflow-hidden">
      {/* Header (pinned) */}
      <div className="shrink-0 px-5 py-5 border-b border-cream-200">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cocoa-700">
          Building bundle
        </p>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="font-display text-3xl font-black text-cocoa-900 tabular-nums">
            {dozenSlots}
          </span>
          <span className="text-base text-cocoa-700 font-bold">
            / {bundleSize}
          </span>
        </div>
        <p className="mt-1 text-xs text-cocoa-700">
          {totalItems > 0
            ? `${totalItems} ${totalItems === 1 ? "donut" : "donuts"} · $${boxPrice.toFixed(2)}`
            : "Tap any donut to start"}
        </p>
      </div>

      {/* Box visualization (pinned) */}
      <div className="shrink-0 px-5 pt-5 pb-4 border-b border-cream-200">
        <BoxVisualization bundleSize={bundleSize} buildItems={buildItems} />
        {dozenSlots === 0 ? (
          <p className="mt-3 text-xs text-cocoa-700 text-center">
            Tap any donut from the menu.
          </p>
        ) : remaining > 0 ? (
          <p className="mt-3 text-xs text-cocoa-700 text-center">
            {remaining} {remaining === 1 ? "spot" : "spots"} remaining.
          </p>
        ) : (
          <p className="mt-3 text-xs text-amber-900 font-semibold text-center">
            Box is full.
          </p>
        )}
      </div>

      {/* Line items (only this section scrolls) */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
        <BuildContents
          buildItems={buildItems}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
        />
      </div>

      {/* Footer (pinned) */}
      <div className="shrink-0 border-t border-cream-200">
        <BundleFooter
          boxPrice={boxPrice}
          canAdd={dozenSlots > 0}
          onClear={onClear}
          onAddToCart={onAddToCart}
        />
      </div>
    </div>
  );
}

/* ---------- Mobile sticky bar + sheet ---------- */

export function MobileTracker(props: BundleTrackerProps) {
  const { buildItems, bundleSize, onIncrement, onDecrement, onClear, onAddToCart } =
    props;
  const [open, setOpen] = useState(false);
  const { dozenSlots, totalItems, boxPrice } = summarizeBuild(
    buildItems,
    bundleSize,
  );

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
      window.addEventListener("keydown", onKey);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", onKey);
      };
    }
    document.body.style.overflow = "";
  }, [open]);

  return (
    <>
      {/* Bottom bar */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 px-3 sm:px-5 pb-3 sm:pb-5 pt-2 bg-gradient-to-t from-cream-50 via-cream-50/90 to-transparent">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-full bg-cocoa-900 text-cream-50 shadow-2xl hover:bg-cocoa-800 transition-colors"
        >
          <span className="flex items-center gap-3 min-w-0">
            <span className="relative w-10 h-10 rounded-full bg-cream-50 text-cocoa-900 flex items-center justify-center shrink-0">
              <ShoppingBag size={17} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-400 text-cocoa-900 text-[10px] font-black flex items-center justify-center border-2 border-cocoa-900">
                  {totalItems}
                </span>
              )}
            </span>
            <span className="text-left min-w-0">
              <span className="block text-sm font-black truncate">
                {dozenSlots > 0 ? `${dozenSlots} / ${bundleSize} in box` : "Build your box"}
              </span>
              <span className="block text-xs text-cream-100/80">
                {totalItems > 0 ? `$${boxPrice.toFixed(2)}` : "Tap a donut to start"}
              </span>
            </span>
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider shrink-0">
            View
            <ChevronUp size={14} />
          </span>
        </button>
      </div>

      {/* Sheet */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setOpen(false)}
              className="lg:hidden fixed inset-0 z-50 bg-cocoa-900/40 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 240, damping: 30 }}
              className="lg:hidden fixed inset-x-0 bottom-0 z-50 max-h-[90vh] bg-cream-50 rounded-t-3xl shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between gap-3 px-5 py-5 border-b border-cream-200">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cocoa-700">
                    Building bundle
                  </p>
                  <p className="font-display text-2xl font-black text-cocoa-900 leading-tight">
                    {dozenSlots > 0
                      ? `${dozenSlots} / ${bundleSize} in box`
                      : "Build your box"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="w-9 h-9 rounded-full bg-cream-100 hover:bg-cream-200 flex items-center justify-center text-cocoa-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Box visualization stays pinned at the top of the sheet */}
              <div className="shrink-0 px-5 pt-5 pb-4 border-b border-cream-200">
                <BoxVisualization
                  bundleSize={bundleSize}
                  buildItems={buildItems}
                />
              </div>

              {/* Only line items scroll */}
              <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
                <BuildContents
                  buildItems={buildItems}
                  onIncrement={onIncrement}
                  onDecrement={onDecrement}
                />
              </div>

              <div className="border-t border-cream-200 px-5 py-4">
                <BundleFooter
                  boxPrice={boxPrice}
                  canAdd={dozenSlots > 0}
                  onClear={onClear}
                  onAddToCart={() => {
                    onAddToCart();
                    setOpen(false);
                  }}
                />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/* ---------- Shared subcomponents ---------- */

function BoxVisualization({
  bundleSize,
  buildItems,
}: {
  bundleSize: BundleSize;
  buildItems: BundleBuildLine[];
}) {
  type SlotEntry = { item: PickupItem; isWide: boolean };
  const slotEntries: SlotEntry[] = [];
  for (const line of buildItems) {
    const wide = (line.item.slotSize ?? 1) === 2;
    for (let i = 0; i < line.qty; i++) {
      slotEntries.push({ item: line.item, isWide: wide });
    }
  }

  let used = 0;
  const cells: React.ReactNode[] = [];
  for (const entry of slotEntries) {
    const cellsNeeded = entry.isWide ? 2 : 1;
    if (used + cellsNeeded > bundleSize) break;
    cells.push(
      <motion.div
        key={`s-${cells.length}`}
        layout
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
        className={`relative ${entry.isWide ? "col-span-2 aspect-[2/1]" : "aspect-square"} rounded-full overflow-hidden border-2 border-amber-300 shadow-inner`}
        title={entry.item.name}
      >
        <FoodImage
          src={entry.item.image}
          alt={entry.item.name}
          fallbackBg={entry.item.tone}
          className="w-full h-full"
        />
      </motion.div>,
    );
    used += cellsNeeded;
  }
  for (let i = used; i < bundleSize; i++) {
    cells.push(
      <div
        key={`e-${i}`}
        className="aspect-square rounded-full border-2 border-dashed border-amber-300/70 bg-amber-50/40 flex items-center justify-center text-[10px] font-bold text-cocoa-700/40"
      >
        {i + 1}
      </div>,
    );
  }

  // 6 → 3 cols (2 rows), 12 → 4 cols (3 rows)
  const cols = bundleSize === 6 ? "grid-cols-3" : "grid-cols-4";

  return (
    <div
      className={`relative grid ${cols} gap-2 p-3 rounded-2xl bg-gradient-to-br from-amber-100 via-amber-100 to-amber-200/70 border-2 border-amber-300`}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.18] pointer-events-none rounded-2xl"
        style={{
          backgroundImage:
            "radial-gradient(rgba(92,58,30,0.5) 1px, transparent 1px)",
          backgroundSize: "11px 11px",
        }}
      />
      {cells}
    </div>
  );
}

function BuildContents({
  buildItems,
  onIncrement,
  onDecrement,
}: {
  buildItems: BundleBuildLine[];
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
}) {
  if (buildItems.length === 0) {
    return (
      <p className="text-sm text-cocoa-700 text-center py-2">
        Your selections will appear here.
      </p>
    );
  }
  return (
    <ul className="space-y-2">
      {buildItems.map((line) => (
        <li key={line.item.id} className="flex items-center gap-3 text-sm">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-cream-100 shrink-0">
            <FoodImage
              src={line.item.image}
              alt=""
              fallbackBg={line.item.tone}
              className="w-full h-full"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-cocoa-900 leading-tight truncate">
              {line.item.name}
            </p>
            <p className="text-[11px] text-cocoa-700">
              ${line.item.price.toFixed(2)}
              {line.item.slotSize === 2 ? " · 2 slots" : ""}
            </p>
          </div>
          <div className="flex items-center gap-1 bg-cream-100 rounded-full p-1 shrink-0">
            <button
              type="button"
              onClick={() => onDecrement(line.item.id)}
              aria-label={`Remove one ${line.item.name}`}
              className="w-6 h-6 rounded-full bg-cream-50 hover:bg-cream-200 flex items-center justify-center text-cocoa-800 transition-colors"
            >
              <Minus size={12} />
            </button>
            <span className="min-w-[1.25rem] text-center text-xs font-black text-cocoa-900 tabular-nums">
              {line.qty}
            </span>
            <button
              type="button"
              onClick={() => onIncrement(line.item.id)}
              aria-label={`Add one more ${line.item.name}`}
              className="w-6 h-6 rounded-full bg-cocoa-900 hover:bg-cocoa-800 flex items-center justify-center text-cream-50 transition-colors"
            >
              <Plus size={12} />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function BundleFooter({
  boxPrice,
  canAdd,
  onClear,
  onAddToCart,
}: {
  boxPrice: number;
  canAdd: boolean;
  onClear: () => void;
  onAddToCart: () => void;
}) {
  return (
    <div className="border-t border-cream-200 px-5 py-4 bg-cream-50">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-cocoa-700 font-semibold">Box price</span>
        <span className="font-display text-2xl font-black text-cocoa-900 tabular-nums">
          ${boxPrice.toFixed(2)}
        </span>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onClear}
          disabled={!canAdd}
          className="px-4 py-3 rounded-full bg-cream-100 hover:bg-cream-200 disabled:opacity-50 disabled:cursor-not-allowed text-cocoa-900 text-sm font-bold transition-colors"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={onAddToCart}
          disabled={!canAdd}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-full bg-cocoa-900 hover:bg-cocoa-800 disabled:opacity-50 disabled:cursor-not-allowed text-cream-50 text-sm font-bold transition-all duration-300 hover:scale-[1.01]"
        >
          <Check size={14} /> Add Bundle to Cart
        </button>
      </div>
    </div>
  );
}
