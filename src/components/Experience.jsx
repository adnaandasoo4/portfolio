import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { HIDE_SECTION_LABELS, experience, experiences } from "../constants";
import { SectionWrapper } from "../hoc";
import { revealVariant as reveal } from "../utils/motion";
import { useSectionBackdrop } from "../utils/backdrop";
import ExperienceRow from "./ExperienceRow";

function Experience() {
  // Single source of truth for which row is open. Clicking an already-
  // open row closes it; clicking a different row opens it and auto-
  // closes the previous one (accordion).
  const [openIdx, setOpenIdx] = useState(null);
  // Hover-to-expand is a desktop-only nicety — on touch, `mouseenter`
  // gets synthesized from a tap which causes a "tap opens via hover,
  // then click toggles closed" race. Gating to `(hover: hover)` keeps
  // mobile strictly click-driven.
  const [canHover, setCanHover] = useState(false);
  useEffect(() => {
    setCanHover(window.matchMedia?.("(hover: hover)").matches ?? false);
  }, []);

  // First 'dark' section after the light hero → video → about run; the
  // white→theme-color background fade begins as Experience scrolls in.
  const ref = useRef(null);
  useSectionBackdrop(ref, "dark");

  return (
    <div ref={ref} data-cursor="check me out" className="flex flex-col gap-10 py-6 sm:py-24">
      {!HIDE_SECTION_LABELS && (
        <motion.span
          variants={reveal}
          custom={0}
          className="font-sans text-xs uppercase tracking-widest text-muted"
        >
          {experience.label}
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
        {experience.heading}
      </motion.h2>

      <motion.ul
        variants={reveal}
        custom={0.1}
        className="flex flex-col"
      >
        {/* Newest first — reverse a copy so the source array (oldest→newest)
            stays intact and the row indices still match display order. */}
        {[...experiences].reverse().map((entry, i) => (
          <ExperienceRow
            key={`${entry.title}-${entry.company_name}-${entry.date}`}
            entry={entry}
            index={i}
            isOpen={openIdx === i}
            onToggle={() => setOpenIdx(openIdx === i ? null : i)}
            onHoverEnter={canHover ? () => setOpenIdx(i) : null}
            onHoverLeave={
              canHover
                ? () => setOpenIdx((curr) => (curr === i ? null : curr))
                : null
            }
          />
        ))}
      </motion.ul>

      <motion.div
        variants={reveal}
        custom={0.15 + experiences.length * 0.06 + 0.15}
        className="flex justify-end pt-10"
      >
        <a
          href="/resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open resume PDF in a new tab"
          className="group inline-block focus:outline-none"
        >
          {/*
            Staggered per-letter vertical swap. Each character is its own
            mini overflow-hidden container with two stacked copies — the
            outgoing slides up, the incoming slides in from below. The
            transitionDelay scales with the character's index, so left
            letters start first and the swap propagates left→right as a
            diagonal wave even though each letter only moves vertically.
            Going both directions (in and out) shares the same delay,
            so the wave plays the same on hover and unhover.
          */}
          <span
            aria-hidden="true"
            className="block whitespace-nowrap text-xl sm:text-2xl leading-[1.25] text-ink"
          >
            {Array.from("Read the resume ↗").map((char, i) => (
              <span
                key={i}
                className="relative inline-block h-[1.25em] overflow-hidden align-bottom"
              >
                <span
                  className="block transition-transform duration-[360ms] group-hover:-translate-y-full group-focus-visible:-translate-y-full"
                  style={{
                    transitionDelay: `${i * 7}ms`,
                    transitionTimingFunction: "cubic-bezier(0.65, 0, 0.35, 1)",
                  }}
                >
                  {char === " " ? " " : char}
                </span>
                <span
                  className="absolute inset-0 translate-y-full transition-transform duration-[360ms] group-hover:translate-y-0 group-focus-visible:translate-y-0"
                  style={{
                    transitionDelay: `${i * 7}ms`,
                    transitionTimingFunction: "cubic-bezier(0.65, 0, 0.35, 1)",
                  }}
                >
                  {char === " " ? " " : char}
                </span>
              </span>
            ))}
          </span>
          <span
            className="block h-px origin-left scale-x-0 bg-ink transition-transform duration-[400ms] group-hover:scale-x-100 group-focus-visible:scale-x-100"
            style={{ transitionTimingFunction: "cubic-bezier(0.65, 0, 0.35, 1)" }}
          />
        </a>
      </motion.div>
    </div>
  );
}

const ExperienceSection = SectionWrapper(Experience, "experience", {
  dataCursor: "check me out",
});
export default ExperienceSection;
