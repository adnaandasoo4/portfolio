# Portfolio v2 — Phase 6: Final Cleanup — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove all orphan code, deps, and assets accumulated across Phases 0–5. Pure deletion / shrink work — no new features, no behavior changes. After this lands, the codebase contains only what the live site actually uses.

**Architecture:** Mechanical sweep. Targets were pre-verified via grep: no live consumers for the legacy Tailwind color tokens, the 8 gradient utility classes in `index.css`, the 4 unused Framer Motion variants (`textVariant`, `fadeIn`, `zoomIn`, `slideIn`), the `services` const + its 4 PNG imports in `constants/index.js`, the `font-poppins` Tailwind shim, the `boxShadow.card` + `hero-pattern` Tailwind entries, the legacy `src/styles.js` helpers beyond `padding`, or the entire `src/assets/` directory after constants stops importing from it.

**Tech Stack:** No changes — just removing things from the existing React 18 + Vite 4 + Tailwind 3 + GSAP + Lenis + Framer Motion stack.

---

## Out of scope for this plan

- Adding the `tech` nav-link entry, fixing the navbar's anchor mapping, cursor follower pill, broader `prefers-reduced-motion` coverage, HeroDecoder a11y aria-label — those are polish items deferred per prior reviews.
- Content updates (real project entries, manifesto copy, footer copyright year, etc.) — user-driven via constants edits anytime.
- Deployment — separate workflow after this phase merges.

## Verification approach

Same as prior phases: no test framework. Every task verifies via `npm run dev` AND `npm run build` (both must pass), since this is a deletion phase where build errors are the canary for "this thing was still consumed."

---

## File structure

**Deleted entirely:**
- `src/styles.js` — only `styles.padding` was consumed; inlined into SectionWrapper.
- `src/assets/` directory and everything in it (`src/assets/index.js`, all PNG/SVG files, `company/` subdir, `tech/` subdir). After Task 3, no `import from "../assets"` remains anywhere in src.

**Modified files:**
- `src/utils/motion.js` — drop `textVariant`, `fadeIn`, `zoomIn`, `slideIn` (orphan). Keep `staggerContainer`, `easeStandard`, `revealVariant`.
- `src/hoc/SectionWrapper.jsx` — drop the `import { styles }` line; inline the `styles.padding` value as a literal class string.
- `src/constants/index.js` — drop the entire `import { ... } from "../assets"` block; drop the `services` const declaration; drop `services` from the existing `export { services, technologies, experiences, projects };` line.
- `tailwind.config.js` — drop legacy color tokens (`primary`, `secondary`, `tertiary`, `test`, `black-100`, `black-200`, `white-100`), drop `boxShadow.card`, drop `backgroundImage["hero-pattern"]`, drop `fontFamily.poppins` shim.
- `src/index.css` — drop the 8 gradient utility classes (`.black-gradient`, `.violet-gradient`, `.orange-gradient`, `.green-pink-gradient`, `.orange-text-gradient`, `.green-text-gradient`, `.blue-text-gradient`, `.pink-text-gradient`).

**Files NOT touched:**
- All section components (Hero, Navbar, Manifesto, Experience, Tech, SelectedWork, Contact, ThemeToggle, Now, HeroDecoder)
- All utility files except motion.js (theme.jsx, lenis.jsx, gsap.js stay)
- App.jsx, main.jsx, index.html
- package.json / package-lock.json (no dep changes — everything that can be uninstalled has been)
- `public/` directory (the Azonix font self-hosted in `public/fonts/azonix/` stays)

---

## Tasks

### Task 1: Drop unused Framer Motion variants

**Files:**
- Modify: `src/utils/motion.js`

- [ ] **Step 1: Replace the file contents**

Open `src/utils/motion.js`. The file currently exports 7 things: `textVariant`, `fadeIn`, `zoomIn`, `slideIn`, `staggerContainer`, `easeStandard`, `revealVariant`. The first 4 are no longer consumed by any active component (verified via grep before this plan was written). Drop them.

Replace the ENTIRE file contents with EXACTLY:

