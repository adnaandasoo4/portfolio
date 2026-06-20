import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const BackdropContext = createContext(null);

/**
 * Holds which backdrop the in-view section is requesting: 'dark' (green) or
 * 'light' (off-white). The TopographicField reads this to cross-fade its
 * colors; sections set it via useReportBackdrop as they scroll into view.
 */
export function BackdropProvider({ children, initial = "dark" }) {
  const [backdrop, setBackdrop] = useState(initial);
  const value = useMemo(() => ({ backdrop, setBackdrop }), [backdrop]);
  return (
    <BackdropContext.Provider value={value}>
      {children}
    </BackdropContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBackdrop() {
  const ctx = useContext(BackdropContext);
  return ctx ? ctx.backdrop : "dark";
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSetBackdrop() {
  const ctx = useContext(BackdropContext);
  return ctx ? ctx.setBackdrop : () => {};
}

/**
 * Report `value` ('dark' | 'light') as the active backdrop while the element
 * referenced by `ref` is at least half in view.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useReportBackdrop(ref, value) {
  const setBackdrop = useSetBackdrop();
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && e.intersectionRatio >= 0.5) setBackdrop(value);
        });
      },
      { threshold: [0.5] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, value, setBackdrop]);
}
