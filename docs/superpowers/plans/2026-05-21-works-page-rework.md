# /works typographic index rework — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the alternating image-left/image-right `/works` layout with an editorial-playful typographic index. A floating cover-image preview anchored to the cursor crossfades between rows on hover.

**Architecture:** `src/components/AllWorks.jsx` is rewritten to render a display title and a single `<ul>` of 5 typographic rows. A single shared preview element lives at the bottom of the component, position: fixed, lerp-following the mouse via `requestAnimationFrame`. Cohesion tweaks adjust two `data-cursor` strings in `src/components/SelectedWork.jsx`. No new files, no new utilities — all motion uses existing Framer Motion + Tailwind primitives.

**Tech Stack:** React 18, React Router DOM, Framer Motion (`motion`, `AnimatePresence`, `useReducedMotion`), Tailwind CSS, Vite. No tests configured — verification is `npm run lint` + `npm run build` + manual visual smoke at `localhost:5173` (dev server runs in the background).

**Spec:** `docs/superpowers/specs/2026-05-21-works-page-rework-design.md`

---

## File map

- **Modify:** `src/components/AllWorks.jsx` — full rewrite (current file is ~180 lines, end state ~230 lines)
- **Modify:** `src/components/SelectedWork.jsx` — two `data-cursor` attribute changes
- **No new files.** No changes to constants, motion utilities, routing, or design tokens.

The component stays in one file. Per the spec, a `WorksCursorPreview.jsx` factoring is optional — only do it if AllWorks crosses ~250 lines after implementation. Decide at Task 11.

---

## Verification primitives

Each task ends with one or more of these checks:

- **Lint:** `npm run lint` — must exit 0 (configured with `--max-warnings 0`).
- **Build:** `npm run build` — must exit 0 (run only at the end and on demand).
- **Visual:** open `http://localhost:5173/works` (the Vite dev server is already running in the background) and confirm the described behavior. Specific things to look at are called out per task.
- **Commit:** `git add` the specific file(s) and create a focused commit.

---

## Task 1: Replace AllWorks with the typographic row skeleton

**Files:**
- Modify: `src/components/AllWorks.jsx` (full rewrite, no hover state, no preview, no reveals yet)

**Why this comes first:** Get the layout shape rendering correctly with the right typography and spacing before layering motion on top. Easier to debug positioning issues without the cursor-follow code interfering.

- [ ] **Step 1: Read the current file**

Run: `Read src/components/AllWorks.jsx`
Note current imports and the `Contact` reuse pattern.

- [ ] **Step 2: Replace the file with the skeleton**

Write `src/components/AllWorks.jsx`:

```jsx
import { Link } from "react-router-dom";

import { projects } from "../constants";
import Contact from "./Contact";

/**
 * AllWorks — typographic index at /works.
 *
 * 5 stacked rows, each is a single <Link>. Display-size project name carries
 * the row; index (mono) on the left, year + services (mono) on the right.
 * Cursor-follow preview and reveal animations are layered on by later tasks.
 */
export default function AllWorks() {
  return (
    <main className="relative w-full bg-paper text-ink">
      {/* Display title — same Cabinet Grotesk treatment as the home Hero and
          per-project titles. Top padding clears the fixed navbar. */}
      <section className="mx-auto flex max-w-screen-2xl flex-col gap-8 px-6 pb-16 pt-32 sm:px-16 sm:pt-40">
        <h1
          className="font-display uppercase"
          style={{
            fontWeight: 700,
            fontSize: "clamp(40px, 6vw, 96px)",
            lineHeight: 0.95,
            letterSpacing: "-0.02em",
          }}
        >
          Works
        </h1>
      </section>

      {/* Typographic index — 5 rows, hairline above each + closer hairline
          below the list. Each row is a single Link. */}
      <section className="mx-auto w-full max-w-screen-2xl px-6 pb-24 sm:px-16">
        <ul role="list" className="border-b border-edge">
          {projects.map((project, i) => (
            <li key={project.slug}>
              <Link
                to={`/works/${project.slug}`}
                data-cursor="open project"
                aria-label={`Open ${project.name}, ${project.year}`}
                className="group flex items-baseline justify-between gap-8 border-t border-edge py-5 sm:py-7 focus:outline-none"
              >
                <div className="flex items-baseline gap-6">
                  <span
                    aria-hidden="true"
                    className="font-mono text-xs uppercase tracking-widest text-muted"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2
                    className="font-display uppercase"
                    style={{
                      fontWeight: 700,
                      fontSize: "clamp(48px, 7vw, 112px)",
                      lineHeight: 1,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {project.name}
                  </h2>
                </div>
                <span className="whitespace-nowrap font-mono text-xs uppercase tracking-widest text-muted">
                  {project.year} · {project.services.join(", ")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <Contact />
    </main>
  );
}
```

