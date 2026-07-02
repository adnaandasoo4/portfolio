import { createContext, useContext, useEffect, useState } from "react";
import { setDarkPalette } from "../components/canvas/topoShader";

const PALETTE_IDS = ["green", "sage", "oxblood", "blue", "graphite", "onyx"];

const PaletteContext = createContext(null);

/**
 * Holds the active color palette and applies it two ways:
 *   - sets `data-palette` on <html> so the CSS accent/chrome vars switch
 *     (see the :root[data-palette=…] blocks in index.css),
 *   - calls setDarkPalette() so the WebGL topographic field's dark colors
 *     switch (read live by the field's rAF loop — no GL re-init).
 * Choice persists in localStorage.
 */
export function PaletteProvider({ children }) {
  const [palette, setPalette] = useState(() => {
    try {
      const stored = window.localStorage.getItem("palette");
      return PALETTE_IDS.includes(stored) ? stored : "green";
    } catch {
      return "green";
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-palette", palette);
    setDarkPalette(palette);
    try {
      window.localStorage.setItem("palette", palette);
    } catch {
      // localStorage unavailable — non-fatal.
    }
  }, [palette]);

  return (
    <PaletteContext.Provider value={{ palette, setPalette }}>
      {children}
    </PaletteContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePalette() {
  return useContext(PaletteContext);
}
