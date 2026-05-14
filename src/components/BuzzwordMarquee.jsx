import { motion } from "framer-motion";
import { buzzwords } from "../constants";

/**
 * Standalone full-width buzzword marquee, mounted between sections as a
 * rhythm break. The list from `buzzwords` is rendered twice in source order
 * and the track animates `translateX(0 → -50%)`, so when the loop completes
 * the second copy occupies the first copy's starting position — the seam is
 * invisible.
 *
 * Hover or keyboard focus on the wrapper pauses the scroll via a pure
 * `:hover` / `:focus-within` CSS selector — cheaper than a JS state toggle.
 * `prefers-reduced-motion: reduce` halts the animation entirely.
 *
 * Not wrapped by SectionWrapper — it's not a content section, so it doesn't
 * need an anchor, padding container, or stagger orchestration. Entrance
 * fade-in is driven by its own `whileInView` so it animates when scrolled
 * past for the first time.
 */
export default function BuzzwordMarquee() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
      className="buzzword-marquee-wrap w-full overflow-hidden border-y border-edge"
    >
      <div className="buzzword-marquee-track flex gap-12 whitespace-nowrap py-5 will-change-transform sm:gap-16">
        {[...buzzwords, ...buzzwords].map((word, i) => (
          <span
            key={i}
            className="flex shrink-0 items-center gap-12 font-mono text-[11px] uppercase tracking-widest text-muted sm:gap-16"
          >
            {word}
            <span aria-hidden="true" className="opacity-50">
              +
            </span>
          </span>
        ))}
      </div>

      <style>{`
        .buzzword-marquee-track {
          animation: buzzword-marquee 40s linear infinite;
        }
        .buzzword-marquee-wrap:hover .buzzword-marquee-track,
        .buzzword-marquee-wrap:focus-within .buzzword-marquee-track {
          animation-play-state: paused;
        }
        @keyframes buzzword-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .buzzword-marquee-track { animation: none; }
        }
      `}</style>
    </motion.div>
  );
}
