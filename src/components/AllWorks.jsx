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
      {/* Typographic index — centered list of project names. The ul is
          `mx-auto w-fit` so it auto-sizes to the widest project name and
          centers horizontally; every row's left edge therefore aligns at
          the same vertical line through the page (Process-style block
          centering). Display-subtle by default on desktop, snaps to ink
          on hover. Top padding clears the fixed navbar. */}
      <section className="mx-auto w-full max-w-[1800px] px-6 pb-24 pt-32 sm:px-16 sm:pt-40">
        <ul
          role="list"
          className="mx-auto flex w-fit flex-col gap-8 sm:gap-0"
          onMouseLeave={() => setHoveredIdx(null)}
        >
          {projects.map((project, i) => {
            const delay = i * 0.08;
            return (
              <li key={project.slug}>
                <Link
                  to={`/works/${project.slug}`}
                  data-cursor="open project"
                  aria-label={`Open ${project.name}, ${project.year}`}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onFocus={() => setHoveredIdx(i)}
                  onBlur={() => setHoveredIdx(null)}
                  className="group flex flex-col gap-4 py-2 sm:py-3 focus:outline-none"
                >
                  <motion.h2
                    className="font-display uppercase whitespace-normal transition-colors duration-200 [color:var(--ink)] sm:whitespace-nowrap sm:[color:var(--display-subtle)] sm:group-hover:[color:var(--ink)] sm:group-focus-visible:[color:var(--ink)]"
                    initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
                    animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                    transition={{
                      delay: prefersReducedMotion ? 0 : delay,
                      duration: prefersReducedMotion ? 0.2 : 0.5,
                      ease: [0.65, 0, 0.35, 1],
                    }}
                    style={{
                      fontWeight: 700,
                      fontSize: "clamp(56px, 9vw, 180px)",
                      lineHeight: 0.82,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {project.name}
                  </motion.h2>
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
                      <div className="flex h-full w-full items-center justify-center bg-edge font-sans text-xs uppercase tracking-widest text-muted">
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
                      delay: prefersReducedMotion ? 0 : delay,
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
                      <div className="flex h-full w-full items-center justify-center bg-edge font-sans text-xs uppercase tracking-widest text-muted">
                        {project.name}
                      </div>
                    )}
                  </motion.div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <WorksCursorPreview hoveredIdx={hoveredIdx} projects={projects} />

      <Contact />
    </main>
  );
}
