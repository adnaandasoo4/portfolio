# Portfolio v2 — Phase 3: Experience — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current Experience section (`react-vertical-timeline-component` with company icons + bullet-point cards) with a compact typographic vertical list. Each row shows role + company + dates on one line, with a 1-2 sentence description that expands on hover/focus.

**Architecture:** New `Experience.jsx` keeps the same filename and `SectionWrapper(Experience, "work")` export (no barrel or App.jsx churn). The `experiences` data shape is restructured: drop `icon`/`iconBg`/`points`, add `description`. Each row uses a CSS-grid `0fr ↔ 1fr` transition (modern, supported in all current browsers) for the height animation — cleaner than Framer Motion height-auto. Hover and keyboard focus toggle the expanded state via per-row React state. The `react-vertical-timeline-component` dep is removed since this is its sole consumer.

**Tech Stack:** React 18, Vite 4, Tailwind 3 (theme-variable tokens from Phase 0), Framer Motion (reveal register only, same custom-delay stagger pattern as Manifesto).

---

## Out of scope for this plan

- Reordering `App.jsx` to put Works before Experience (the spec order). Deferred to Phase 5 (Selected Work rewrite) to keep this phase scoped to a single section.
- Section number "02" gap: Manifesto is `01 — Index`, Experience is `03 — Experience`. While the old Works is still rendering between them, the visible numbering skips "02". Acceptable mid-transition; resolves when Works is rewritten in Phase 5.
- Deleting `freelance.png`, `fannie.png` from `public/`-style assets. They live in `src/assets/company/` and become orphan once `experiences` no longer references them. The actual `.png` files are deferred to the final cleanup phase; the import lines in `constants/index.js` are removed since they'd otherwise warn about unused imports.
- `meta`, `starbucks`, `tesla`, `shopify` company icon imports in `constants/index.js` — already orphan today (only `fannie`/`freelance` were used). Plan leaves these untouched (they were not introduced by this phase). Final cleanup sweep handles them.
- Updating `navLinks[1].title` from "experience" — keep as-is for nav compatibility.

## Verification approach

Same as prior phases: no test framework. Each task runs `npm run dev` via Bash (PowerShell has an execution-policy issue). Browser-only checks bundle into Task 4's smoke-test.

---

## File structure

**New content in `src/constants/index.js`:**
- New `experience` named export (`{ label }`) for the section's mono header.
- Restructured `experiences` array — drop `icon`/`iconBg`/`points`, add `description`.
- Drop the now-unused `freelance` and `fannie` imports from the top of the file.

**Rewritten files:**
- `src/components/Experience.jsx` — full replacement. New typographic list, per-row click/hover expand, no timeline lib.

**Modified files:**
- `package.json` — uninstall `react-vertical-timeline-component`.

**Files NOT touched:**
- `src/components/index.js` (Experience export name unchanged)
- `src/App.jsx` (Experience position unchanged)
- `navLinks` in constants (anchor `"work"` and label `"experience"` unchanged)
- All other section components, hoc, utils, assets directories
- `src/styles.js`, `src/utils/motion.js` (still consumed by Tech and Works)

---

## Tasks

### Task 1: Update `experiences` data + add `experience` content export

**Files:**
- Modify: `src/constants/index.js`

- [ ] **Step 1: Drop `freelance` and `fannie` from the asset imports**

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
  fannie,
  freelance,
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

Changes: remove the two lines `fannie,` and `freelance,`. Keep `meta, starbucks, tesla` (orphaned today but already in place; final cleanup sweep handles).

- [ ] **Step 2: Restructure the `experiences` array**

In `src/constants/index.js`, find the current `experiences` array (around lines 117–157). It's the block beginning `const experiences = [` with 3 entries each having `title`, `company_name`, `icon`, `iconBg`, `date`, `points`.

Replace the ENTIRE `const experiences = [...];` block (just `experiences`, NOT `services`/`technologies`/`projects`) with EXACTLY:

