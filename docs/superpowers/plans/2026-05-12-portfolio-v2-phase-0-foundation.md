# Portfolio v2 — Phase 0: Foundation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up the new visual + motion foundation (theme system, Lenis smooth scroll, GSAP wiring, webfonts, Tailwind tokens, restructured constants) **without touching the existing section components or removing old dependencies**. After this plan lands, the site renders identically to before, but the codebase is ready to host the section rewrites in Phase 1+.

**Architecture:** Additive, alongside the existing code. New utilities live in `src/utils/`; theme state is React-Context-driven; Lenis runs a single instance at app root; GSAP/ScrollTrigger is registered with a `scrollerProxy` that reads scroll position from Lenis. No section components are modified except `SectionWrapper.jsx` (one new no-op prop).

**Tech Stack:** React 18, Vite 4, Tailwind CSS 3, **+ gsap, + lenis** (both added in Task 1). No test framework added — see "Verification approach" below.

---

## Deviation from spec (§5 Phase 0)

The spec lists "old-dep removal" inside Phase 0. **This plan defers that work** to a later cleanup phase. Reason: the existing section components (`Hero.jsx`, `Tech.jsx`, `Works.jsx`, `Contact.jsx`) import from `./canvas/` which transitively imports `three`, `@react-three/fiber`, and `@react-three/drei`. Removing those packages in Phase 0 would break the Vite build, not just runtime. Cleaner sequence: Phase 0 sets up new foundation **alongside** old code → each subsequent section-rewrite phase removes its own dependence on old imports → after Phase 5, a final cleanup commit uninstalls `three`, `@react-three/fiber`, `@react-three/drei`, `maath`, `@emailjs/browser`, `react-tilt`, `react-vertical-timeline-component`.

Practical impact for this plan: keep `package.json` dependencies untouched except for **adding** `gsap` and `lenis`.

## Verification approach

This codebase has **no test framework** today. Adding Vitest + RTL for two utility hooks is YAGNI for a portfolio rewrite. Every task in this plan uses **manual verification via `npm run dev` + browser devtools** as its check, not unit tests. Each task lists exact commands and exact things to look for. If a step's check fails, that's the test-fails moment — fix and re-verify before committing.

---

## File structure

**New files (all under `src/utils/`):**
- `src/utils/theme.js` — `ThemeProvider` component + `useTheme()` hook. Owns light/dark state, persists to `localStorage`, applies `data-theme` attribute to `<html>`.
- `src/utils/lenis.js` — `LenisProvider` component + `useLenis()` hook. Owns the single Lenis instance.
- `src/utils/gsap.js` — Registers `ScrollTrigger` plugin once and wires its `scrollerProxy` to read from a Lenis instance. Exports a `setupGsap(lenisInstance)` function called from `App.jsx`.

**Modified files:**
- `index.html` — preconnects for font CDNs + inline pre-paint script for theme.
- `src/index.css` — replace Poppins font import with Geist + JetBrains Mono + Azonix; add `:root[data-theme="…"]` blocks defining `--bg`, `--ink`, `--accent`, `--border`, `--muted`; update the global `*` rule.
- `tailwind.config.js` — **additively** add new tokens (`ink`, `cream`, `accent`, `border-token`, `muted`) that read from CSS variables. Keep all existing tokens (`primary`, `secondary`, `tertiary`, etc.) intact for backward-compat with old section components.
- `src/App.jsx` — wrap existing tree with `<ThemeProvider><LenisProvider>…</LenisProvider></ThemeProvider>`; call `setupGsap()` in a `useEffect` after Lenis mounts. Do **not** change any visible structure.
- `src/hoc/SectionWrapper.jsx` — add an optional `scrollTriggered` parameter (no-op for now; consumed by later phases).
- `src/constants/index.js` — **additively** export `manifestoBullets`, `personalityPills`, `socials`, `now`. Keep all existing exports.
- `package.json` — `+ gsap`, `+ lenis`.

