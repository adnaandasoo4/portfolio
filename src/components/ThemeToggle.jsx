import { useTheme } from "../utils/theme";

/**
 * Pill button that toggles between light and dark themes.
 * On hover, both the pill colors AND the inner emblem's gradient invert
 * INSTANTLY — no transition, hard color swap — previewing what the theme
 * will look like after the click.
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
        className="ttg-button inline-flex items-center gap-2 rounded-full border border-edge px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-ink hover:border-ink hover:bg-ink hover:text-paper"
      >
        <span aria-hidden="true" className="ttg-emblem block h-2.5 w-2.5 rounded-full" />
        <span>{next}</span>
      </button>
    </>
  );
}
