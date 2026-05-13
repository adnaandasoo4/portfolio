import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { tech, technologies } from "../constants";
import { SectionWrapper } from "../hoc";
import { revealVariant as reveal } from "../utils/motion";

// Zubiate / itsjay.us-style bento grid. Two rows:
//   row 1 — 3 primary tools in large cells (each spanning 7/21 cols)
//   row 2 — 7 supporting tools in small cells (each spanning 3/21 cols)
//
// A single absolutely-positioned <motion.div> sits in the grid container and
// animates its x/y/width/height to whichever cell is being hovered. Framer
// Motion's spring interpolation between bounds gives the "morph" feel — the
// dark fill physically slides + reshapes between tiles instead of dis/appearing
// per cell. Each cell cross-fades from icon (default) to wordmark (hovered),
// so the highlight reveals "context" — the tool's name — as it lands.
function Tech() {
  const containerRef = useRef(null);
  const cellRefs = useRef([]);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [bounds, setBounds] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // Recompute the highlight rect whenever the hovered cell changes. We measure
  // off the live DOM rather than tracking grid math so cells can be any size /
  // span without keeping a separate layout model in sync.
  useEffect(() => {
    if (hoveredIdx === null) return;
    const cell = cellRefs.current[hoveredIdx];
    const container = containerRef.current;
    if (!cell || !container) return;
    const cRect = container.getBoundingClientRect();
    const tRect = cell.getBoundingClientRect();
    setBounds({
      x: tRect.left - cRect.left,
      y: tRect.top - cRect.top,
      width: tRect.width,
      height: tRect.height,
    });
  }, [hoveredIdx]);

  const primary = technologies.filter((t) => t.primary);
  const supporting = technologies.filter((t) => !t.primary);

  const renderCell = (entry, idx, isPrimary, isLastInRow) => {
    const isHovered = hoveredIdx === idx;
    // Internal hairlines only — no outer frame around the grid.
    //   - Top row cells get `border-b` (horizontal divider between rows)
    //   - Bottom row cells get no border-b (would be the outer bottom edge)
    //   - All cells except the last in their row get `border-r` (vertical
    //     dividers); the last cell in each row drops it so the right edge
    //     stays unbordered.
    // Icon color flips ink → paper on hover so it reads on top of the
    // dark morphing highlight that slides in.
    return (
      <div
        key={entry.name}
        ref={(el) => (cellRefs.current[idx] = el)}
        onMouseEnter={() => setHoveredIdx(idx)}
        className={`relative flex items-center justify-center border-edge ${
          isPrimary ? "col-span-7 row-start-1 border-b" : "col-span-3 row-start-2"
        } ${isLastInRow ? "" : "border-r"}`}
      >
        <entry.Icon
          className={`relative z-10 transition-colors duration-200 ${
            entry.wordmark
              ? // Wordmarks (Next.js / GSAP) are wide — fix the height and let
                // width follow the SVG's viewBox aspect ratio. Heights are a
                // notch below the square brand-mark heights so the wide
                // letterforms don't overpower the rest of the grid.
                isPrimary
                  ? "h-7 w-auto sm:h-9"
                  : "h-5 w-auto sm:h-7"
              : // Square brand marks — fixed height + matching width.
                isPrimary
                  ? "h-12 w-12 sm:h-14 sm:w-14"
                  : "h-7 w-7 sm:h-9 sm:w-9"
          }`}
          style={{ color: isHovered ? "var(--bg)" : "var(--ink)" }}
          aria-hidden="true"
        />
        <span className="sr-only">{entry.name}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-10 py-24">
      <motion.span
        variants={reveal}
        custom={0}
        className="font-mono text-[10px] uppercase tracking-widest text-muted"
      >
        {tech.label}
      </motion.span>

      <motion.div variants={reveal} custom={0.1}>
        <div
          ref={containerRef}
          className="relative grid grid-cols-[repeat(21,minmax(0,1fr))] overflow-hidden"
          style={{ gridAutoRows: "clamp(120px, 15vw, 220px)" }}
          onMouseLeave={() => setHoveredIdx(null)}
        >
          {/*
            Morphing highlight. Painted FIRST in source order so transparent
            cells render on top of it — cell borders + icon/wordmark stay
            visible while the dark fill animates underneath. Spring-based
            transition on x/y/width/height produces the morph between cells.
          */}
          <motion.div
            className="pointer-events-none absolute bg-ink"
            initial={false}
            animate={{
              x: bounds.x,
              y: bounds.y,
              width: bounds.width,
              height: bounds.height,
              opacity: hoveredIdx !== null ? 1 : 0,
            }}
            transition={{
              type: "spring",
              stiffness: 320,
              damping: 30,
              opacity: { duration: 0.15 },
            }}
          />

          {primary.map((t, i) =>
            renderCell(t, i, true, i === primary.length - 1)
          )}
          {supporting.map((t, i) =>
            renderCell(t, primary.length + i, false, i === supporting.length - 1)
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default SectionWrapper(Tech, "tech");
