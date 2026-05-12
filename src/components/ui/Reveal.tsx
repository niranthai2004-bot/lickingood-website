"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Slide-up line reveal — wraps each line of a headline in an overflow mask
 * and slides the inner span up from below.
 *
 * Animates on mount (not on scroll) so headlines are guaranteed to appear.
 *
 * The generous bottom padding (`pb-[0.22em]`) reserves space for descenders
 * (y, g, p, j) so display fonts with tight line-heights aren't clipped.
 */
export function Line({
  children,
  delay = 0,
  duration = 0.9,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  return (
    <span className={`block overflow-hidden pb-[0.22em] ${className}`}>
      <motion.span
        className="block"
        initial={{ y: "115%" }}
        animate={{ y: "0%" }}
        transition={{ duration, ease, delay }}
      >
        {children}
      </motion.span>
    </span>
  );
}

/** Soft fade + lift for paragraphs, eyebrows, button rows. */
export function FadeIn({
  children,
  delay = 0,
  y = 18,
  duration = 0.7,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  duration?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0 }}
      transition={{ duration, ease, delay }}
    >
      {children}
    </motion.div>
  );
}
