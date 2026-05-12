# Portfolio v2 — Phase 2: Manifesto — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current About section + service cards (Tilt-driven gradient cards) with a typographic Manifesto section: small mono label, a 2-sentence display-weight intro, and a row of skill/value pills.

**Architecture:** New `Manifesto.jsx` component replaces `About.jsx`. Section keeps the `id="about"` anchor for nav compatibility (no `constants.navLinks` change needed). Content lives in `constants/index.js`: existing `manifestoBullets` provides the pills; a new `manifesto` object provides the label and intro paragraph. The component uses `SectionWrapper` HOC (same pattern as old About) for the section shell, anchor span, and reveal trigger; child motion elements use `custom` deltas for a per-element stagger without modifying `SectionWrapper`.

**Tech Stack:** React 18, Vite 4, Tailwind 3 (theme-variable tokens from Phase 0), Framer Motion (reveal register only — no GSAP in this phase). Inline `style` for the clamp() font size (same pattern as Hero in Phase 1).

---

## Out of scope for this plan

- `services` array in `src/constants/index.js` becomes orphan (no consumer after this phase). Same for the `web`/`mobile`/`backend`/`creator` PNG imports in `src/assets/`. Deferred to a final cleanup phase after Phase 5, alongside the other legacy-token / legacy-asset removals.
- `react-tilt` dependency becomes orphan (only consumer was the old About). Also deferred to the cleanup phase to stay consistent with the "phases don't churn package.json beyond the dep being removed in *this* phase" rule. (Phase 1 was an exception because emailjs + maath were unambiguously dead the moment their consumer was rewritten — same is true of react-tilt here, but to keep the phase pattern clean and avoid lockfile thrash mid-redesign we leave it.)
- The visible navbar link still reads `about` (from `navLinks[0].title`). Renaming to "manifesto" or "index" is a content-gate decision the user can make anytime via a one-line constants edit.

## Verification approach

Same as Phases 0 and 1: no test framework. Each task runs `npm run dev` (via Bash, not PowerShell — execution policy) to confirm Vite compiles, then a manual browser pass at the end of the phase. Browser-only checks are surfaced in Task 6.

---

## File structure

**New files:**
- `src/components/Manifesto.jsx` — the new section component. Renders the label, intro, and pills. Exports `SectionWrapper(Manifesto, "about")`.

**Modified files:**
- `src/constants/index.js` — appends a `manifesto` export (`{ label, intro }`). Keeps existing `manifestoBullets`. Does NOT remove `services` (deferred).
- `src/components/index.js` — replaces the `About` import + export with `Manifesto`.
- `src/App.jsx` — replaces `<About />` with `<Manifesto />` and updates the named import.

**Deleted files:**
- `src/components/About.jsx` — replaced by Manifesto.

**Files NOT touched:**
- `src/constants/index.js`'s `services`, `web`/`mobile`/`backend`/`creator` asset entries (deferred orphan cleanup)
- `src/components/Loader.jsx`, `src/components/canvas/Ball.jsx` (used by Tech until Phase 4)
- `src/components/Hero.jsx`, `Navbar.jsx`, `Contact.jsx` (Phase 1)
- All `*.jsx` for `Experience`, `Tech`, `Works` (Phases 3–5)
- `src/index.css` (gradient classes still used by Experience/Tech/Works)
- `src/styles.js`, `src/utils/motion.js` (still used by other legacy section components)
- `src/hoc/SectionWrapper.jsx` (Manifesto uses it as-is)

---

## Tasks

### Task 1: Add `manifesto` content to `src/constants/index.js`

**Files:**
- Modify: `src/constants/index.js` (append-only)

- [ ] **Step 1: Append new export**

Open `src/constants/index.js`. After the last existing export (which after Phase 1 is `export const footer = { ... };`), append EXACTLY this block (with one blank line before it):

