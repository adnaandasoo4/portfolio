import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import { projects } from "../constants";
import {
  revealVariant as reveal,
  staggerContainer,
} from "../utils/motion";
import Contact from "./Contact";

// Standard viewport trigger: section reveals once when at least 20% of
// it is in view. `once: true` means the animation doesn't replay on
// scroll-out/in — matches the home page's section reveals.
const viewport = { once: true, amount: 0.2 };

/**
 * AllWorks — full project index, mounted at /works.
 *
 * Layout:
 *   - Big "Work" title at the top, in the same display weight as the
 *     other section headings on the home page
 *   - One row per project, alternating image-left / image-right on every
 *     other row for visual rhythm (the "zebra" pattern common in
 *     editorial portfolios)
 *   - Each row is wrapped in a <Link> to /works/:slug — entire row is
 *     clickable
 *   - Cover image takes ~55% of the row width; the remaining ~45% holds
 *     the project name (display), year, services (mono), and a one-line
 *     description, with a "View project ↗" affordance at the bottom that
 *     subtly grows/translates on hover
 *   - Footer reuses the Contact component verbatim
 *
 * Scrolls to top on mount so navigating from a detail page or from the
 * "View all works" link on home lands the visitor at the title, not at
 * whatever scroll offset the SPA was at.
 */
export default function AllWorks() {
  // Scroll-to-top on navigation handled by ScrollOnRouteChange at the
  // App level — see App.jsx.
  return (
    <main className="relative w-full bg-paper text-ink">
      {/* Page header — big display title. Padding-top accounts for the
          fixed navbar so the title has breathing room. */}
      <motion.section
        variants={staggerContainer()}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        className="mx-auto flex max-w-screen-2xl flex-col gap-8 px-6 pb-16 pt-32 sm:px-16 sm:pt-40"
      >
        <motion.h1
          variants={reveal}
          custom={0}
          className="font-display uppercase"
          style={{
            fontWeight: 700,
            fontSize: "clamp(40px, 6vw, 96px)",
            lineHeight: 0.95,
            letterSpacing: "-0.02em",
          }}
        >
          Works
        </motion.h1>
      </motion.section>

      {/* Project list — alternating image-left / image-right rows. Each
          row is its own viewport-triggered reveal so the list cascades
          in as the visitor scrolls through it (rather than firing all
          at once at the top of the section). */}
      <section className="mx-auto w-full max-w-screen-2xl px-6 pb-24 sm:px-16">
        <ul className="flex flex-col gap-20 sm:gap-32">
          {projects.map((project, i) => {
            const imageOnLeft = i % 2 === 0;
            return (
              <motion.li
                key={project.slug}
                variants={reveal}
                custom={0}
                initial="hidden"
                whileInView="show"
                viewport={viewport}
              >
                <Link
                  to={`/works/${project.slug}`}
                  data-cursor="open project"
                  aria-label={`Open ${project.name}`}
                  className="group grid grid-cols-1 items-center gap-8 sm:grid-cols-12 sm:gap-12"
                >
                  {/* Cover image — sm:col-span-7 on the side dictated by
                      row index. order utilities flip the visual order on
                      odd rows without changing DOM order. */}
                  <div
                    className={`relative overflow-hidden bg-edge sm:col-span-7 ${
                      imageOnLeft ? "sm:order-1" : "sm:order-2"
                    }`}
                    style={{ aspectRatio: "16 / 10" }}
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
                      <div className="flex h-full w-full items-center justify-center font-mono text-xs uppercase tracking-widest text-muted">
                        {project.name} · placeholder
                      </div>
                    )}
                  </div>

                  {/* Detail column — index + name + meta + description +
                      view CTA. Index/name sit at the top, view CTA at
                      the bottom for a clear top-to-bottom read. */}
                  <div
                    className={`flex flex-col gap-6 sm:col-span-5 ${
                      imageOnLeft ? "sm:order-2" : "sm:order-1"
                    }`}
                  >
                    <div className="flex items-baseline gap-4">
                      <span className="font-mono text-xs uppercase tracking-widest text-muted">
                        {String(i + 1).padStart(2, "0")} /{" "}
                        {String(projects.length).padStart(2, "0")}
                      </span>
                      <span className="font-mono text-xs uppercase tracking-widest text-muted">
                        {project.year}
                      </span>
                    </div>

                    <h2
                      className="font-display uppercase"
                      style={{
                        fontWeight: 700,
                        fontSize: "clamp(32px, 4vw, 64px)",
                        lineHeight: 1,
                        letterSpacing: "-0.015em",
                      }}
                    >
                      {project.name}
                    </h2>

                    <p className="font-mono text-xs uppercase tracking-widest text-muted">
                      {project.services.join(" · ")}
                    </p>

                    <p
                      className="opacity-80"
                      style={{
                        fontSize: "15px",
                        lineHeight: 1.55,
                        maxWidth: "48ch",
                      }}
                    >
                      {project.description}
                    </p>

                    <span className="mt-2 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-ink">
                      View project
                      <span
                        aria-hidden="true"
                        className="inline-block transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5"
                      >
                        ↗
                      </span>
                    </span>
                  </div>
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </section>

      {/* Footer — same Contact set-piece as the home page. */}
      <Contact />
    </main>
  );
}
