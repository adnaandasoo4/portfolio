import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";

import { projects } from "../constants";
import {
  revealVariant as reveal,
  staggerContainer,
} from "../utils/motion";
import Contact from "./Contact";
import CTAMagneticFill from "./cta/CTAMagneticFill";

// Standard viewport trigger used by every reveal-on-scroll section on
// this page. once:true matches the home page's pattern — animations
// don't replay when the section re-enters the viewport.
const viewport = { once: true, amount: 0.2 };

/**
 * Per-project detail page mounted at /works/:slug.
 *
 * Sections, top → bottom:
 *   1. Hero — huge project name in Clash Display (display token)
 *   2. Three-column metadata strip — Services / Year / Credits
 *   3. Description paragraph
 *   4. Two CTAMagneticFill buttons — Live Website + View Source (each
 *      conditionally rendered when its URL is present in the constants)
 *   5. Desktop screenshot — full-width inside the inner rail
 *   6. Two-phone mobile screenshots row — placeholder boxes if the
 *      project doesn't yet have mobileImages set
 *   7. Footer — reuses the homepage Contact component verbatim
 *
 * The Navbar, ScrollToTop, CustomCursor, and Preloader sit at the App
 * level (outside Routes), so they appear automatically on this page too.
 *
 * Scrolls to top on mount so navigating from a tile lands the visitor at
 * the project name rather than wherever they were vertically on the home
 * page. If the slug is unknown, falls back to a 404 panel rather than
 * crashing.
 */
