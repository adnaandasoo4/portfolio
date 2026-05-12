/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  mode: "jit",
  theme: {
    extend: {
      colors: {
        // existing tokens — kept for backward-compat with old section components
        primary: "#050816",
        secondary: "#aaa6c3",
        tertiary: "#151030",
        test: "#0b0b0b",
        "black-100": "#100d25",
        "black-200": "#090325",
        "white-100": "#f3f3f3",
        // new theme-variable-backed tokens (Phase 0)
        ink: "var(--ink)",
        paper: "var(--bg)",
        accent: "var(--accent)",
        edge: "var(--border)",
        muted: "var(--muted)",
      },
      boxShadow: {
        card: "0px 35px 120px -15px #211e35",
      },
      screens: {
        xs: "450px",
      },
      backgroundImage: {
        "hero-pattern": "url('/src/assets/herobg.png')",
      },
      fontFamily: {
        display: ["Azonix", "Geist", "system-ui", "sans-serif"],
        sans: [
          "Geist",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
        // transitional alias so `font-poppins` references in legacy components
        // still resolve to our new sans during Phase 0. Remove when those
        // components are rewritten in later phases.
        poppins: [
          "Geist",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
