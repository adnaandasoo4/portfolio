import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";

import { projects } from "../constants";
import Contact from "./Contact";
import WorksCursorPreview from "./WorksCursorPreview";

/**
 * AllWorks — typographic index at /works.
 *
 * 5 stacked rows, each is a single <Link>. Display-size project name carries
 * the row; index (mono) on the left, year + services (mono) on the right.
 * Cursor-follow preview and reveal animations are layered on by later tasks.
 */
export default function AllWorks() {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const prefersReducedMotion = useReducedMotion();

  return (
    <main className="relative w-full bg-paper text-ink">
      {/* Display title — same Cabinet Grotesk treatment as the home Hero and
          per-project titles. Top padding clears the fixed navbar. */}
      <section className="mx-auto flex max-w-screen-2xl flex-col gap-8 px-6 pb-16 pt-32 sm:px-16 sm:pt-40">
        <h1
          className="font-display uppercase"
          style={{
            fontWeight: 700,
            fontSize: "clamp(40px, 6vw, 96px)",
            lineHeight: 0.95,
            letterSpacing: "-0.02em",
          }}
          aria-label="Works"
        >
          {Array.from("Works").map((char, i) => (
            <span
              key={i}
              className="inline-block overflow-hidden align-bottom"
              aria-hidden="true"
            >
              <motion.span
                className="inline-block"
                initial={prefersReducedMotion ? { opacity: 0 } : { y: "100%" }}
                animate={prefersReducedMotion ? { opacity: 1 } : { y: 0 }}
                transition={{
                  delay: prefersReducedMotion ? 0 : i * 0.03,
                  duration: prefersReducedMotion ? 0.2 : 0.6,
                  ease: [0.65, 0, 0.35, 1],
                }}
              >
                {char}
              </motion.span>
            </span>
          ))}
        </h1>
      </section>

      {/* Typographic index — 5 rows, hairline above each + closer hairline
          below the list. Each row is a single Link. */}
      <section className="mx-auto w-full max-w-screen-2xl px-6 pb-24 sm:px-16">
        <ul
          role="list"
          className="space-y-8 sm:space-y-0"
          onMouseLeave={() => setHoveredIdx(null)}
        >
          {projects.map((project, i) => {
            const delay = 0.6 + i * 0.08;
            return (
              <li
                key={project.slug}
                className="group"
                style={{
                  opacity: hoveredIdx !== null && hoveredIdx !== i ? 0.35 : 1,
                  transition: "opacity 200ms",
                }}
              >
                {/* Hairline above the row — animates from scaleX 0 to 1 on mount,
                    transform-origin: left so it grows left-to-right. */}
                <motion.div
                  className="h-px w-full origin-left bg-edge transition-all duration-200 group-focus-within:h-0.5 group-focus-within:bg-ink"
                  initial={prefersReducedMotion ? { opacity: 0 } : { scaleX: 0 }}
                  animate={prefersReducedMotion ? { opacity: 1 } : { scaleX: 1 }}
                  transition={{
                    delay: prefersReducedMotion ? 0 : delay,
                    duration: prefersReducedMotion ? 0.2 : 0.4,
                    ease: [0.65, 0, 0.35, 1],
                  }}
                />
                <Link
                  to={`/works/${project.slug}`}
                  data-cursor="open project"
                  aria-label={`Open ${project.name}, ${project.year}`}
                  onMouseEnter={() => setHoveredIdx(i)}
                  className="group flex flex-col gap-4 py-6 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8 sm:py-7 focus:outline-none"
                >
                  <motion.div
                    className="flex items-baseline gap-6"
                    initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
                    animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                    transition={{
                      delay: prefersReducedMotion ? 0 : delay + 0.15,
                      duration: prefersReducedMotion ? 0.2 : 0.5,
                      ease: [0.65, 0, 0.35, 1],
                    }}
                  >
                    <span
                      aria-hidden="true"
                      className="font-mono text-xs uppercase tracking-widest tabular-nums text-muted"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h2
                      className="font-display uppercase"
                      style={{
                        fontWeight: 700,
                        fontSize: "clamp(32px, 9vw, 112px)",
                        lineHeight: 1,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {project.name}
                    </h2>
                  </motion.div>
                  {/* Desktop reduced-motion inline thumb. Replaces the cursor-follow
                      preview when the user has prefers-reduced-motion: reduce. Sized
                      smaller than the cursor preview; opacity follows row hover state. */}
                  <div
                    className="hidden sm:motion-reduce:block"
                    style={{
                      width: "clamp(200px, 18vw, 280px)",
                      aspectRatio: "16 / 10",
                      opacity: hoveredIdx === i ? 1 : 0,
                      transition: "opacity 180ms",
                    }}
                  >
                    {project.coverImage ? (
                      <img
                        src={project.coverImage}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-edge font-mono text-xs uppercase tracking-widest text-muted">
                        {project.name}
                      </div>
                    )}
                  </div>
                  {/* Mobile-only inline thumbnail. Hidden on sm+ — desktop uses the
                      cursor-follow preview instead. */}
                  <motion.div
                    className="block w-full sm:hidden"
                    style={{ aspectRatio: "16 / 10" }}
                    initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
                    animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                    transition={{
                      delay: prefersReducedMotion ? 0 : delay + 0.15,
                      duration: prefersReducedMotion ? 0.2 : 0.5,
                      ease: [0.65, 0, 0.35, 1],
                    }}
                  >
                    {project.coverImage ? (
                      <img
                        src={project.coverImage}
                        alt={project.name}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-edge font-mono text-xs uppercase tracking-widest text-muted">
                        {project.name}
                      </div>
                    )}
                  </motion.div>
                  <motion.span
                    className="whitespace-nowrap font-mono text-xs uppercase tracking-widest text-muted"
                    initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
                    animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                    transition={{
                      delay: prefersReducedMotion ? 0 : delay + 0.15,
                      duration: prefersReducedMotion ? 0.2 : 0.5,
                      ease: [0.65, 0, 0.35, 1],
                    }}
                  >
                    {project.year} · {project.services.join(", ")}
                  </motion.span>
                </Link>
              </li>
            );
          })}
          {/* Closing hairline below the last row */}
          <motion.div
            className="h-px w-full origin-left bg-edge"
            initial={prefersReducedMotion ? { opacity: 0 } : { scaleX: 0 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { scaleX: 1 }}
            transition={{
              delay: prefersReducedMotion ? 0 : 0.6 + projects.length * 0.08,
              duration: prefersReducedMotion ? 0.2 : 0.4,
              ease: [0.65, 0, 0.35, 1],
            }}
          />
        </ul>
      </section>

      <WorksCursorPreview hoveredIdx={hoveredIdx} projects={projects} />

      <Contact />
    </main>
  );
}