- [ ] **Step 3: Visual check**

Refresh `http://localhost:5173/works`. Confirm:
- Big `WORKS` title at top (no animation yet).
- 5 rows, each on its own line with `01`/`02`/… on the left, the display-cased project name in the middle, year and services on the right.
- Hairlines above each row and below the last row.
- Hovering a row swaps the cursor label to "open project" (the existing `CustomCursor` reads `data-cursor`).
- Clicking a row navigates to the project detail page.

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: exit 0, no warnings.

- [ ] **Step 5: Commit**

```bash
git add src/components/AllWorks.jsx
git commit -m "AllWorks: replace alternating layout with typographic row skeleton"
```

---

## Task 2: Row dim on hover

**Files:**
- Modify: `src/components/AllWorks.jsx`

- [ ] **Step 1: Add useState import and hoveredIdx state**

Replace the import line and add state inside the component:

```jsx
import { useState } from "react";
import { Link } from "react-router-dom";

import { projects } from "../constants";
import Contact from "./Contact";

// ...

export default function AllWorks() {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  return (
    // ... existing JSX
  );
}
```

- [ ] **Step 2: Wire mouseLeave on the list and mouseEnter on each link**

Replace the `<ul>` opening tag and the `<Link>` opening tag inside the map:

```jsx
<ul
  role="list"
  className="border-b border-edge"
  onMouseLeave={() => setHoveredIdx(null)}
>
  {projects.map((project, i) => (
    <li
      key={project.slug}
      style={{
        opacity: hoveredIdx !== null && hoveredIdx !== i ? 0.35 : 1,
        transition: "opacity 200ms",
      }}
    >
      <Link
        to={`/works/${project.slug}`}
        data-cursor="open project"
        aria-label={`Open ${project.name}, ${project.year}`}
        onMouseEnter={() => setHoveredIdx(i)}
        className="group flex items-baseline justify-between gap-8 border-t border-edge py-5 sm:py-7 focus:outline-none"
      >
        {/* ... unchanged inner content ... */}
      </Link>
    </li>
  ))}
</ul>
```

- [ ] **Step 3: Visual check**

Refresh `/works`. Hover any row — other rows should fade to ~35% opacity. Move cursor between rows — the dim follows the active row. Move cursor off the list — all rows return to full opacity.

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/components/AllWorks.jsx
git commit -m "AllWorks: dim non-hovered rows to 0.35 on row hover"
```

---

## Task 3: Cursor-follow preview (position + visibility)

**Files:**
- Modify: `src/components/AllWorks.jsx`

This task adds the floating preview element and the rAF lerp loop, but uses static `<img>` (no crossfade yet — that comes in Task 4).

- [ ] **Step 1: Add refs, mouse tracking, and rAF loop**

Update imports at the top:

```jsx
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { projects } from "../constants";
import Contact from "./Contact";

const PREVIEW_WIDTH = "clamp(240px, 22vw, 360px)";
const LERP = 0.18;
const OFFSET_X = 24;
const OFFSET_Y = 24;
```

Inside `AllWorks`, before the `return`:

```jsx
const previewRef = useRef(null);
const mouseTarget = useRef({ x: 0, y: 0 });
const current = useRef({ x: 0, y: 0 });
const rafId = useRef(null);

// Preload all cover images on mount so the swap is instant on first hover.
useEffect(() => {
  projects.forEach((p) => {
    if (p.coverImage) {
      const img = new Image();
      img.src = p.coverImage;
    }
  });
}, []);

// Track mouse position at window level. Single passive listener for the
// lifetime of the page.
useEffect(() => {
  const handleMove = (e) => {
    mouseTarget.current.x = e.clientX;
    mouseTarget.current.y = e.clientY;
  };
  window.addEventListener("mousemove", handleMove);
  return () => window.removeEventListener("mousemove", handleMove);
}, []);