```js
const experiences = [
  {
    title: "Freelance Web Developer",
    company_name: "UI / UX clients",
    date: "Jun 2019 — Jan 2020",
    description:
      "Built and maintained React-based marketing sites and small web apps for design-led clients. Owned the engineering side end-to-end — scoping, implementation, browser QA, and handoff.",
  },
  {
    title: "Software Engineer Intern",
    company_name: "Fannie Mae",
    date: "Jun 2021 — Aug 2021",
    description:
      "Shipped internal React components on a financial-services platform team. Pair-programmed with senior engineers and presented final work to the broader org.",
  },
  {
    title: "Full Stack Developer",
    company_name: "Fannie Mae",
    date: "Jul 2023 — Present",
    description:
      "Owning frontend and full-stack work on data-heavy compliance dashboards. Day-to-day: React, TypeScript, Node, and shipping features that go through change-management review.",
  },
];
```

The new shape per entry is `{ title, company_name, date, description }`. Em-dashes in the date strings are U+2014.

- [ ] **Step 3: Add `experience` content export**

In `src/constants/index.js`, at the end of the file (after the last existing export, which is `manifesto`), append EXACTLY this block with one blank line before:

```js

export const experience = {
  // Small uppercase mono label rendered above the role list. Numbering follows
  // the spec — Manifesto is 01, Selected Work (Phase 5) is 02, Experience is 03,
  // Tech (Phase 4) is 04. The "02" gap is intentional mid-transition.
  label: "03 — Experience",
};
```

Ensure trailing newline.

- [ ] **Step 4: Smoke test (Bash, not PowerShell)**

```bash
npm run dev
```
(`run_in_background: true`. Wait ~3s. Read output. Confirm "ready in", NO "failed to resolve" errors. Kill.)

If Vite reports an import error for `freelance` or `fannie`, that means the old `Experience.jsx` (still pre-rewrite) is referencing them via the experiences array. Wait — the old `Experience.jsx` reads `experience.icon` and `experience.iconBg` from each entry, plus `experience.points.map(...)`. With the data shape change, the old Experience.jsx will crash at runtime when it renders. **But it'll still compile** — the constants file no longer imports the missing icons, but the old component doesn't directly import them either; it consumes the data via `experience.icon`, which is now `undefined`. So the build succeeds; only runtime breaks. That runtime break is unavoidable between Task 1 and Task 2 — accept it. The smoke test should confirm the build compiles.

- [ ] **Step 5: Commit**

```bash
git add src/constants/index.js
git commit -m "Restructure experiences shape (drop icons/bullets, add description); add experience label"
```

---

### Task 2: Rewrite `src/components/Experience.jsx`

**Files:**
- Modify: `src/components/Experience.jsx` (full replacement)

- [ ] **Step 1: Replace contents**

Open `src/components/Experience.jsx`. The current file imports `VerticalTimeline`, `VerticalTimelineElement`, a stylesheet, and renders cards. Replace its ENTIRE contents with EXACTLY:

```jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { experience, experiences } from "../constants";
import { SectionWrapper } from "../hoc";

const ease = [0.65, 0, 0.35, 1];
const reveal = {
  hidden: { opacity: 0, y: 12 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease, delay },
  }),
};

/**
 * Single experience row. Default state is collapsed (just role + company + date).
 * Hover or keyboard focus expands the description below via a CSS grid-template-rows
 * 0fr→1fr transition (modern, no JS measurement needed).
 */
function ExperienceRow({ entry, index }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.li
      variants={reveal}
      custom={0.15 + index * 0.06}
      className="border-t border-edge last:border-b"
    >
      <button
        type="button"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        aria-expanded={isOpen}
        className="w-full text-left py-6 outline-none transition-opacity focus-visible:opacity-90"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="text-ink text-xl sm:text-2xl leading-tight">
            <span className="font-medium">{entry.title}</span>
            <span className="ml-2 text-muted font-normal">{entry.company_name}</span>
          </h3>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted whitespace-nowrap">
            {entry.date}
          </span>
        </div>
        <div
          className={`grid transition-all duration-300 ${
            isOpen ? "mt-3 grid-rows-[1fr] opacity-100" : "mt-0 grid-rows-[0fr] opacity-0"
          }`}
          style={{ transitionTimingFunction: "cubic-bezier(0.65, 0, 0.35, 1)" }}
        >
          <p className="max-w-2xl overflow-hidden text-sm sm:text-base leading-relaxed text-ink">
            {entry.description}
          </p>
        </div>
      </button>
    </motion.li>
  );
}

function Experience() {
  return (
    <div className="flex flex-col gap-10 py-24">
      <motion.span
        variants={reveal}
        custom={0}
        className="font-mono text-[10px] uppercase tracking-widest text-muted"
      >
        {experience.label}
      </motion.span>

      <motion.ul
        variants={reveal}
        custom={0.1}
        className="flex flex-col"
      >
        {experiences.map((entry, i) => (
          <ExperienceRow key={`${entry.title}-${entry.company_name}-${entry.date}`} entry={entry} index={i} />
        ))}
      </motion.ul>
    </div>
  );
}

export default SectionWrapper(Experience, "work");
```