**Files NOT touched in this phase (deferred to later phases):**
- All section components (`Hero.jsx`, `About.jsx`, `Experience.jsx`, `Tech.jsx`, `Works.jsx`, `Contact.jsx`, `Navbar.jsx`)
- `src/components/canvas/*`
- `src/components/Loader.jsx`
- `src/styles.js` (still used by old section components)
- `src/utils/motion.js` (still used by old section components)
- `public/desktop_pc/`, `public/planet/`

---

## Tasks

### Task 1: Add `gsap` and `lenis` dependencies

**Files:**
- Modify: `package.json` (npm will do this automatically)
- Test: `npm run dev` still starts cleanly

- [ ] **Step 1: Install both packages**

Run from `C:/Users/Adnaan Dasoo/Projects/Portfolio`:
```bash
npm install gsap@^3.12.0 lenis@^1.1.0
```

Expected: npm installs both packages, updates `package.json` `dependencies` and `package-lock.json`.

- [ ] **Step 2: Verify install**

```bash
npm ls gsap lenis
```

Expected output (versions may differ slightly):
```
portfolio@0.0.0
├── gsap@3.12.x
└── lenis@1.1.x
```

- [ ] **Step 3: Smoke test that dev server still starts**

```bash
npm run dev
```

Expected: Vite starts on http://localhost:5173 (or similar), no errors in terminal. Kill with Ctrl+C after confirming.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "Add gsap and lenis dependencies"
```

---

### Task 2: Webfonts in `index.css`

**Files:**
- Modify: `src/index.css` (lines 1–14)

- [ ] **Step 1: Replace the Poppins font import**

Open `src/index.css`. Replace lines 1–14 (everything from `@import url(...Poppins...)` through the closing `}` of the `*` rule) with:

```css
@import url("https://fonts.googleapis.com/css2?family=Geist:wght@400;500;700;900&family=JetBrains+Mono:wght@400;500&display=swap");
@import url("https://fonts.cdnfonts.com/css/azonix");

@tailwind base;
@tailwind components;
@tailwind utilities;

:root[data-theme="light"] {
  --bg: #F2EFE9;
  --ink: #0A0A0A;
  --accent: #3A6B3A;
  --border: rgba(10, 10, 10, 0.18);
  --muted: rgba(10, 10, 10, 0.62);
}

:root[data-theme="dark"] {
  --bg: #0A0A0A;
  --ink: #F2EFE9;
  --accent: #3A6B3A;
  --border: rgba(242, 239, 233, 0.18);
  --muted: rgba(242, 239, 233, 0.62);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Geist", system-ui, -apple-system, sans-serif;
}

html, body {
  background: var(--bg);
  color: var(--ink);
}
```

**Important:** The existing `.hash-span` rule and all `.*-gradient` and `.canvas-loader` rules below line 14 must stay untouched — they're used by old section components.

- [ ] **Step 2: Verify the file**

The rules below line ~40 (i.e., from `.hash-span { ... }` onward) must be unchanged. Open the file and visually confirm.

- [ ] **Step 3: Smoke test**

```bash
npm run dev
```

Open the site in a browser. **Expected:** the page may look slightly off (because the body font is now Geist instead of Poppins and the body background is now cream `#F2EFE9`), but it should still render — Hero, About, Experience, Tech, Works, Contact all visible. **No console errors.** The site WILL look weirder than before because the dark Three.js scenes are now on a cream background; that's expected and gets fixed in Phase 1. Kill the dev server.

- [ ] **Step 4: Commit**

```bash
git add src/index.css
git commit -m "Replace Poppins with Geist/Azonix/JetBrains Mono + add theme CSS variables"
```

---

### Task 3: Theme pre-paint script in `index.html`

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add preconnects and pre-paint script**

Open `index.html`. Replace the entire `<head>` block (lines 3–8) with:

