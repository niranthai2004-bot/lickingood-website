"use client";

import { type ReactNode } from "react";

/**
 * Simple horizontal swipe carousel for mobile.
 *
 * Pure native browser scrolling — no JS, no refs, no event listeners, no
 * item duplication. Items render once, scroll has a natural stop at both
 * ends, and iPhone's momentum + scroll-snap do all the heavy lifting.
 *
 * Behaviors locked in via CSS:
 *  - touch-pan-x          → only horizontal gestures are captured by the
 *                            carousel; vertical swipes pass through to the
 *                            page (no diagonal drift)
 *  - snap-x mandatory     → cards land cleanly on each card edge after a
 *                            swipe; reads as deliberate, not loose
 *  - overscroll-x-contain → doesn't pull the page horizontally past the
 *                            end (no rubber-band on the wrong axis)
 *  - overflow-y hidden    → predictable vertical clipping; card shadows
 *                            don't reveal a gap to the section background
 */
export function MobileCarousel<T>({
  items,
  renderItem,
  itemClassName = "",
  className = "",
  ariaLabel,
}: {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  /** Per-item wrapper classes (typically width). */
  itemClassName?: string;
  /** Outer track classes (gap + horizontal padding). */
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <div
      role="region"
      aria-label={ariaLabel}
      className={`flex items-stretch overflow-x-auto overflow-y-hidden no-scrollbar snap-x snap-mandatory overscroll-x-contain touch-pan-x ${className}`}
    >
      {items.map((item, i) => (
        <div
          key={i}
          className={`shrink-0 snap-start flex ${itemClassName}`}
        >
          {renderItem(item, i)}
        </div>
      ))}
    </div>
  );
}
