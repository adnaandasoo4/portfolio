# Portfolio v2 — Phase 4: Tech Stack — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current Tech section (3D ball icons via `BallCanvas`) with a Zubiate-style grid of monochrome SVG tech logos in bordered cells. Each icon flips with the theme via `currentColor`. Drop the entire R3F/Three.js stack since this was its last consumer.

**Architecture:** New Tech component renders a 4-column responsive grid (auto-down) of cells, each with a Simple-Icons SVG (via `react-icons/si`) above a small mono label. The icon color inherits `text-ink` from the cell so light/dark toggle flips naturally. Cells share a common background and a `gap-px` over a tinted grid container produces 1px dividers between cells. Three.js / R3F / drei deps are removed in a final task once `BallCanvas` and `Loader.jsx` are deleted.

**Tech Stack:** React 18, Vite 4, Tailwind 3, Framer Motion (reveal register), **+ `react-icons`** (new — Simple Icons set via `react-icons/si`).

---

## Out of scope for this plan

- Removing the orphan `services` array + `mobile`/`backend`/`creator`/`web` PNG imports from `src/constants/index.js`. Orphan since Phase 2 (Manifesto replaced About). Deferred to the final cleanup phase after Phase 5.
- Removing `react-tilt` dep — orphan since Phase 2, deferred.
- Removing `logo.svg`, `github.png`, `menu.svg`, `close.svg`, `adnaan.png`, `herobg.png`, `creator.png`, `mobile.png`, `backend.png`, `web.png` assets — likely orphan but verifying requires a full grep sweep. Deferred to final cleanup.
- Reordering `App.jsx` to put Works before Tech, or adding a `tech` entry to `navLinks`. Out of scope; user can choose to add later via a one-line constants edit.

## Verification approach

Same as prior phases: no test framework. Each task runs `npm run dev` via the Bash tool (PowerShell has an execution-policy issue on this machine). Browser-only checks bundle into Task 6's manual checklist.

---

## File structure

**New dependency:**
- `react-icons` — provides Simple Icons React components as `SiXxx` named exports.

**Removed dependencies:**
- `three`
- `@react-three/fiber`
- `@react-three/drei`

**Modified files:**
- `src/constants/index.js` — drop 13 tech PNG imports from top, add 13 `react-icons/si` imports, restructure `technologies` shape from `{ name, icon: pngPath }` to `{ name, Icon: ReactComponent }`, append a new `tech` content export.
- `src/assets/index.js` — drop the 13 tech PNG imports and re-exports.
- `src/components/Tech.jsx` — full rewrite. Grid layout, no BallCanvas.
- `src/components/index.js` — drop `BallCanvas` import + re-export, drop the `./canvas` named import line entirely.
- `src/index.css` — drop `.canvas-loader` class + its `@keyframes mulShdSpin`. No remaining consumers after `Loader.jsx` is removed.

**Deleted files:**
- `src/components/canvas/Ball.jsx`
- `src/components/canvas/index.js`
- `src/components/canvas/` directory itself (empty after Ball is removed)
- `src/components/Loader.jsx` (only consumer was Ball.jsx)