```js
export const staggerContainer = (staggerChildren, delayChildren) => {
  return {
    hidden: {},
    show: {
      transition: {
        staggerChildren: staggerChildren,
        delayChildren: delayChildren || 0,
      },
    },
  };
};

// Shared reveal-on-scroll variant used by Manifesto, Experience, and future
// typographic sections. `custom` is interpreted as a delay (seconds), so each
// motion child can stagger itself without parent stagger config.
export const easeStandard = [0.65, 0, 0.35, 1];

export const revealVariant = {
  hidden: { opacity: 0, y: 12 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeStandard, delay },
  }),
};
```

- [ ] **Step 2: Smoke test (Bash, NOT PowerShell)**

```bash
npm run dev
```
(`run_in_background: true`, wait ~3s, confirm "ready in" with NO "is not exported" errors, kill)

```bash
npm run build
```

Both must pass. If anything fails with `"textVariant"`/`"fadeIn"`/`"zoomIn"`/`"slideIn"` is not exported, a consumer was missed — restore the corresponding function and report BLOCKED so the grep can be rerun.

- [ ] **Step 3: Commit**

```bash
git add src/utils/motion.js
git commit -m "Drop unused Framer Motion variants (textVariant, fadeIn, zoomIn, slideIn)"
```

---

### Task 2: Inline `styles.padding` into SectionWrapper, delete `src/styles.js`

**Files:**
- Modify: `src/hoc/SectionWrapper.jsx`
- Delete: `src/styles.js`

- [ ] **Step 1: Update `src/hoc/SectionWrapper.jsx`**

The file currently imports `styles` from `"../styles"` and uses `${styles.padding}` in the className computation. Replace the file with EXACTLY:

```jsx
import { motion } from "framer-motion";

import { staggerContainer } from "../utils/motion";

/**
 * Wraps a section component with the shared motion + padding shell.
 *
 * @param {React.ComponentType} Component
 * @param {string} idName - anchor id for in-page navigation
 * @param {object} [options]
 * @param {boolean} [options.scrollTriggered=false] - When true, this section opts out
 *   of Framer Motion reveal variants because the inner component drives its own
 *   GSAP ScrollTrigger animations (used by SelectedWork). The outer <section> is
 *   still rendered, just without the FM viewport reveal.
 * @param {boolean} [options.fullBleed=false] - When true, drops `max-w-7xl mx-auto`
 *   and the shared horizontal/vertical padding so the section can span the full
 *   viewport. Used by SelectedWork whose slides are `w-screen` each.
 */
const SectionWrapper = (Component, idName, options) => {
  const { scrollTriggered = false, fullBleed = false } = options ?? {};

  return function HOC() {
    const motionProps = scrollTriggered
      ? {}
      : {
          variants: staggerContainer(),
          initial: "hidden",
          whileInView: "show",
          viewport: { once: true, amount: 0.25 },
        };

    const className = fullBleed
      ? "relative z-0"
      : "sm:px-16 px-6 sm:py-16 py-10 max-w-7xl mx-auto relative z-0";

    return (
      <motion.section {...motionProps} className={className}>
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

Changes from current:
- Removed `import { styles } from "../styles";`
- Replaced `` `${styles.padding} max-w-7xl mx-auto relative z-0` `` with the literal class string `"sm:px-16 px-6 sm:py-16 py-10 max-w-7xl mx-auto relative z-0"` (exact equivalent — the `styles.padding` value was `"sm:px-16 px-6 sm:py-16 py-10"`).

- [ ] **Step 2: Delete `src/styles.js`**

```bash
rm src/styles.js
```

- [ ] **Step 3: Verify no other consumer**

```bash
grep -rln "from ['\"]\.\./styles['\"]\|from ['\"]\.\./\.\./styles['\"]\|from ['\"]\./styles['\"]" src/ 2>/dev/null || echo "no remaining imports of styles"
```

Expected: `no remaining imports of styles`.

- [ ] **Step 4: Smoke test (Bash)**

```bash
npm run dev
```
(`run_in_background: true`, wait ~3s, confirm "ready in", kill)

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add src/hoc/SectionWrapper.jsx src/styles.js
git commit -m "Inline styles.padding into SectionWrapper; delete src/styles.js"
```

(Git registers the deletion when `git add src/styles.js` references the now-gone path.)

---

### Task 3: Clean `src/constants/index.js` — drop assets import + services