```js

export const manifesto = {
  // Small uppercase mono label rendered above the intro. The em-dash is U+2014.
  label: "01 — Index",
  // Two-sentence intro, rendered at display weight. Edit anytime — components
  // re-render automatically. Keep under ~60ch for line-length comfort.
  intro:
    "Frontend engineer focused on motion, scroll-driven interfaces, and craft-level UI. I care about how software feels — restraint, rhythm, and the moments that surprise.",
};
```

Ensure the file still ends with a single trailing newline.

- [ ] **Step 2: Smoke test (Bash, not PowerShell)**

```bash
npm run dev
```
(`run_in_background: true`. Wait ~3 seconds, read output for "ready in", kill the process.)

- [ ] **Step 3: Commit**

```bash
git add src/constants/index.js
git commit -m "Add manifesto content (label + intro) for Phase 2"
```

---

### Task 2: Create `src/components/Manifesto.jsx`

**Files:**
- Create: `src/components/Manifesto.jsx`

- [ ] **Step 1: Write the component**

Create `src/components/Manifesto.jsx` with EXACTLY:

```jsx
import { motion } from "framer-motion";
import { manifesto, manifestoBullets } from "../constants";
import { SectionWrapper } from "../hoc";

// Reveal variant with a per-element delay supplied via `custom`. Children inside
// the SectionWrapper-wrapped section all receive the "show" state at once when
// the section scrolls into view; each element's own `transition.delay` (from
// `custom`) staggers them. This avoids needing to modify the SectionWrapper HOC.
const ease = [0.65, 0, 0.35, 1];
const reveal = {
  hidden: { opacity: 0, y: 12 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease, delay },
  }),
};

function Manifesto() {
  return (
    <div className="flex flex-col gap-10 py-24">
      {/* Section number + label */}
      <motion.span
        variants={reveal}
        custom={0}
        className="font-mono text-[10px] uppercase tracking-widest text-muted"
      >
        {manifesto.label}
      </motion.span>

      {/* Intro paragraph in display weight */}
      <motion.p
        variants={reveal}
        custom={0.1}
        className="text-ink"
        style={{
          fontWeight: 700,
          fontSize: "clamp(28px, 4vw, 56px)",
          lineHeight: 1.1,
          letterSpacing: "-0.015em",
          maxWidth: "60ch",
        }}
      >
        {manifesto.intro}
      </motion.p>

      {/* Skill / value pills */}
      <motion.ul
        variants={reveal}
        custom={0.25}
        className="flex flex-wrap gap-2"
      >
        {manifestoBullets.map((bullet, i) => (
          <motion.li
            key={bullet}
            variants={reveal}
            custom={0.3 + i * 0.05}
            className="rounded-full border border-edge px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted"
          >
            {bullet}
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}

export default SectionWrapper(Manifesto, "about");
```

**Why this shape:**
- `SectionWrapper(Manifesto, "about")` keeps the `#about` anchor working with the navbar's existing `navLinks[0].id === "about"`. No navLinks change required.
- Inner motion elements opt into the parent's variant state propagation (the SectionWrapper's `motion.section` is `whileInView='show'`); each child's `custom` value translates into its own `transition.delay`, producing a stagger without needing parent `staggerChildren` config.
- The intro paragraph uses inline `style` for clamp() font-size because Tailwind config doesn't express fluid display sizes cleanly. Same pattern as Hero in Phase 1.
- The pills use the same shape as the footer's personality pills in Phase 1 (`rounded-full border border-edge px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted`) for visual consistency.

- [ ] **Step 2: Smoke test (Bash)**

```bash
npm run dev
```
(background, wait ~3s, confirm "ready in" with NO compile errors, kill)

The component isn't wired into App.jsx yet — this just verifies the file compiles.

- [ ] **Step 3: Commit**

```bash
git add src/components/Manifesto.jsx
git commit -m "Add Manifesto section component (typographic intro + pills)"
```

---

### Task 3: Delete `src/components/About.jsx`

**Files:**
- Delete: `src/components/About.jsx`

- [ ] **Step 1: Delete the file**

Use Bash:

```bash
rm src/components/About.jsx
```

- [ ] **Step 2: Smoke test (Bash)**

