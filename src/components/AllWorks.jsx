import { useState } from "react";
import { Link } from "react-router-dom";

import { projects } from "../constants";
import Contact from "./Contact";

/**
 * AllWorks — typographic index at /works.
 *
 * 5 stacked rows, each is a single <Link>. Display-size project name carries
 * the row; index (mono) on the left, year + services (mono) on the right.
 * Cursor-follow preview and reveal animations are layered on by later tasks.
 */
export default function AllWorks() {
  const [hoveredIdx, setHoveredIdx] = useState(null);

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
        >
          Works
        </h1>
      </section>

      {/* Typographic index — 5 rows, hairline above each + closer hairline
          below the list. Each row is a single Link. */}
      <section className="mx-auto w-full max-w-screen-2xl px-6 pb-24 sm:px-16">
        <ul
          role="list"
          className="border-b border-edge"
          onMouseLeave={() => setHoveredIdx(null)}
        >
          {projects.map((project, i) => (
            <li
              key={project.slug}
              style={{
                opacity: hoveredIdx !== null && hoveredIdx !== i ? 0.35 : 1,
                transition: "opacity 200ms",
              }}
            >
              <Link
                to={`/works/${project.slug}`}
                data-cursor="open project"
                aria-label={`Open ${project.name}, ${project.year}`}
                onMouseEnter={() => setHoveredIdx(i)}
                className="group flex items-baseline justify-between gap-8 border-t border-edge py-5 sm:py-7"
              >
                <div className="flex items-baseline gap-6">
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
                      fontSize: "clamp(48px, 7vw, 112px)",
                      lineHeight: 1,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {project.name}
                  </h2>
                </div>
                <span className="hidden sm:inline whitespace-nowrap font-mono text-xs uppercase tracking-widest text-muted">
                  {project.year} · {project.services.join(", ")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <Contact />
    </main>
  );
}
