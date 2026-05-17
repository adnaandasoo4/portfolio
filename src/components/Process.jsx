import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { HIDE_SECTION_LABELS, designProcess } from "../constants";
import { SectionWrapper } from "../hoc";
import { easeStandard as ease, revealVariant as reveal } from "../utils/motion";

/**
 * Process section.
 *
 * A direct riff on the ethansuero.com client-list set piece, repurposed
 * for a design-process narrative. The right column stacks five large
 * display rows (one per stage) rendered in `--display-subtle` — the same
 * ghost color the Hero's WebGL wordmark uses — so the rows read as
 * pitch-black silhouettes against the page bg. Hovering a row shifts it
 * to `--ink` and pushes the stage's description + framed identity card
 * into a sticky slot in the left column.
 *
 * When no stage is hovered the left slot is completely blank (no
 * placeholder card, no border) — the section reveals its content only as
 * the visitor explores it.
 *
 * Mobile (<md): hover is meaningless, so the layout collapses to a
 * stacked single-column flow where each stage prints its name, its
 * description, and its framed card inline, separated by hairline
 * dividers.
 */
function Process() {
  // Two-state hover orchestration so the left slot always animates in a
  // strict sequence — old card exits, slot goes empty, new card enters —
  // instead of the new card mounting in the flex flow beneath a still-
  // exiting old card and snapping up when the exit completes.
  //
  // `hoveredIndex` tracks the user's pointer in real time (drives the row
  // color flash). `displayedIndex` is what's actually mounted in the slot;
  // we only advance it from null → newIndex once the previous exit has
  // fully completed. `isExitingRef` gates that transition so a fast hover
  // can't queue a new mount mid-exit.
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [displayedIndex, setDisplayedIndex] = useState(null);

  // Refs mirror the latest state for handlers that fire outside React's
  // commit phase (AnimatePresence onExitComplete) without making those
  // values into effect deps.
  const hoveredIndexRef = useRef(null);
  const displayedIndexRef = useRef(null);
  const isExitingRef = useRef(false);
  hoveredIndexRef.current = hoveredIndex;
  displayedIndexRef.current = displayedIndex;

  useEffect(() => {
    if (hoveredIndex === displayedIndexRef.current) return;
    if (isExitingRef.current) return; // chain continues in onExitComplete
    if (displayedIndexRef.current === null) {
      // Slot empty — mount the hovered stage immediately.
      setDisplayedIndex(hoveredIndex);
      return;
    }
    // Slot has content — eject it first; onExitComplete drives the next
    // mount once the exit animation finishes.
    isExitingRef.current = true;
    setDisplayedIndex(null);
  }, [hoveredIndex]);

  const handleExitComplete = () => {
    isExitingRef.current = false;
    const target = hoveredIndexRef.current;
    if (target === null || target === displayedIndexRef.current) return;
    if (displayedIndexRef.current === null) {
      setDisplayedIndex(target);
      return;
    }
    // Slot was re-filled while we were exiting — keep chaining.
    isExitingRef.current = true;
    setDisplayedIndex(null);
  };

  const activeStage =
    displayedIndex !== null ? designProcess.stages[displayedIndex] : null;

  return (
    <div className="flex flex-col gap-12 py-24">
      {!HIDE_SECTION_LABELS && (
        <motion.span
          variants={reveal}
          custom={0}
          className="font-mono text-xs uppercase tracking-widest text-muted"
        >
          {designProcess.label}
        </motion.span>
      )}

      {/* Desktop layout — three-track grid. Middle track is auto-sized to
          the widest word and centered between two equal-flex spacers, so
          the row block always sits in the visual center of the inner rail
          (== viewport center on screens up to max-w-screen-2xl). The
          description+card lives in the left spacer; the right spacer
          stays empty for balance. */}
      <div className="hidden md:grid md:grid-cols-[1fr_auto_1fr] md:gap-12">
        {/* LEFT — sticky content slot. AnimatePresence's onExitComplete
            drives the state-machine chain that mounts the next card only
            after the previous one has fully exited, so two cards never
            coexist in the slot's flex flow. Card is right-aligned inside
            the spacer column so it hugs the words rather than floating
            on the far edge of the viewport. */}
        <div className="md:sticky md:top-32 md:w-96 md:max-w-full md:self-start md:justify-self-end">
          <div className="min-h-[480px]">
            <AnimatePresence onExitComplete={handleExitComplete}>
              {activeStage && (
                <motion.div
                  key={activeStage.number}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18, ease }}
                  className="flex flex-col gap-8"
                >
                  <p
                    className="text-ink/85"
                    style={{
                      fontSize: "15px",
                      lineHeight: 1.55,
                      maxWidth: "42ch",
                    }}
                  >
                    {activeStage.description}
                  </p>

                  {/* Framed identity card. Mirrors the Suero reference's
                      bordered logo card; here it holds the big stage
                      number, the stage name, and the tool stack. */}
                  <div className="flex aspect-[4/3] w-full max-w-sm flex-col border border-edge p-6">
                    <div className="flex flex-1 items-center justify-center">
                      <span
                        className="font-display text-ink"
                        style={{
                          fontWeight: 700,
                          fontSize: "clamp(80px, 8vw, 132px)",
                          lineHeight: 1,
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {activeStage.number}
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <span className="font-mono text-xs uppercase tracking-widest text-ink">
                        {activeStage.name}
                      </span>
                      <span className="text-center font-mono text-[10px] uppercase tracking-widest text-muted">
                        {activeStage.tools.join(" · ")}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* MIDDLE — stage rows. Display-weight Clash Display, ghost color
            by default, ink-color on hover. Sized to its content (widest
            stage name); the surrounding grid template centers this block
            in the inner rail. Pointer leaving the whole rail clears the
            active stage so the left slot returns to blank. */}
        <motion.ul
          variants={reveal}
          custom={0.1}
          className="flex flex-col"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {designProcess.stages.map((stage, i) => {
            const active = hoveredIndex === i;
            return (
              <li key={stage.number}>
                <button
                  type="button"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onFocus={() => setHoveredIndex(i)}
                  onBlur={() => setHoveredIndex(null)}
                  aria-label={`${stage.name} — stage ${stage.number}`}
                  className="block w-full text-left font-display uppercase transition-colors duration-200"
                  style={{
                    color: active ? "var(--ink)" : "var(--display-subtle)",
                    fontWeight: 700,
                    fontSize: "clamp(56px, 7vw, 128px)",
                    lineHeight: 0.82,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {stage.name}
                </button>
              </li>
            );
          })}
        </motion.ul>

        {/* RIGHT spacer — empty 1fr column that mirrors the left spacer so
            the middle track stays optically centered in the inner rail. */}
        <div />
      </div>

      {/* Mobile layout — stacked. Hover is meaningless here, so every stage
          prints its name, description, and framed card inline with a
          hairline divider between adjacent stages. */}
      <ul className="flex flex-col gap-12 md:hidden">
        {designProcess.stages.map((stage, i) => (
          <motion.li
            key={stage.number}
            variants={reveal}
            custom={0.05 * i}
            className="flex flex-col gap-5"
          >
            <h3
              className="font-display uppercase text-ink"
              style={{
                fontWeight: 700,
                fontSize: "clamp(44px, 13vw, 88px)",
                lineHeight: 1,
                letterSpacing: "-0.02em",
              }}
            >
              {stage.name}
            </h3>
            <p
              className="text-ink/85"
              style={{
                fontSize: "15px",
                lineHeight: 1.55,
                maxWidth: "52ch",
              }}
            >
              {stage.description}
            </p>
            <div className="flex aspect-[4/3] w-full max-w-xs flex-col border border-edge p-5">
              <div className="flex flex-1 items-center justify-center">
                <span
                  className="font-display text-ink"
                  style={{
                    fontWeight: 700,
                    fontSize: "clamp(64px, 18vw, 112px)",
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {stage.number}
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="font-mono text-xs uppercase tracking-widest text-ink">
                  {stage.name}
                </span>
                <span className="text-center font-mono text-[10px] uppercase tracking-widest text-muted">
                  {stage.tools.join(" · ")}
                </span>
              </div>
            </div>
            {i < designProcess.stages.length - 1 && (
              <div className="mt-2 border-t border-edge" />
            )}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

const ProcessSection = SectionWrapper(Process, "process");
export default ProcessSection;
