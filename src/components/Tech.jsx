import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { HIDE_SECTION_LABELS, tech, technologies } from "../constants";
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

  // Compute the highlight rect inside the hover handler and batch both
  // state updates in the same event tick. React 18 collapses paired
  // setState calls into a single render, so the morphing highlight
  // animates directly to the new bounds without a one-frame gap that a
  // setState-in-useEffect approach would introduce.
  const handleEnter = (idx) => {
    const cell = cellRefs.current[idx];
    const container = containerRef.current;
    if (cell && container) {
      const cRect = container.getBoundingClientRect();
      const tRect = cell.getBoundingClientRect();
      setBounds({
        x: tRect.left - cRect.left,
        y: tRect.top - cRect.top,
        width: tRect.width,
        height: tRect.height,
      });
    }
    setHoveredIdx(idx);
  };

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
      <a
        key={entry.name}
        ref={(el) => (cellRefs.current[idx] = el)}
        href={entry.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${entry.name} (opens in new tab)`}
        data-cursor="tech break?"
        onMouseEnter={() => handleEnter(idx)}
        className={`relative flex items-center justify-center border-edge focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink ${
          isPrimary ? "col-span-7 row-start-1 border-b" : "col-span-3 row-start-2"
        } ${isLastInRow ? "" : "border-r"}`}
      >
        <entry.Icon
          className={`relative z-10 max-w-full transition-colors duration-200 ${
            entry.wordmark
              ? // Wordmarks (Next.js / GSAP) are wide — fix the height and let
                // width follow the SVG's viewBox aspect ratio. Heights are a
                // notch below the square brand-mark heights so the wide
                // letterforms don't overpower the rest of the grid.
                // max-w-full above ensures wide wordmarks shrink rather than
                // overflow narrow supporting cells at 360px viewport.
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
      </a>
    );
  };

  return (
    <div className="flex flex-col gap-10 py-6 sm:py-24">
      {!HIDE_SECTION_LABELS && (
        <motion.span
          variants={reveal}
          custom={0}
          className="font-mono text-xs uppercase tracking-widest text-muted"
        >
          {tech.label}
        </motion.span>
      )}

      <motion.h2
        variants={reveal}
        custom={0.05}
        className="font-display uppercase text-ink"
        style={{
          fontWeight: 700,
          fontSize: "clamp(40px, 6vw, 96px)",
          lineHeight: 1,
          letterSpacing: "-0.01em",
        }}
      >
        {tech.heading}
      </motion.h2>

      {/* Mobile: 2-column grid of 4:3 cells. Drops the bento layout's
          primary/supporting distinction and the morphing-highlight
          interaction (they don't translate to a touch interface) while
          keeping the brand logos at a generous size in wider rectangles
          to halve the section's vertical footprint. */}
      <motion.div
        variants={reveal}
        custom={0.1}
        className="grid grid-cols-2 gap-3 sm:hidden"
      >
        {technologies.map((entry) => (
          <a
            key={entry.name}
            href={entry.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${entry.name} (opens in new tab)`}
            data-cursor="tech break?"
            className="flex aspect-[4/3] items-center justify-center border border-edge text-ink"
          >
            <entry.Icon
              className={`max-w-full text-ink ${
                entry.wordmark ? "h-6 w-auto" : "h-10 w-10"
              }`}
              aria-hidden="true"
            />
            <span className="sr-only">{entry.name}</span>
          </a>
        ))}
      </motion.div>

      {/* Desktop: existing bento grid with morphing highlight on hover. */}
      <motion.div variants={reveal} custom={0.1} className="hidden sm:block">
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

const TechSection = SectionWrapper(Tech, "tech");
export default TechSection;
