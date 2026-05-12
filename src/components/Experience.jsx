import { useState } from "react";
import { motion } from "framer-motion";
import { experience, experiences } from "../constants";
import { SectionWrapper } from "../hoc";
import { revealVariant as reveal } from "../utils/motion";

/**
 * Single experience row. Default state is collapsed (just role + company + date).
 * Hover, keyboard focus, or click toggles the expanded state. Click is included
 * so touch users (no hover events) can read descriptions. The CSS grid
 * `grid-template-rows: 0fr → 1fr` transition smoothly animates the row height
 * without any JS height measurement.
 */
function ExperienceRow({ entry, index }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.li
      variants={reveal}
      custom={0.15 + index * 0.06}
      className="border-t border-edge last:border-b"
    >
      <h3 className="text-ink text-xl sm:text-2xl leading-tight">
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setIsOpen(false)}
          aria-expanded={isOpen}
          aria-controls={`exp-desc-${index}`}
          className="w-full text-left py-6 outline-none transition-opacity focus-visible:opacity-90"
        >
          <span className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <span>
              <span className="font-medium">{entry.title}</span>
              <span className="ml-2 text-muted font-normal">{entry.company_name}</span>
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted whitespace-nowrap">
              {entry.date}
            </span>
          </span>
          <span
            className={`grid transition-[grid-template-rows,opacity,margin-top] duration-300 ${
              isOpen ? "mt-3 grid-rows-[1fr] opacity-100" : "mt-0 grid-rows-[0fr] opacity-0"
            }`}
            style={{ transitionTimingFunction: "cubic-bezier(0.65, 0, 0.35, 1)" }}
          >
            <span
              id={`exp-desc-${index}`}
              aria-hidden={!isOpen}
              className="block overflow-hidden"
            >
              <span className="block max-w-2xl text-sm sm:text-base leading-relaxed text-ink font-normal">
                {entry.description}
              </span>
            </span>
          </span>
        </button>
      </h3>
    </motion.li>
  );
}

function Experience() {
  return (
    <div className="flex flex-col gap-10 py-24">
      <motion.span
        variants={reveal}
        custom={0}
        className="font-mono text-[10px] uppercase tracking-widest text-muted"
      >
        {experience.label}
      </motion.span>

      <motion.ul
        variants={reveal}
        custom={0.1}
        className="flex flex-col"
      >
        {experiences.map((entry, i) => (
          <ExperienceRow
            key={`${entry.title}-${entry.company_name}-${entry.date}`}
            entry={entry}
            index={i}
          />
        ))}
      </motion.ul>
    </div>
  );
}

export default SectionWrapper(Experience, "work");
