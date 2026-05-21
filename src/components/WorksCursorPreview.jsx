import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

const PREVIEW_WIDTH = "clamp(360px, 32vw, 560px)";
const LERP = 0.18;
const OFFSET_X = 24;
const OFFSET_Y = 24;

/**
 * WorksCursorPreview — cursor-follow image preview for the /works typographic
 * index. Hidden on mobile (no hover) and under prefers-reduced-motion (the
 * caller renders an inline thumb in that case).
 *
 * Owns:
 *  - image preloading on mount
 *  - a window-level mousemove listener
 *  - a rAF lerp loop that only runs while a row is hovered
 */
export default function WorksCursorPreview({ hoveredIdx, projects }) {
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
  }, [projects]);

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
  );
}
