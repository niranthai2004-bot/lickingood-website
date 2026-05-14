"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Seamless horizontal infinite carousel for mobile.
 *
 * How it works (the cheap trick that looks expensive):
 *   - Items are rendered THREE times in a row: [a, b, c, a, b, c, a, b, c]
 *   - Initial scroll position is the start of the MIDDLE copy
 *   - A scroll listener watches for the user wandering near either edge
 *     of the visible band; when they cross a threshold, scrollLeft jumps
 *     by exactly one set-width (no animation), placing them in the
 *     equivalent position in the middle copy
 *   - Because the items look identical between copies, the jump is
 *     imperceptible — the carousel feels endless in both directions
 *
 * Notes:
 *   - The container has `overflow-x-auto snap-x snap-mandatory`; touch
 *     swipe + momentum is fully native, so it stays buttery on iPhone
 *   - We render duplicates with aria-hidden so screen readers don't
 *     announce items multiple times
 *   - One-pass scroll listener (no rAF) keeps it cheap on long lists
 *
 * The desktop layout should render the same items in a static grid
 * elsewhere — wrap this in `<div className="lg:hidden">` so it ONLY
 * appears on mobile (otherwise desktop sees 3× the items).
 */
export function MobileInfiniteCarousel<T>({
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
  /** Outer track classes (typically gap + horizontal padding). */
  className?: string;
  ariaLabel?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || items.length === 0) return;

    let isResetting = false;
    let initialized = false;

    // Set initial scroll position to the start of the middle copy.
    // Use rAF so the layout has computed scrollWidth by the time we read it.
    const init = () => {
      const setWidth = track.scrollWidth / 3;
      track.scrollLeft = setWidth;
      initialized = true;
    };
    requestAnimationFrame(init);

    const onScroll = () => {
      if (!initialized || isResetting) return;
      const setWidth = track.scrollWidth / 3;
      const sl = track.scrollLeft;

      // 30% buffer either side of the middle band — wide enough that fast
      // swipes don't blow past the boundary, narrow enough the user never
      // notices the jump.
      const buffer = setWidth * 0.3;

      if (sl > setWidth * 2 - buffer) {
        isResetting = true;
        track.scrollLeft = sl - setWidth;
        // Microtask is enough; next paint clears the flag.
        requestAnimationFrame(() => {
          isResetting = false;
        });
      } else if (sl < setWidth - buffer) {
        isResetting = true;
        track.scrollLeft = sl + setWidth;
        requestAnimationFrame(() => {
          isResetting = false;
        });
      }
    };

    // Resize the carousel? Re-init the middle position.
    const onResize = () => {
      isResetting = true;
      const setWidth = track.scrollWidth / 3;
      track.scrollLeft = setWidth;
      requestAnimationFrame(() => {
        isResetting = false;
      });
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [items]);

  // Render items thrice so the user can scroll comfortably in either
  // direction before the boundary reset kicks in.
  const tripled: Array<{ item: T; key: string; isMiddleCopy: boolean }> = [];
  for (let copy = 0; copy < 3; copy++) {
    items.forEach((item, idx) => {
      tripled.push({
        item,
        key: `${copy}-${idx}`,
        isMiddleCopy: copy === 1,
      });
    });
  }

  return (
    <div
      ref={trackRef}
      role="region"
      aria-label={ariaLabel}
      className={`flex overflow-x-auto no-scrollbar snap-x snap-mandatory overscroll-x-contain ${className}`}
    >
      {tripled.map(({ item, key, isMiddleCopy }, i) => (
        <div
          key={key}
          aria-hidden={!isMiddleCopy}
          className={`shrink-0 snap-start ${itemClassName}`}
        >
          {renderItem(item, i % items.length)}
        </div>
      ))}
    </div>
  );
}
