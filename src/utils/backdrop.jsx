import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const BackdropContext = createContext(null);

// Stable fallback so consumers used outside a provider don't see a new
// registry object (and re-run effects) on every render.
const EMPTY_REGISTRY = { current: [] };

/**
 * Holds an ordered registry of sections and the backdrop palette each one
 * wants ('dark' green / 'light' off-white). The TopographicField reads the
 * registry every frame to compute a continuous, scroll-driven color blend
 * that drives both the field colors and the page text. Sections register
 * themselves via useSectionBackdrop.
 */
export function BackdropProvider({ children }) {
  const registryRef = useRef([]);
  const [version, setVersion] = useState(0);

  const register = useCallback((entry) => {
    registryRef.current = [...registryRef.current, entry];
    setVersion((v) => v + 1);
    return () => {
      registryRef.current = registryRef.current.filter((e) => e !== entry);
      setVersion((v) => v + 1);
    };
  }, []);

  const value = useMemo(
    () => ({ registryRef, version, register }),
    [version, register],
  );
  return (
    <BackdropContext.Provider value={value}>
      {children}
    </BackdropContext.Provider>
  );
}

/**
 * Register `ref`'s element with the given palette ('dark' | 'light') while it
 * is mounted. The field measures each registered element's position to blend
 * colors across sections as the user scrolls.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useSectionBackdrop(ref, palette) {
  const ctx = useContext(BackdropContext);
  const register = ctx && ctx.register;
  useEffect(() => {
    if (!register || !ref.current) return;
    const entry = { el: ref.current, palette };
    return register(entry);
  }, [ref, palette, register]);
}

/**
 * Accessor for the field: the live registry ref plus a version counter that
 * bumps whenever sections register/unregister (so cached offsets recompute).
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useBackdropRegistry() {
  const ctx = useContext(BackdropContext);
  if (ctx) return { registryRef: ctx.registryRef, version: ctx.version };
  return { registryRef: EMPTY_REGISTRY, version: 0 };
}