// rAF lerp loop. Only runs while a row is hovered. Seeds current at the
// mouse position on engage so the preview doesn't glide in from (0,0).
useEffect(() => {
  if (hoveredIdx === null) return;

  current.current.x = mouseTarget.current.x;
  current.current.y = mouseTarget.current.y;

  const tick = () => {
    current.current.x += (mouseTarget.current.x - current.current.x) * LERP;
    current.current.y += (mouseTarget.current.y - current.current.y) * LERP;

    const el = previewRef.current;
    if (el) {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const x = Math.max(
        0,
        Math.min(window.innerWidth - w, current.current.x + OFFSET_X)
      );
      const y = Math.max(
        0,
        Math.min(window.innerHeight - h, current.current.y + OFFSET_Y)
      );
      el.style.transform = `translate(${x}px, ${y}px)`;
    }
    rafId.current = requestAnimationFrame(tick);
  };
  rafId.current = requestAnimationFrame(tick);

  return () => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
  };
}, [hoveredIdx]);
```

- [ ] **Step 2: Render the preview element**

Insert this just before `<Contact />` at the bottom of the `return`:

```jsx
{/* Cursor-follow preview. position: fixed; translated by rAF loop above.
    Hidden on mobile (no hover) and under prefers-reduced-motion (Task 8
    swaps in the inline thumb behavior for that case). */}
<div
  ref={previewRef}
  className="pointer-events-none fixed left-0 top-0 z-40 hidden sm:block motion-reduce:hidden"
  style={{
    width: PREVIEW_WIDTH,
    aspectRatio: "16 / 10",
    opacity: hoveredIdx !== null ? 1 : 0,
    transition: "opacity 240ms",
    willChange: "transform, opacity",
  }}
>
  {hoveredIdx !== null &&
    (projects[hoveredIdx].coverImage ? (
      <img
        src={projects[hoveredIdx].coverImage}
        alt=""
        className="h-full w-full object-cover"
      />
    ) : (
      <div className="flex h-full w-full items-center justify-center bg-edge font-mono text-xs uppercase tracking-widest text-muted">
        {projects[hoveredIdx].name}
      </div>
    ))}
</div>
```

- [ ] **Step 3: Visual check**

Refresh `/works`. Hover any row — the cover image should appear next to the cursor (offset +24/+24px) and follow as you move. Moving between rows swaps the image immediately. Moving cursor near the right or bottom edge of the viewport — preview clamps inside the viewport, doesn't clip. Moving off the list — preview fades out over ~240ms.

Open DevTools Performance briefly to confirm no runaway rAF activity when the cursor is off the list (the loop should not be running).

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/components/AllWorks.jsx
git commit -m "AllWorks: add cursor-follow preview with rAF lerp"
```

---

## Task 4: Crossfade preview image on row change

**Files:**
- Modify: `src/components/AllWorks.jsx`

The preview position glides smoothly; now make the image swap also fade rather than cut.

- [ ] **Step 1: Import AnimatePresence and motion**

Update imports at the top:

```jsx
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
```

- [ ] **Step 2: Replace the preview's inner content with an AnimatePresence-keyed layer**

Replace the entire preview `<div>` (rendered above `<Contact />`) with:

```jsx
<div
  ref={previewRef}
  className="pointer-events-none fixed left-0 top-0 z-40 hidden sm:block motion-reduce:hidden"
  style={{
    width: PREVIEW_WIDTH,
    aspectRatio: "16 / 10",
    willChange: "transform",
  }}
>
  <AnimatePresence>
    {hoveredIdx !== null && (
      <motion.div
        key={hoveredIdx}
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
      >
        {projects[hoveredIdx].coverImage ? (
          <img
            src={projects[hoveredIdx].coverImage}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-edge font-mono text-xs uppercase tracking-widest text-muted">
            {projects[hoveredIdx].name}
          </div>
        )}
      </motion.div>
    )}
  </AnimatePresence>
</div>
```

Notes:
- The outer `<div>` no longer sets opacity directly — AnimatePresence manages the inner `motion.div`'s opacity.
- The `key={hoveredIdx}` causes the inner layer to unmount and a new layer to mount on each row change; their fade-out and fade-in overlap → crossfade.
- Position (translate) still set by the rAF loop on `previewRef`. The inner motion.div is `absolute inset-0` so it inherits the translation.

- [ ] **Step 3: Visual check**

Refresh `/works`. Hover row 1, then quickly move to row 3 — the image should smoothly fade between projects (no hard cut). Hovering and leaving — preview fades out cleanly.

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/components/AllWorks.jsx
git commit -m "AllWorks: crossfade preview image on row change"
```

---

## Task 5: Title letter-mask reveal on mount

**Files:**
- Modify: `src/components/AllWorks.jsx`

- [ ] **Step 1: Replace the title with per-letter motion spans**

In the display title section, replace:

```jsx
<h1
  className="font-display uppercase"
  style={{
    fontWeight: 700,
    fontSize: "clamp(40px, 6vw, 96px)",
    lineHeight: 0.95,
    letterSpacing: "-0.02em",
  }}
>
  Works
