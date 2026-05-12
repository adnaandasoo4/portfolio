import { useTheme } from "../utils/theme";

/**
 * Pill button that toggles between light and dark themes.
 * Displays the inverse of the current theme as its label ("Dark" when in light, etc.).
 * Color-flipping circle preview matches the visual pattern from the dvdrod reference.
 */
export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const next = theme === "light" ? "dark" : "light";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${next} mode`}
      className="inline-flex items-center gap-2 rounded-full border border-edge px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper"
    >
      <span
        aria-hidden="true"
        className="block h-2.5 w-2.5 rounded-full"
        style={{
          background:
            "linear-gradient(135deg, var(--ink) 0 50%, var(--bg) 50% 100%)",
          boxShadow: "inset 0 0 0 1px var(--ink)",
        }}
      />
      <span>{next}</span>
    </button>
  );
}