Note on the `key` prop: combining `title + company_name + date` creates a stable composite key that survives entry reordering without animation jitter. Using `index` as a key would cause Framer Motion to remap variants on reorder.

Note on the grid-row trick: `grid-template-rows: 0fr` → `1fr` smoothly transitions block height with the content as a single grid item. The child `<p>` needs `overflow: hidden` so its content clips during the transition (placed in the className).

- [ ] **Step 2: Smoke test (Bash)**

```bash
npm run dev
```
(`run_in_background: true`, wait ~5s, confirm "ready in" with NO compile errors, kill.)

If Vite reports an error about `experience` or `experiences` not being exported, double-check Task 1's constants changes landed correctly.

- [ ] **Step 3: Commit**

```bash
git add src/components/Experience.jsx
git commit -m "Rewrite Experience: typographic vertical list with hover-expand"
```

---

### Task 3: Uninstall `react-vertical-timeline-component`

**Files:**
- Modify: `package.json`, `package-lock.json` (via `npm uninstall`)

- [ ] **Step 1: Verify the package is now orphan**

Confirm nothing in `src/` imports from `react-vertical-timeline-component`:

```bash
grep -rln "react-vertical-timeline-component" src/ 2>/dev/null || echo "no remaining imports"
```

Expected: `no remaining imports`. (The old `Experience.jsx` was the sole consumer, and Task 2 replaced it.)

- [ ] **Step 2: Uninstall**

```bash
npm uninstall react-vertical-timeline-component
```

Expected: npm removes the package from `dependencies` in `package.json` and prunes the lockfile.

- [ ] **Step 3: Smoke test (Bash)**

```bash
npm run dev
```
(`run_in_background: true`, wait ~3s, confirm "ready in", kill)

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "Remove react-vertical-timeline-component (no longer consumed)"
```

---

### Task 4: Phase 3 final smoke test

**Files:**
- None modified — verification only (unless a check fails and needs a mechanical fix).

- [ ] **Step 1: Automated checks (Bash)**

Run each and report PASS/FAIL:

```bash
npm run dev
```
(`run_in_background: true`, wait ~5s, confirm "ready in" with the local URL, kill)

```bash
npm run build
```
Expected: clean build. Note bundle size — phase 1 baseline was 1238.69 KB / 374.06 KB gzipped, phase 2 essentially identical. Phase 3 should drop slightly with `react-vertical-timeline-component` gone (~30-50 KB depending on tree-shaking).

```bash
grep -rln "react-vertical-timeline-component\|VerticalTimeline" src/ 2>/dev/null || echo "no remaining refs"
```
Expected: `no remaining refs`.

```bash
grep -rln "experience\.icon\|experience\.iconBg\|experience\.points" src/ 2>/dev/null || echo "no orphan field refs"
```
Expected: `no orphan field refs` (the old icon/iconBg/points fields are gone).

```bash
grep -E "^const experiences|^export const experience " src/constants/index.js
```
Expected: 2 matches — the `const experiences` declaration AND the `export const experience` declaration.

```bash
npm ls react-vertical-timeline-component 2>&1 | grep -E "vertical-timeline|empty"
```
Expected: shows the package is not in dependencies (either empty output or "(empty)").

```bash
git log --oneline portfolio_testing -8
```
Expected: 4 new commits since Phase 2's final (`b6c53fb`):
- Phase 3 plan commit
- `Restructure experiences shape...`
- `Rewrite Experience: typographic vertical list...`
- `Remove react-vertical-timeline-component...`

```bash
git status --short
```
Expected: only `.claude/` and `CLAUDE.md` (pre-existing untracked).

- [ ] **Step 2: Surface manual browser checklist**

Report verbatim:

```
## User browser verification (Phase 3)

