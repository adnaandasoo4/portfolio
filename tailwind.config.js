/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  mode: "jit",
  // Makes `hover:` and `group-hover:` variants only fire on devices that
  // actually support hover (mice / trackpads). Touch users never trigger
  // sticky-hover states from a tap.
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      colors: {
        ink: "var(--ink)",
        paper: "var(--bg)",
        accent: "var(--accent)",
        lime: "var(--lime)",
        edge: "var(--border)",
        muted: "var(--muted)",
        flag: "var(--flag)",
      },
      screens: {
        xs: "450px",
      },
      fontFamily: {
        // Headers + big display pieces. Clash Display (heavy + all-caps via the
        // .font-display rule in index.css). Body/small text use `sans` (Manrope).
        display: ["Clash Display", "Manrope", "system-ui", "sans-serif"],
        sans: [
          "Manrope",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
