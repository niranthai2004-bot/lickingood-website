"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Seamless horizontal infinite carousel for mobile.
 *
 * v2 fixes from v1:
 *  - touch-action: pan-x   — locks gestures to horizontal only so a swipe
 *                            never drifts vertically or hijacks page scroll
 *  - Debounced reset       — only re-positions scrollLeft AFTER scrolling
 *                            has settled (touch + momentum + snap all done).
 *                            Eliminates the snap-back jitter where the reset
 *                            fired mid-swipe and fought scroll-snap.
 *  - Touch-state guard     — never resets while the user's finger is down.
 *  - Instant `scrollTo`    — repositioning uses behavior:"instant" so the
 *                            jump is paint-synchronous and invisible.
 *  - 3× copies, recenter   — items render thrice; initial position lands on
 *                            the middle copy. When the user wanders past a
 *                            buffer band into the outer copies, we silently
 *                            translate them back to the equivalent middle
 *                            position. Because items look identical between
 *                            copies, the jump is imperceptible.
 *
 * The container also pins `overflow-y: hidden` so card shadows above/below
 * are clipped predictably and don't reveal a "background gap" during scroll.
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
  itemClassName?: string;
  className?: string;
  ariaLabel?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || items.length === 0) return;

    let touchActive = false;
    let resetTimer: ReturnType<typeof setTimeout> | null = null;
    let initialized = false;

    // ── Initial centering ────────────────────────────────────────────
    // requestAnimationFrame waits until layout has computed scrollWidth.
    // We use `auto` (NOT smooth) — there's no scroll to animate, just a
    // synchronous repositioning to the middle copy.
    const center = () => {
      const setWidth = track.scrollWidth / 3;
      track.scrollLeft = setWidth;
      initialized = true;
    };
    requestAnimationFrame(center);

    // ── Reset check (runs only after scroll settles) ─────────────────
    const tryReset = () => {
      if (!initialized || touchActive) return;
      const setWidth = track.scrollWidth / 3;
      const sl = track.scrollLeft;

      // Generous 35% buffer either side of the middle band. The buffer is
      // large because once scroll has settled, the user could re-engage
      // mid-band and we don't want to thrash; only reset if they're truly
      // close to one of the outer-copy edges.
      const lower = setWidth * 0.65;
      const upper = setWidth * 2.35;

      if (sl < lower) {
        track.scrollLeft = sl + setWidth;
      } else if (sl > upper) {
        track.scrollLeft = sl - setWidth;
      }
    };

    const scheduleReset = () => {
      if (resetTimer) clearTimeout(resetTimer);
      // 300ms after the last scroll/touch event — covers iOS momentum +
      // scroll-snap re-engagement. Long enough to avoid mid-flight jumps.
      resetTimer = setTimeout(tryReset, 300);
    };

    // ── Event wiring ─────────────────────────────────────────────────
    const onTouchStart = () => {
      touchActive = true;
      if (resetTimer) {
        clearTimeout(resetTimer);
        resetTimer = null;
      }
    };
    const onTouchEnd = () => {
      touchActive = false;
      scheduleReset();
    };
    const onScroll = () => {
      if (!initialized) return;
      scheduleReset();
    };
    const onResize = () => {
      // Layout changed — re-center to the middle copy. Don't try to
      // preserve relative position, that's not worth the complexity.
      const setWidth = track.scrollWidth / 3;
      track.scrollLeft = setWidth;
    };

    track.addEventListener("touchstart", onTouchStart, { passive: true });
    track.addEventListener("touchend", onTouchEnd, { passive: true });
    track.addEventListener("touchcancel", onTouchEnd, { passive: true });
    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      track.removeEventListener("touchstart", onTouchStart);
      track.removeEventListener("touchend", onTouchEnd);
      track.removeEventListener("touchcancel", onTouchEnd);
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (resetTimer) clearTimeout(resetTimer);
    };
  }, [items]);

  // 3× render — enough headroom for the user to swipe several cards either
  // direction before any silent recentering kicks in.
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
      // touch-pan-x  → CSS `touch-action: pan-x` (vertical input falls
      //                through to the page; carousel ONLY scrolls horizontally)
      // overscroll-x-contain → no bounce past the carousel into page nav
      // overflow-y-hidden    → predictable clipping, no shadow bleed gaps
      className={`flex items-stretch overflow-x-auto overflow-y-hidden no-scrollbar snap-x snap-mandatory overscroll-x-contain touch-pan-x ${className}`}
    >
      {tripled.map(({ item, key, isMiddleCopy }, i) => (
        <div
          key={key}
          aria-hidden={!isMiddleCopy}
          className={`shrink-0 snap-start flex ${itemClassName}`}
        >
          {renderItem(item, i % items.length)}
        </div>
      ))}
    </div>
  );
}
