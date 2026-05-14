import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { easeStandard } from "../utils/motion";

/**
 * Page preloader.
 *
 * Sequence on first mount:
 *   1. Counts 0 → 100 over ~2.2s with a quartic ease-out, so the number
 *      flies up early and decelerates into 100.
 *   2. Holds for ~250ms at 100 so the eye lands on the full number.
 *   3. Splits horizontally: the top half slides up out of the viewport
 *      while the bottom half slides down, taking ~900ms. The counter
 *      fades over the first 250ms of this phase.
 *   4. Calls `onReady` at the moment the split starts so the underlying
 *      Hero can begin its enter animations and feel like it's emerging
 *      from behind the splitting halves.
 *   5. Unmounts itself when the split animation finishes.
 *
 * The counter writes directly to a span's `textContent` from the rAF
 * loop rather than driving React state, avoiding ~130 re-renders over
 * the 2.2s count.
 *
 * @param {object} props
 * @param {() => void} [props.onReady] - Fires when the reveal animation
 *   starts, ahead of the preloader unmounting. Use this to trigger
 *   above-the-fold entry animations.
 */
export default function Preloader({ onReady }) {
  // "counting" → "revealing" → "done"
  const [phase, setPhase] = useState("counting");
  const countRef = useRef(null);

  // Count 0 → 100 with quartic ease-out. Writes the result to the span's
  // textContent so React never re-renders during the count.
  useEffect(() => {
    if (phase !== "counting") return;
    const duration = 2200;
    const startTime = performance.now();
    let rafId = 0;
    let lastValue = -1;

    const tick = () => {
      const elapsed = performance.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      const value = Math.floor(eased * 100);
      if (value !== lastValue && countRef.current) {
        countRef.current.textContent = String(value).padStart(3, "0");
        lastValue = value;
      }
      if (t < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        if (countRef.current) countRef.current.textContent = "100";
        // Brief beat at "100" before the split kicks off.
        setTimeout(() => {
          setPhase("revealing");
          onReady?.();
        }, 250);
      }
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [phase, onReady]);

  if (phase === "done") return null;

  const revealing = phase === "revealing";

  return (
    <div
      className="fixed inset-0 z-[10000] overflow-hidden"
      aria-hidden={revealing}
      role="presentation"
    >
      {/* Top half — slides up off-screen on reveal. */}
      <motion.div
        className="absolute inset-x-0 top-0 h-1/2 bg-paper"
        initial={{ y: 0 }}
        animate={{ y: revealing ? "-100%" : 0 }}
        transition={{ duration: 0.9, ease: easeStandard }}
      />
      {/* Bottom half — slides down off-screen, and we use its end-of-
          animation callback to flip phase → "done" so the wrapper
          unmounts the moment both halves have left the viewport. */}
      <motion.div
        className="absolute inset-x-0 bottom-0 h-1/2 bg-paper"
        initial={{ y: 0 }}
        animate={{ y: revealing ? "100%" : 0 }}
        transition={{ duration: 0.9, ease: easeStandard }}
        onAnimationComplete={() => revealing && setPhase("done")}
      />

      {/* Counter — sits on top of the halves; fades during the reveal
          so the number disappears before the halves have fully cleared. */}
      <motion.div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        animate={{ opacity: revealing ? 0 : 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <span
          ref={countRef}
          className="font-display text-ink tabular-nums"
          style={{
            fontWeight: 700,
            fontSize: "clamp(48px, 9vw, 128px)",
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          000
        </span>
      </motion.div>
    </div>
  );
}
