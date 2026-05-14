import { createContext, useContext, useEffect, useState } from "react";
import Lenis from "lenis";

const LenisContext = createContext(null);

export function LenisProvider({ children }) {
  const [lenis, setLenis] = useState(null);

  useEffect(() => {
    // Respect prefers-reduced-motion — users who opt out of motion get
    // the browser's native scroll, no Lenis smoothing. Skip the whole
    // setup so we don't pay for a rAF loop that does nothing useful.
    if (
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const instance = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      anchors: true,
    });
    setLenis(instance);

    let frame;
    function raf(time) {
      instance.raf(time);
      frame = requestAnimationFrame(raf);
    }
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      instance.destroy();
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}

/**
 * Returns the active Lenis instance, or `null` until the provider's first
 * effect commit. Consumers must guard for `null` (e.g. early-return from a
 * scroll-setup effect when Lenis isn't ready yet).
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useLenis() {
  return useContext(LenisContext);
}