```html
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="/logo.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="preconnect" href="https://fonts.cdnfonts.com" />
    <script>
      // Pre-paint theme to avoid flash. Read localStorage first, fall back to OS preference, default light.
      (function () {
        try {
          var stored = localStorage.getItem("theme");
          var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
          var theme = stored || (prefersDark ? "dark" : "light");
          document.documentElement.setAttribute("data-theme", theme);
        } catch (e) {
          document.documentElement.setAttribute("data-theme", "light");
        }
      })();
    </script>
    <title>Adnaan Dasoo</title>
  </head>
```

- [ ] **Step 2: Smoke test**

```bash
npm run dev
```

Open devtools → Elements panel → inspect `<html>`. **Expected:** `<html>` has a `data-theme` attribute set to either `"light"` or `"dark"` (depending on your OS preference). Open the Console and run:

```js
localStorage.getItem("theme")
```

Expected: `null` (because we haven't written it yet). Now manually set it:

```js
localStorage.setItem("theme", "dark"); location.reload();
```

Expected: page reloads, `<html data-theme="dark">`, and the body background flips to near-black `#0A0A0A` with cream text. Clean up:

```js
localStorage.removeItem("theme"); location.reload();
```

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Add theme pre-paint script + font preconnects to index.html"
```

---

### Task 4: Create `src/utils/theme.js` (ThemeProvider + useTheme)

**Files:**
- Create: `src/utils/theme.js`

- [ ] **Step 1: Write the file**

Create `src/utils/theme.js` with:

```jsx
import { createContext, useCallback, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

function readInitialTheme() {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      window.localStorage.setItem("theme", theme);
    } catch (e) {
      // localStorage may be unavailable (private browsing, etc.). Non-fatal.
    }
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
```

- [ ] **Step 2: Wrap `App` with `ThemeProvider`**

Open `src/App.jsx`. Replace its contents with:

```jsx
import { BrowserRouter } from 'react-router-dom';
import { About, Contact, Experience, Hero, Navbar, Tech, Works, StarsCanvas } from './components';
import { ThemeProvider } from './utils/theme';

const App = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className='relative z-0 bg-test'>
          <div>
            <Navbar />
            <Hero />
          </div>
          <About />
          <Experience />
          <Tech />
          <Works />
          <div className='relative z-0'>
            <Contact />
            <StarsCanvas />
          </div>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
```

(Only change: import `ThemeProvider` and wrap the existing tree. Visible structure untouched.)

- [ ] **Step 3: Smoke test**

```bash
npm run dev
```

In the browser console:

```js
// Should error — there's no toggle UI yet, so we test via the React DevTools or directly via the attribute
document.documentElement.getAttribute("data-theme");
```

Expected: `"light"` (or `"dark"` if your OS prefers dark). Set it explicitly to test persistence:

```js
localStorage.setItem("theme", "dark"); location.reload();
```

Expected: page reloads with `data-theme="dark"`. Reload again without changing anything — `data-theme="dark"` persists. Clean up:

```js
localStorage.removeItem("theme"); location.reload();
```

- [ ] **Step 4: Commit**

```bash
git add src/utils/theme.js src/App.jsx
git commit -m "Add ThemeProvider + useTheme hook, mount in App"
```

---

### Task 5: Update `tailwind.config.js` with theme-variable tokens

**Files:**
- Modify: `tailwind.config.js`

- [ ] **Step 1: Add new tokens additively**

Open `tailwind.config.js`. Replace the entire file contents with:

```js
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
        cream: "var(--bg)",
        accent: "var(--accent)",
        "border-token": "var(--border)",
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
        sans: ["Geist", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
```

(Changes: added `ink`, `cream`, `accent`, `border-token`, `muted` color tokens that read from CSS variables; added `fontFamily` entries for `font-display`, `font-sans`, `font-mono`. Existing tokens left intact.)

- [ ] **Step 2: Smoke test**

```bash
npm run dev
```

Open the browser console and run:

```js
const el = document.createElement("div");
el.className = "bg-cream text-ink p-4";
el.textContent = "tailwind theme tokens work";
document.body.prepend(el);
```

Expected: a cream-background, near-black text element appears at the top of the page. (Don't worry that it clashes with the rest of the page — this is just a sanity check.) Refresh to clean it up.

Also verify the font tokens compile. Run:

```js
const f = document.createElement("div");
f.className = "font-display text-4xl";
f.textContent = "ADNAAN";
document.body.prepend(f);
```

Expected: large bold-feeling type rendered in Azonix (all-caps geometric). If you see system-ui instead, the font CDN may not have loaded yet — wait 5 seconds and inspect again.

- [ ] **Step 3: Commit**

```bash
git add tailwind.config.js
git commit -m "Add theme-variable tokens and font-family entries to Tailwind config"
```

---

### Task 6: Create `src/utils/lenis.js` (LenisProvider + useLenis)

**Files:**
- Create: `src/utils/lenis.js`

- [ ] **Step 1: Write the file**

Create `src/utils/lenis.js` with:

```jsx
import { createContext, useContext, useEffect, useRef, useState } from "react";
import Lenis from "lenis";

const LenisContext = createContext(null);

export function LenisProvider({ children }) {
  const lenisRef = useRef(null);
  const [lenis, setLenis] = useState(null);

  useEffect(() => {
    const instance = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = instance;
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
      lenisRef.current = null;
      setLenis(null);
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}

export function useLenis() {
  return useContext(LenisContext);
}
```

- [ ] **Step 2: Wrap `App` with `LenisProvider`**

Open `src/App.jsx` and update to:

```jsx
import { BrowserRouter } from 'react-router-dom';
import { About, Contact, Experience, Hero, Navbar, Tech, Works, StarsCanvas } from './components';
import { ThemeProvider } from './utils/theme';
import { LenisProvider } from './utils/lenis';

const App = () => {
  return (
    <ThemeProvider>
      <LenisProvider>
        <BrowserRouter>
          <div className='relative z-0 bg-test'>
            <div>
              <Navbar />
              <Hero />
            </div>
            <About />
            <Experience />
            <Tech />
            <Works />
            <div className='relative z-0'>
              <Contact />
              <StarsCanvas />
            </div>
          </div>
        </BrowserRouter>
      </LenisProvider>
    </ThemeProvider>
  )
}

export default App
```

- [ ] **Step 3: Smoke test scroll feel**

```bash
npm run dev
```

In the browser, scroll the page using mouse wheel and trackpad. Expected: scroll feels noticeably smoother / dampened compared to native scroll. Scroll-to-anchor (clicking a navbar link) should also feel smoothly eased. **No console errors.**

Also delete the existing `scroll-behavior: smooth;` line if you accidentally re-added one (we removed it in Task 2, but double-check `src/index.css` line ~11 in case it crept back).

- [ ] **Step 4: Commit**

```bash
git add src/utils/lenis.js src/App.jsx
git commit -m "Add LenisProvider for app-wide smooth scroll"
```

---

### Task 7: Create `src/utils/gsap.js` (ScrollTrigger + Lenis scrollerProxy)

**Files:**
- Create: `src/utils/gsap.js`

- [ ] **Step 1: Write the file**

Create `src/utils/gsap.js` with:

```js
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

/**
 * Wire GSAP ScrollTrigger to read scroll position from Lenis instead of native window scroll.
 * Call once when a Lenis instance becomes available.
 *
 * Returns a cleanup function that unwires the proxy.
 */
export function setupGsap(lenis) {
  if (!lenis) return () => {};
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }

  ScrollTrigger.scrollerProxy(document.body, {
    scrollTop(value) {
      if (arguments.length) {
        lenis.scrollTo(value, { immediate: true });
      }
      return lenis.scroll;
    },
    getBoundingClientRect() {
      return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
    },
  });

  const onScroll = () => ScrollTrigger.update();
  lenis.on("scroll", onScroll);

  ScrollTrigger.defaults({ scroller: document.body });
  ScrollTrigger.refresh();

  return () => {
    lenis.off("scroll", onScroll);
    ScrollTrigger.killAll();
  };
}

export { gsap, ScrollTrigger };
```

- [ ] **Step 2: Wire `setupGsap` in `App.jsx`**

Open `src/App.jsx`. Update to:

```jsx
import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { About, Contact, Experience, Hero, Navbar, Tech, Works, StarsCanvas } from './components';
import { ThemeProvider } from './utils/theme';
import { LenisProvider, useLenis } from './utils/lenis';
import { setupGsap } from './utils/gsap';

function GsapBootstrap() {
  const lenis = useLenis();
  useEffect(() => {
    if (!lenis) return;
    const cleanup = setupGsap(lenis);
    return cleanup;
  }, [lenis]);
  return null;
}

const App = () => {
  return (
    <ThemeProvider>
      <LenisProvider>
        <GsapBootstrap />
        <BrowserRouter>
          <div className='relative z-0 bg-test'>
            <div>
              <Navbar />
              <Hero />
            </div>
            <About />
            <Experience />
            <Tech />
            <Works />
            <div className='relative z-0'>
              <Contact />
              <StarsCanvas />
            </div>
          </div>
        </BrowserRouter>
      </LenisProvider>
    </ThemeProvider>
  )
}

export default App
```

- [ ] **Step 3: Smoke test that GSAP is wired without errors**

```bash
npm run dev
```

Open the site. **Expected:** site renders identically, no console errors. In console run:

```js
window.ScrollTrigger ? "loaded" : "not loaded";
```

Expected: `"loaded"` (GSAP registers ScrollTrigger globally as a side effect of `gsap.registerPlugin`).

Try a tiny live ScrollTrigger to confirm the proxy works. Paste in console:

```js
const st = ScrollTrigger.create({
  trigger: document.body,
  start: "top top",
  end: "bottom bottom",
  scrub: true,
  onUpdate: (self) => console.log("progress:", self.progress.toFixed(2))
});
```

Now scroll the page. Expected: console logs progressing from 0.00 to 1.00 as you scroll. Clean up:

```js
st.kill();
```

- [ ] **Step 4: Commit**

```bash
git add src/utils/gsap.js src/App.jsx
git commit -m "Register GSAP ScrollTrigger with Lenis scrollerProxy"
```

---

### Task 8: Augment `SectionWrapper` with `scrollTriggered` prop

**Files:**
- Modify: `src/hoc/SectionWrapper.jsx`

- [ ] **Step 1: Update the HOC**

Open `src/hoc/SectionWrapper.jsx`. Replace contents with:

```jsx
import { motion } from "framer-motion";

import { styles } from "../styles";
import { staggerContainer } from "../utils/motion";

/**
 * Wraps a section component with the shared motion + padding shell.
 *
 * @param {React.ComponentType} Component
 * @param {string} idName - anchor id for in-page navigation
 * @param {object} [options]
 * @param {boolean} [options.scrollTriggered=false] - When true, this section opts out
 *   of Framer Motion reveal variants because the inner component drives its own
 *   GSAP ScrollTrigger animations (used by SelectedWork in a later phase). The
 *   outer <section> is still rendered, just without the FM viewport reveal.
 */
const SectionWrapper = (Component, idName, options = {}) => {
  const { scrollTriggered = false } = options;

  return function HOC() {
    const motionProps = scrollTriggered
      ? {}
      : {
          variants: staggerContainer(),
          initial: "hidden",
          whileInView: "show",
          viewport: { once: true, amount: 0.25 },
        };

    return (
      <motion.section
        {...motionProps}
        className={`${styles.padding} max-w-7xl mx-auto relative z-0`}
      >
        <span className='hash-span' id={idName}>
          &nbsp;
        </span>

        <Component />
      </motion.section>
    );
  };
};

export default SectionWrapper;
```

- [ ] **Step 2: Verify backward-compat**

```bash
npm run dev
```

Open the site. **Expected:** every section still uses the Framer Motion stagger-in behavior exactly as before — because no caller passes `{ scrollTriggered: true }` yet. The `options` parameter is optional with a default, so all existing `SectionWrapper(MyComponent, "id")` calls work unchanged.

Scroll through the page and confirm each section reveals on scroll-in as before. **No console errors.**

- [ ] **Step 3: Commit**

```bash
git add src/hoc/SectionWrapper.jsx
git commit -m "Add scrollTriggered option to SectionWrapper HOC (no-op until Phase 5)"
```

---

### Task 9: Add new content exports to `src/constants/index.js`

**Files:**
- Modify: `src/constants/index.js`

- [ ] **Step 1: Append new exports**

Open `src/constants/index.js`. **Do not modify** any existing export. At the end of the file, after the current `export { services, technologies, experiences, projects };` line, add:

```js

// ----------------------------------------------------------------------------
// New exports introduced by Phase 0 of the v2 redesign.
// These are consumed by section components that get rewritten in Phase 1+.
// Placeholder content is in place; real content lands during each phase's
// content gate (see docs/superpowers/specs/2026-05-12-portfolio-redesign-design.md §5).
// ----------------------------------------------------------------------------

export const manifestoBullets = [
  "Motion",
  "Scroll-driven UI",
  "WebGL",
  "Design systems",
];

export const personalityPills = [
  "GSAP",
  "React",
  "WebGL",
  "Design Engineering",
  "Good vibes",
];

export const socials = [
  { name: "Email", url: "mailto:adasoo747@gmail.com" },
  { name: "GitHub", url: "https://github.com/adnaandasoo4" },
  { name: "LinkedIn", url: "https://linkedin.com/in/" },
];

export const now = {
  label: "Now",
  body: "Currently building portfolio.v2 — shipping motion-led case studies for selected work.",
};
```

- [ ] **Step 2: Verify imports work**

```bash
npm run dev
```

Open the site. **Expected:** no console errors. In console verify the new exports load by running:

```js
import("/src/constants/index.js").then(m => console.log({
  hasManifesto: Array.isArray(m.manifestoBullets),
  hasPills: Array.isArray(m.personalityPills),
  hasSocials: Array.isArray(m.socials),
  hasNow: typeof m.now === "object" && m.now !== null
}));
```

Expected: `{ hasManifesto: true, hasPills: true, hasSocials: true, hasNow: true }`.

- [ ] **Step 3: Commit**

```bash
git add src/constants/index.js
git commit -m "Add manifestoBullets, personalityPills, socials, now exports for v2 redesign"
```

---

### Task 10: Final smoke test of Phase 0

**Files:**
- None modified — verification only.

- [ ] **Step 1: Hard-reload and walk through the site**

```bash
npm run dev
```

Open the site in a clean browser tab (or hard-reload, Ctrl+Shift+R). Walk through these checks in order:

1. **No console errors or warnings.** (Open devtools Console.)
2. **`<html data-theme="…">` is set before paint.** Inspect `<html>` in Elements panel — it has `data-theme="light"` or `"dark"`.
3. **Theme toggle works programmatically.** In console: `localStorage.setItem("theme","dark"); location.reload();` — page reloads dark. `localStorage.removeItem("theme"); location.reload();` — back to default.
4. **Lenis is mounted.** Scroll the page with mouse wheel — feels smoothly eased compared to native scroll.
5. **GSAP ScrollTrigger is registered.** In console: `typeof ScrollTrigger`. Expected: `"function"`.
6. **All sections render and animate on scroll-in as before.** Hero, About, Experience, Tech, Works, Contact — each should fade/stagger in when scrolled into view (unchanged from before the plan).
7. **All anchor nav still works.** Clicking a navbar link smoothly scrolls to the section.
8. **Font tokens compile.** In console: `getComputedStyle(document.body).fontFamily`. Expected: starts with `"Geist"`.

If any check fails, fix it before moving on. If all pass, you're done with Phase 0.

- [ ] **Step 2: Verify deps are correct**

```bash
npm ls gsap lenis
```

Expected: both listed with no peer-dep warnings about them.

```bash
git log --oneline -10
```

Expected: 9 new commits on `portfolio_testing` since the spec commit (`628ce5d`), one per task above.

- [ ] **Step 3: Final commit (only if the smoke test caught and fixed anything)**

If you had to fix anything during Step 1, commit it now:

```bash
git add -A
git commit -m "Phase 0 final smoke test fixes"
```

Otherwise, skip this step — Phase 0 is done.

---

## Out of scope for this plan (deferred to later phases)

- **Removing** `three`, `@react-three/fiber`, `@react-three/drei`, `maath`, `@emailjs/browser`, `react-tilt`, `react-vertical-timeline-component`. These come out in a cleanup phase after Phase 5 when no component imports them.
- The `ThemeToggle` UI component (the "DARK" pill). Built in Phase 1 alongside the new Hero.
- Self-hosting Azonix in `public/fonts/`. Deferred — using `fonts.cdnfonts.com` is fine for development; we'll self-host before a real deploy.
- Rewriting any section component (`Hero.jsx`, `About.jsx`, etc.). Each is rewritten in its own phase.
- Removing the `Poppins`-era CSS gradient utility classes from `src/index.css`. Still used by old section components.
- Removing or restructuring `src/styles.js` and `src/utils/motion.js`. Still consumed by old section components.

## Self-review

**Spec coverage check** (against §4 of the spec):
- Theme system (light/dark with persistence + pre-paint) → Tasks 3, 4 ✓
- CSS custom properties for `--bg`, `--ink`, `--accent`, `--border`, `--muted` → Task 2 ✓
- Tailwind tokens reading from CSS variables → Task 5 ✓
- Geist, Azonix, JetBrains Mono webfonts → Task 2 ✓
- Lenis at app root, single instance → Task 6 ✓
- GSAP + ScrollTrigger with `scrollerProxy` reading from Lenis → Task 7 ✓
- `SectionWrapper` accepts optional `scrollTriggered` prop → Task 8 ✓
- `constants/index.js` adds `manifestoBullets`, `personalityPills`, `socials`, `now` → Task 9 ✓
- `services`/`projects` rename/drop → **deferred** (consumers still exist; documented in "Out of scope")
- Dep removal of `@emailjs/browser`, `three`, `@react-three/*`, `maath`, `react-tilt`, `react-vertical-timeline-component` → **deferred** (consumers still exist; documented in "Deviation from spec")
- New section components (`HeroDecoder`, `SelectedWork`, etc.) → **not in this plan**, owned by Phase 1+

**Placeholder scan:** All code blocks contain full, runnable code. All commands are concrete. No "TBD" or "implement later" remain.

**Type consistency:**
- `ThemeProvider` / `useTheme` defined in Task 4, consumed in Task 4 Step 2. ✓
- `LenisProvider` / `useLenis` defined in Task 6, consumed in Task 6 Step 2 and Task 7 Step 2. ✓
- `setupGsap(lenis)` defined in Task 7 Step 1, called in Task 7 Step 2. ✓
- `manifestoBullets`, `personalityPills`, `socials`, `now` exported from `constants/index.js` in Task 9; consumed by Phase 1+ section rewrites (not in this plan). ✓
- `scrollTriggered` option signature on `SectionWrapper` matches in Task 8 between definition and the "documented for Phase 5" usage note. ✓
