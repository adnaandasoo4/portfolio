import { useState } from "react";
import { motion } from "framer-motion";
import { experience, experiences } from "../constants";
import { SectionWrapper } from "../hoc";

const ease = [0.65, 0, 0.35, 1];
const reveal = {
  hidden: { opacity: 0, y: 12 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease, delay },
  }),
};

/**
 * Single experience row. Default state is collapsed (just role + company + date).
 * Hover or keyboard focus expands the description below via a CSS grid-template-rows
 * 0fr→1fr transition (modern, no JS measurement needed).
 */
function ExperienceRow({ entry, index }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.li
      variants={reveal}
      custom={0.15 + index * 0.06}
      className="border-t border-edge last:border-b"
    >
      <button
        type="button"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        aria-expanded={isOpen}
        className="w-full text-left py-6 outline-none transition-opacity focus-visible:opacity-90"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="text-ink text-xl sm:text-2xl leading-tight">
            <span className="font-medium">{entry.title}</span>
            <span className="ml-2 text-muted font-normal">{entry.company_name}</span>
          </h3>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted whitespace-nowrap">
            {entry.date}
          </span>
        </div>
        <div
          className={`grid transition-all duration-300 ${
            isOpen ? "mt-3 grid-rows-[1fr] opacity-100" : "mt-0 grid-rows-[0fr] opacity-0"
          }`}
          style={{ transitionTimingFunction: "cubic-bezier(0.65, 0, 0.35, 1)" }}
        >
          <p className="max-w-2xl overflow-hidden text-sm sm:text-base leading-relaxed text-ink">
            {entry.description}
          </p>
        </div>
      </button>
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
          <ExperienceRow key={`${entry.title}-${entry.company_name}-${entry.date}`} entry={entry} index={i} />
        ))}
      </motion.ul>
    </div>
  );
}

export default SectionWrapper(Experience, "work");
