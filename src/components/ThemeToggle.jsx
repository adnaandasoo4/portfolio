import { useTheme } from "../utils/theme";

/**
 * Pill button that toggles between light and dark themes.
 * On hover, both the pill colors AND the inner emblem's gradient invert
 * over a quick 200ms ease — fast enough to feel responsive, slow enough
 * to read as a deliberate animation rather than a snap.
 */
export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const next = theme === "light" ? "dark" : "light";

  return (
    <>
      <style>{`
        .ttg-emblem {
          background: linear-gradient(135deg, var(--ink) 0 50%, var(--bg) 50% 100%);
          box-shadow: inset 0 0 0 1px var(--ink);
          transition: background 200ms ease-out, box-shadow 200ms ease-out;
        }
        .ttg-button:hover .ttg-emblem {
          background: linear-gradient(135deg, var(--bg) 0 50%, var(--ink) 50% 100%);
          box-shadow: inset 0 0 0 1px var(--bg);
        }
      `}</style>
      <button
        type="button"
        onClick={toggle}
        aria-label={`Switch to ${next} mode`}
        className="ttg-button inline-flex items-center gap-2 rounded-full border border-edge px-3 py-1.5 font-sans text-[10px] uppercase tracking-widest text-ink transition-colors duration-200 ease-out hover:border-ink hover:bg-ink hover:text-paper"
      >
        <span aria-hidden="true" className="ttg-emblem block h-2.5 w-2.5 rounded-full" />
        <span>{next}</span>
      </button>
    </>
  );
}
