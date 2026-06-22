import { useEffect, useState } from "react";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { easeStandard } from "../utils/motion";

// The curtain's curved leading edge is an SVG quadratic, drawn in a viewBox
// where 1 unit = 1vw (x) / 1vh (y). BASE_Y is where the straight sides of the
// bottom edge sit (just below the fold so the screen is fully covered at rest);
// SAG_VH is how far the center of the curve dips below that line. A quadratic
// (not a circular/elliptical arc) keeps the edges near-horizontal, so it reads
// as a gentle bow rather than a semicircle. The sag eases to 0 over the sweep.
const BASE_Y = 103;
const SAG_VH = 8;

/**
 * "Hello" in a handful of languages. The first ("Hello") fades in and lingers;
 * the rest flick past quickly. Latin scripts render in Manrope; the Arabic word
 * falls back to the system stack, which is fine for a single word.
 */
const GREETINGS = ["Hello", "Hola", "Bonjour", "你好", "Ciao", "Hallo", "Sawubona", "مرحبا"];

/**
 * Page preloader.
 *
 * Sequence on first mount:
 *   1. Flashes through GREETINGS — "hello" in a dozen languages — about one
 *      every 170ms, holding a beat on the last word.
 *   2. A full-screen #141310 curtain then sweeps up off the viewport, revealing
 *      the page from the bottom upward. The curtain's leading (bottom) edge is a
 *      shallow downward arc (rounded bottom corners), so the reveal boundary is
 *      a gentle curve rather than a straight line — screen edges clear first,
 *      the center last.
 *   3. Calls `onReady` the instant the sweep starts so the underlying Hero can
 *      begin its enter animations and feel like it's emerging behind the curtain.
 *   4. Unmounts itself when the sweep finishes.
 *
 * @param {object} props
 * @param {() => void} [props.onReady] - Fires when the reveal animation
 *   starts, ahead of the preloader unmounting. Use this to trigger
 *   above-the-fold entry animations.
 */
export default function Preloader({ onReady }) {
  // "loading" → "revealing" → "done"
  const [phase, setPhase] = useState("loading");
  const [index, setIndex] = useState(0);

  // One numeric driver for the whole sweep (0 = covering, 1 = fully swept). Both
  // the vertical travel and the curve depth derive from it, so they ease in
  // perfect sync — and the depth interpolates as a plain number (no string-token
  // snapping), giving a smooth flatten as the curtain levels out at the top.
  const sweep = useMotionValue(0);
  const curtainY = useTransform(sweep, [0, 1], ["0%", "-112%"]);
  // Quadratic control-point Y: for a quadratic, the curve's midpoint sits
  // halfway between the endpoints and the control point, so a midpoint dip of
  // SAG_VH needs the control point 2·SAG_VH below BASE_Y. Eases to BASE_Y (flat).
  const ctrlY = useTransform(sweep, [0, 1], [BASE_Y + 2 * SAG_VH, BASE_Y]);
  const dPath = useMotionTemplate`M0 0 H100 V${BASE_Y} Q50 ${ctrlY} 0 ${BASE_Y} Z`;

  // Hold the first greeting ("Hello") for a beat, then flick through the rest
  // quickly. A self-rescheduling timeout lets the first step run long and the
  // remainder run short; clearing the live handle on cleanup halts the chain.
  useEffect(() => {
    if (phase !== "loading") return;
    const FIRST_MS = 950; // "Hello" lingers
    const REST_MS = 160; // the rest flick past
    let i = 0;
    let timer = 0;
    const advance = () => {
      i += 1;
      if (i >= GREETINGS.length) {
        setIndex(GREETINGS.length - 1);
        timer = setTimeout(() => {
          setPhase("revealing");
          onReady?.();
        }, 220);
        return;
      }
      setIndex(i);
      timer = setTimeout(advance, REST_MS);
    };
    timer = setTimeout(advance, FIRST_MS);
    return () => clearTimeout(timer);
  }, [phase, onReady]);

  // Drive the sweep once the reveal begins. Single eased tween on the numeric
  // motion value; onComplete unmounts the preloader.
  useEffect(() => {
    if (phase !== "revealing") return;
    const controls = animate(sweep, 1, {
      duration: 1.05,
      ease: easeStandard,
      onComplete: () => setPhase("done"),
    });
    return () => controls.stop();
  }, [phase, sweep]);

  if (phase === "done") return null;

  return (
    <div
      className="fixed inset-0 z-[10000] overflow-hidden"
      aria-hidden={phase === "revealing"}
      role="presentation"
    >
      {/* The curtain. Taller than the viewport so its curved bottom edge starts
          below the fold (screen fully covered), entering view only once it
          sweeps up. The greeting rides inside it, so word + curtain leave
          together. The shape is an SVG quadratic (gentle bow, not a semicircle);
          preserveAspectRatio="none" lets the viewBox stretch to any viewport. */}
      <motion.div className="absolute inset-x-0 top-0" style={{ height: "120vh", y: curtainY }}>
        <motion.svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 120"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <motion.path d={dPath} fill="var(--lime)" />
        </motion.svg>

        {/* Greeting — centered within the viewport-height band at the top of
            the curtain (not the full 120vh, so it sits in the visual center).
            No fade on reveal: the last word rides up with the curtain. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex h-screen items-center justify-center">
          {/* Each greeting swaps in place — no AnimatePresence, so the key
              change remounts the span and replays its fade. "Hello" (index 0)
              fades in slowly; the rest pop nearly instantly. */}
          <motion.span
            key={index}
            dir="auto"
            style={{
              color: "var(--dark-bg)",
              fontFamily: "Manrope, system-ui, sans-serif",
              fontWeight: 600,
              fontSize: "clamp(28px, 4vw, 60px)",
              lineHeight: 1,
              letterSpacing: "-0.01em",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: index === 0 ? 0.7 : 0.08, ease: "easeOut" }}
          >
            {GREETINGS[index]}
          </motion.span>
        </div>
      </motion.div>
    </div>
  );
}