The dev server will fail to compile at this point because `src/components/index.js` still references `About.jsx`. That's expected. Skip the dev-server check this task — Task 4 fixes the barrel and Task 5 fixes App.jsx, after which compilation returns to clean.

Do NOT commit yet — the staged tree is mid-rewrite. Commit happens in the next task once the barrel is updated.

---

### Task 4: Update `src/components/index.js` (rename About → Manifesto)

**Files:**
- Modify: `src/components/index.js`

- [ ] **Step 1: Replace contents**

Open `src/components/index.js`. It currently reads:

```js
import { BallCanvas } from './canvas';
import Hero from './Hero';
import Navbar from './Navbar';
import About from './About';
import Tech from './Tech';
import Experience from './Experience';
import Works from './Works';
import Contact from './Contact';

export {
  Hero,
  Navbar,
  About,
  Tech,
  Experience,
  Works,
  Contact,
  BallCanvas,
};
```

Replace its contents with EXACTLY:

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

Changes: two lines — `About` → `Manifesto` in the import statement, `About` → `Manifesto` in the export list.

- [ ] **Step 2: Smoke test (Bash)**

The dev server will STILL fail to compile because `src/App.jsx` still references the now-removed `About` named import. Expected. Task 5 fixes it. Skip the dev-server check this task.

- [ ] **Step 3: Stage but don't commit yet**

```bash
git add src/components/About.jsx src/components/index.js
```

(Combining the About.jsx deletion from Task 3 with the barrel update — these are inseparable. The actual commit happens in Task 5 once App.jsx also references Manifesto.)

---

### Task 5: Update `src/App.jsx` (render Manifesto instead of About)

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Replace contents**

Open `src/App.jsx`. It currently reads:

```jsx
import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { About, Contact, Experience, Hero, Navbar, Tech, Works } from './components';
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
            <About />
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

Replace its contents with EXACTLY:

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

Changes: two — `About` → `Manifesto` in the named-import alphabetical list, `<About />` → `<Manifesto />` in the JSX.

- [ ] **Step 2: Smoke test (Bash) — compile must now be clean**

```bash
npm run dev
```
(`run_in_background: true`. Wait ~5s. Read output. Verify "ready in" with NO "failed to resolve" errors. Kill.)

If Vite reports any error referencing `About`, `./About`, or `Manifesto`, that's a BLOCKED state — investigate and fix before committing.

- [ ] **Step 3: Stage + commit the full rename together**

```bash
git add src/App.jsx
git commit -m "Replace About section with Manifesto (rename + new typographic design)"
```

(After this commit, `git status` should show a clean working tree apart from the pre-existing untracked `.claude/` and `CLAUDE.md`. The single commit captures the full rename across About.jsx delete + barrel + App.jsx + Manifesto.jsx — Manifesto.jsx itself was a separate commit in Task 2 because it was an isolated, fully-functional new file that compiles on its own.)

---

### Task 6: Phase 2 final smoke test

**Files:**
- None modified — verification only (unless an automated check fails and needs a mechanical fix).

- [ ] **Step 1: Run automated checks via Bash**

```bash
npm run dev
```
(`run_in_background: true`, wait ~5s, confirm "ready in", note URL, kill)

```bash
npm run build
```
Expected: clean build, bundle size roughly similar to Phase 1's (1238 KB / 374 KB gzipped). Maybe slightly smaller since the Tilt-driven About is gone but Tilt is still bundled (deferred cleanup).

```bash
ls src/components/About.jsx 2>&1
```
Expected: `cannot access 'src/components/About.jsx': No such file or directory` (or similar).

```bash
ls src/components/Manifesto.jsx
```
Expected: file listed.

```bash
grep -rn "from './About'\|from \"./About\"\|<About" src/ 2>/dev/null
```
Expected: no output (no remaining About references).

```bash
grep -rn "Manifesto" src/
```
Expected: matches in `src/components/Manifesto.jsx`, `src/components/index.js`, and `src/App.jsx`.

```bash
grep "^export const manifesto" src/constants/index.js
```
Expected: 1 match.

```bash
git log --oneline portfolio_testing -10
```
Expected: 3 new commits since Phase 1's final commit (`9e1c80d`):
- `<sha>` Replace About section with Manifesto
- `<sha>` Add Manifesto section component
- `<sha>` Add manifesto content (label + intro)

```bash
git status --short
```
Expected: only `.claude/` and `CLAUDE.md` (pre-existing untracked).

- [ ] **Step 2: Surface manual browser checklist**

Report this checklist verbatim to the user:

```
## User browser verification (Phase 2)

