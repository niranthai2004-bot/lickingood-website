/**
 * Branded cart icon — a bakery carryout box with a donut peek.
 * Stroke-based so it inherits `currentColor` and tints with any text color.
 */
export function DonutBoxIcon({
  size = 18,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {/* Box silhouette: flap on top, body below */}
      <path d="M4 9 L12 5 L20 9 V19.5 A0.5 0.5 0 0 1 19.5 20 H4.5 A0.5 0.5 0 0 1 4 19.5 Z" />
      {/* Lid divider */}
      <path d="M4 9 H20" />
      {/* Donut peeking through */}
      <circle cx="12" cy="14.5" r="2.6" />
      <circle cx="12" cy="14.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}