**Files:**
- Modify: `src/constants/index.js`

- [ ] **Step 1: Drop the assets import block at the top**

Open `src/constants/index.js`. The file currently begins with:

```js
import {
  mobile,
  backend,
  creator,
  web,
  meta,
  starbucks,
  tesla,
} from "../assets";

import {
  SiHtml5,
  ...
```

Remove the ENTIRE first `import { ... } from "../assets";` block (lines 1–9). The file should now begin directly with the `react-icons/si` import block:

```js
import {
  SiHtml5,
  SiCss,
  SiJavascript,
  SiTypescript,
  SiReact,
  SiRedux,
  SiTailwindcss,
  SiNodedotjs,
  SiMongodb,
  SiThreedotjs,
  SiGit,
  SiFigma,
  SiDocker,
} from "react-icons/si";
```

- [ ] **Step 2: Drop the `services` const**

In `src/constants/index.js`, find the `const services = [...]` block (it appears immediately after `navLinks`, around lines 34–47 of the modified file). It looks like this:

```js
const services = [
  {
    title: "Fullstack Developer",
    icon: web,
  },
  {
    title: "Web Developer",
    icon: mobile,
  },
  {
    title: "React Developer",
    icon: backend,
  },
  {
    title: "UI / UX Enthusiast",
    icon: creator,
  },
];
```

Delete that entire `const services = [...];` block (including the leading blank line and the closing `];`).

- [ ] **Step 3: Drop `services` from the export statement**

Find the line `export { services, technologies, experiences, projects };` (will be around line 130 after the prior deletions). Replace with EXACTLY:

```js
export { technologies, experiences, projects };
```

(Only `services` is removed from the named-export list.)

- [ ] **Step 4: Smoke test (Bash)**

```bash
npm run dev
```
(`run_in_background: true`, wait ~3s, confirm "ready in" with NO "failed to resolve" or "is not exported" errors, kill)

```bash
npm run build
```

Both must pass. If anything errors referencing `mobile`/`backend`/`creator`/`web`/`meta`/`starbucks`/`tesla` from constants, restore that one and report BLOCKED.

- [ ] **Step 5: Commit**

```bash
git add src/constants/index.js
git commit -m "Drop services const + assets import block from constants (all orphan)"
```

---

### Task 4: Clean `tailwind.config.js` — drop legacy tokens

**Files:**
- Modify: `tailwind.config.js`

- [ ] **Step 1: Replace the file**

Open `tailwind.config.js`. Replace the ENTIRE file contents with EXACTLY:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  mode: "jit",
  theme: {
    extend: {
      colors: {
        ink: "var(--ink)",
        paper: "var(--bg)",
        accent: "var(--accent)",
        edge: "var(--border)",
        muted: "var(--muted)",
      },
      screens: {
        xs: "450px",
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
      },
    },
  },
  plugins: [],
};
```

Changes from current:
- Removed legacy color tokens: `primary`, `secondary`, `tertiary`, `test`, `black-100`, `black-200`, `white-100` (no consumers in src/)
- Removed entire `boxShadow.card` block (no consumers)
- Removed entire `backgroundImage["hero-pattern"]` block (no consumers, plus the referenced asset is being deleted in Task 6)
- Removed `fontFamily.poppins` transitional shim (no `font-poppins` class consumers — verified via grep)
- Removed the inline comments distinguishing "legacy" vs "Phase 0" tokens (now there's only one tier)
- Kept: 5 theme-variable-backed color tokens, `screens.xs`, the three fontFamily entries (`display`, `sans`, `mono`)

- [ ] **Step 2: Smoke test (Bash)**

```bash
npm run dev
```
(`run_in_background: true`, wait ~3s, confirm "ready in", kill)

```bash
npm run build
```

Both must pass. If any class like `bg-primary`/`text-secondary`/`bg-tertiary`/`bg-test`/`shadow-card`/`bg-hero-pattern`/`font-poppins` still appears in a rendered component, Vite/Tailwind won't error (Tailwind just won't generate the rule), but the visual will be broken. Visually verify via Task 7's manual checklist.

- [ ] **Step 3: Commit**

```bash
git add tailwind.config.js
git commit -m "Drop legacy Tailwind tokens (legacy colors, card shadow, hero-pattern, poppins shim)"
```

---

### Task 5: Clean `src/index.css` — drop gradient utility classes

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Replace the file**

Open `src/index.css`. The file currently has the webfont imports, theme CSS variables, base reset, and 8 gradient utility classes that were used by the old (now-rewritten) About + Works + Experience components. Replace the ENTIRE file contents with EXACTLY:

```css
@import url("https://fonts.googleapis.com/css2?family=Geist:wght@400;500;700;900&family=JetBrains+Mono:wght@400;500&display=swap");

