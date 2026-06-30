import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useSectionBackdrop } from "../utils/backdrop";

const ease = [0.65, 0, 0.35, 1];

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const mod = (v, m) => ((v % m) + m) % m;

const NAME = "Adnaan Dasoo";
// Pairs of name + separator per row. The track renders this many; `halfW`
// (scrollWidth / 2) is the wrap period, so any even split is seamless. 24 keeps
// `halfW` wider than the viewport at every clamp size, so there's never a gap.
const REPS = 24;

/**
 * Hero section (V2) — twin marquee.
 *
 * Two rows of "ADNAAN DASOO ✦" drift in opposite directions, the first name of
 * each row centered. A single scroll-independent rAF translates the two tracks
 * and wraps them at their half-width. The bottom HUD (coordinates / scroll /
 * elevation) is kept from the previous hero and still animates with scroll.
 *
 * @param {object} props
 * @param {boolean} [props.ready=true] - Hold the entrance fade until the
 *   preloader peels away.
 */
export default function Hero({ ready = true }) {
  const sectionRef = useRef(null);
  const r1Ref = useRef(null);
  const r2Ref = useRef(null);
  const hudRef = useRef(null);
  const latRef = useRef(null);
  const lonRef = useRef(null);
  const elevRef = useRef(null);
  const readyRef = useRef(ready);
  readyRef.current = ready;
  useSectionBackdrop(sectionRef, "light");

  // Marquee loop: each row drifts at a constant speed, wrapping seamlessly at
  // its half-width. `pos` is initialized so the first name sits dead-center.
  useEffect(() => {
    const rows = [
      { el: r1Ref.current, dir: 1, speed: 0.5, pos: 0, halfW: 0 },
      { el: r2Ref.current, dir: -1, speed: 0.5, pos: 0, halfW: 0 },
    ];
    const measure = () => {
      rows.forEach((r) => {
        if (!r.el) return;
        const nameW = r.el.children[0].getBoundingClientRect().width;
        r.halfW = r.el.scrollWidth / 2;
        r.pos = (nameW - window.innerWidth) / 2; // center the first name
      });
    };
    // Two rAFs so the (variable) font settles before we measure widths.
    requestAnimationFrame(() => requestAnimationFrame(measure));
    window.addEventListener("resize", measure);

    let raf = 0;
    const frame = () => {
      rows.forEach((r) => {
        if (!r.el || !r.halfW) return;
        r.pos += r.dir * r.speed;
        // Whole-pixel transform → no sub-pixel blur on the huge glyphs.
        r.el.style.transform = `translateX(${Math.round(-mod(r.pos, r.halfW))}px)`;
      });
      raf = requestAnimationFrame(frame);
    };
    frame();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Bottom HUD: scroll-driven coordinate/elevation readouts + fade-out as the
  // section scrolls up. Independent of the marquee.
  useEffect(() => {
    let raf = 0;
    const frame = () => {
      const vh = window.innerHeight;
      const scroll = window.scrollY || 0;
      const pc = clamp(scroll / (vh * 0.9), 0, 1);
      if (latRef.current) latRef.current.textContent = `${(40.7128 + pc * 0.2872).toFixed(4)}° N`;
      if (lonRef.current) lonRef.current.textContent = `${(74.006 - pc * 0.6).toFixed(4)}° W`;
      if (elevRef.current) elevRef.current.textContent = `${String(Math.round(pc * 2480)).padStart(4, "0")} M`;
      if (hudRef.current) {
        hudRef.current.style.opacity = readyRef.current
          ? String(1 - clamp(scroll / (vh * 0.5), 0, 1))
          : "0";
      }
      raf = requestAnimationFrame(frame);
    };
    frame();
    return () => cancelAnimationFrame(raf);
  }, []);

  // One row's content: REPS pairs of <name><✦>. The separator is tinted with
  // the opposite color of the row's text so the two rows mirror each other.
  const buildUnits = (sepColor) => {
    const out = [];
    for (let i = 0; i < REPS; i++) {
      out.push(
        <span key={`n${i}`} style={{ padding: "0 0.12em" }}>{NAME}</span>,
        <span key={`s${i}`} style={{ padding: "0 0.06em", color: sepColor }}>✦</span>,
      );
    }
    return out;
  };

  const trackStyle = {
    fontWeight: 600,
    fontSize: "clamp(60px, 16.5vw, 380px)",
    lineHeight: 0.92,
    letterSpacing: "-0.02em",
    wordSpacing: "0.32em",
    willChange: "transform",
  };

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen min-h-[100dvh] w-full flex-col overflow-hidden"
    >
      {/* Accessible heading — the marquee itself is decorative repetition. */}
      <h1 className="sr-only">Adnaan Dasoo — Creative Developer</h1>

      {/* Twin marquee — full-bleed, vertically centered. Fades in on `ready`. */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : false}
        transition={{ duration: 0.8, delay: 0.3, ease }}
        className="pointer-events-none absolute inset-0 flex select-none flex-col justify-center font-display uppercase"
      >
        <div className="flex overflow-hidden">
          <div ref={r1Ref} className="inline-flex whitespace-nowrap text-ink" style={trackStyle}>
            {buildUnits("var(--accent)")}
          </div>
        </div>
        <div className="flex overflow-hidden">
          <div ref={r2Ref} className="inline-flex whitespace-nowrap text-accent" style={trackStyle}>
            {buildUnits("var(--ink)")}
          </div>
        </div>
      </motion.div>

      {/* Bottom HUD — coordinates (left) + SCROLL DOWN (center) + elevation
          (right). Opacity owned by the rAF (gated on `ready`). */}
      <div
        ref={hudRef}
        className="pointer-events-none mt-auto grid grid-cols-3 items-end px-4 pb-8 sm:px-8"
        style={{ opacity: 0 }}
      >
        <div className="font-sans text-[14px] font-medium uppercase leading-[1.5] tracking-[0.16em] text-muted sm:text-[16px]">
          <div ref={latRef}>40.7128° N</div>
          <div ref={lonRef}>74.0060° W</div>
        </div>

        <span
          className="justify-self-center self-end uppercase text-muted"
          style={{
            fontFamily: "'Manrope', system-ui, sans-serif",
            fontWeight: 700,
            fontSize: "17px",
            letterSpacing: "0.24em",
            whiteSpace: "nowrap",
          }}
        >
          Scroll Down
        </span>

        <div className="justify-self-end text-right font-sans text-[14px] font-medium uppercase leading-[1.5] tracking-[0.16em] text-muted sm:text-[16px]">
          <div>Elev</div>
          <div ref={elevRef}>0000 M</div>
        </div>
      </div>
    </section>
  );
}
