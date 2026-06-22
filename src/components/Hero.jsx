import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useSectionBackdrop } from "../utils/backdrop";

const ease = [0.65, 0, 0.35, 1];

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const lerp = (a, b, t) => a + (b - a) * t;
// Smooth ease-in-out for the expand progress.
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

/**
 * Hero section (V2).
 *
 * Scroll choreography (driven by a single rAF reading scroll position):
 * - The headline + bottom HUD scroll away with the section and fade out.
 * - The reel does NOT scroll with them: it stays put and SCALES UP to a
 *   near-fullscreen video (inset by the page padding) over the first viewport
 *   of scroll (p1). A same-size invisible slot reserves its place in the layout
 *   so the headline/HUD sit around it; the visible reel is a fixed overlay.
 * - Over the next viewport (p2, provided by the 100vh spacer after the hero in
 *   App), the now-fullscreen reel translates up and off, revealing the About
 *   section beneath it.
 *
 * @param {object} props
 * @param {boolean} [props.ready=true] - Hold entrance animations until the
 *   preloader peels away.
 */
export default function Hero({ ready = true }) {
  const sectionRef = useRef(null);
  const stmtRef = useRef(null);
  const reelRef = useRef(null);
  const slotRef = useRef(null);
  const hudRef = useRef(null);
  const latRef = useRef(null);
  const lonRef = useRef(null);
  const elevRef = useRef(null);
  const initRectRef = useRef(null);
  const readyRef = useRef(ready);
  readyRef.current = ready;
  useSectionBackdrop(sectionRef, "light");

  // Measure the reel slot's document-relative box (scroll-independent via
  // rect.top + scrollY). Re-measured on resize. This is the reel's start state.
  useEffect(() => {
    const measure = () => {
      const slot = slotRef.current;
      if (!slot) return;
      const r = slot.getBoundingClientRect();
      initRectRef.current = {
        top: r.top + (window.scrollY || 0),
        left: r.left,
        width: r.width,
        height: r.height,
      };
    };
    // Two rAFs so fonts/layout settle before the first measure.
    requestAnimationFrame(() => requestAnimationFrame(measure));
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Single scroll-driven rAF: HUD coordinates + fade, and the reel expand/exit.
  // While the reel sits at rest it slides along a horizontal track that follows
  // the cursor's X position (vertical stays put); as the reel expands to
  // fullscreen the track resolves into the centered fullscreen inset, so the
  // cursor-follow naturally fades out as you scroll.
  useEffect(() => {
    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // targetX = the cursor's X (px); cx eases toward it each frame. Default to
    // viewport center so the reel rests over its centered slot before first move
    // (and stays centered under reduced motion, where no listener is attached).
    let targetX = (typeof window !== "undefined" ? window.innerWidth : 0) / 2;
    let cx = targetX;
    const onMove = (e) => {
      targetX = e.clientX;
    };
    if (!reduce) window.addEventListener("mousemove", onMove);

    let raf = 0;
    const frame = () => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const scroll = window.scrollY || 0;
      const p1 = clamp(scroll / vh, 0, 1); // expand
      const p2 = clamp((scroll - vh) / vh, 0, 1); // exit
      const e1 = easeInOut(p1);
      // Ease the smoothed cursor X toward the live target every frame.
      cx += (targetX - cx) * 0.08;

      // HUD coordinate/elevation readouts.
      const pc = clamp(scroll / (vh * 0.9), 0, 1);
      if (latRef.current) latRef.current.textContent = `${(40.7128 + pc * 0.2872).toFixed(4)}° N`;
      if (lonRef.current) lonRef.current.textContent = `${(74.006 - pc * 0.6).toFixed(4)}° W`;
      if (elevRef.current) elevRef.current.textContent = `${String(Math.round(pc * 2480)).padStart(4, "0")} M`;
      // HUD fades out over the first ~half viewport as it scrolls up.
      if (hudRef.current) {
        hudRef.current.style.opacity = readyRef.current
          ? String(1 - clamp(scroll / (vh * 0.5), 0, 1))
          : "0";
      }

      // Reel: lerp from its slot box to a padding-inset fullscreen box, then
      // translate up and off during the exit phase.
      const init = initRectRef.current;
      const reel = reelRef.current;
      if (reel && init) {
        // Match the nav's padding (p-4 / sm:p-8 = 16 / 32px) so the expanded
        // reel's edges align with the logo (left) and the buttons (right).
        const pad = vw >= 640 ? 32 : 16;
        const fTop = pad, fLeft = pad, fW = vw - 2 * pad, fH = vh - 2 * pad;
        // Rest-state left: center the reel under the cursor, clamped so it can
        // travel the full width between the page padding without leaving frame.
        const restLeft = clamp(cx - init.width / 2, pad, vw - pad - init.width);
        reel.style.left = `${lerp(restLeft, fLeft, e1)}px`;
        reel.style.top = `${lerp(init.top, fTop, e1)}px`;
        reel.style.width = `${lerp(init.width, fW, e1)}px`;
        reel.style.height = `${lerp(init.height, fH, e1)}px`;
        // Keep the rounded corners through the expand (don't square off at
        // fullscreen) — overflow:hidden clips the video to this radius.
        reel.style.borderRadius = "10px";
        reel.style.transform = `translateY(${-p2 * (fH + fTop + 40)}px)`;
        reel.style.opacity = readyRef.current && scroll < vh * 2.1 ? "1" : "0";
      }
      raf = requestAnimationFrame(frame);
    };
    frame();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  // Cursor-kinetic drift + skew on the headline (the reel gets its own drift in
  // the scroll rAF above, scaled to fade as it expands).
  useEffect(() => {
    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let sTx = 0, sTy = 0, sSk = 0, scx = 0, scy = 0, scs = 0;
    const onMove = (e) => {
      const dx = e.clientX / window.innerWidth - 0.5;
      const dy = e.clientY / window.innerHeight - 0.5;
      sTx = dx * -22;
      sTy = dy * -14;
      sSk = dx * -2.2;
    };
    window.addEventListener("mousemove", onMove);

    let raf = 0;
    const frame = () => {
      const stmt = stmtRef.current;
      if (stmt) {
        scx += (sTx - scx) * 0.07;
        scy += (sTy - scy) * 0.07;
        scs += (sSk - scs) * 0.07;
        stmt.style.transform = `translate(${scx}px, ${scy}px) skewX(${scs}deg)`;
      }
      raf = requestAnimationFrame(frame);
    };
    frame();
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen min-h-[100dvh] w-full flex-col overflow-hidden px-6 pt-32 sm:px-16 sm:pt-40"
    >
      {/* Expanding reel — a fixed overlay (escapes the section's overflow since
          no transformed ancestor). Geometry + opacity are driven by the scroll
          rAF above. Black placeholder for now; drop a <video> in later. */}
      <div
        ref={reelRef}
        aria-hidden="true"
        className="pointer-events-none fixed z-20 overflow-hidden bg-black"
        style={{
          left: 0,
          top: 0,
          width: 0,
          height: 0,
          opacity: 0,
          willChange: "transform",
          transition: "opacity .5s ease",
        }}
      />

      {/* Statement — centered in the flex-1 band between the nav and the reel. */}
      <div className="flex flex-1 flex-col justify-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={ready ? { opacity: 1, y: 0 } : false}
        transition={{ duration: 0.7, delay: 0.35, ease }}
        className="-mx-6 sm:-mx-16"
      >
        <h1
          ref={stmtRef}
          className="text-center text-ink"
          style={{
            fontFamily: "'Clash Display', system-ui, sans-serif",
            fontWeight: 600,
            textTransform: "uppercase",
            fontSize: "clamp(32px, 9.8vw, 200px)",
            lineHeight: 0.92,
            letterSpacing: "-0.02em",
            whiteSpace: "nowrap",
            willChange: "transform",
            paddingInline: "clamp(8px, 1.4vw, 24px)",
          }}
        >
          Hi, my name is{" "}
          <em style={{ fontStyle: "normal", color: "var(--accent)" }}>Adnaan</em>
        </h1>
      </motion.div>
      </div>

      {/* Reel slot — invisible box reserving the reel's place in the layout so
          the headline/HUD frame it. The visible reel overlays it at scroll 0. */}
      <div className="flex items-center justify-center">
        <div
          ref={slotRef}
          aria-hidden="true"
          style={{
            width: "clamp(400px, 42vw, 820px)",
            aspectRatio: "16 / 10",
            visibility: "hidden",
          }}
        />
      </div>

      {/* Balances the headline band above so the reel slot stays centered. */}
      <div className="flex-1" />

      {/* Bottom HUD — coordinates (left) + SCROLL DOWN (center) + elevation
          (right). Scrolls away with the section; opacity owned by the rAF
          (gated on `ready`) so it fades out as it scrolls up. */}
      <div
        ref={hudRef}
        className="pointer-events-none grid grid-cols-3 items-end pb-8"
        style={{ opacity: 0 }}
      >
        <div className="font-mono text-[14px] font-medium uppercase leading-[1.5] tracking-[0.16em] text-muted sm:text-[16px]">
          <div ref={latRef}>40.7128° N</div>
          <div ref={lonRef}>74.0060° W</div>
        </div>

        <span
          className="justify-self-center self-end uppercase text-muted"
          style={{
            fontFamily: "Manrope, system-ui, sans-serif",
            fontWeight: 700,
            fontSize: "17px",
            letterSpacing: "0.24em",
            whiteSpace: "nowrap",
          }}
        >
          Scroll Down
        </span>

        <div className="justify-self-end text-right font-mono text-[14px] font-medium uppercase leading-[1.5] tracking-[0.16em] text-muted sm:text-[16px]">
          <div>Elev</div>
          <div ref={elevRef}>0000 M</div>
        </div>
      </div>
    </section>
  );
}