</h1>
```

With:

```jsx
<h1
  className="font-display uppercase"
  style={{
    fontWeight: 700,
    fontSize: "clamp(40px, 6vw, 96px)",
    lineHeight: 0.95,
    letterSpacing: "-0.02em",
  }}
  aria-label="Works"
>
  {Array.from("Works").map((char, i) => (
    <span
      key={i}
      className="inline-block overflow-hidden align-bottom"
      aria-hidden="true"
    >
      <motion.span
        className="inline-block"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{
          delay: i * 0.03,
          duration: 0.6,
          ease: [0.65, 0, 0.35, 1],
        }}
      >
        {char}
      </motion.span>
    </span>
  ))}
</h1>
```

Notes:
- The outer wrapper spans are `aria-hidden="true"` and the `<h1>` carries the full word via `aria-label`, so SR users hear "Works" once.
- `align-bottom` on the wrapper prevents the inline-block letters from misaligning vertically with their baseline (an inline-block default that produces a subtle offset).
- `overflow-hidden` on the wrapper is what creates the mask — the inner span slides up from 100% (below the mask) to 0 (visible).

- [ ] **Step 2: Visual check**

Refresh `/works`. On page load, the letters of `WORKS` should slide up in sequence from below the title's baseline (30ms apart, 600ms each). After landing, the title is static.

Navigate to a project and back. The title replays its reveal (page is fully remounted) — that's acceptable behavior per the spec's Section 11 item 6.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/components/AllWorks.jsx
git commit -m "AllWorks: animate title with per-letter mask reveal"
```

---

## Task 6: Per-row reveal cascade (hairline grow + content fade-up)

**Files:**
- Modify: `src/components/AllWorks.jsx`

The hairline `border-t` on each link is replaced with a `motion.div` so it can be `scaleX` animated. The row content fades up after its hairline grows.

- [ ] **Step 1: Restructure each row to use a motion hairline and animated content**

Replace the `<ul>` and its mapped children with:

```jsx
<ul
  role="list"
  onMouseLeave={() => setHoveredIdx(null)}
>
  {projects.map((project, i) => {
    const delay = 0.6 + i * 0.08;
    return (
      <li
        key={project.slug}
        style={{
          opacity: hoveredIdx !== null && hoveredIdx !== i ? 0.35 : 1,
          transition: "opacity 200ms",
        }}
      >
        {/* Hairline above the row — animates from scaleX 0 to 1 on mount,
            transform-origin: left so it grows left-to-right. */}
        <motion.div
          className="h-px w-full origin-left bg-edge"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay, duration: 0.4, ease: [0.65, 0, 0.35, 1] }}
        />
        <Link
          to={`/works/${project.slug}`}
          data-cursor="open project"
          aria-label={`Open ${project.name}, ${project.year}`}
          onMouseEnter={() => setHoveredIdx(i)}
          className="group flex items-baseline justify-between gap-8 py-5 sm:py-7 focus:outline-none"
        >
          <motion.div
            className="flex items-baseline gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: delay + 0.15,
              duration: 0.5,
              ease: [0.65, 0, 0.35, 1],
            }}
          >
            <span
              aria-hidden="true"
              className="font-mono text-xs uppercase tracking-widest text-muted"
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <h2
              className="font-display uppercase"
              style={{
                fontWeight: 700,
                fontSize: "clamp(48px, 7vw, 112px)",
                lineHeight: 1,
                letterSpacing: "-0.02em",
              }}
            >
              {project.name}
            </h2>
          </motion.div>
          <motion.span
            className="whitespace-nowrap font-mono text-xs uppercase tracking-widest text-muted"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: delay + 0.15,
              duration: 0.5,
              ease: [0.65, 0, 0.35, 1],
            }}
          >
            {project.year} · {project.services.join(", ")}
          </motion.span>
        </Link>
      </li>
    );
  })}
  {/* Closer hairline below the last row */}
  <motion.div
    className="h-px w-full origin-left bg-edge"
    initial={{ scaleX: 0 }}
    animate={{ scaleX: 1 }}
    transition={{
      delay: 0.6 + projects.length * 0.08,
      duration: 0.4,
      ease: [0.65, 0, 0.35, 1],
    }}
  />
</ul>
```

Notes:
- Removed `border-t border-edge` from the Link className and `border-b border-edge` from the ul — both replaced by the `motion.div` hairlines for animation control.
- All five rows reveal off the same mount; no `whileInView` since the list fits in the viewport on landing.

- [ ] **Step 2: Visual check**

