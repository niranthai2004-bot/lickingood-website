"use client";

import { Star } from "lucide-react";
import { reviews } from "@/data/reviews";
import { FadeIn, Line } from "@/components/ui/Reveal";

const avatarTones = [
  "bg-amber-100 text-amber-900",
  "bg-rose-100 text-rose-900",
  "bg-violet-100 text-violet-900",
  "bg-sky-100 text-sky-900",
  "bg-emerald-100 text-emerald-900",
  "bg-stone-200 text-stone-800",
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${count} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={16}
          className={i < count ? "fill-amber-400 text-amber-400" : "text-cream-300"}
        />
      ))}
    </div>
  );
}

export function Reviews() {
  const loop = [...reviews, ...reviews];

  return (
    <section className="relative py-20 lg:py-28 bg-cream-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="text-center max-w-3xl mx-auto">
          <FadeIn>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-cocoa-700 mb-3">
              Loved by Alabama
            </p>
          </FadeIn>
          <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-cocoa-900 tracking-tight leading-[0.92]">
            <Line>4.9 stars and</Line>
            <Line delay={0.1}>climbing.</Line>
          </h2>
          <FadeIn delay={0.3} className="mt-5">
            <p className="text-xl text-cocoa-700 font-medium">
              From thousands of reviews across Google, Yelp, and DoorDash.
            </p>
          </FadeIn>
        </div>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-24 bg-gradient-to-r from-cream-50 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-24 bg-gradient-to-l from-cream-50 to-transparent z-10" />

        <div className="flex w-max gap-5 animate-scroll-x hover:[animation-play-state:paused]">
          {loop.map((review, i) => (
            <article
              key={`${review.id}-${i}`}
              className="w-[300px] sm:w-[380px] shrink-0 rounded-card bg-cream-50 border border-cream-200 p-7 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-500 ease-out"
            >
              <Stars count={review.rating} />
              <p className="mt-5 text-cocoa-800 font-display text-xl font-bold leading-snug">
                &ldquo;{review.body}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-full ${avatarTones[i % avatarTones.length]} flex items-center justify-center font-display font-black border border-cream-200`}
                >
                  {review.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-cocoa-900 leading-tight">
                    {review.name}
                  </p>
                  <p className="text-xs text-cocoa-700">{review.city}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
