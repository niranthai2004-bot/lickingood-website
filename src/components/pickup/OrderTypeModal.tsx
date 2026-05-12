"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { Bike, ShoppingBag, X } from "lucide-react";

/**
 * "How would you like to order?" interstitial modal.
 * Triggered when a customer taps Add on the homepage menu — keeps the regular
 * browse experience separate from the per-location ordering flow.
 */
export function OrderTypeModal({
  open,
  onClose,
  itemName,
}: {
  open: boolean;
  onClose: () => void;
  itemName?: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          className="fixed inset-0 z-[60] bg-cocoa-900/40 backdrop-blur-sm flex items-center justify-center px-4 py-8"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl bg-cream-50 border border-cream-200 shadow-2xl overflow-hidden"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-cream-100 hover:bg-cream-200 flex items-center justify-center text-cocoa-800 transition-colors"
            >
              <X size={16} />
            </button>

            <div className="p-7 sm:p-8">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cocoa-700 mb-2">
                Order
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-cocoa-900 leading-[1.05] tracking-tight">
                How would you like to order?
              </h2>
              {itemName && (
                <p className="mt-2 text-sm text-cocoa-700">
                  We&apos;ll take you to the menu so you can add{" "}
                  <strong className="text-cocoa-900">{itemName}</strong> at
                  your shop.
                </p>
              )}

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Link
                  href="/order/pickup"
                  onClick={onClose}
                  className="group rounded-2xl border-2 border-cream-200 hover:border-cocoa-900 bg-cream-50 hover:bg-cream-100 p-5 text-left transition-all duration-300 hover:scale-[1.02]"
                >
                  <span className="w-10 h-10 rounded-full bg-cocoa-900 text-cream-50 flex items-center justify-center mb-3">
                    <ShoppingBag size={17} />
                  </span>
                  <p className="font-display text-lg font-black text-cocoa-900 leading-tight">
                    Pickup
                  </p>
                  <p className="text-xs text-cocoa-700 mt-1">
                    Grab and go at your nearest shop.
                  </p>
                </Link>
                <Link
                  href="/order/delivery"
                  onClick={onClose}
                  className="group rounded-2xl border-2 border-cream-200 hover:border-cocoa-900 bg-cream-50 hover:bg-cream-100 p-5 text-left transition-all duration-300 hover:scale-[1.02]"
                >
                  <span className="w-10 h-10 rounded-full bg-cocoa-900 text-cream-50 flex items-center justify-center mb-3">
                    <Bike size={17} />
                  </span>
                  <p className="font-display text-lg font-black text-cocoa-900 leading-tight">
                    Delivery
                  </p>
                  <p className="text-xs text-cocoa-700 mt-1">
                    Fresh to your door.
                  </p>
                </Link>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="mt-5 w-full text-center text-sm text-cocoa-700 hover:text-cocoa-900 font-semibold transition-colors"
              >
                Keep browsing
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