Refresh `/works`. After the title finishes its rise (~600ms), the rows reveal in sequence: hairline grows left-to-right above each row, then 150ms later the row content fades up. Each subsequent row is 80ms behind the previous. The closing hairline below the last row grows last.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/components/AllWorks.jsx
git commit -m "AllWorks: cascade hairlines + row content on mount"
```

---

## Task 7: Mobile layout (< 768px)

**Files:**
- Modify: `src/components/AllWorks.jsx`

The row restructures to stacked on mobile with an inline thumbnail. Wider gaps between rows. Smaller display cap on the name.

- [ ] **Step 1: Update row Link className for vertical stack on mobile**

Replace the Link className from:

```
group flex items-baseline justify-between gap-8 py-5 sm:py-7 focus:outline-none
```

To:

```
group flex flex-col gap-4 py-6 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8 sm:py-7 focus:outline-none
```

- [ ] **Step 2: Update the name's font-size to be smaller on mobile**

In the `<h2>` style, change:

```js
fontSize: "clamp(48px, 7vw, 112px)",
```

To:

```js
fontSize: "clamp(32px, 9vw, 112px)",
```

Mobile minimum drops to 32px and `9vw` scales aggressively for narrow screens; desktop max stays at 112px.

- [ ] **Step 3: Insert mobile-only thumbnail between name block and meta**

Inside the Link, between the name `motion.div` and the year/services `motion.span`, insert:

```jsx
{/* Mobile-only inline thumbnail. Hidden on sm+ — desktop uses the
    cursor-follow preview instead. */}
<motion.div
  className="block w-full sm:hidden"
  style={{ aspectRatio: "16 / 10" }}
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{
    delay: delay + 0.15,
    duration: 0.5,
    ease: [0.65, 0, 0.35, 1],
  }}
>
  {project.coverImage ? (
    <img
      src={project.coverImage}
      alt={project.name}
      loading="lazy"
      decoding="async"
      className="h-full w-full object-cover"
    />
  ) : (
    <div className="flex h-full w-full items-center justify-center bg-edge font-mono text-xs uppercase tracking-widest text-muted">
      {project.name}
    </div>
  )}
</motion.div>
```

- [ ] **Step 4: Widen vertical gap between rows on mobile**

Add `space-y-8 sm:space-y-0` to the `<ul>` className (the inter-row hairline above each row stays; this adds extra margin between rows on mobile only):

```jsx
<ul
  role="list"
  className="space-y-8 sm:space-y-0"
  onMouseLeave={() => setHoveredIdx(null)}
>
```

- [ ] **Step 5: Visual check**

Refresh `/works` in DevTools at viewport 375px wide. Each row stacks: `01` → name (smaller, fits the screen) → cover thumbnail → year · services. Hairlines above each row remain. Extra vertical space between rows. Tapping anywhere on a row navigates to the project. Cursor preview does not render.

Resize to 1280px — desktop layout returns: index, name, year/services on one row; no inline thumb visible; cursor preview works.

- [ ] **Step 6: Lint**

Run: `npm run lint`
Expected: exit 0.

- [ ] **Step 7: Commit**

```bash
git add src/components/AllWorks.jsx
git commit -m "AllWorks: mobile stack layout with inline thumbnail"
```

---

## Task 8: Reduced-motion fallback

**Files:**
- Modify: `src/components/AllWorks.jsx`

Gate the title reveal, per-row reveals, and cursor preview behind `useReducedMotion`. Under reduced motion, swap in a small inline thumb that appears at the right side of the hovered row on desktop.

- [ ] **Step 1: Import useReducedMotion and detect**

Update imports at the top:

```jsx
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";

import { projects } from "../constants";
import Contact from "./Contact";

const PREVIEW_WIDTH = "clamp(240px, 22vw, 360px)";
const LERP = 0.18;
const OFFSET_X = 24;
const OFFSET_Y = 24;
```

Inside `AllWorks`, at the top of the function body:

```jsx
export default function AllWorks() {
  const prefersReducedMotion = useReducedMotion();
  const [hoveredIdx, setHoveredIdx] = useState(null);
  // ...rest of the component
}
```

- [ ] **Step 2: Gate the title letter-mask reveal**

Update the per-letter motion spans inside the `<h1>`:

```jsx
<motion.span
  className="inline-block"
  initial={prefersReducedMotion ? { opacity: 0 } : { y: "100%" }}
  animate={prefersReducedMotion ? { opacity: 1 } : { y: 0 }}
  transition={{
    delay: prefersReducedMotion ? 0 : i * 0.03,
    duration: prefersReducedMotion ? 0.2 : 0.6,
    ease: [0.65, 0, 0.35, 1],
  }}
