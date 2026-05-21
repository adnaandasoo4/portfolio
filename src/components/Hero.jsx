import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { hero } from "../constants";

// HeroBigText pulls in Three.js (~365 KB). Code-splitting it into its own
// chunk lets the rest of the page (Manifesto, Experience, Tech, Selected
// Work, Contact) finish downloading first; the wordmark fills in as Three
// loads in parallel. Fallback is null so the wordmark area stays empty
// during the swap — the page background already covers it.
const HeroBigText = lazy(() => import("./HeroBigText"));

const ease = [0.65, 0, 0.35, 1];

/**
 * Live HH:MM:SS clock for the author's local time, shown in the hero's
 * top-left corner to balance the top-right scroll indicator. The time is
 * formatted via Intl.DateTimeFormat with an explicit IANA `timeZone`, so
 * the displayed clock is always the author's local time regardless of
 * where the visitor is viewing from. Ticks once per second.
 */
function LocalTime({ label, timeZone, ready }) {
  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone,
      }),
    [timeZone],
  );

  const [time, setTime] = useState(() => formatter.format(new Date()));

  useEffect(() => {
    const tick = () => setTime(formatter.format(new Date()));
    // Align the first tick to the next wall-clock second so the seconds
    // digit doesn't lag a fractional moment behind real time.
    const msUntilNextSecond = 1000 - (Date.now() % 1000);
    let intervalId;
    const timeoutId = setTimeout(() => {
      tick();
      intervalId = setInterval(tick, 1000);
    }, msUntilNextSecond);
    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [formatter]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={ready ? { opacity: 1 } : false}
      transition={{ duration: 0.6, delay: 0.25, ease }}
      className="flex flex-col gap-1.5"
    >
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
        {label}
      </span>
      <span className="font-mono text-sm tracking-wider text-ink tabular-nums">
        {time}
      </span>
    </motion.div>
  );
}

/**
 * Hero section.
 *
 * Layout:
 * - Top-right: animated scroll-stream indicator (vertical line with an
 *   orange streak travelling top→bottom on loop, vertical "SCROLL" label
 *   below). Sits at the top of the inner content rail so it's the first
 *   right-side element a visitor sees.
 * - Bottom-right (above the wordmark): two-line kicker — Software
 *   Engineer / Creative Developer, in display-friendly mono at ink color.
 * - Bottom: HeroBigText — full-bleed WebGL wordmark with through-glass
 *   blur localized around the cursor on hover.
 *
 * @param {object} props
 * @param {boolean} [props.ready=true] - When false, the in-section
 *   motion elements stay at their initial state and don't animate. Used
 *   by the App-level Preloader: when the preloader is in its counting
 *   phase, ready is false and the Hero is hidden; when the preloader
 *   begins its reveal/split, ready flips to true and the kicker + scroll
 *   indicator animate in alongside the splitting overlay.
 */
export default function Hero({ ready = true }) {
  return (
    <section className="relative flex min-h-screen min-h-[100dvh] w-full flex-col overflow-hidden px-6 pb-0 pt-32 sm:px-16 sm:pb-12 sm:pt-40">
      {/* Inner content container — same 1536px rail as every other section,
          and same internal px-6 sm:px-16 padding the navbar uses, so the
          scroll indicator's right edge lines up with the navbar's theme
          toggle on wide displays. (Without the padding, the inner rail's
          edge sits flush with the section's content edge, which is 64px
          to the right of the navbar's right-aligned items.) */}
      <div className="relative mx-auto flex w-full max-w-[1800px] flex-1 flex-col px-6 sm:px-16">
        <div className="flex items-start justify-between">
          <LocalTime
            label={hero.locale.label}
            timeZone={hero.locale.timeZone}
            ready={ready}
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={ready ? { opacity: 1 } : false}
            transition={{ duration: 0.6, delay: 0.25, ease }}
            className="flex flex-col items-center gap-3"
          >
            {/* Vertical track + orange streak that loops top→bottom. */}
            <div className="relative h-20 w-px overflow-hidden bg-edge">
              <motion.div
                className="absolute left-0 top-0 h-4 w-px bg-flag"
                initial={{ y: -16 }}
                animate={{ y: 80 }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            </div>
            <span
              className="font-mono text-[10px] uppercase tracking-widest text-muted"
              style={{ writingMode: "vertical-rl" }}
            >
              {hero.scrollPrompt}
            </span>
          </motion.div>
        </div>
      </div>

      {/* Mobile-only sideways wordmark — replaces the WebGL ADNAAN on
          phones. Bottom is anchored to the same `bottom-[24vw]` rail
          the kicker uses, so the last "N" sits flush with the bottom
          of "Creative Developer" — the two read as a connected
          bottom band. `writing-mode: vertical-rl` rotates Latin glyphs
          90° clockwise (top-to-bottom reading), matching the technique
          used by the SCROLL label on the right. */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : false}
        transition={{ duration: 0.6, delay: 0.45, ease }}
        className="pointer-events-none absolute bottom-[24vw] left-6 z-0 select-none uppercase sm:hidden"
        style={{
          writingMode: "vertical-rl",
          fontFamily: '"Clash Display", "Geist", system-ui, sans-serif',
          fontWeight: 700,
          fontSize: "clamp(80px, 24vw, 160px)",
          lineHeight: 0.85,
          letterSpacing: "-0.02em",
          color: "var(--display-subtle)",
        }}
      >
        {hero.name}
      </motion.div>

      {/* Kicker — Software Engineer / Creative Developer. Anchored just
          above the wordmark and right-aligned with the inner rail. */}
      <div className="pointer-events-none absolute bottom-[24vw] left-0 right-0 z-10 mx-auto w-full max-w-[1800px] px-6 sm:px-16">
        <div className="flex justify-end">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={ready ? { opacity: 1, y: 0 } : false}
            transition={{ duration: 0.6, delay: 0.5, ease }}
            className="font-mono text-sm uppercase tracking-widest text-ink sm:text-right"
          >
            {hero.kicker.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </motion.div>
        </div>
      </div>

      {/* WebGL display word, full-bleed at the bottom. Lazy-loaded so
          Three.js doesn't block the rest of the page's initial paint.
          Desktop/tablet only — on mobile, the sideways wordmark above
          carries the name. */}
      <div className="hidden sm:contents">
        <Suspense fallback={null}>
          <HeroBigText text={hero.name} />
        </Suspense>
      </div>
    </section>
  );
}
