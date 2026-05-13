import { motion } from "framer-motion";
import { hero } from "../constants";
import HeroDecoder from "./HeroDecoder";
import Now from "./Now";

const ease = [0.65, 0, 0.35, 1];

/**
 * Hero section. Renders a full-viewport stage with the decoded name + subtitle in
 * the middle row, and a bottom row containing location/availability on the left
 * and the Now card on the right. Drops the old "Hi, I'm Adnaan" headline, the
 * orange gradient sidebar, the ComputersCanvas (now removed entirely), and the
 * bouncing scroll indicator.
 */
export default function Hero() {
  return (
    <section className="relative flex min-h-screen w-full flex-col px-6 pb-12 pt-32 sm:px-16 sm:pt-40">
      <div className="mx-auto flex w-full max-w-screen-2xl flex-1 flex-col justify-end gap-12">
        {/* Name + subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease }}
        >
          <HeroDecoder
            target={hero.name}
            className="font-display text-ink"
            data-hero-display=""
          />
          <p className="mt-4 font-mono text-xs uppercase tracking-widest text-muted">
            {hero.subtitle}
          </p>
        </motion.div>

        {/* Bottom row: location + availability pill on the left, Now card on the right */}
        <motion.div
          className="grid grid-cols-1 gap-6 sm:grid-cols-[1fr_auto] sm:items-end"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease }}
        >
          <div className="flex flex-col gap-2 font-mono text-[10px] uppercase tracking-widest text-muted">
            <span>{hero.location}</span>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-edge px-2.5 py-1 text-ink">
              <span
                aria-hidden="true"
                className="block h-1.5 w-1.5 rounded-full bg-accent"
                style={{ boxShadow: "0 0 0 3px rgb(from var(--accent) r g b / 0.18)" }}
              />
              {hero.availability}
            </span>
          </div>

          <Now />
        </motion.div>
      </div>

      <style>{`
        /* Scoped to the Hero name span via its [data-hero-display] attribute so
           later sections that also use the font-display + text-ink combo don't
           inherit the giant clamp() sizing. Weight 900 lands on Cabinet Grotesk
           Black (the only Cabinet Grotesk weight loaded in index.css). */
        [data-hero-display] {
          font-size: clamp(60px, 11vw, 168px);
          line-height: 0.92;
          letter-spacing: 0.04em;
          font-weight: 900;
        }
      `}</style>
    </section>
  );
}
