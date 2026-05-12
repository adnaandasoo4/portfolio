import { useEffect, useRef, useState } from "react";

// Glyph set the decoder cycles through before each letter lands on its target.
// Restricted to uppercase A-Z because the Hero's display font (Azonix) is
// uppercase-only — including digits/symbols would trigger font-fallback flicker
// mid-animation. Letters from this set always render in the same face.
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Animation timing. 33 ms tick + reveal-one-letter-every-4-frames runs ~1.5× faster
// than the original brainstormed 50ms cadence. Total decode time for an 11-character
// target ≈ 11 × 4 × 33ms ≈ 1.45s.
const TICK_MS = 33;
const FRAMES_PER_REVEAL = 4;

/**
 * Renders `target` as a scroll-decoded string. On mount and again whenever the element
 * scrolls back into view (>=50% intersecting), runs the decode animation: every letter
 * cycles through random glyphs, then locks in one at a time left-to-right.
 *
 * Whitespace and newlines are not decoded — they pass through immediately. Newlines
 * render as <br> via per-line <span class="block"> wrappers.
 *
 * Props:
 *   - target: string to decode. May contain "\n" for line breaks.
 *   - className: applied to the outer <span>.
 */
function makeScrambledInitial(target) {
  return target
    .split("")
    .map((c) => {
      if (c === "\n" || c === " ") return c;
      return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    })
    .join("");
}

export default function HeroDecoder({ target, className = "", ...rest }) {
  // Initialize with a scrambled placeholder so the first paint doesn't briefly
  // show the resolved target before the decoder starts.
  const [display, setDisplay] = useState(() => makeScrambledInitial(target));
  const elementRef = useRef(null);
  const intervalRef = useRef(null);
  const decodingRef = useRef(false);

  // Start one run of the decode animation. Guards against re-entry.
  function decode() {
    if (decodingRef.current) return;
    decodingRef.current = true;

    const chars = target.split("");
    // `revealed[i]` is true once char i has been "locked in".
    // Whitespace and newlines are pre-revealed so they pass straight through.
    const revealed = chars.map((c) => c === "\n" || c === " ");

    let frame = 0;
    intervalRef.current = setInterval(() => {
      frame++;

      // Lock in one new letter every FRAMES_PER_REVEAL ticks.
      if (frame % FRAMES_PER_REVEAL === 0) {
        const next = revealed.findIndex((r) => !r);
        if (next === -1) {
          // All letters revealed — settle on the final string and stop.
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          decodingRef.current = false;
          setDisplay(target);
          return;
        }
        revealed[next] = true;
      }

      // Render: revealed letters show their final char; unrevealed show a random glyph.
      const out = chars
        .map((c, i) => {
          if (revealed[i]) return c;
          return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        })
        .join("");
      setDisplay(out);
    }, TICK_MS);
  }

  useEffect(() => {
    // Run once on mount.
    decode();

    // Re-trigger when the element scrolls back into view (>=50% visible).
    const el = elementRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) decode();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      decodingRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  // Render: split by "\n" so each line wraps in its own block span.
  const lines = display.split("\n");
  return (
    <span ref={elementRef} className={className} {...rest}>
      {lines.map((line, i) => (
        <span key={i} className="block">
          {line}
        </span>
      ))}
    </span>
  );
}
