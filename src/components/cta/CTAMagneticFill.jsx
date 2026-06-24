import { useEffect, useRef, useState } from "react";

/**
 * CTA variant C — magnetic + fill.
 *
 * Two motion ideas combined:
 *   1. Magnetic — the button tracks the cursor's offset from its center
 *      and translates toward it, capped at ~14px in any direction. The
 *      transform is smoothed with a rAF lerp so the motion feels weighty
 *      rather than snappy. On mouseleave the button springs back to (0,0).
 *   2. Fill — the same bg-ink fill from the letter-wave-fill variant
 *      slides up from the bottom on hover, text color inverts ink → paper.
 *
 * The magnetic pull is the visual that most clearly reads as "this thing
 * is alive." Combined with the fill, it gives the button two distinct
 * personality beats: a subtle gravitational tug, then a decisive fill.
 */

const STRENGTH = 0.35; // fraction of cursor offset applied to translate
const MAX_PX = 14; // cap so the button never wanders too far from its slot
const LERP = 0.18; // 0..1; higher = snappier follow
const FILL_DURATION_MS = 500;
const ease = "cubic-bezier(0.65, 0, 0.35, 1)";

export default function CTAMagneticFill({
  label,
  href,
  arrow = "↗",
  disabledLabel = "Coming soon",
  className = "",
}) {
  // Renders the same magnetic interaction regardless of whether a URL
  // is wired up — this is intentional for the in-development phase, so
  // the hover/fill/magnetic motion can be evaluated even on projects
  // that don't have a live site or public repo yet. When `href` is
  // missing, the click is short-circuited (preventDefault) and a
  // tooltip via `title` reads the disabledLabel; otherwise the link
  // navigates normally.
  const isExternal = !!href && href.startsWith("http");
  const ref = useRef(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function tick() {
      currentRef.current.x +=
        (targetRef.current.x - currentRef.current.x) * LERP;
      currentRef.current.y +=
        (targetRef.current.y - currentRef.current.y) * LERP;
      el.style.transform = `translate3d(${currentRef.current.x.toFixed(
        2,
      )}px, ${currentRef.current.y.toFixed(2)}px, 0)`;
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  function handleClick(e) {
    // No-op click when there's no URL — the visual feedback (magnetic,
    // fill, color invert) still plays but the page doesn't navigate.
    if (!href) e.preventDefault();
  }

  function handlePointerMove(e) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * STRENGTH;
    const dy = (e.clientY - cy) * STRENGTH;
    targetRef.current.x = Math.max(-MAX_PX, Math.min(MAX_PX, dx));
    targetRef.current.y = Math.max(-MAX_PX, Math.min(MAX_PX, dy));
  }

  function handlePointerLeave() {
    targetRef.current.x = 0;
    targetRef.current.y = 0;
    setIsHovering(false);
  }

  return (
    <a
      ref={ref}
      href={href || "#"}
      onClick={handleClick}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      data-cursor="check it out"
      aria-label={href ? label : `${label} — ${disabledLabel}`}
      title={href ? undefined : disabledLabel}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setIsHovering(true)}
      onPointerLeave={handlePointerLeave}
      onFocus={() => setIsHovering(true)}
      onBlur={handlePointerLeave}
      className={`group relative inline-flex overflow-hidden border border-ink bg-paper px-7 py-4 will-change-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 ${className}`}
    >
      {/* Fill layer */}
      <span
        aria-hidden="true"
        className="absolute inset-0 z-0 bg-ink transition-transform"
        style={{
          transform: isHovering ? "translateY(0)" : "translateY(100%)",
          transitionDuration: `${FILL_DURATION_MS}ms`,
          transitionTimingFunction: ease,
        }}
      />
      <span
        className="relative z-10 font-sans text-sm uppercase tracking-widest transition-colors"
        style={{
          color: isHovering ? "var(--bg)" : "var(--ink)",
          transitionDuration: `${FILL_DURATION_MS}ms`,
          transitionTimingFunction: ease,
        }}
      >
        {label} {arrow}
      </span>
    </a>
  );
}
