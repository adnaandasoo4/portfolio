import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";

import { projects } from "../constants";
import Contact from "./Contact";

const PREVIEW_WIDTH = "clamp(240px, 22vw, 360px)";
const LERP = 0.18;
const OFFSET_X = 24;
const OFFSET_Y = 24;

/**
 * AllWorks — typographic index at /works.
 *
 * 5 stacked rows, each is a single <Link>. Display-size project name carries
 * the row; index (mono) on the left, year + services (mono) on the right.
 * Cursor-follow preview and reveal animations are layered on by later tasks.
 */
export default function AllWorks() {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const previewRef = useRef(null);
  const mouseTarget = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const rafId = useRef(null);

  // Preload all cover images on mount so the swap is instant on first hover.
  useEffect(() => {
    projects.forEach((p) => {
      if (p.coverImage) {
        const img = new Image();
        img.src = p.coverImage;
      }
    });
  }, []);

  // Track mouse position at window level. Single passive listener for the
  // lifetime of the page.
  useEffect(() => {
    const handleMove = (e) => {
      mouseTarget.current.x = e.clientX;
      mouseTarget.current.y = e.clientY;
    };
    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  // rAF lerp loop. Only runs while a row is hovered. Seeds current at the
  // mouse position on engage so the preview doesn't glide in from (0,0).
  useEffect(() => {
    if (hoveredIdx === null) return;

    current.current.x = mouseTarget.current.x;
    current.current.y = mouseTarget.current.y;

    // Cache preview dimensions once per hover engagement. The preview's
    // width is fixed via clamp() and aspect ratio is fixed, so reading
    // offsetWidth/Height inside the rAF tick would force layout each
    // frame for no benefit.
    const el = previewRef.current;
    const w = el ? el.offsetWidth : 0;
    const h = el ? el.offsetHeight : 0;

    const tick = () => {
      current.current.x += (mouseTarget.current.x - current.current.x) * LERP;
      current.current.y += (mouseTarget.current.y - current.current.y) * LERP;

      if (el) {
        const x = Math.max(
          0,
          Math.min(window.innerWidth - w, current.current.x + OFFSET_X)
        );
        const y = Math.max(
          0,
          Math.min(window.innerHeight - h, current.current.y + OFFSET_Y)
        );
        el.style.transform = `translate(${x}px, ${y}px)`;
      }
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [hoveredIdx]);

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
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{
                  delay: i * 0.03,
                  duration: 0.6,
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

      {/* Cursor-follow preview. position: fixed; translated by rAF loop above.
          Hidden on mobile (no hover) and under prefers-reduced-motion (Task 8
          swaps in the inline thumb behavior for that case). */}
      <div
        ref={previewRef}
        className="pointer-events-none fixed left-0 top-0 z-40 hidden sm:block motion-reduce:hidden"
        style={{
          width: PREVIEW_WIDTH,
          aspectRatio: "16 / 10",
          willChange: "transform",
        }}
      >
        <AnimatePresence>
          {hoveredIdx !== null && (
            <motion.div
              key={hoveredIdx}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              {projects[hoveredIdx].coverImage ? (
                <img
                  src={projects[hoveredIdx].coverImage}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-edge font-mono text-xs uppercase tracking-widest text-muted">
                  {projects[hoveredIdx].name}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Contact />
    </main>
  );
}