>
  {char}
</motion.span>
```

- [ ] **Step 3: Gate the per-row hairline and content reveals**

In the rows map, simplify the animation when reduced motion is preferred:

For the hairline `motion.div`:

```jsx
<motion.div
  className="h-px w-full origin-left bg-edge"
  initial={prefersReducedMotion ? { opacity: 0 } : { scaleX: 0 }}
  animate={prefersReducedMotion ? { opacity: 1 } : { scaleX: 1 }}
  transition={{
    delay: prefersReducedMotion ? 0 : delay,
    duration: prefersReducedMotion ? 0.2 : 0.4,
    ease: [0.65, 0, 0.35, 1],
  }}
/>
```

For the name `motion.div` and meta `motion.span`:

```jsx
<motion.div
  className="flex items-baseline gap-6"
  initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
  animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
  transition={{
    delay: prefersReducedMotion ? 0 : delay + 0.15,
    duration: prefersReducedMotion ? 0.2 : 0.5,
    ease: [0.65, 0, 0.35, 1],
  }}
>
  {/* ...inner content... */}
</motion.div>
```

Apply the identical gating pattern (same `initial`/`animate`/`transition` shape) to:

- The meta `motion.span` inside the Link (same `delay + 0.15` timing as the name `motion.div`).
- The closing hairline `motion.div` below the list (same `0.6 + projects.length * 0.08` timing it already has, gated like the per-row hairline).
- The mobile thumb `motion.div` added in Task 7 (same `delay + 0.15` timing as the name).

The gated transition object is structurally:

```jsx
initial={prefersReducedMotion ? { opacity: 0 } : <existing initial>}
animate={prefersReducedMotion ? { opacity: 1 } : <existing animate>}
transition={{
  delay: prefersReducedMotion ? 0 : <existing delay>,
  duration: prefersReducedMotion ? 0.2 : <existing duration>,
  ease: [0.65, 0, 0.35, 1],
}}
```

- [ ] **Step 4: Add the desktop reduced-motion inline thumb**

Inside each row's `<Link>`, between the name `motion.div` and the meta `motion.span`, insert:

```jsx
{/* Desktop reduced-motion inline thumb. Replaces the cursor-follow
    preview when the user has prefers-reduced-motion: reduce. Sized
    smaller than the cursor preview; opacity follows row hover state. */}
<div
  className="hidden sm:motion-reduce:block"
  style={{
    width: "clamp(200px, 18vw, 280px)",
    aspectRatio: "16 / 10",
    opacity: hoveredIdx === i ? 1 : 0,
    transition: "opacity 180ms",
  }}
>
  {project.coverImage ? (
    <img
      src={project.coverImage}
      alt=""
      className="h-full w-full object-cover"
    />
  ) : (
    <div className="flex h-full w-full items-center justify-center bg-edge font-mono text-xs uppercase tracking-widest text-muted">
      {project.name}
    </div>
  )}
</div>
```

Notes:
- `sm:motion-reduce:block` reads "at sm breakpoint and up, IF prefers-reduced-motion, display block". Under motion-safe desktop this stays hidden.
- The cursor-follow preview from Task 3 already has `motion-reduce:hidden` so it's mutually exclusive with this thumb.

- [ ] **Step 5: Visual check**

In Chrome DevTools, open Rendering panel → set "Emulate CSS media feature prefers-reduced-motion" to "reduce". Refresh `/works` at a desktop width.

Confirm:
- Title letters appear at final position (no slide-up); a fast opacity fade only.
- Row hairlines and content appear without translate/scale animations.
- Hovering a row: row dim still works; cursor-follow preview does NOT appear; instead a small thumbnail appears at the right side of the hovered row (after the name, before the meta).
- Row dim transition still works (opacity is allowed under reduced motion).

Turn off the emulation, refresh — full motion returns.

- [ ] **Step 6: Lint**

Run: `npm run lint`
Expected: exit 0.

- [ ] **Step 7: Commit**

```bash
git add src/components/AllWorks.jsx
git commit -m "AllWorks: reduced-motion fallback with inline desktop thumb"
```

---

## Task 9: Accessibility polish — focus state

**Files:**
- Modify: `src/components/AllWorks.jsx`

The `<Link>` className already has `focus:outline-none`; we add a visible custom focus indicator on the hairline above the focused row.

- [ ] **Step 1: Add a focus-visible state to the hairline via a sibling approach**

The simplest path: thicken the hairline `motion.div` to 2px and change its background to `bg-ink` when the row's Link has focus-visible. Tailwind's `group-focus-visible` modifier supports this — add `group` to the `<li>` and use `group-focus-visible:h-0.5 group-focus-visible:bg-ink` on the hairline.

Restructure the `<li>` and hairline:

```jsx
<li
  key={project.slug}
  className="group"
  style={{
    opacity: hoveredIdx !== null && hoveredIdx !== i ? 0.35 : 1,
    transition: "opacity 200ms",
  }}