Open the dev server URL in a fresh tab. Hard-reload (Ctrl+Shift+R).

1. Console: free of red errors.
2. Scroll past the hero. The Manifesto section appears with:
   - A small uppercase mono label: "01 — INDEX"
   - A two-sentence display-weight paragraph (~28-56px depending on viewport width)
   - A row of 4 pills below: Motion, Scroll-driven UI, WebGL, Design systems
3. On scroll-in, the label, paragraph, ul, and pills each fade-and-slide up at slightly
   different times (per-element stagger ~50ms between pills, ~100ms between sections).
4. Click the navbar's "about" link — page smooth-scrolls to the Manifesto section.
5. The OLD About design (4 gradient/Tilt cards with web/mobile/backend/creator icons) is GONE.
6. Sections below (Experience, Tech, Works) still render with their OLD design — that's
   expected, they get rewritten in Phases 3-5.
7. Switch to dark mode (DARK toggle in navbar). The Manifesto text flips to cream;
   pill borders + label color flip too. Everything stays legible.
```

- [ ] **Step 3: If any automated check fails — fix and commit**

If a check fails mechanically (e.g., a missed reference), fix and commit:

```bash
git add <files>
git commit -m "Phase 2 final smoke test fixes"
```

Otherwise no further commit — Phase 2 is complete.

---

## Self-review

**Spec coverage check** (against design spec §3.2 Manifesto, and §5 Phase 2 entry):

§3.2 Manifesto requirements:
- ✓ Small mono label `01 — INDEX` — Task 1 (`manifesto.label`) + Task 2 (rendered as `font-mono text-[10px] uppercase tracking-widest text-muted`)
- ✓ Intro 2-3 sentences in display weight (clamp 28–56px) — Task 1 (`manifesto.intro`) + Task 2 (inline style with `clamp(28px, 4vw, 56px)`, fontWeight 700)
- ✓ 3-4 short skill/value pills — uses existing `manifestoBullets` from Phase 0; Task 2 renders them
- ✓ Replaces About + services cards — Task 3 deletes About.jsx; Task 4 + Task 5 swap consumers; services not consumed anywhere after this phase (orphan, deferred cleanup)
- ✓ Motion: reveal register only — Task 2 uses Framer Motion `reveal` variant; no GSAP
- ✓ Lines stagger in on scroll-in — Task 2's per-element `custom` deltas produce the stagger

§5 Phase 2 delivery requirements:
- ✓ Section-by-section delivery; this is a small phase, single section
- ✓ Approval-gated; this plan is one of those gates
- ✓ Content gate: user provides intro paragraph (placeholder in place)

**Placeholder scan:** All code blocks are complete and runnable. No "TBD", "implement later", or "similar to Task N". Commands are concrete with expected outputs.

**Type consistency:**
- `manifesto` exported from constants as `{ label: string, intro: string }` (Task 1); consumed in Task 2 as `manifesto.label` and `manifesto.intro`. ✓
- `manifestoBullets` (string[]) defined in Phase 0 Task 9, consumed in Task 2's `.map((bullet, i) => ...)`. ✓
- `SectionWrapper(Component, idName)` two-arg form from Phase 0 + Phase 1; Task 2 uses it. ✓
- `motion` named import from "framer-motion" — already present in the project (used by Hero, etc.). ✓
- `Manifesto` named export from `src/components/Manifesto.jsx` (Task 2); consumed by `src/components/index.js` (Task 4) and `src/App.jsx` (Task 5). ✓