@font-face {
  font-family: 'Azonix';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: local('Azonix'), url('/fonts/azonix/Azonix.woff') format('woff');
}

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
}

html, body {
  background: var(--bg);
  color: var(--ink);
  font-family: "Geist", system-ui, -apple-system, sans-serif;
  overflow-x: hidden;
}

.hash-span {
  margin-top: -100px;
  padding-bottom: 100px;
  display: block;
}
```

Changes from current:
- Removed: `.black-gradient`, `.violet-gradient`, `.orange-gradient`, `.green-pink-gradient`, `.orange-text-gradient`, `.green-text-gradient`, `.blue-text-gradient`, `.pink-text-gradient`
- Kept: Google Fonts import, Azonix `@font-face`, Tailwind directives, theme CSS variables, universal reset, `html, body` declarations, `.hash-span` (used by SectionWrapper for anchor offset)

- [ ] **Step 2: Smoke test (Bash)**

```bash
npm run dev
```
(`run_in_background: true`, wait ~3s, confirm "ready in", kill)

```bash
npm run build
```

Both must pass. Any rendered component using a `.*-gradient` class would now show no background — visually verify via Task 7.

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "Drop 8 unused gradient utility classes from index.css"
```

---

### Task 6: Delete `src/assets/` directory entirely

**Files:**
- Delete: `src/assets/` (entire directory tree)

- [ ] **Step 1: Verify nothing imports from assets anymore**

```bash
grep -rln "from ['\"]\.\.\/assets\|from ['\"]\.\.\/\.\.\/assets\|from ['\"]\./assets" src/ 2>/dev/null || echo "no remaining imports of ../assets"
```

Expected: `no remaining imports of ../assets`. (Task 3 dropped the last consumer in `constants/index.js`.)

If anything is found, STOP and report — Task 3 missed a consumer.

- [ ] **Step 2: Delete the directory**

```bash
rm -rf src/assets
```

Verify:

```bash
ls src/assets 2>&1 | head -1
```

Expected: "No such file or directory" (or similar shell-specific phrasing).

- [ ] **Step 3: Smoke test (Bash)**

```bash
npm run dev
```
(`run_in_background: true`, wait ~3s, confirm "ready in" with NO "failed to resolve" errors, kill)

```bash
npm run build
```

Both must pass. If anything errors with a path containing `assets/`, Task 3 missed a consumer — restore the directory and report BLOCKED.

- [ ] **Step 4: Commit**

```bash
git add -A src/assets
git commit -m "Delete src/assets/ directory (no remaining consumers)"
```

(`-A` for the whole directory deletion, since `git add` of a deleted path registers the removal of every file in it.)

---

### Task 7: Phase 6 final smoke test

**Files:**
- None modified — verification only.

- [ ] **Step 1: Automated checks (Bash)**

```bash
npm run dev
```
(`run_in_background: true`, wait ~5s, confirm "ready in" + local URL with no errors, kill)

```bash
npm run build
```

Expected: clean build. Bundle should be approximately the same as Phase 5 (~417 KB raw / ~145 KB gzipped) — this phase removes source code + unbundled assets, not runtime deps, so the JS bundle barely moves. The win is repo cleanliness, not bundle size.

```bash
ls src/assets 2>&1 | head -1
ls src/styles.js 2>&1 | head -1
```
Expected: both report "No such file or directory".

