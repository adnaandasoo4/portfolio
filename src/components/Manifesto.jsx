import { useEffect, useRef, useState } from "react";
import { HIDE_SECTION_LABELS, manifesto } from "../constants";
import { SectionWrapper } from "../hoc";
import { useSectionBackdrop } from "../utils/backdrop";

const lerp = (a, b, t) => a + (b - a) * t;

// Resting (un-lit) text tint and the radius of the cursor "shine". The shine
// reveals full --ink at the cursor, fading back to DIM outward — a glimmer that
// follows the pointer across the words.
const DIM = "color-mix(in srgb, var(--ink) 30%, transparent)";
// Peak brightness at the cursor. Below full --ink so the lit/unlit contrast is
// gentle rather than a hard pop.
const SHINE = "color-mix(in srgb, var(--ink) 72%, transparent)";
const SHINE_RADIUS = 350;

function Manifesto() {
  const ref = useRef(null);
  const pRef = useRef(null);
  // Light/paper through hero → about; the white→dark fade begins at the
  // About → Experience handoff (Experience is the first 'dark' section).
  useSectionBackdrop(ref, "light");

  // Whole intro as one string — the shine is a continuous gradient over the
  // paragraph, so the old per-word tokenization is no longer needed.
  const text = manifesto.intro.map((s) => s.text).join("");

  const [reduce] = useState(
    () =>
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  // Cursor-tracked shine: update CSS vars (--mx/--my) on the paragraph, smoothed
  // toward the pointer so the highlight glides rather than snaps. The gradient
  // (background-clip:text) brightens the glyphs nearest the cursor.
  useEffect(() => {
    const host = ref.current;
    const p = pRef.current;
    if (reduce || !host || !p) return; // reduced motion: static, fully-lit text

    // Park the highlight off-screen so the text rests fully DIM until hovered.
    let tx = -SHINE_RADIUS, ty = -SHINE_RADIUS, cx = tx, cy = ty;
    const onMove = (e) => {
      const r = p.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
    };
    const onLeave = () => {
      tx = -SHINE_RADIUS;
      ty = -SHINE_RADIUS;
    };
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);

    let raf = 0;
    const frame = () => {
      cx = lerp(cx, tx, 0.06);
      cy = lerp(cy, ty, 0.06);
      p.style.setProperty("--mx", `${cx}px`);
      p.style.setProperty("--my", `${cy}px`);
      raf = requestAnimationFrame(frame);
    };
    frame();
    return () => {
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [reduce]);

  const shineStyle = reduce
    ? { color: "var(--ink)" }
    : {
        color: "transparent",
        WebkitTextFillColor: "transparent",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        backgroundImage: `radial-gradient(circle ${SHINE_RADIUS}px at var(--mx, ${-SHINE_RADIUS}px) var(--my, ${-SHINE_RADIUS}px), ${SHINE} 0%, ${DIM} 45%)`,
      };

  return (
    <div ref={ref} className="flex flex-col gap-8 p-4 px-6 py-10 pb-24 sm:p-8 sm:px-12 sm:py-16 sm:pb-40">
      {!HIDE_SECTION_LABELS && (
        <span className="font-sans text-xs uppercase tracking-widest text-muted">
          {manifesto.label}
        </span>
      )}
      <p
        ref={pRef}
        style={{
          fontWeight: 700,
          fontSize: "clamp(33px, 5.2vw, 79px)",
          lineHeight: 1.18,
          letterSpacing: "-0.015em",
          maxWidth: "none",
          // First line indented far right (Huy-style) — the rest wrap left,
          // giving an organic ragged block instead of a flush paragraph.
          textIndent: "40%",
          ...shineStyle,
        }}
      >
        {text}
      </p>
    </div>
  );
}

const ManifestoSection = SectionWrapper(Manifesto, "about", {
  scrollTriggered: true,
  fullBleed: true,
});
export default ManifestoSection;
