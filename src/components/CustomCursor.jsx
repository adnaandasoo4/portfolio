import { useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";

/**
 * Custom cursor add-on.
 *
 * The native OS cursor stays visible — this component only renders the
 * floating label pill that trails alongside it. The pill state swaps
 * when the mouse is over an interactive element (`<a>`, `<button>`,
 * `role="button"`, `<input>`, `<label>`, or anything with
 * `data-cursor="active"`):
 *
 * - Pill turns orange (`bg-flag`).
 * - Inner dot flips to white.
 * - Pill performs a single bounce-pop on activation only — flipping back
 *   to "Scroll" snaps without animation.
 *
 * Touch devices skip the component entirely.
 */
export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);
  const [label, setLabel] = useState("click");

  const wrapperRef = useRef(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const prevActive = useRef(false);

  const popControls = useAnimation();

  // --- Mouse tracking + lerp follower ------------------------------------
  useEffect(() => {
    const isTouch =
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0);
    if (isTouch) return;

    setEnabled(true);

    const onMouseMove = (e) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
    };

    const onMouseOver = (e) => {
      // Pill is footer-only AND hover-only — no base "scroll" state on
      // empty space. Outside #contact, force inactive so the pill fades
      // out. Inside #contact but not over an interactive element, also
      // force inactive (no pill on empty footer space).
      if (!e.target.closest?.("#contact")) {
        setActive(false);
        return;
      }

      // Inside the footer — look for a `data-cursor` ancestor first.
      // This lets a section wrapper declare a blanket label that wins
      // over a descendant <button> matching the default-interactive
      // selector.
      const labeled = e.target.closest?.("[data-cursor]");
      if (labeled) {
        setActive(true);
        const custom = labeled.getAttribute("data-cursor");
        setLabel(custom && custom !== "active" ? custom : "click");
        return;
      }
      // Fallback: any default-interactive element gets the generic label.
      const interactive = e.target.closest?.(
        'a, button, [role="button"], input, label'
      );
      if (interactive) {
        setActive(true);
        setLabel("click");
      } else {
        setActive(false);
      }
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseover", onMouseOver, { passive: true });

    let rafId = 0;
    const tick = () => {
      current.current.x += (target.current.x - current.current.x) * 0.14;
      current.current.y += (target.current.y - current.current.y) * 0.14;
      if (wrapperRef.current) {
        wrapperRef.current.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0)`;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // --- Bounce pop, ONLY on transition to active --------------------------
  // Keyframe sequence creates a small overshoot → undershoot → settle.
  // Deactivation (active → inactive) snaps back without animation so
  // the pill doesn't bounce twice for every interactive element you
  // hover off of.
  useEffect(() => {
    if (!enabled) return;
    if (active && !prevActive.current) {
      // Horizontal squish → vertical stretch → settle. The two axes
      // are inversely correlated for a stage of the cycle, which sells
      // the "ball getting squeezed from the sides and rebounding" feel.
      popControls.start({
        scaleX: [1, 0.92, 1.04, 1],
        scaleY: [1, 1.08, 0.97, 1],
        transition: { duration: 0.35, ease: "easeOut" },
      });
    }
    prevActive.current = active;
  }, [active, enabled, popControls]);

  if (!enabled) return null;

  return (
    <div
      ref={wrapperRef}
      className="pointer-events-none fixed left-0 top-0 z-[9999]"
      style={{ willChange: "transform" }}
      aria-hidden="true"
    >
      {/* Pill positioned with an offset from the wrapper origin (= mouse
          position) so it sits next to the OS cursor visual rather than
          underneath it. origin-left keeps the bounce anchored on the
          side closest to the cursor. */}
      <motion.div
        animate={popControls}
        className={`absolute left-[20px] top-[14px] inline-flex origin-center items-center gap-1.5 whitespace-nowrap rounded-full bg-flag px-2.5 py-1 font-sans text-[10px] capitalize tracking-wide text-white transition-opacity duration-200 ${
          active ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="block h-1.5 w-1.5 rounded-full bg-white" />
        {label}
      </motion.div>
    </div>
  );
}
