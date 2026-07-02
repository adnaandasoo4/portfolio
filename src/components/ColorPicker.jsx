import { useRef, useState } from "react";
import { LuShuffle } from "react-icons/lu";
import { usePalette } from "../utils/palette";
import { BACKDROP_COLORS, DARK_PALETTES } from "./canvas/topoShader";
import { startPaletteTransition } from "../utils/paletteTransition";

// Palette order is also the cycle order — clicking the dial advances to the
// next entry and wraps. Must stay in sync with topoShader DARK_PALETTES + the
// :root[data-palette=…] blocks in index.css.
const PALETTES = [
  { id: "green", name: "Forest", dark: "#292E21", accent: "#DCFE4F" },
  { id: "sage", name: "Sage", dark: "#1A2517", accent: "#ACC8A2" },
  { id: "oxblood", name: "Oxblood", dark: "#200B10", accent: "#8A8E94" },
  { id: "blue", name: "Midnight", dark: "#0F1B30", accent: "#8FC2F2" },
  { id: "graphite", name: "Graphite", dark: "#24262B", accent: "#B7A6F0" },
  { id: "onyx", name: "Onyx", dark: "#0C0D10", accent: "#E9B44C" },
];

/**
 * Color-mode dial in the bottom-left of the full-page nav overlay. A single
 * plain circle (sized to match the scroll-to-top button) holding a shuffle
 * glyph; each click cycles to the NEXT palette and fires the radial splash
 * from the dial's center. While hovering, the dial fills with the next
 * palette's accent (a preview of where a click lands) and a lagging
 * "See things differently" text label trails the pointer in that same color.
 */
export default function ColorPicker() {
  const ctx = usePalette();
  const palette = ctx?.palette ?? "green";
  const setPalette = ctx?.setPalette ?? (() => {});

  const currentIndex = Math.max(
    0,
    PALETTES.findIndex((p) => p.id === palette)
  );
  const nextPalette = PALETTES[(currentIndex + 1) % PALETTES.length];

  const [hovering, setHovering] = useState(false);
  const cursorRef = useRef(null);

  // Cycle forward: kick off the radial splash from the dial center (OverlayTopo
  // reads this each frame), THEN apply the next palette. `from` is cloned before
  // setPalette runs so the eventual setDarkPalette mutation of BACKDROP_COLORS
  // can't change it under us. Splash skipped under reduced motion.
  const handleClick = (e) => {
    const next = PALETTES[(currentIndex + 1) % PALETTES.length];
    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) {
      const r = e.currentTarget.getBoundingClientRect();
      const cx = (r.left + r.width / 2) / window.innerWidth;
      const cy = 1 - (r.top + r.height / 2) / window.innerHeight;
      const from = BACKDROP_COLORS.dark;
      const to = DARK_PALETTES[next.id] || DARK_PALETTES.green;
      startPaletteTransition({
        fromBg: [...from.bg],
        fromLine: [...from.line],
        toBg: [...to.bg],
        toLine: [...to.line],
        center: [cx, cy],
        now: performance.now(),
      });
    }
    setPalette(next.id);
  };

  // Anchor the trailing label at the cursor tip; an inner offset floats it up
  // and to the right. The wrapper's slow transition gives it the lagging trail.
  const onMove = (e) => {
    const el = cursorRef.current;
    if (el) {
      el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    }
  };

  return (
    <div
      className="absolute bottom-6 left-6 z-[2]"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onMouseMove={onMove}
    >
      <button
        type="button"
        onClick={handleClick}
        aria-label={`Change color theme — next: ${nextPalette.name}`}
        style={{
          width: 64,
          height: 64,
          borderRadius: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          cursor: "pointer",
          background: hovering ? nextPalette.accent : "transparent",
          border: `1px solid ${
            hovering ? nextPalette.accent : "rgba(241,239,232,0.35)"
          }`,
          color: hovering ? "#000000" : "var(--dark-ink)",
          transform: hovering ? "scale(1.05)" : "scale(1)",
          transition:
            "background-color .25s ease, border-color .25s ease, color .25s ease, transform .2s ease",
        }}
      >
        <LuShuffle size={24} strokeWidth={2} aria-hidden="true" />
      </button>

      {/* Lagging trail label — follows the pointer; offset up/right of the tip.
          pointer-events:none so clicks fall through to whatever's beneath. */}
      <div
        ref={cursorRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0"
        style={{
          willChange: "transform",
          transition: "transform 1.15s cubic-bezier(.22,1,.36,1)",
        }}
      >
        <div
          style={{
            transform: `translate(30px, -220%) translateX(${hovering ? 0 : -8}px)`,
            opacity: hovering ? 1 : 0,
            transition:
              "transform .32s cubic-bezier(.34,1.56,.64,1), opacity .2s ease, color .2s ease",
            color: nextPalette.accent,
            fontFamily: "'Manrope', system-ui, sans-serif",
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          See things differently
        </div>
      </div>
    </div>
  );
}
