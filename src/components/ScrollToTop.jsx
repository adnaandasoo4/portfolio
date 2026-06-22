import { useEffect, useState } from "react";
import { useLenis } from "../utils/lenis";

/**
 * Floating "back to top" button, fixed bottom-right of the viewport.
 *
 * Visibility is gated by scroll position — the button fades in once the
 * user has scrolled past one viewport height (i.e., past the Hero) and
 * fades out again at the top. Click dispatches Lenis's `scrollTo(0)` so
 * the smooth-scroll matches the rest of the page's scroll feel; if Lenis
 * isn't mounted yet, falls back to the browser's native smooth scroll.
 *
 * Hidden state also drops the button from the tab order (`tabIndex=-1`)
 * and marks it `aria-hidden` so keyboard and screen-reader users don't
 * land on an offscreen control.
 */
export default function ScrollToTop() {
  const lenis = useLenis();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => setVisible(window.scrollY > window.innerHeight);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const handleClick = () => {
    if (lenis) {
      lenis.scrollTo(0);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Scroll to top"
      aria-hidden={!visible}
      data-cursor="back to the top?"
      tabIndex={visible ? 0 : -1}
      className={`fixed bottom-4 right-4 z-50 hidden h-14 w-14 items-center justify-center rounded-full border border-edge bg-paper text-ink transition-[opacity,transform,background-color,color,border-color] duration-300 hover:border-[var(--lime)] hover:bg-[var(--lime)] hover:text-[var(--dark-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper md:flex sm:bottom-8 sm:right-8 sm:h-16 sm:w-16 ${
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0"
      }`}
      style={{ transitionTimingFunction: "cubic-bezier(0.65, 0, 0.35, 1)" }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
        strokeLinejoin="miter"
        aria-hidden="true"
        className="h-5 w-5 sm:h-6 sm:w-6"
      >
        <line x1="12" y1="19" x2="12" y2="5" />
        <polyline points="5,12 12,5 19,12" />
      </svg>
    </button>
  );
}
