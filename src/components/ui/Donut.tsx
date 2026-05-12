type DonutProps = {
  className?: string;
  /** Glaze color */
  glaze?: string;
  /** Dough color */
  dough?: string;
  /** Sprinkle palette */
  sprinkles?: string[];
  /** Hide sprinkles */
  noSprinkles?: boolean;
};

/**
 * Stylized SVG donut illustration. Used for hero, decorative floats,
 * and as a fallback wherever real food photography isn't yet wired up.
 */
export function Donut({
  className,
  glaze = "#FF6B1A",
  dough = "#F4A82B",
  sprinkles = ["#FFFBF2", "#E96A85", "#FFD25A", "#5C3A1E"],
  noSprinkles = false,
}: DonutProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <radialGradient id="doughGrad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor={dough} stopOpacity="1" />
          <stop offset="100%" stopColor={dough} stopOpacity="0.85" />
        </radialGradient>
        <radialGradient id="glazeGrad" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor={glaze} stopOpacity="1" />
          <stop offset="100%" stopColor={glaze} stopOpacity="0.9" />
        </radialGradient>
      </defs>

      {/* Dough ring (outer) */}
      <circle cx="100" cy="100" r="90" fill="url(#doughGrad)" />
      {/* Hole */}
      <circle cx="100" cy="100" r="30" fill="#FFFBF2" />

      {/* Glaze drip — wavy ring slightly smaller than dough */}
      <path
        d="M100 14
           C 142 14, 186 58, 186 100
           C 186 142, 142 186, 100 186
           C 58 186, 14 142, 14 100
           C 14 58, 58 14, 100 14 Z
           M100 60
           C 78 60, 60 78, 60 100
           C 60 122, 78 140, 100 140
           C 122 140, 140 122, 140 100
           C 140 78, 122 60, 100 60 Z"
        fill="url(#glazeGrad)"
        fillRule="evenodd"
        transform="scale(0.95) translate(5,5)"
      />

      {/* Glaze highlight */}
      <ellipse cx="72" cy="58" rx="22" ry="8" fill="white" fillOpacity="0.35" />

      {/* Sprinkles */}
      {!noSprinkles && (
        <g>
          {sprinklePositions.map((p, i) => (
            <rect
              key={i}
              x={p.x}
              y={p.y}
              width="8"
              height="3"
              rx="1.5"
              fill={sprinkles[i % sprinkles.length]}
              transform={`rotate(${p.r} ${p.x + 4} ${p.y + 1.5})`}
            />
          ))}
        </g>
      )}
    </svg>
  );
}

const sprinklePositions = [
  { x: 50, y: 80, r: 30 },
  { x: 60, y: 50, r: -20 },
  { x: 90, y: 40, r: 15 },
  { x: 130, y: 50, r: -40 },
  { x: 150, y: 80, r: 60 },
  { x: 155, y: 120, r: -30 },
  { x: 130, y: 150, r: 20 },
  { x: 90, y: 158, r: -10 },
  { x: 55, y: 145, r: 50 },
  { x: 40, y: 110, r: -60 },
  { x: 75, y: 70, r: 5 },
  { x: 120, y: 70, r: -50 },
  { x: 75, y: 135, r: 75 },
  { x: 125, y: 135, r: -25 },
];