**Files NOT touched:**
- `src/App.jsx` (already doesn't import BallCanvas)
- All other section components, hoc, utils
- `src/hoc/SectionWrapper.jsx`
- Navlinks in `src/constants/index.js`
- `src/styles.js`, `src/utils/motion.js` (extracted `revealVariant` in Phase 3 stays)
- `tailwind.config.js` (legacy color tokens stay; cleanup is Phase 5+)

---

## Tasks

### Task 1: Install `react-icons`

**Files:**
- Modify: `package.json`, `package-lock.json` (via `npm install`)

- [ ] **Step 1: Install**

```bash
npm install react-icons@^5.4.0
```

Expected: npm installs `react-icons` and updates `package.json` / `package-lock.json`.

- [ ] **Step 2: Verify**

```bash
npm ls react-icons
```

Expected: shows `react-icons@5.4.x` at top level.

- [ ] **Step 3: Smoke test**

```bash
npm run dev
```
(`run_in_background: true`, wait ~3s, confirm "ready in", kill)

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "Install react-icons for Tech section SVG glyphs"
```

---

### Task 2: Restructure `technologies` + `assets/index.js` + add `tech` label

**Files:**
- Modify: `src/constants/index.js`
- Modify: `src/assets/index.js`

- [ ] **Step 1: Drop tech PNG imports from `src/assets/index.js`**

Open `src/assets/index.js`. The file currently has lines for the tech PNG imports + re-exports. Replace the ENTIRE file with EXACTLY:

```js
import logo from "./logo.svg";
import backend from "./backend.png";
import creator from "./creator.png";
import mobile from "./mobile.png";
import web from "./web.png";
import github from "./github.png";
import menu from "./menu.svg";
import close from "./close.svg";

import meta from "./company/meta.png";
import shopify from "./company/shopify.png";
import fannie from "./company/fannie.png";
import starbucks from "./company/starbucks.png";
import tesla from "./company/tesla.png";
import freelance from "./company/freelance.png";

import carrent from "./carrent.png";
import jobit from "./jobit.png";
import tripguide from "./tripguide.png";

export {
  logo,
  backend,
  creator,
  mobile,
  web,
  github,
  menu,
  close,
  meta,
  shopify,
  fannie,
  freelance,
  starbucks,
  tesla,
  carrent,
  jobit,
  tripguide,
};
```

Changes from the current file:
- Removed the 13 lines `import css from "./tech/css.png";` through `import threejs from "./tech/threejs.svg";`
- Removed the same 13 names from the `export { ... }` list

Note: We keep `fannie`, `freelance`, `meta`, `shopify`, `starbucks`, `tesla` re-exports for now — those are orphan but their cleanup is deferred. Same for `backend`, `creator`, `mobile`, `web`, `logo`, `github`, `menu`, `close`.

- [ ] **Step 2: Update imports at the top of `src/constants/index.js`**

Open `src/constants/index.js`. The top of the file currently reads:

```js
import {
  mobile,
  backend,
  creator,
  web,
  javascript,
  typescript,
  html,
  css,
  reactjs,
  redux,
  tailwind,
  nodejs,
  mongodb,
  git,
  figma,
  docker,
  meta,
  starbucks,
  tesla,
  carrent,
  jobit,
  tripguide,
  threejs,
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
  carrent,
  jobit,
  tripguide,
} from "../assets";

import {
  SiHtml5,
  SiCss3,
  SiJavascript,
  SiTypescript,
  SiReact,
  SiRedux,
  SiTailwindcss,
  SiNodedotjs,
  SiMongodb,
  SiThreejs,
  SiGit,
  SiFigma,
  SiDocker,
} from "react-icons/si";
```

Changes:
- Removed 13 tech PNG imports (`javascript`, `typescript`, `html`, `css`, `reactjs`, `redux`, `tailwind`, `nodejs`, `mongodb`, `git`, `figma`, `docker`, `threejs`) from the assets named-import block.
- Added a second import block from `react-icons/si` with 13 corresponding Simple-Icons React components.

Note on icon naming: react-icons capitalizes the Simple Icons slug. If `SiNodedotjs` or `SiThreejs` doesn't exist (icon-pack version mismatch), the dev server's Vite import resolution will throw `SyntaxError: 'SiXxx' is not exported from 'react-icons/si'`. If that happens, look the icon up in [`react-icons` docs](https://react-icons.github.io/react-icons/icons?name=si) and substitute the correct name. As of react-icons 5.4.x, all 13 names above resolve correctly.

- [ ] **Step 3: Restructure the `technologies` array**

In `src/constants/index.js`, find the `const technologies = [...]` block (around lines 63-116). It currently has 13 entries each with `{ name, icon: pngImport }`.

Replace the ENTIRE `technologies` array declaration with EXACTLY:

```js
const technologies = [
  { name: "HTML 5", Icon: SiHtml5 },
  { name: "CSS 3", Icon: SiCss3 },
  { name: "JavaScript", Icon: SiJavascript },
  { name: "TypeScript", Icon: SiTypescript },
  { name: "React JS", Icon: SiReact },
  { name: "Redux Toolkit", Icon: SiRedux },
  { name: "Tailwind CSS", Icon: SiTailwindcss },
  { name: "Node JS", Icon: SiNodedotjs },
  { name: "MongoDB", Icon: SiMongodb },
  { name: "Three JS", Icon: SiThreejs },
  { name: "Git", Icon: SiGit },
  { name: "Figma", Icon: SiFigma },
  { name: "Docker", Icon: SiDocker },
];
```

Shape is now `{ name, Icon: ReactComponent }`. `Icon` is capitalized because it's a React component (convention).

- [ ] **Step 4: Append `tech` content export**

At the very end of the file (after the last existing export, which is `experience`), append EXACTLY this block with one blank line before:

```js

export const tech = {
  // Small uppercase mono label for the section header. Section number follows
  // the spec — Hero (no label), Manifesto 01, Selected Work 02 (Phase 5),
  // Experience 03, Tech 04.
  label: "04 — Stack",
};
```

- [ ] **Step 5: Smoke test (Bash)**

```bash
npm run dev
```
(`run_in_background: true`, wait ~3s, confirm "ready in" with NO "failed to resolve" errors, kill)

The old `Tech.jsx` still imports `BallCanvas` and reads `technology.icon`. With the new shape, `technology.icon` is now `undefined` (the field is `Icon`, capitalized) — so the old `BallCanvas` will probably render with no decal, but won't crash the BUILD. Vite compiles. Runtime is degraded; that's the unavoidable intermediate state. Task 3 fixes Tech.jsx.

- [ ] **Step 6: Commit**

```bash
git add src/constants/index.js src/assets/index.js
git commit -m "Restructure technologies (react-icons SVGs), drop tech PNG assets, add tech label"
```

---

### Task 3: Rewrite `src/components/Tech.jsx`

**Files:**
- Modify: `src/components/Tech.jsx`

- [ ] **Step 1: Replace contents**

Open `src/components/Tech.jsx`. Replace its ENTIRE contents with EXACTLY:

```jsx
import { motion } from "framer-motion";
import { tech, technologies } from "../constants";
import { SectionWrapper } from "../hoc";
import { revealVariant as reveal } from "../utils/motion";

function Tech() {
  return (
    <div className="flex flex-col gap-10 py-24">
      <motion.span
        variants={reveal}
        custom={0}
        className="font-mono text-[10px] uppercase tracking-widest text-muted"
      >
        {tech.label}
      </motion.span>

      {/*
        Grid lines trick: the <ul> has bg-edge and gap-px. Each cell has bg-paper.
        The 1px gaps reveal the tinted bg-edge underneath, producing dividing lines
        between cells that flip color with the theme. An outer 1px border closes
        the rectangle.
      */}
      <motion.ul
        variants={reveal}
        custom={0.1}
        className="grid grid-cols-2 gap-px border border-edge bg-edge sm:grid-cols-3 md:grid-cols-4"
      >
        {technologies.map(({ name, Icon }, i) => (
          <motion.li
            key={name}
            variants={reveal}
            custom={0.15 + i * 0.03}
            className="flex aspect-square flex-col items-center justify-center gap-3 bg-paper p-4 text-ink"
          >
            <Icon className="h-7 w-7 sm:h-9 sm:w-9" aria-hidden="true" />
            <span className="text-center font-mono text-[9px] uppercase tracking-widest text-muted">
              {name}
            </span>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}

export default SectionWrapper(Tech, "tech");
```

This replaces a component that previously:
- Imported `BallCanvas` from `./canvas`
- Mapped `technologies` to BallCanvas-wrapped divs
- Used `SectionWrapper(Tech, "")` (empty anchor)

New version:
- Pure DOM, no BallCanvas
- `<Icon />` components from react-icons (single SVG path each, fill = `currentColor`)
- `aria-hidden="true"` on icons since the name label provides the same info to AT
- Anchor changed from `""` to `"tech"` for valid HTML and future nav-link readiness

- [ ] **Step 2: Smoke test (Bash)**

```bash
npm run dev
```
(`run_in_background: true`, wait ~5s, confirm "ready in" with NO compile errors, kill)

After this step, the Tech section renders the new grid in the browser. The OLD `BallCanvas` is no longer imported by Tech, but Ball.jsx still exists on disk and `BallCanvas` is still exported from `src/components/canvas/index.js` + `src/components/index.js`. Task 4 cleans those up.

- [ ] **Step 3: Commit**

```bash
git add src/components/Tech.jsx
git commit -m "Rewrite Tech: monochrome SVG grid, no BallCanvas"
```

---

### Task 4: Delete Ball + Loader + canvas directory + drop `.canvas-loader` CSS

**Files:**
- Delete: `src/components/canvas/Ball.jsx`
- Delete: `src/components/canvas/index.js`
- Delete: `src/components/canvas/` directory (empty after Ball + index removal)
- Delete: `src/components/Loader.jsx`
- Modify: `src/components/index.js`
- Modify: `src/index.css`

- [ ] **Step 1: Update `src/components/index.js`**

The file currently reads:

```js
import { BallCanvas } from './canvas';
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
  BallCanvas,
};
```

Replace with EXACTLY:

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

Changes: removed `BallCanvas` from both the import block and the export block. Removed the `./canvas` import line entirely.

- [ ] **Step 2: Delete the canvas directory and Loader.jsx**

```bash
rm -rf src/components/canvas
rm src/components/Loader.jsx
```

Confirm the canvas directory is gone:

```bash
ls src/components/canvas 2>&1 | head -1
```

Expected: `cannot access 'src/components/canvas': No such file or directory`.

- [ ] **Step 3: Drop `.canvas-loader` styles from `src/index.css`**

Open `src/index.css`. The file currently has a `.canvas-loader` class definition (around line 135ish) followed by a long `@keyframes mulShdSpin` block (multiple frames, ends around line 220+). These were used by the now-deleted `Loader.jsx`.

Find the section that begins with the comment line:

```css
/* canvas- styles */
```

(That comment plus the `.canvas-loader { ... }` rule plus the `@keyframes mulShdSpin { ... }` block.)

Remove that ENTIRE section — the comment, the `.canvas-loader` rule, AND the `@keyframes mulShdSpin` rule. After removal, what was previously below the keyframes (if anything) stays in place.

If you're unsure exactly which lines to remove, use the following heuristic: delete starting from the line `/* canvas- styles */` through the closing `}` of the `mulShdSpin` keyframes. Verify with:

```bash
grep -n "canvas-loader\|canvas- styles\|mulShdSpin" src/index.css
```

Expected: no matches after the edit.

- [ ] **Step 4: Smoke test (Bash)**

```bash
npm run dev
```
(`run_in_background: true`, wait ~3s, confirm "ready in" with NO "failed to resolve" errors, kill)

If Vite reports a resolution error for `./Loader`, `./canvas`, or `BallCanvas`, something still imports them — fix that import. (Verified by plan: only Ball.jsx imported Loader; only `components/index.js` imported `./canvas`; both updates land in this task.)

- [ ] **Step 5: Commit**

```bash
git add src/components/canvas src/components/Loader.jsx src/components/index.js src/index.css
git commit -m "Drop BallCanvas + Loader + canvas-loader CSS (no remaining consumers)"
```

Git registers the deletions when `git add` references the now-deleted paths.

---

### Task 5: Uninstall `three`, `@react-three/fiber`, `@react-three/drei`

**Files:**
- Modify: `package.json`, `package-lock.json` (via `npm uninstall`)

- [ ] **Step 1: Verify orphan**

```bash
grep -rln "three\|@react-three" src/ 2>/dev/null
```

Expected: no matches in `src/`. (Only place left would be string literals like "Three JS" or "ThreeJS" in display labels — those are content, not imports. Use a refined grep if needed: `grep -rln "from '@react-three\|from \"three\"" src/`.)

- [ ] **Step 2: Uninstall**

```bash
npm uninstall three @react-three/fiber @react-three/drei
```

Expected: npm removes the three packages plus their transitive deps from `package.json` / `package-lock.json`. Output should report "removed N packages" where N includes those three plus transitives (typically 60+ for the three.js ecosystem).

- [ ] **Step 3: Smoke test (Bash)**

```bash
npm run dev
```
(`run_in_background: true`, wait ~3s, confirm "ready in" with NO errors, kill)

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "Remove three, @react-three/fiber, @react-three/drei (no remaining consumers)"
```

---

### Task 6: Phase 4 final smoke test

**Files:**
- None modified — verification only (unless a check fails and needs a mechanical fix).

- [ ] **Step 1: Automated checks (Bash)**

```bash
npm run dev
```
(`run_in_background: true`, wait ~5s, confirm "ready in", note local URL, kill)

```bash
npm run build
```

Expected: clean build. Bundle should drop significantly. Phase 3 baseline was 1228.44 KB / 370.78 KB gzipped. With Three.js (~600 KB raw, ~150 KB gzipped) and R3F/drei removed, expect roughly 600–700 KB raw / 220–250 KB gzipped — a major reduction.

```bash
grep -rln "BallCanvas\|@react-three\|from 'three'\|from \"three\"\|Loader from\|canvas-loader" src/ index.html 2>/dev/null
```

Expected: no matches. (String literal "Three JS" in `technologies` is content, not an import — the grep above is scoped to `from '...'`/`from "..."` and the `BallCanvas`/`Loader from` identifier patterns.)

```bash
ls src/components/canvas 2>&1 | head -1
ls src/components/Loader.jsx 2>&1 | head -1
```

Expected: both report "No such file or directory".

```bash
ls src/components/Tech.jsx
```

Expected: file listed.

```bash
grep -E "^export const tech" src/constants/index.js
```

Expected: 1 match — `export const tech = {`.

```bash
grep -c "react-icons/si" src/constants/index.js
```

Expected: 1 (one import statement from react-icons/si).

```bash
npm ls three @react-three/fiber @react-three/drei react-icons 2>&1
```

Expected: `three`, `@react-three/fiber`, `@react-three/drei` show as missing or extraneous. `react-icons@5.4.x` shows as installed at top level.

```bash
git log --oneline portfolio_testing -8
```

Expected: 6 new commits since Phase 3's final (`c005259`):
- `<sha>` Remove three, @react-three/fiber, @react-three/drei
- `<sha>` Drop BallCanvas + Loader + canvas-loader CSS
- `<sha>` Rewrite Tech: monochrome SVG grid, no BallCanvas
- `<sha>` Restructure technologies (react-icons SVGs), drop tech PNG assets, add tech label
- `<sha>` Install react-icons for Tech section SVG glyphs
- `<sha>` Add Phase 4 (Tech Stack) implementation plan

```bash
git status --short
```

Expected: only `.claude/` and `CLAUDE.md` (pre-existing untracked).

- [ ] **Step 2: Surface manual browser checklist verbatim**

```
## User browser verification (Phase 4)

Open the dev server URL in a fresh tab. Hard-reload (Ctrl+Shift+R).

1. Console: free of red errors.
2. Scroll past Hero, Manifesto, and Experience. The Tech section appears with:
   - Small uppercase mono label "04 — STACK" at the top.
   - A grid of 13 cells: 2-wide on mobile, 3-wide on tablet, 4-wide on desktop.
   - Each cell is a square with a single SVG icon centered above its tech name in small uppercase mono.
3. Icons are monochrome (same color as the surrounding text). No multicolor brand logos,
   no 3D balls, no rotating decals.
4. Cells share hairline 1px borders forming a continuous grid pattern.
5. Switch to dark mode (DARK toggle in navbar). Icons flip to cream; cell backgrounds
   flip to near-black; the hairline grid lines stay visible. Everything legible.
6. On scroll-in, the label, ul container, and each cell stagger-fade in. Smooth.
7. Click the navbar's "experience" link to confirm anchors still work. Scroll down to
   Tech section. The Works section below still uses the OLD design (gradient project
   cards) — that's expected (Phase 5).
8. Bundle is dramatically smaller — the page should load noticeably faster than before.
```

- [ ] **Step 3: If anything fails mechanically — fix and commit**

If an automated check fails (missing import, leftover reference), fix and commit:

```bash
git add <files>
git commit -m "Phase 4 final smoke test fixes"
```

Otherwise no further commit — Phase 4 is complete.

---

## Self-review

**Spec coverage check** (against design spec §3.5 Tech stack and §4 Stack changes):

§3.5 Tech stack requirements:
- ✓ Small mono label `04 — STACK` — Task 2 (`tech.label`) + Task 3 (rendered with mono uppercase classes)
- ✓ 4-column grid of monochrome SVG logos in bordered cells — Task 3 (Tailwind grid with `gap-px` over `bg-edge` for divider effect)
- ✓ `currentColor` for icons — Task 3 (react-icons natively use `fill="currentColor"`, inherits `text-ink`)
- ✓ Each cell labels the tech below the logo — Task 3 (icon over name)
- ✓ Replaces 3D balls — Task 3 + Task 4 (Ball.jsx deleted)
- ✓ Reveal register only — Task 3 (Framer Motion `reveal` from Phase 3's shared utils/motion)

§4 Stack changes (cumulative):
- ✓ Three.js, R3F, drei removed — Task 5 (after consumers gone in Task 4)
- ✓ Tech stack uses single-path SVGs — Task 2 + Task 3 (react-icons/si)
- ✓ Asset cleanup for tech PNGs — Task 2 (assets/index.js and constants/index.js)
- ✓ `.canvas-loader` CSS removed — Task 4 (orphan after Loader.jsx delete)

Phase delivery requirements:
- ✓ Single section visual rewrite + paired cleanup of deps that become orphan
- ✓ Other sections (Hero, Manifesto, Experience, Works, Contact, Navbar) untouched
- ✓ `react-icons` added because Tech needs SVG icon components (consistent with Phase 1's emailjs/maath addition→removal cycle pattern)

**Placeholder scan:** All code blocks are complete and runnable. No "TBD", "implement later", or "similar to Task N". Every command has expected output.

**Type consistency:**
- `tech` exported from constants as `{ label: string }` (Task 2 Step 4); consumed in Task 3 as `tech.label`. ✓
- `technologies` shape `{ name: string, Icon: ReactComponent }` (Task 2 Step 3); consumed in Task 3 via `({ name, Icon })` destructure and `<Icon ... />`. ✓
- `react-icons/si` imports use `SiXxx` PascalCase naming consistent with the package's documented API. ✓
- `SectionWrapper(Tech, "tech")` two-arg form (was previously `""`). ✓
- Imports in `src/constants/index.js` after Task 2: assets gives `mobile, backend, creator, web, meta, starbucks, tesla, carrent, jobit, tripguide` (10 names); react-icons/si gives 13 icon components. No collisions. ✓
- `revealVariant as reveal` imported from `../utils/motion` (added in Phase 3 Task 4 fix). ✓
