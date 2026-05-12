"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ThumbsUp } from "lucide-react";
import { FadeIn, Line } from "@/components/ui/Reveal";

const initialSuggestions = [
  { id: "s1", idea: "Honey-lavender glaze", name: "Sarah K.", city: "Fairhope, AL", votes: 142 },
  { id: "s2", idea: "Birthday cake mochi", name: "Jamie L.", city: "Pensacola, FL", votes: 118 },
  { id: "s3", idea: "Brown butter old-fashioned", name: "Marcus T.", city: "Mobile, AL", votes: 96 },
  { id: "s4", idea: "Cookies-and-cream filled", name: "Devon R.", city: "Gulf Shores, AL", votes: 84 },
  { id: "s5", idea: "Cardamom-pistachio", name: "Priya S.", city: "Pace, FL", votes: 73 },
  { id: "s6", idea: "Brûléed crème glaze", name: "Nina H.", city: "Daphne, AL", votes: 67 },
];

export function FlavorRequest() {
  const [idea, setIdea] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [voted, setVoted] = useState<Set<string>>(new Set());
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>(() =>
    Object.fromEntries(initialSuggestions.map((s) => [s.id, s.votes])),
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) return;
    setSubmitted(true);
    setIdea("");
    setTimeout(() => setSubmitted(false), 4000);
  };

  const toggleVote = (id: string) => {
    setVoted((prev) => {
      const next = new Set(prev);
      const wasVoted = next.has(id);
      if (wasVoted) next.delete(id);
      else next.add(id);
      setVoteCounts((counts) => ({
        ...counts,
        [id]: (counts[id] ?? 0) + (wasVoted ? -1 : 1),
      }));
      return next;
    });
  };

  return (
    <section className="relative py-20 lg:py-28 bg-cream-100 overflow-hidden">
      <div
        aria-hidden
        className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(253,222,180,0.6), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="absolute bottom-0 right-0 w-[340px] h-[340px] rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(247,224,139,0.5), transparent 70%)",
        }}
      />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <FadeIn>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cocoa-700 mb-4">
            Community
          </p>
        </FadeIn>
        <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black text-cocoa-900 tracking-tight leading-[0.92]">
          <Line>What should we</Line>
          <Line delay={0.08}>bake next?</Line>
        </h2>
        <FadeIn delay={0.4} className="mt-6">
          <p className="text-xl text-cocoa-700 font-medium leading-snug max-w-2xl mx-auto">
            Got a flavor we have to try? Drop your idea below — we read every
            one, and the best ones make it onto the menu.
          </p>
        </FadeIn>

        {/* Submission form */}
        <FadeIn delay={0.55} className="mt-9">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
          >
            <input
              type="text"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Maple-pecan, brown sugar bourbon, anything goes..."
              maxLength={80}
              className="flex-1 rounded-full px-5 py-3 bg-cream-50 border border-cream-200 text-cocoa-900 placeholder:text-cocoa-700/50 focus:outline-none focus:border-cocoa-900 transition-colors"
            />
            <button
              type="submit"
              disabled={!idea.trim()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-cocoa-900 hover:bg-cocoa-800 disabled:opacity-40 disabled:cursor-not-allowed text-cream-50 font-bold transition-all duration-300 hover:scale-[1.02]"
            >
              <Send size={15} />
              Send it
            </button>
          </form>
          <AnimatePresence>
            {submitted && (
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-3 text-sm text-cocoa-800 font-semibold"
              >
                Got it. We&apos;ll see what we can do.
              </motion.p>
            )}
          </AnimatePresence>
        </FadeIn>
      </div>

      {/* Community suggestions */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 lg:mt-20">
        <FadeIn>
          <h3 className="text-center font-display text-2xl sm:text-3xl font-black text-cocoa-900 mb-2">
            Loved by the community
          </h3>
          <p className="text-center text-sm text-cocoa-700 mb-10">
            Tap a heart on the ones you&apos;d order.
          </p>
        </FadeIn>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {initialSuggestions.map((s, i) => {
            const isVoted = voted.has(s.id);
            return (
              <motion.button
                key={s.id}
                type="button"
                onClick={() => toggleVote(s.id)}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                whileHover={{ y: -3 }}
                className="text-left relative bg-cream-50 border border-cream-200 rounded-card p-5 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <p className="font-display text-lg font-black text-cocoa-900 leading-tight">
                  &ldquo;{s.idea}&rdquo;
                </p>
                <p className="mt-3 text-xs text-cocoa-700">
                  {s.name} · {s.city}
                </p>
                <span
                  className={`mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                    isVoted
                      ? "bg-cocoa-900 text-cream-50"
                      : "bg-cream-100 text-cocoa-800"
                  }`}
                >
                  <ThumbsUp
                    size={12}
                    className={`transition-transform duration-300 ${isVoted ? "scale-110" : ""}`}
                  />
                  {voteCounts[s.id]}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