export default function ProjectDetail() {
  const { slug } = useParams();
  const project = projects.find((p) => p.slug === slug);

  // Scroll-to-top on navigation is now handled by ScrollOnRouteChange in
  // App.jsx, which resets BOTH the document scroll and Lenis's internal
  // position (window.scrollTo alone doesn't update Lenis's virtual
  // target — the next wheel event would snap back to the old offset).

  if (!project) {
    return (
      <main className="min-h-screen w-full bg-paper text-ink">
        <div className="mx-auto flex max-w-[1800px] flex-col gap-6 px-6 pt-40 sm:px-16">
          <span className="font-sans text-xs uppercase tracking-widest text-muted">
            404 — Project not found
          </span>
          <h1
            className="font-display uppercase"
            style={{
              fontWeight: 700,
              fontSize: "clamp(48px, 7vw, 112px)",
              lineHeight: 1,
              letterSpacing: "-0.01em",
            }}
          >
            Not here.
          </h1>
          <p className="max-w-[55ch] text-sm text-muted">
            No project with the slug{" "}
            <code className="font-sans text-ink">{slug}</code>. Head back to
            the work index and pick another.
          </p>
          <div className="pt-4">
            <Link
              to="/"
              className="font-sans text-sm uppercase tracking-widest text-ink underline underline-offset-4"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative w-full bg-paper text-ink">
      {/* Hero — project name as the page's title moment. Sits below the
          fixed Navbar with generous top padding so the wordmark has air.
          The "Back to works" link sits above the title in the same rail,
          mirroring the editorial reference where it acts as a contextual
          breadcrumb back to the work index. Reveal cascades top-to-
          bottom via custom-delayed reveal variants, matching the home
          page's section reveal cadence. */}
      <motion.section
        variants={staggerContainer()}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        className="mx-auto flex max-w-[1800px] flex-col gap-12 px-6 pb-16 pt-32 sm:px-16 sm:pt-40"
      >
        <motion.div variants={reveal} custom={0}>
          <Link
            to="/works"
            data-cursor="back to works"
            className="group inline-flex w-fit items-center gap-2 font-sans text-xs uppercase tracking-widest text-muted transition-colors hover:text-ink"
          >
            <span
              aria-hidden="true"
              className="inline-block transition-transform group-hover:-translate-x-1"
            >
              ←
            </span>
            Back to works
          </Link>
        </motion.div>

        <motion.h1
          variants={reveal}
          custom={0.05}
          className="font-display uppercase"
          style={{
            fontWeight: 700,
            fontSize: "clamp(40px, 6vw, 96px)",
            lineHeight: 0.95,
            letterSpacing: "-0.02em",
          }}
        >
          {project.name}
        </motion.h1>

        {/* Metadata strip — two columns: Year and Services. CTAs used to
            sit here in a third column; they've moved down to line up
            with the tech stack row below so the actionable controls
            visually anchor the bottom of the hero block. */}
        <motion.div
          variants={reveal}
          custom={0.15}
          className="grid grid-cols-2 gap-6 border-t border-edge pt-10 sm:gap-10"
        >
          <div className="flex flex-col gap-4">
            <span className="font-sans text-xs uppercase tracking-widest text-muted">
              Year
            </span>
            <span className="font-sans text-sm uppercase tracking-widest text-ink">
              {project.year}
            </span>
          </div>
          <div className="flex flex-col gap-4 text-right">
            <span className="font-sans text-xs uppercase tracking-widest text-muted">
              Services
            </span>
            <div className="flex flex-col gap-1 font-sans text-sm uppercase tracking-widest text-ink">
              {project.services.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tech stack + CTAs row. Tech stack chips on the left (sm:col-
            span-7), Live Website + View Source buttons on the right
            (sm:col-span-5) at equal width. `sm:items-end` aligns the
            buttons with the bottom of the tech-stack column — i.e.
            level with the chips, not the section label above them —
            so the row reads as one horizontal band. */}
        <motion.div
          variants={reveal}
          custom={0.25}
          className="grid grid-cols-1 gap-10 sm:grid-cols-12 sm:items-end"
        >
          <div className="flex flex-col gap-5 sm:col-span-7">
            <span className="font-sans text-xs uppercase tracking-widest text-muted">
              Tech stack
            </span>
            <ul className="flex flex-wrap gap-2">
              {project.techStack.map((tech) => (
                <li
                  key={tech}
                  className="border border-ink/30 px-3 py-1.5 font-sans text-xs uppercase tracking-widest text-ink"
                >
                  {tech}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex w-full gap-3 sm:col-span-5">
            <CTAMagneticFill
              label="Live Website"
              href={project.liveUrl}
              disabledLabel="Site coming soon"
              className="flex-1 justify-center"
            />
            <CTAMagneticFill
              label="View Source"
              href={project.sourceUrl}
              disabledLabel="Repository is private"
              className="flex-1 justify-center"
            />
          </div>
        </motion.div>
      </motion.section>

      {/* Desktop screenshot. Constrained to the inner rail; aspect-[16/10]
          keeps things consistent with the carousel tile shape. Single
          reveal — image fades up as it enters the viewport. */}
      <motion.section
        variants={reveal}
        custom={0}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        className="mx-auto w-full max-w-[1800px] px-6 py-16 sm:px-16"
      >
        {project.coverImage ? (
          <img
            src={project.coverImage}
            alt={`${project.name} — desktop screenshot`}
            loading="lazy"
            decoding="async"
            className="w-full"
            style={{ aspectRatio: "16 / 10", objectFit: "cover" }}
          />
        ) : (
          <div
            className="flex w-full items-center justify-center bg-edge font-sans text-xs uppercase tracking-widest text-muted"
            style={{ aspectRatio: "16 / 10" }}
          >
            Desktop screenshot · placeholder
          </div>
        )}
      </motion.section>

      {/* Mobile screenshots — 3 rectangular boxes side-by-side. Drops
          the phone-frame styling (rounded corners + tall narrow aspect)
          in favor of plain rectangular containers that match the rest of
          the page's grid language. Placeholder text fills any empty
          slots until you drop assets into the project's mobileImages
          array. Boxes stagger in left → right via per-index reveal delays. */}
      <motion.section
        variants={staggerContainer()}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        className="mx-auto w-full max-w-[1800px] px-6 py-16 sm:px-16"
      >
        <motion.h2
          variants={reveal}
          custom={0}
          className="mb-10 font-sans text-xs uppercase tracking-widest text-muted"
        >
          On mobile
        </motion.h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8">
          {[0, 1, 2].map((idx) => {
            const src = project.mobileImages[idx];
            return (
              <motion.div
                key={idx}
                variants={reveal}
                custom={0.1 + idx * 0.08}
                className="overflow-hidden bg-edge"
                style={{ aspectRatio: "9 / 16" }}
              >
                {src ? (
                  <img
                    src={src}
                    alt={`${project.name} — mobile screenshot ${idx + 1}`}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center px-4 text-center font-sans text-[10px] uppercase tracking-widest text-muted">
                    Mobile screenshot {idx + 1} · placeholder
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* Footer — reuse the homepage Contact component verbatim so the
          page ends with the same set-piece a visitor sees on /. */}
      <Contact />
    </main>
  );
}