```bash
grep -rln "textVariant\|fadeIn\|zoomIn\|slideIn\|bg-test\|primary\|tertiary\|black-100\|black-200\|white-100\|font-poppins\|shadow-card\|hero-pattern\|black-gradient\|violet-gradient\|orange-gradient\|green-pink-gradient\|orange-text-gradient\|green-text-gradient\|blue-text-gradient\|pink-text-gradient\|from ['\"]\.\.\/assets\|from ['\"]\.\.\/\.\.\/assets" src/ 2>/dev/null
```
Expected: no matches. (One acceptable hit would be a non-code string literal, but at this point there shouldn't be any.)

```bash
grep -rln "services" src/constants/index.js 2>/dev/null
```
Expected: no matches (or one acceptable match if the string `"services"` appears in description text — unlikely).

```bash
git log --oneline portfolio_testing -10
```
Expected: 6 Phase 6 implementation commits + the Phase 6 plan commit, on top of Phase 5's last commit (`e6f3060`).

```bash
git status --short
```
Expected: only `.claude/` and `CLAUDE.md` (pre-existing untracked).

- [ ] **Step 2: Surface manual browser checklist**

Report verbatim:

```
## User browser verification (Phase 6)

Open the dev server URL in a fresh tab. Hard-reload (Ctrl+Shift+R).

1. Console: free of red errors.
2. Every section renders exactly the same as it did before this phase started:
   - Hero with the Azonix-decoded name, subtitle, location, availability pill, Now card
   - Sticky Navbar with logo + about/experience/projects nav + DARK toggle
   - Manifesto with "01 — INDEX" label + intro paragraph + pills
   - Experience with "02 — EXPERIENCE" label + 3 hover-expand rows
   - Tech with "03 — STACK" label + grid of monochrome SVG icons
   - Selected Work with "04 — SELECTED WORK" label + pinned horizontal scroll set-piece (desktop) / vertical snap stack (mobile)
   - Footer with personality pills + Azonix uppercase CTA + email/location/socials/copyright
3. Theme toggle (DARK pill in navbar) flips light/dark — all sections theme correctly.
4. Anchor links in the nav scroll smoothly to each section.
5. No visual regressions — gradient backgrounds, multicolor borders, Tilt cards,
   bullet lists, or anything else that the old design used should be completely gone.
   If anything looks "broken" (e.g., a div with no background where there used to be
   a gradient), that signals a consumer of one of the dropped classes was missed —
   report which section.
```

- [ ] **Step 3: If anything fails — fix and commit**

If something breaks, fix it and commit:

```bash
git add <files>
git commit -m "Phase 6 final smoke test fixes"
```

Otherwise no further commit — Phase 6 is complete.

---

## Self-review

**Spec coverage check** (against the "what's left" inventory):

- ✓ Drop legacy Tailwind color tokens — Task 4
- ✓ Drop `boxShadow.card`, `hero-pattern`, `font-poppins` shim — Task 4
- ✓ Drop 8 gradient utility classes from `index.css` — Task 5
- ✓ Drop unused Framer Motion variants (`textVariant`, `fadeIn`, `zoomIn`, `slideIn`) — Task 1
- ✓ Shrink/eliminate `src/styles.js` — Task 2 (deleted; `padding` inlined into SectionWrapper)
- ✓ Drop `services` const + asset imports from `constants/index.js` — Task 3
- ✓ Delete orphan asset files on disk — Task 6 (entire directory)

**Placeholder scan:** Every code block is complete and runnable. Every command has expected output. No "TBD", "implement later", or "similar to Task N" markers.

**Type consistency:**
- `SectionWrapper`'s computed `className` after Task 2 produces a string identical in tokens to what `styles.padding + ...` previously produced. ✓
- `motion.js` after Task 1 still exports `staggerContainer` (consumed by SectionWrapper), `easeStandard`, `revealVariant` (consumed by Manifesto, Experience, Tech). ✓
- `constants/index.js` after Task 3 no longer imports anything from `../assets`. Other consumer files don't import from `../assets` (verified via grep before plan was written). ✓
- `tailwind.config.js` after Task 4 contains only the 5 theme-variable-backed colors (`ink`, `paper`, `accent`, `edge`, `muted`) + screens.xs + 3 fontFamily entries. No legacy tokens to break consumers. ✓
- `src/index.css` after Task 5 keeps the @font-face, theme vars, reset, html/body, `.hash-span`. Nothing else references the deleted gradient classes. ✓