>
  <motion.div
    className="h-px w-full origin-left bg-edge transition-all duration-200 group-focus-within:h-0.5 group-focus-within:bg-ink"
    initial={prefersReducedMotion ? { opacity: 0 } : { scaleX: 0 }}
    animate={prefersReducedMotion ? { opacity: 1 } : { scaleX: 1 }}
    transition={{
      delay: prefersReducedMotion ? 0 : delay,
      duration: prefersReducedMotion ? 0.2 : 0.4,
      ease: [0.65, 0, 0.35, 1],
    }}
  />
  <Link
    /* ...unchanged... */
  >
    {/* ...unchanged... */}
  </Link>
</li>
```

Notes:
- `group-focus-within` triggers when any descendant of the group has focus — works for the link's focus state without needing `group-focus-visible` (which can be finicky with React Router's `<Link>`).
- Existing `group` class on the Link stays — Tailwind's `group` is identifier-scoped; the `<li>`'s `group` and the Link's `group` don't conflict (they're separate group scopes, both named "group" — the `group-focus-within` on the hairline matches the nearest ancestor `group`, which is the `<li>`).

- [ ] **Step 2: Visual + keyboard check**

Refresh `/works`. Press Tab repeatedly — focus moves through the rows in order. When a row is focused, its top hairline should thicken to 2px and turn to the ink color. Press Enter on a focused row — navigates to the project.

Confirm with VoiceOver / NVDA (if available): each row announces as a link with the format "Open {project name}, {year}". The numeric index is not announced.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/components/AllWorks.jsx
git commit -m "AllWorks: visible keyboard focus indicator on row hairline"
```

---

## Task 10: SelectedWork.jsx cohesion tweaks

**Files:**
- Modify: `src/components/SelectedWork.jsx`

Two lexical edits — no layout or motion changes.

- [ ] **Step 1: Change tile data-cursor to "open project"**

In `SelectedWork.jsx`, find the `<Link>` inside the `projects.map((project, i) => ...)` block. Change:

```jsx
data-cursor="check out my work"
```

To:

```jsx
data-cursor="open project"
```

- [ ] **Step 2: Add data-cursor to the "View all works" link**

Find the `<Link to="/works">` near the bottom of the file. Add a `data-cursor` attribute:

```jsx
<Link
  to="/works"
  aria-label="View all works"
  data-cursor="open the index"
  className="group inline-block focus:outline-none"
>
```

- [ ] **Step 3: Visual check**

Refresh the home page `http://localhost:5173/`. Scroll to the SelectedWork section. Hover any tile — cursor label reads "open project" (not "check out my work"). Hover the "View all works" link below the carousel — cursor label reads "open the index".

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/components/SelectedWork.jsx
git commit -m "SelectedWork: align cursor labels with /works typographic index"
```

---

## Task 11: Final verification and optional refactor

**Files:**
- Possibly: `src/components/WorksCursorPreview.jsx` (new file, only if AllWorks > 250 lines)

- [ ] **Step 1: Check line count of AllWorks.jsx**

```bash
wc -l src/components/AllWorks.jsx
```

If under 250 lines, skip Step 2 and continue. If over 250 lines, factor the cursor preview (the preview `<div>` + the rAF loop `useEffect` + the mouse tracking `useEffect` + the image preload `useEffect` + the related refs and constants) into `src/components/WorksCursorPreview.jsx` that accepts `hoveredIdx` and `projects` as props.

- [ ] **Step 2: Optional refactor (skip if under 250 lines)**

Extract the preview element and its hooks into `src/components/WorksCursorPreview.jsx`:

```jsx
import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

const PREVIEW_WIDTH = "clamp(240px, 22vw, 360px)";
const LERP = 0.18;
const OFFSET_X = 24;
const OFFSET_Y = 24;

