# Portfolio v2 — Phase 5: Selected Work — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current `Works.jsx` (Tilt-wrapped gradient project cards) with `SelectedWork.jsx` — the **signature scroll set-piece** of the redesign: a horizontally-scrolling pinned section driven by GSAP ScrollTrigger. The user's vertical scroll wheel/trackpad input translates to horizontal motion while the section is pinned at the top of the viewport. Below 768px, pin-scroll is disabled and slides stack vertically with CSS scroll-snap.

**Architecture:**
- New `SelectedWork.jsx` consumes the rewired `projects` data and renders a horizontal track of full-viewport slide articles.
- GSAP ScrollTrigger pins the section, scrubs the track's `x` transform from `0` to negative `(trackWidth - viewportWidth)`. `gsap.matchMedia` gates the pin to `(min-width: 768px)` so mobile gets a clean vertical stack.
- The component uses the `useLenis()` hook so it can wait until Lenis is mounted before registering ScrollTriggers (the `scrollerProxy` from Phase 0 keeps GSAP synced with Lenis's scroll position).
- `SectionWrapper(SelectedWork, "projects", { scrollTriggered: true })` — the `scrollTriggered` opt-out (added in Phase 0 Task 8) skips the parent's Framer Motion reveal so the inner GSAP animation owns motion exclusively. Per spec: "GSAP-only for this section. No Framer Motion overlap."
- App.jsx is reordered to match the spec section sequence: Manifesto (01) → SelectedWork (02) → Experience (03) → Tech (04) → Contact.

**Tech Stack:** React 18, Vite 4, Tailwind 3, **GSAP + ScrollTrigger** (already installed Phase 0, first real use here), Lenis (already mounted Phase 0). No Framer Motion in this component.

---

## Out of scope for this plan

This is the last visible-section rewrite in the redesign. After this phase ships, a separate final cleanup pass is recommended to remove the legacy artifacts that are now orphan across all five phases — but **that cleanup is NOT in this phase's scope.** Specifically deferred:

- Legacy Tailwind color tokens (`primary`, `secondary`, `tertiary`, `test`, `black-100`, `black-200`, `white-100`, `boxShadow.card`, `backgroundImage["hero-pattern"]`)
- `font-poppins` transitional shim in `tailwind.config.js` (already orphan since Phase 1 rewrote Navbar)
- Gradient utility classes in `src/index.css` (`.black-gradient`, `.violet-gradient`, `.orange-gradient`, `.green-pink-gradient`, `.orange-text-gradient`, `.green-text-gradient`, `.blue-text-gradient`, `.pink-text-gradient`)
- Unused Framer Motion variants in `src/utils/motion.js` (`textVariant`, `fadeIn`, `zoomIn`, `slideIn` — only `staggerContainer`, `easeStandard`, `revealVariant` are still consumed)
- `src/styles.js` shrink — after Phase 5, only `styles.padding` is consumed (by `SectionWrapper`); the rest are dead
- `services` const in `src/constants/index.js` (orphan since Phase 2)
- Orphan PNG/SVG assets on disk: `logo.svg`, `menu.svg`, `close.svg`, `adnaan.png`, `backend.png`, `creator.png`, `mobile.png`, `web.png`, `github.png`, `herobg.png`, `carrent.png`, `jobit.png`, `tripguide.png`, all `company/*.png`, all `tech/*.png` (some already removed from assets/index.js, some only orphan after this phase)

Removing those is mechanical but distinct from the user-facing change in this phase — better as a single follow-up "Final cleanup" commit that the user can review for bundle-size impact in one shot.

---

## File structure

**New files:**
- `src/components/SelectedWork.jsx` — the new section component with GSAP pin-scroll.

**Modified files:**
- `src/constants/index.js` — drop `carrent`, `jobit`, `tripguide` imports from the top assets block. Restructure `projects` array shape (drop `tags`/`color`/`image`/`source_code_link`; add `techStack: string[]`, `coverImage?`, `liveUrl?`, `sourceUrl?`). Append `selectedWork` content export with `label: "02 — Selected Work"`.
- `src/assets/index.js` — drop `carrent`, `jobit`, `tripguide`, `github` imports + re-exports. (`github` is orphan after Works deletion.)
- `src/components/index.js` — replace `Works` import + re-export with `SelectedWork`.
- `src/App.jsx` — replace `<Works />` with `<SelectedWork />`, **reorder JSX** so SelectedWork sits between Manifesto and Experience (matches spec numbering).
- `package.json` / `package-lock.json` — uninstall `react-tilt`.

**Deleted files:**
- `src/components/Works.jsx` — replaced by SelectedWork.

**Files NOT touched in this phase (deferred to final cleanup):**
- `tailwind.config.js`, `src/index.css` (gradient utilities), `src/styles.js`, `src/utils/motion.js`
- `src/hoc/SectionWrapper.jsx` (uses the already-existing `scrollTriggered` option from Phase 0 Task 8)
- All other section components
- `src/utils/lenis.jsx`, `src/utils/gsap.js`, `src/utils/theme.jsx` (Phase 0 foundation)
- The .png files in `src/assets/` (deleting the actual files is part of the deferred cleanup; we only drop their import/export wiring in this phase)

---

## Content note

The current `projects` array has 3 entries from the JS Mastery tutorial (`Car Rent`, `Job IT`, `Trip Guide`). This phase replaces them with **4 plausible placeholder entries** that the user can edit in `constants/index.js` to swap with real project content. The placeholder shape demonstrates every field the new component consumes, so the user has a working template to populate.

Real content gates for Phase 5 (per spec §5):
- 3–4 project case studies — name, 1–2 sentence description, tech-stack list, cover image (or video), optional case-study/live/source links.

Until the user provides those, the component shows the placeholder names + a large CSS-rendered project number where the cover image would go. No external image fetch is required.

## Verification approach

Same as prior phases: no test framework. Each task runs `npm run dev` AND (for the high-risk Task 3 + 4 + 6) `npm run build` via the Bash tool. Browser-only checks (the actual pin-scroll behavior) bundle into Task 6's manual checklist.

---

## Tasks

### Task 1: Restructure `projects` + drop project PNG imports + add `selectedWork` label

**Files:**
- Modify: `src/constants/index.js`

- [ ] **Step 1: Update the assets import at the top of the file**

Open `src/constants/index.js`. The top currently reads (after Phase 4):

```js
import {
  mobile,
  backend,
  creator,
  web,
  meta,
  starbucks,
  tesla,
  carrent,
  jobit,
  tripguide,
} from "../assets";
```

Replace with EXACTLY:

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
```

Changes: removed the three project-image imports (`carrent`, `jobit`, `tripguide`). Keep `mobile`, `backend`, `creator`, `web` (consumed by the orphan `services` array — services itself is deferred-cleanup; don't remove its imports now). Keep `meta`, `starbucks`, `tesla` (already orphan; deferred). The other import block for `react-icons/si` is unchanged.

- [ ] **Step 2: Replace the `projects` array**

In `src/constants/index.js`, find the `const projects = [...]` block (around lines 113–158 depending on phase numbering). It currently has 3 entries each with `{ name, description, tags, image, source_code_link }`.

Replace the ENTIRE `const projects = [...];` block with EXACTLY:

```js
const projects = [
  {
    name: "Compliance Dashboard",
    description:
      "Internal financial-services dashboard for change-management review. React + TypeScript on a backend team's data feed.",
    techStack: ["React", "TypeScript", "Node", "PostgreSQL"],
    coverImage: null,
    liveUrl: null,
    sourceUrl: null,
  },
  {
    name: "Portfolio v2",
    description:
      "This site. Typographic redesign with GSAP pinned scroll, Lenis smooth-scroll, Framer Motion reveals, and a custom theme system.",
    techStack: ["React", "Vite", "GSAP", "Lenis", "Tailwind"],
    coverImage: null,
    liveUrl: "https://github.com/adnaandasoo4/portfolio",
    sourceUrl: "https://github.com/adnaandasoo4/portfolio",
  },
  {
    name: "Design System Explorer",
    description:
      "Browser-based playground for a component library — live token previews, prop controls, and copyable usage snippets.",
    techStack: ["React", "TypeScript", "Tailwind", "MDX"],
    coverImage: null,
    liveUrl: null,
    sourceUrl: null,
  },
  {
    name: "Motion Library",
    description:
      "Reusable React hooks + components for scroll-driven and gesture-driven UI. Designed for production performance at 60fps.",
    techStack: ["React", "GSAP", "Motion", "TypeScript"],
    coverImage: null,
    liveUrl: null,
    sourceUrl: null,
  },
];
```

New shape per entry: `{ name, description, techStack: string[], coverImage: string | null, liveUrl: string | null, sourceUrl: string | null }`. The 4 entries are plausible placeholders — the user edits in this file to replace with real content.

DO NOT modify any other declarations (`services`, `technologies`, `experiences`, `navLinks`, plus the new exports added in prior phases).

- [ ] **Step 3: Append `selectedWork` content export**

At the very end of `src/constants/index.js` (after the last existing export, which is `tech`), append EXACTLY this block with one blank line before:

```js

export const selectedWork = {
  // Small uppercase mono label rendered above the slide track. Numbering follows
  // the spec — Manifesto 01, Selected Work 02, Experience 03, Tech 04.
  label: "02 — Selected Work",
};
```

Ensure trailing newline.

- [ ] **Step 4: Smoke test (Bash, NOT PowerShell)**

```bash
npm run dev
```
(`run_in_background: true`, wait ~3s, confirm "ready in", kill)

The OLD `Works.jsx` still imports `image` per project; that's now `null` for every entry. `<img src={null}>` renders an empty/broken img tag at runtime, but Vite **build** still compiles. Intermediate breakage is acceptable; Task 4 replaces Works.

- [ ] **Step 5: Commit**

```bash
git add src/constants/index.js
git commit -m "Restructure projects (new shape, placeholder content), drop project PNG imports, add selectedWork label"
```

---

### Task 2: Drop `carrent`, `jobit`, `tripguide`, `github` from `src/assets/index.js`

**Files:**
- Modify: `src/assets/index.js`

- [ ] **Step 1: Replace the file**

Open `src/assets/index.js`. The file currently has imports + re-exports for many assets. Replace its ENTIRE contents with EXACTLY:

```js
import logo from "./logo.svg";
import backend from "./backend.png";
import creator from "./creator.png";
import mobile from "./mobile.png";
import web from "./web.png";
import menu from "./menu.svg";
import close from "./close.svg";

import meta from "./company/meta.png";
import shopify from "./company/shopify.png";
import fannie from "./company/fannie.png";
import starbucks from "./company/starbucks.png";
import tesla from "./company/tesla.png";
import freelance from "./company/freelance.png";

export {
  logo,
  backend,
  creator,
  mobile,
  web,
  menu,
  close,
  meta,
  shopify,
  fannie,
  freelance,
  starbucks,
  tesla,
};
```

Changes:
- Removed `import github from "./github.png";` (orphan after Works rewrite)
- Removed `import carrent from "./carrent.png";`
- Removed `import jobit from "./jobit.png";`
- Removed `import tripguide from "./tripguide.png";`
- Removed `github`, `carrent`, `jobit`, `tripguide` from the re-export block

Everything else stays unchanged. Note that several names re-exported here (e.g., `mobile`/`backend`/`creator`/`web`/`fannie`/`freelance`/`meta`/etc.) are also orphan but deferred per the "out of scope" note above.

- [ ] **Step 2: Smoke test (Bash)**

```bash
npm run dev
```
(`run_in_background: true`, wait ~3s, confirm "ready in" with NO "failed to resolve" errors, kill)

The OLD `Works.jsx` still imports `github` from `../assets`. That import will now fail at module resolution. **Expect Vite to error** until Task 4 deletes Works.jsx.

To verify the intermediate state more rigorously, run `npm run build` — it will fail. That's the expected, acceptable intermediate state for ~30 minutes while Task 3 + 4 land.

Skip `npm run build` here — just confirm Vite dev *starts up* (the broken import won't surface until something tries to load Works). If Vite startup itself errors, that's a real BLOCKED state.

- [ ] **Step 3: Commit**

```bash
git add src/assets/index.js
git commit -m "Drop carrent/jobit/tripguide/github from assets index (no consumers after Works rewrite)"
```

---

### Task 3: Create `src/components/SelectedWork.jsx`

This is the **single biggest new component in the redesign** — GSAP pin-scroll + responsive fallback. Take time on it.

**Files:**
- Create: `src/components/SelectedWork.jsx`

- [ ] **Step 1: Write the component**

Create `src/components/SelectedWork.jsx` with EXACTLY:

```jsx
import { useEffect, useRef } from "react";
import { useLenis } from "../utils/lenis";
import { gsap, ScrollTrigger } from "../utils/gsap";
import { selectedWork, projects } from "../constants";
import { SectionWrapper } from "../hoc";

/**
 * Selected Work — the signature scroll set-piece. On desktop (>=768px) the section
 * pins at the top of the viewport and the user's vertical scroll input scrubs the
 * inner track horizontally; below 768px the slides stack vertically with CSS
 * scroll-snap, no pin. GSAP-only — no Framer Motion overlap per design spec §3.3.
 */
function SelectedWork() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const lenis = useLenis();

  useEffect(() => {
    // Wait for Lenis to mount so its scrollerProxy is in place before we register
    // any ScrollTriggers (set up at app root in src/utils/gsap.js).
    if (!lenis) return;
    if (!sectionRef.current || !trackRef.current) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const section = sectionRef.current;
      const track = trackRef.current;
      // Distance to translate = total track width minus one viewport
      // (the last slide should end aligned to the viewport's right edge).
      const distance = () => track.scrollWidth - window.innerWidth;

      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });

    return () => mm.revert();
  }, [lenis]);

  return (
    <div ref={sectionRef} className="relative">
      {/* Section label — stays inside the section but above the pinned track */}
      <div className="px-6 pt-24 pb-12 sm:px-16">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
          {selectedWork.label}
        </span>
      </div>

      {/* Track: horizontal flex on desktop, vertical stack with snap on mobile */}
      <div
        ref={trackRef}
        className="flex snap-y snap-mandatory flex-col md:h-screen md:snap-none md:flex-row"
      >
        {projects.map((project, i) => (
          <article
            key={project.name}
            className="flex h-screen w-screen flex-shrink-0 snap-start flex-col gap-8 px-6 py-12 sm:px-16 md:flex-row md:gap-16 md:py-24"
          >
            {/* Left: meta */}
            <div className="flex flex-1 flex-col justify-between md:max-w-[40%]">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted">
                {String(i + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
              </div>

              <div>
                <h3
                  className="text-ink"
                  style={{
                    fontFamily:
                      "Geist, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    fontWeight: 900,
                    fontSize: "clamp(40px, 6vw, 96px)",
                    lineHeight: "0.95",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {project.name}
                </h3>
                <p className="mt-6 max-w-md text-base leading-relaxed text-ink">
                  {project.description}
                </p>
                <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-1">
                  {project.techStack.map((tech) => (
                    <li
                      key={tech}
                      className="font-mono text-[10px] uppercase tracking-widest text-muted"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-6">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[10px] uppercase tracking-widest text-ink transition-opacity hover:opacity-60"
                  >
                    Live ↗
                  </a>
                )}
                {project.sourceUrl && (
                  <a
                    href={project.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[10px] uppercase tracking-widest text-ink transition-opacity hover:opacity-60"
                  >
                    Code ↗
                  </a>
                )}
              </div>
            </div>

            {/* Right: cover (image or numbered placeholder) */}
            <div className="relative flex-1">
              {project.coverImage ? (
                <img
                  src={project.coverImage}
                  alt={project.name}
                  className="absolute inset-0 h-full w-full rounded-md object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-md border border-edge">
                  <span
                    aria-hidden="true"
                    className="text-edge"
                    style={{
                      fontFamily:
                        "Geist, ui-sans-serif, system-ui, sans-serif",
                      fontWeight: 900,
                      fontSize: "clamp(120px, 18vw, 360px)",
                      lineHeight: "1",
                      letterSpacing: "-0.04em",
                      color: "var(--muted)",
                      opacity: 0.5,
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default SectionWrapper(SelectedWork, "projects", { scrollTriggered: true });
```

**Key design decisions explained:**
- `useLenis()` returns `null` on the first render (per Phase 0 contract); the effect guards `if (!lenis) return` and runs again when Lenis becomes available (the dep array `[lenis]` triggers re-run).
- `gsap.matchMedia()` adds a context bound to `(min-width: 768px)` — GSAP automatically cleans up the tween and ScrollTrigger when the viewport drops below the breakpoint (revertible). `mm.revert()` in the React cleanup handles unmount.
- `distance()` is a function (not a value) so GSAP re-evaluates on `invalidateOnRefresh` — important when window resizes.
- `anticipatePin: 1` reduces the brief layout shift when the pin engages.
- `SectionWrapper(..., "projects", { scrollTriggered: true })` — the `scrollTriggered: true` option (added in Phase 0 Task 8) disables the HOC's Framer Motion reveal so GSAP owns motion exclusively.
- The `<div>` wrapping `<section>` semantics is *intentional* — SectionWrapper renders a `<motion.section>` already; we just need a generic block here.
- The padding/typography classes match the patterns from Hero/Manifesto/Experience for visual consistency.
- The numeric counter uses `String(i + 1).padStart(2, "0")` so it always reads `01`, `02`, etc.

- [ ] **Step 2: Smoke test BOTH dev AND build (Bash)**

```bash
npm run dev
```
(`run_in_background: true`, wait ~5s, confirm "ready in" with NO compile errors, kill)

```bash
npm run build
```

The build will likely STILL FAIL because Works.jsx still exists and still imports `github` from `../assets` (which Task 2 removed). That's intermediate. Confirm SelectedWork.jsx itself doesn't introduce *new* errors:

- If the build error message references `github` from `../assets` — that's pre-existing from Task 2, will be resolved in Task 4.
- If the build error references anything in `SelectedWork.jsx` itself — fix it.

Document the intermediate-state errors in the commit message.

- [ ] **Step 3: Commit**

```bash
git add src/components/SelectedWork.jsx
git commit -m "Add SelectedWork component (GSAP pin-and-scrub horizontal scroll)"
```

---

### Task 4: Rename Works → SelectedWork in barrel + App, delete Works.jsx, reorder App.jsx

**Files:**
- Delete: `src/components/Works.jsx`
- Modify: `src/components/index.js`
- Modify: `src/App.jsx`

- [ ] **Step 1: Update `src/components/index.js`**

The file currently reads (after Phase 4):

```js
import Hero from './Hero';
import Navbar from './Navbar';
import Manifesto from './Manifesto';
import Tech from './Tech';
import Experience from './Experience';
import Works from './Works';
import Contact from './Contact';

export {
  Hero,
  Navbar,
  Manifesto,
  Tech,
  Experience,
  Works,
  Contact,
};
```

Replace with EXACTLY:

```js
import Hero from './Hero';
import Navbar from './Navbar';
import Manifesto from './Manifesto';
import Tech from './Tech';
import Experience from './Experience';
import SelectedWork from './SelectedWork';
import Contact from './Contact';

export {
  Hero,
  Navbar,
  Manifesto,
  Tech,
  Experience,
  SelectedWork,
  Contact,
};
```

Changes: `Works` → `SelectedWork` in both the import line and the export list. Position in the export block matches alphabetical context (kept where Works was).

- [ ] **Step 2: Update `src/App.jsx`**

The file currently reads:

```jsx
import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Contact, Experience, Hero, Manifesto, Navbar, Tech, Works } from './components';
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
          <div className='relative z-0'>
            <Navbar />
            <Hero />
            <Manifesto />
            <Experience />
            <Tech />
            <Works />
            <Contact />
          </div>
        </BrowserRouter>
      </LenisProvider>
    </ThemeProvider>
  )
}

export default App
```

Replace with EXACTLY:

```jsx
import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Contact, Experience, Hero, Manifesto, Navbar, SelectedWork, Tech } from './components';
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
          <div className='relative z-0'>
            <Navbar />
            <Hero />
            <Manifesto />
            <SelectedWork />
            <Experience />
            <Tech />
            <Contact />
          </div>
        </BrowserRouter>
      </LenisProvider>
    </ThemeProvider>
  )
}

export default App
```

Two changes:
1. Imports: `Works` → `SelectedWork` (alphabetical position changes accordingly)
2. JSX order: `<SelectedWork />` moved from position 4 (after Tech) up to position 2 (between Manifesto and Experience). The final visual order matches the spec: Hero → Manifesto (01) → Selected Work (02) → Experience (03) → Tech (04) → Contact.

- [ ] **Step 3: Delete `src/components/Works.jsx`**

```bash
rm src/components/Works.jsx
```

- [ ] **Step 4: Smoke test BOTH dev AND build (Bash)**

```bash
npm run dev
```
(`run_in_background: true`, wait ~5s, confirm "ready in" with NO "failed to resolve" errors, kill)

```bash
npm run build
```

Now BOTH should pass cleanly. The intermediate errors from Tasks 2 and 3 (`github` resolution, missing Works module) should all be resolved. If `npm run build` still errors, debug before proceeding.

- [ ] **Step 5: Commit**

```bash
git add src/components/Works.jsx src/components/index.js src/App.jsx
git commit -m "Replace Works section with SelectedWork; reorder sections to match spec"
```

---

### Task 5: Uninstall `react-tilt`

**Files:**
- Modify: `package.json`, `package-lock.json` (via `npm uninstall`)

- [ ] **Step 1: Verify orphan**

```bash
grep -rln "react-tilt" src/ 2>/dev/null || echo "no remaining imports"
```

Expected: `no remaining imports`. (Works.jsx was the sole consumer; Task 4 deleted it.)

- [ ] **Step 2: Uninstall**

```bash
npm uninstall react-tilt
```

Expected: npm removes `react-tilt` from `dependencies` and `package-lock.json`.

- [ ] **Step 3: Smoke test (Bash)**

```bash
npm run dev
```
(`run_in_background: true`, wait ~3s, confirm "ready in", kill)

```bash
npm run build
```

Both should pass.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "Remove react-tilt (no remaining consumers)"
```

---

### Task 6: Phase 5 final smoke test

**Files:**
- None modified — verification only (unless something fails mechanically).

- [ ] **Step 1: Automated checks (Bash)**

```bash
npm run dev
```
(`run_in_background: true`, wait ~5s, confirm "ready in" with NO errors, note URL, kill)

```bash
npm run build
```

Expected: clean build. Note bundle size — Phase 4 baseline was 420.15 KB / 146.35 KB gzipped. Phase 5 dropping `react-tilt` should reduce slightly (~10-20 KB).

```bash
ls src/components/Works.jsx 2>&1 | head -1
```
Expected: "No such file or directory".

```bash
ls src/components/SelectedWork.jsx
```
Expected: file listed.

```bash
grep -rln "from './Works'\|from \"./Works\"\|<Works " src/ 2>/dev/null || echo "no Works refs"
```
Expected: `no Works refs`.

```bash
grep -n "SelectedWork\|selectedWork" src/App.jsx src/components/index.js src/components/SelectedWork.jsx src/constants/index.js | head -20
```
Expected: multiple matches showing SelectedWork is wired everywhere.

```bash
grep -E "^export const selectedWork" src/constants/index.js
```
Expected: 1 match.

```bash
grep "{ scrollTriggered: true }" src/components/SelectedWork.jsx
```
Expected: 1 match (the SectionWrapper export).

```bash
npm ls react-tilt 2>&1
```
Expected: empty or "(empty)".

```bash
git log --oneline portfolio_testing -8
```
Expected: 6 new commits since Phase 4's final (`289ba6a`):
- `<sha>` Remove react-tilt
- `<sha>` Replace Works section with SelectedWork; reorder
- `<sha>` Add SelectedWork component
- `<sha>` Drop carrent/jobit/tripguide/github from assets
- `<sha>` Restructure projects, add selectedWork label
- `<sha>` Add Phase 5 plan

```bash
git status --short
```
Expected: only `.claude/` and `CLAUDE.md` (pre-existing untracked).

- [ ] **Step 2: Surface manual browser checklist for the user**

Report this verbatim:

```
## User browser verification (Phase 5)

Open the dev server URL in a fresh tab. Hard-reload (Ctrl+Shift+R).

DESKTOP (resize browser to at least 1024px wide):

1. Console: free of red errors.
2. Section order top-to-bottom should now be: Hero → Manifesto → Selected Work → Experience → Tech → Footer.
3. Scroll into the Selected Work section. The section header reads "02 — SELECTED WORK".
4. As you continue to scroll DOWN, the section should pin to the top of the viewport
   and the project slides scroll HORIZONTALLY (left-to-right) instead of the page
   continuing to scroll down.
5. Each slide is a full viewport showing:
   - Counter "01 / 04" (etc.) in mono uppercase top-left
   - Project name in giant display weight
   - 1-2 sentence description
   - Tech stack pills
   - On the right side: a large numbered placeholder ("01", "02" etc.) since we don't
     have real project images yet
6. After scrolling through all 4 slides, the section unpins and the page continues
   vertically into Experience.
7. Theme toggle (DARK button in navbar): switching modes flips all text/border/bg
   colors. Placeholder cover squares flip their tint with the theme.

MOBILE (resize browser narrower than 768px):

8. The Selected Work section is NOT pinned. Slides stack vertically and you can
   scroll through them with normal vertical scrolling.
9. CSS scroll-snap should make each slide "snap" to the top of the viewport as you
   scroll past it (a slightly stickier scroll feel).
10. The text + cover stack vertically within each slide.

CONTENT GATES:
- The 4 project entries are placeholders. Edit `src/constants/index.js` to replace
  with real content: name, description, techStack array, coverImage URL (or null
  for the numbered placeholder), liveUrl, sourceUrl.
- When you add a coverImage URL, the `<img>` replaces the numbered placeholder
  automatically.
```

- [ ] **Step 3: If anything fails mechanically — fix and commit**

If something breaks, fix and commit:

```bash
git add <files>
git commit -m "Phase 5 final smoke test fixes"
```

Otherwise no further commit — Phase 5 is complete.

---

## Self-review

**Spec coverage check** (against design spec §3.3 Selected Work):

§3.3 Selected Work requirements:
- ✓ Small mono label `02 — SELECTED WORK` — Task 1 (`selectedWork.label`) + Task 3 (rendered with mono uppercase classes)
- ✓ Pinned horizontal scroll set-piece — Task 3 (GSAP ScrollTrigger pin + scrub on `(min-width: 768px)`)
- ✓ Per-slide layout: number top-left, name display weight, description, tech stack, large preview — Task 3 (matches all five slots)
- ✓ Vertical → horizontal scroll conversion — Task 3 (scrub: 1, x: -distance translates the track)
- ✓ Section unpins after last slide, vertical resumes — Task 3 (ScrollTrigger end: `+=${distance}` releases pin)
- ✓ Mobile fallback: vertical stack + CSS scroll-snap — Task 3 (md:snap-none → snap-y snap-mandatory on the track wrapper)
- ✓ GSAP-only, no Framer Motion overlap — Task 3 (no `motion.*` elements; `{ scrollTriggered: true }` opts out of HOC's Framer Motion reveal)

Phase delivery requirements:
- ✓ App.jsx reordered to spec section sequence — Task 4
- ✓ `react-tilt` removed (was Works.jsx's only consumer) — Task 5
- ✓ Project PNGs unbundled (carrent, jobit, tripguide, github) — Tasks 1 + 2

**Placeholder scan:** Every code block contains runnable code. No "TBD", "TODO", "fill in details" markers. Every command has expected output. The four placeholder project entries are deliberate content placeholders flagged in the "Content note" section — not plan placeholders.

**Type consistency:**
- `selectedWork` exported as `{ label: string }` (Task 1 Step 3); consumed in Task 3 as `selectedWork.label`. ✓
- `projects` shape `{ name, description, techStack: string[], coverImage: string|null, liveUrl: string|null, sourceUrl: string|null }` (Task 1 Step 2); consumed in Task 3 via destructuring + `?? null` checks. ✓
- `useLenis()` returns `Lenis | null` (Phase 0 contract); SelectedWork's effect guards `if (!lenis) return`. ✓
- `gsap` + `ScrollTrigger` imports from `../utils/gsap` (Phase 0 Task 7); used directly in the effect. ✓
- `SectionWrapper(Component, idName, options)` three-arg form (Phase 0 Task 8); used as `SectionWrapper(SelectedWork, "projects", { scrollTriggered: true })`. ✓
- The `scrollTriggered: true` option correctly skips Framer Motion variants per the HOC's logic. ✓
