"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Minus,
  Plus,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { FoodImage } from "@/components/ui/FoodImage";
import { DonutBoxIcon } from "@/components/ui/DonutBoxIcon";
import type { CartBundleLine, CartLine } from "./BoxBuilder";

const TAX_RATE = 0.09; // ~9% Alabama / Florida combined estimate

function lineSubtotal(line: CartLine): number {
  return line.kind === "item"
    ? line.item.price * line.qty
    : line.unitPrice * line.qty;
}

function totalItemCount(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.qty, 0);
}

export function MiniCart({
  cart,
  onIncrementItem,
  onDecrementItem,
  onRemoveBundle,
  onClear,
}: {
  cart: CartLine[];
  onIncrementItem: (id: string) => void;
  onDecrementItem: (id: string) => void;
  onRemoveBundle: (bundleId: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [promoOpen, setPromoOpen] = useState(false);
  const [promo, setPromo] = useState("");
  const [expandedBundleId, setExpandedBundleId] = useState<string | null>(null);

  const totalItems = totalItemCount(cart);
  const subtotal = cart.reduce((sum, l) => sum + lineSubtotal(l), 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      {/* Floating pill */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="View cart"
        className="fixed top-[72px] sm:top-[92px] right-3 sm:right-5 lg:right-8 z-40 group inline-flex items-center gap-2.5 pl-3 pr-4 py-2.5 rounded-full bg-cocoa-900 text-cream-50 shadow-2xl hover:bg-cocoa-800 transition-all duration-300 hover:scale-[1.03]"
      >
        <span className="relative w-9 h-9 rounded-full bg-cream-50 text-cocoa-900 flex items-center justify-center">
          <DonutBoxIcon size={18} />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-400 text-cocoa-900 text-[10px] font-black flex items-center justify-center border-2 border-cocoa-900">
              {totalItems}
            </span>
          )}
        </span>
        <span className="text-xs font-black uppercase tracking-wider whitespace-nowrap">
          {totalItems > 0 ? `$${subtotal.toFixed(2)}` : "Cart"}
        </span>
      </button>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-cocoa-900/40 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 240, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[440px] bg-cream-50 shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-3 px-5 py-5 border-b border-cream-200">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cocoa-700">
                    Your cart
                  </p>
                  <p className="font-display text-2xl font-black text-cocoa-900 leading-tight">
                    {totalItems > 0
                      ? `${totalItems} ${totalItems === 1 ? "item" : "items"}`
                      : "Cart is empty"}
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

              {/* Body */}
              <div className="flex-1 overflow-y-auto overscroll-contain">
                {cart.length === 0 ? (
                  <div className="py-12 px-5 text-center">
                    <p className="text-sm text-cocoa-700">
                      Add donuts, drinks, or kolaches from the menu.
                    </p>
                  </div>
                ) : (
                  <ul className="py-3 px-5 space-y-2.5">
                    {cart.map((line) => {
                      if (line.kind === "item") {
                        return (
                          <li
                            key={line.item.id}
                            className="flex items-center gap-3 text-sm"
                          >
                            <div className="w-11 h-11 rounded-full overflow-hidden bg-cream-100 shrink-0">
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
                              <p className="text-xs text-cocoa-700">
                                ${line.item.price.toFixed(2)} each
                              </p>
                            </div>
                            <div className="flex items-center gap-1 bg-cream-100 rounded-full p-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => onDecrementItem(line.item.id)}
                                aria-label={`Remove one ${line.item.name}`}
                                className="w-7 h-7 rounded-full bg-cream-50 hover:bg-cream-200 flex items-center justify-center text-cocoa-800 transition-colors"
                              >
                                <Minus size={13} />
                              </button>
                              <span className="min-w-[1.25rem] text-center text-xs font-black text-cocoa-900 tabular-nums">
                                {line.qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => onIncrementItem(line.item.id)}
                                aria-label={`Add one more ${line.item.name}`}
                                className="w-7 h-7 rounded-full bg-cocoa-900 hover:bg-cocoa-800 flex items-center justify-center text-cream-50 transition-colors"
                              >
                                <Plus size={13} />
                              </button>
                            </div>
                          </li>
                        );
                      }
                      return (
                        <BundleCartRow
                          key={line.id}
                          line={line}
                          expanded={expandedBundleId === line.id}
                          onToggle={() =>
                            setExpandedBundleId(
                              expandedBundleId === line.id ? null : line.id,
                            )
                          }
                          onRemove={() => onRemoveBundle(line.id)}
                        />
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Promo + footer */}
              <div className="border-t border-cream-200 px-5 py-4">
                {/* Promo code */}
                <div className="mb-3">
                  <button
                    type="button"
                    onClick={() => setPromoOpen((v) => !v)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-cocoa-700 hover:text-cocoa-900 transition-colors"
                  >
                    <Tag size={13} />
                    {promoOpen ? "Hide" : "Add"} promo code
                    <ChevronDown
                      size={12}
                      className={`transition-transform duration-300 ${promoOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  <AnimatePresence>
                    {promoOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 flex gap-2">
                          <input
                            type="text"
                            value={promo}
                            onChange={(e) => setPromo(e.target.value)}
                            placeholder="Promo code"
                            className="flex-1 rounded-full px-4 py-2 bg-cream-100 border border-cream-200 text-sm text-cocoa-900 placeholder:text-cocoa-700/50 focus:outline-none focus:border-cocoa-900"
                          />
                          <button
                            type="button"
                            disabled={!promo.trim()}
                            className="px-4 py-2 rounded-full bg-cocoa-900 hover:bg-cocoa-800 disabled:opacity-50 disabled:cursor-not-allowed text-cream-50 text-xs font-bold transition-colors"
                          >
                            Apply
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Totals */}
                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-cocoa-700">Subtotal</span>
                    <span className="font-bold text-cocoa-900 tabular-nums">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-cocoa-700">Estimated tax</span>
                    <span className="font-bold text-cocoa-900 tabular-nums">
                      ${tax.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-cream-200">
                    <span className="text-cocoa-700 font-semibold">Total</span>
                    <span className="font-display text-2xl font-black text-cocoa-900 tabular-nums">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={onClear}
                    disabled={cart.length === 0}
                    className="px-4 py-3 rounded-full bg-cream-100 hover:bg-cream-200 disabled:opacity-50 disabled:cursor-not-allowed text-cocoa-900 text-sm font-bold transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    disabled={cart.length === 0}
                    className="flex-1 px-4 py-3 rounded-full bg-cocoa-900 hover:bg-cocoa-800 disabled:opacity-50 disabled:cursor-not-allowed text-cream-50 text-sm font-bold transition-all duration-300 hover:scale-[1.01]"
                  >
                    Checkout · ${total.toFixed(2)}
                  </button>
                </div>
                <p className="mt-2.5 text-[10px] text-cocoa-700 text-center">
                  Tax estimated at checkout. Square processes payment at the
                  selected shop.
                </p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function BundleCartRow({
  line,
  expanded,
  onToggle,
  onRemove,
}: {
  line: CartBundleLine;
  expanded: boolean;
  onToggle: () => void;
  onRemove: () => void;
}) {
  return (
    <li className="rounded-2xl bg-cream-100/70 border border-cream-200 p-3">
      <div className="flex items-center gap-3 text-sm">
        <div className="w-11 h-11 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0 text-amber-900">
          <DonutBoxIcon size={19} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-cocoa-900 leading-tight truncate">
            {line.label}
          </p>
          <p className="text-xs text-cocoa-700 truncate">{line.summary}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className="font-display text-sm font-black text-cocoa-900 tabular-nums">
            ${(line.unitPrice * line.qty).toFixed(2)}
          </span>
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove bundle"
            className="ml-1 w-7 h-7 rounded-full bg-cream-50 hover:bg-rose-100 flex items-center justify-center text-cocoa-800 hover:text-rose-900 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-cocoa-700 hover:text-cocoa-900 transition-colors"
      >
        {expanded ? "Hide details" : "Show details"}
        <ChevronDown
          size={11}
          className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden mt-2 space-y-1.5 pt-2 border-t border-cream-200"
          >
            {line.contents.map((c, i) => (
              <li
                key={`${c.item.id}-${i}`}
                className="flex items-center justify-between text-xs text-cocoa-700"
              >
                <span className="truncate">{c.item.name}</span>
                <span className="font-bold text-cocoa-900 tabular-nums shrink-0 ml-2">
                  × {c.qty}
                </span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  );
}