export default function WorksCursorPreview({ hoveredIdx, projects }) {
  const previewRef = useRef(null);
  const mouseTarget = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const rafId = useRef(null);

  useEffect(() => {
    projects.forEach((p) => {
      if (p.coverImage) {
        const img = new Image();
        img.src = p.coverImage;
      }
    });
  }, [projects]);

  useEffect(() => {
    const handleMove = (e) => {
      mouseTarget.current.x = e.clientX;
      mouseTarget.current.y = e.clientY;
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  useEffect(() => {
    if (hoveredIdx === null) return;
    current.current.x = mouseTarget.current.x;
    current.current.y = mouseTarget.current.y;
    const tick = () => {
      current.current.x += (mouseTarget.current.x - current.current.x) * LERP;
      current.current.y += (mouseTarget.current.y - current.current.y) * LERP;
      const el = previewRef.current;
      if (el) {
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        const x = Math.max(0, Math.min(window.innerWidth - w, current.current.x + OFFSET_X));
        const y = Math.max(0, Math.min(window.innerHeight - h, current.current.y + OFFSET_Y));
        el.style.transform = `translate(${x}px, ${y}px)`;
      }
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [hoveredIdx]);

  return (
    <div
      ref={previewRef}
      className="pointer-events-none fixed left-0 top-0 z-40 hidden sm:block motion-reduce:hidden"
      style={{
        width: PREVIEW_WIDTH,
        aspectRatio: "16 / 10",
        willChange: "transform",
      }}
    >
      <AnimatePresence>
        {hoveredIdx !== null && (
          <motion.div
            key={hoveredIdx}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {projects[hoveredIdx].coverImage ? (
              <img
                src={projects[hoveredIdx].coverImage}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-edge font-mono text-xs uppercase tracking-widest text-muted">
                {projects[hoveredIdx].name}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

In `AllWorks.jsx`, remove the corresponding effects/refs/constants/preview JSX and import + render the new component:

```jsx
import WorksCursorPreview from "./WorksCursorPreview";
// ...
// At the bottom, just before <Contact />:
<WorksCursorPreview hoveredIdx={hoveredIdx} projects={projects} />
```

- [ ] **Step 3: Run lint**

```bash
npm run lint
```
Expected: exit 0, no warnings.

- [ ] **Step 4: Run build**

```bash
npm run build
```
Expected: exit 0, no errors.

- [ ] **Step 5: Manual smoke test (full checklist from spec section 11)**

1. Cold-load `/works` — page renders, no console errors.
2. Title reveal plays once on mount.
3. Desktop hover — preview appears, glides smoothly, crossfades between rows; non-hovered rows dim; no layout shift; cursor label is "open project".
4. Cursor preview stays inside viewport when mouse approaches edges.
5. Click a row — navigates to `/works/{slug}`; lands at top of detail page.
6. Browser back to `/works` — title reveal replays (acceptable per spec); page renders correctly.
7. Mobile viewport (~375px) — rows stack vertically with thumbnails; taps navigate; no preview element renders.
8. Reduced-motion (DevTools emulation) — no slide-ups, inline thumb appears on row hover, no rAF loop running.
9. Tab through rows — focus indicator visible (thick ink-colored hairline above focused row); Enter navigates.
10. Home page `/` — `SelectedWork` tile cursor reads "open project"; `View all works` cursor reads "open the index"; layout and motion unchanged otherwise.

- [ ] **Step 6: Commit (only if refactor was performed in Step 2)**

If Step 2 created `WorksCursorPreview.jsx`:

```bash
git add src/components/WorksCursorPreview.jsx src/components/AllWorks.jsx
git commit -m "AllWorks: factor cursor preview into WorksCursorPreview component"
```

If no refactor, skip — Tasks 1-10 already covered everything.

---

## Spec coverage check

Each spec section mapped to tasks:

- **Spec 3 (Page architecture)** — Task 1 (skeleton with title + list).
- **Spec 4.1 (Desktop row)** — Task 1 (markup) + Task 6 (motion).
- **Spec 4.2 (Mobile row)** — Task 7.
- **Spec 5.1–5.3 (Cursor preview)** — Tasks 3 (position + visibility) + 4 (crossfade).
- **Spec 5.4 (Row dim)** — Task 2.
- **Spec 6.1 (Title letter reveal)** — Task 5.
- **Spec 6.2 (Row reveals)** — Task 6.
- **Spec 6.3 (No scrolljacking)** — implicit; no pinning/scrub code is added.
- **Spec 7 (Reduced motion)** — Task 8.
- **Spec 8 (Accessibility)** — `aria-label` + `aria-hidden` covered in Task 1; focus indicator in Task 9.
- **Spec 9 (Cohesion tweaks)** — Task 10.
- **Spec 10 (Component & file changes)** — Tasks 1–10 modify `AllWorks.jsx`; Task 10 modifies `SelectedWork.jsx`; Task 11 covers the optional `WorksCursorPreview.jsx` factoring.
- **Spec 11 (Testing checklist)** — Task 11 Step 5.
