"use client";

import { useState } from "react";

type FoodImageProps = {
  src: string;
  alt: string;
  /** Tailwind background class shown while loading or if the image fails. */
  fallbackBg?: string;
  className?: string;
  imgClassName?: string;
};

/**
 * Stock food photography wrapper.
 *
 * Renders a soft pastel surface with a subtle radial highlight beneath the photo.
 * While the image loads it fades in over the surface; if the URL 404s the surface
 * stays — never a broken-image icon, never an emoji placeholder.
 *
 * Plain <img> (not next/image) so any URL works without next.config remote-pattern.
 */
export function FoodImage({
  src,
  alt,
  fallbackBg = "bg-cream-100",
  className = "",
  imgClassName = "",
}: FoodImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  return (
    <div className={`relative overflow-hidden ${fallbackBg} ${className}`}>
      {/* Subtle radial highlight — gives the fallback surface depth so it reads as designed, not empty. */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(60% 50% at 30% 25%, rgba(255,255,255,0.55) 0%, transparent 70%), radial-gradient(50% 50% at 80% 90%, rgba(0,0,0,0.05) 0%, transparent 70%)",
        }}
      />
      {!errored && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          className={`relative z-10 w-full h-full object-cover transition-opacity duration-700 ${
            loaded ? "opacity-100" : "opacity-0"
          } ${imgClassName}`}
        />
      )}
    </div>
  );
}
