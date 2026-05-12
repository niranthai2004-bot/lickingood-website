/**
 * Shared brand mark — used in the homepage navbar, the merchant portal, and
 * anywhere else the Lickin' Good identity needs to appear consistently.
 *
 * Two-tone donut glyph + display wordmark. Sized via Tailwind on the parent.
 */
export function BrandMark({
  size = "default",
  className = "",
  showWordmark = true,
  tagline,
}: {
  size?: "sm" | "default" | "lg";
  className?: string;
  showWordmark?: boolean;
  /** Optional sub-line (e.g. "Merchant Portal") shown under the wordmark */
  tagline?: string;
}) {
  const iconSize =
    size === "sm" ? "w-7 h-7" : size === "lg" ? "w-10 h-10" : "w-8 h-8";
  const wordSize =
    size === "sm"
      ? "text-base sm:text-lg"
      : size === "lg"
        ? "text-2xl"
        : "text-lg sm:text-xl lg:text-2xl";

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <DonutGlyph className={iconSize} />
      {showWordmark && (
        <span
          className={`font-display ${wordSize} font-black tracking-tight text-cocoa-900 leading-[1.05]`}
        >
          Lickin&apos; Good Donuts
          {tagline && (
            <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-cocoa-700">
              {tagline}
            </span>
          )}
        </span>
      )}
    </span>
  );
}

function DonutGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <defs>
        <radialGradient id="bm-glaze" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#5C3A1E" />
          <stop offset="100%" stopColor="#271708" />
        </radialGradient>
      </defs>
      <circle cx="16" cy="16" r="14" fill="url(#bm-glaze)" />
      <circle cx="16" cy="16" r="4.5" fill="#FFFBF2" />
      <ellipse
        cx="11"
        cy="10"
        rx="3.6"
        ry="1.5"
        fill="#FFFBF2"
        fillOpacity="0.22"
      />
    </svg>
  );
}