Open the dev server URL in a fresh tab. Hard-reload (Ctrl+Shift+R).

1. Console: free of red errors.
2. Scroll past the hero and Manifesto. The Experience section appears with:
   - A small uppercase mono label: "03 — EXPERIENCE"
   - A vertical list of 3 rows separated by thin 1px lines.
3. Each row shows: role + company on the left ("Freelance Web Developer  UI / UX clients"),
   and a date range on the right in uppercase mono ("JUN 2019 — JAN 2020").
4. Default state: rows are collapsed — only the single-line title + date are visible.
5. Hover any row — the description fades + expands underneath smoothly (~300ms).
   Mouse off — collapses back.
6. Tab through the rows with the keyboard — each row's description expands on focus,
   collapses on blur. Same animation as hover.
7. No timeline graphic, no icons, no card backgrounds. Just typographic rows with hairline dividers.
8. Sections below (Tech, Works) still render with their OLD design — that's expected
   (Phases 4 and 5).
9. Switch to dark mode (DARK toggle in navbar). Experience text flips to cream,
   border-lines + label color flip too. Legibility preserved.
10. Click the navbar's "experience" link — page smooth-scrolls to the section.
```

- [ ] **Step 3: If any automated check fails — fix and commit**

If a mechanical issue surfaces (missed import, stale reference), fix it and commit:

```bash
git add <files>
git commit -m "Phase 3 final smoke test fixes"
```

Otherwise no further commit — Phase 3 is complete.

---

## Self-review

**Spec coverage check** (against design spec §3.4 Experience):

§3.4 Experience requirements:
- ✓ Small mono label `03 — EXPERIENCE` — Task 1 (`experience.label`) + Task 2 (rendered with mono uppercase classes)
- ✓ Vertical list of roles — Task 2 (`<motion.ul>` with `<ExperienceRow>` per entry)
- ✓ No timeline graphic, no icons — Task 2 (plain text rows, no `<img>`, no decorative graphics)
- ✓ Role + company on left, dates on right — Task 2 (`<div className="flex justify-between">` with title/company in `<h3>` left, date `<span>` right)
- ✓ 1-2 sentence description, collapsed by default — Task 1 (new `description` field, 1-2 sentences) + Task 2 (initial `isOpen: false`, grid-rows 0fr)
- ✓ Hover/click expand smoothly — Task 2 (`onMouseEnter`/`onFocus` set isOpen, CSS grid transition)
- ✓ Reveal register, per-row stagger — Task 2 (Framer Motion `reveal` variant with `custom={0.15 + i*0.06}`)

Phase delivery requirements:
- ✓ Single-section rewrite, no other sections touched
- ✓ `react-vertical-timeline-component` removed since this phase made it orphan (same pattern as Phase 1's emailjs/maath removal)
- ✓ Content gate: user provides real job descriptions later

**Placeholder scan:** All code blocks are complete and runnable. No TBD/TODO markers. Commands have expected outputs.

**Type consistency:**
- `experience` exported from constants as `{ label: string }` (Task 1 Step 3); consumed in Task 2 as `experience.label`. ✓
- `experiences` shape `{ title: string, company_name: string, date: string, description: string }` (Task 1 Step 2); consumed in Task 2's `ExperienceRow` props (`entry.title`, `entry.company_name`, `entry.date`, `entry.description`). ✓
- `SectionWrapper(Experience, "work")` two-arg form (unchanged from old export). ✓
- `motion`, `useState` imports valid. ✓
