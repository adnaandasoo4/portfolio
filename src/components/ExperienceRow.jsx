import { motion } from "framer-motion";
import { revealVariant as reveal } from "../utils/motion";

/**
 * Single experience row. Open/closed state is owned by the parent so that
 * opening one row auto-closes the previously open one (accordion behavior).
 * Click toggles on all devices. Hover/focus open + leave/blur close are
 * provided only when the parent passes the handlers — i.e., on hover-
 * capable pointer devices — so touch users get a strictly click-driven
 * UX without the synthesized-hover race.
 *
 * @param {object} props
 * @param {object} props.entry - { title, company_name, date, description }
 * @param {number} props.index - position in the list, drives stagger delay
 * @param {boolean} props.isOpen - controlled open state
 * @param {() => void} props.onToggle - parent's "toggle me" handler
 * @param {(() => void) | null} [props.onHoverEnter] - desktop hover/focus open
 * @param {(() => void) | null} [props.onHoverLeave] - desktop hover/focus close
 */
export default function ExperienceRow({
  entry,
  index,
  isOpen,
  onToggle,
  onHoverEnter,
  onHoverLeave,
}) {
  return (
    <motion.li
      variants={reveal}
      custom={0.15 + index * 0.06}
      className="border-t border-edge last:border-b"
    >
      <h3 className="text-ink text-xl sm:text-2xl leading-tight">
        <button
          type="button"
          onClick={onToggle}
          onMouseEnter={onHoverEnter ?? undefined}
          onMouseLeave={onHoverLeave ?? undefined}
          onFocus={onHoverEnter ?? undefined}
          onBlur={onHoverLeave ?? undefined}
          aria-expanded={isOpen}
          aria-controls={`exp-desc-${index}`}
          className="w-full text-left py-6 outline-none transition-opacity focus-visible:opacity-90"
        >
          <span className="flex items-center justify-between gap-x-4">
            {/* Inner content block grows to fill the row (flex-1) and
                spreads title-on-left / date-on-right (justify-between).
                On desktop this reproduces the original layout exactly —
                the indicator is hidden so the date sits at the far
                right. On mobile the indicator is visible at the far
                right of the row, with the date pushed left to make
                room. */}
            <span className="flex flex-1 flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <span>
                <span className="font-medium">{entry.title}</span>
                <span className="ml-2 text-muted font-normal">{entry.company_name}</span>
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted whitespace-nowrap">
                {entry.date}
              </span>
            </span>
            {/* Mobile-only click affordance. '+' rotates 45° on open to
                read as '×'. Hidden on sm:+ because hover-to-expand on
                desktop already makes the row's interactivity obvious. */}
            <svg
              viewBox="0 0 16 16"
              aria-hidden="true"
              className={`h-4 w-4 shrink-0 text-muted transition-transform duration-300 sm:hidden ${
                isOpen ? "rotate-45" : ""
              }`}
              style={{ transitionTimingFunction: "cubic-bezier(0.65, 0, 0.35, 1)" }}
            >
              <line
                x1="2.5"
                y1="8"
                x2="13.5"
                y2="8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <line
                x1="8"
                y1="2.5"
                x2="8"
                y2="13.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
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
