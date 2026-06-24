import { useRef, useState } from "react";
import { usePalette } from "../utils/palette";
import { BACKDROP_COLORS, DARK_PALETTES } from "./canvas/topoShader";
import { startPaletteTransition } from "../utils/paletteTransition";

// Swatch colors per palette. `dark` is the backdrop; `accent` fills the active
// square. Must stay in sync with topoShader DARK_PALETTES + the
// :root[data-palette=…] blocks in index.css.
const PALETTES = [
  { id: "green", name: "Forest", dark: "#292E21", accent: "#DCFE4F" },
  { id: "oxblood", name: "Oxblood", dark: "#200B10", accent: "#8A8E94" },
  { id: "blue", name: "Midnight", dark: "#0F1B30", accent: "#8FC2F2" },
  { id: "graphite", name: "Graphite", dark: "#24262B", accent: "#E0A94A" },
];

/**
 * Color-mode picker in the bottom-left of the full-page nav overlay. A 2×2 grid
 * of squares (active one filled). The native cursor stays; while hovering the
 * picker a long pill "cursor" expands and trails the pointer reading "See things
 * differently", tinted with the current theme's accent.
 */
export default function ColorPicker() {
  const ctx = usePalette();
  const palette = ctx?.palette ?? "green";
  const setPalette = ctx?.setPalette ?? (() => {});

  // Picking a swatch: kick off the radial splash from the clicked swatch (the
  // overlay's OverlayTopo reads this each frame), THEN apply the palette. `from`
  // is cloned before setPalette runs so the eventual setDarkPalette mutation of
  // BACKDROP_COLORS.dark can't change it under us. Skipped under reduced motion.
  const handlePick = (p, e) => {
    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) {
      const r = e.currentTarget.getBoundingClientRect();
      const cx = (r.left + r.width / 2) / window.innerWidth;
      const cy = 1 - (r.top + r.height / 2) / window.innerHeight;
      const from = BACKDROP_COLORS.dark;
      const to = DARK_PALETTES[p.id] || DARK_PALETTES.green;
      startPaletteTransition({
        fromBg: [...from.bg],
        fromLine: [...from.line],
        toBg: [...to.bg],
        toLine: [...to.line],
        center: [cx, cy],
        now: performance.now(),
      });
    }
    setPalette(p.id);
  };

  const [hovering, setHovering] = useState(false);
  // Accent of the swatch currently under the pointer — tints the trailing pill
  // so it previews the palette you're about to pick. null → fall back to the
  // active theme's accent (--lime).
  const [hoverAccent, setHoverAccent] = useState(null);
  const cursorRef = useRef(null);

  // Anchor the wrapper at the cursor tip; the inner box offsets right + centers
  // vertically, so its left edge sits just to the right of the default cursor.
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
      onMouseLeave={() => {
        setHovering(false);
        setHoverAccent(null);
      }}
      onMouseMove={onMove}
    >
      <div className="grid grid-cols-2 gap-1.5">
        {PALETTES.map((p) => {
          const active = palette === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={(e) => handlePick(p, e)}
              onMouseEnter={() => setHoverAccent(p.accent)}
              onMouseLeave={() => setHoverAccent(null)}
              aria-label={`Switch to ${p.name} theme`}
              aria-pressed={active}
              style={{
                width: 15,
                height: 15,
                borderRadius: 4,
                background: active ? p.accent : "transparent",
                border: active
                  ? `1px solid ${p.accent}`
                  : "1px solid rgba(235,235,225,0.45)",
                padding: 0,
                cursor: "pointer",
              }}
            />
          );
        })}
      </div>

      {/* Custom trailing pill — follows the pointer and expands while hovering.
          pointer-events:none so clicks fall through; offset right of the cursor. */}
      <div
        ref={cursorRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0"
        style={{ willChange: "transform", transition: "transform .12s ease-out" }}
      >
        <div
          style={{
            transform: `translate(16px, -50%) scale(${hovering ? 1 : 0.3})`,
            transformOrigin: "left center",
            opacity: hovering ? 1 : 0,
            transition:
              "transform .32s cubic-bezier(.34,1.56,.64,1), opacity .2s ease, background-color .2s ease",
            background: hoverAccent ?? "var(--lime)",
            color: "var(--dark-bg)",
            borderRadius: 6,
            padding: "10px 20px",
            fontFamily: "'Manrope', system-ui, sans-serif",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.12em",
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
