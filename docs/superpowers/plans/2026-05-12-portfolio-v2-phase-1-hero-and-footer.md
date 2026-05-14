# Portfolio v2 — Phase 1: Hero + Footer — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current Hero and Contact sections with the new typographic design (scroll-decoded name, status pill, Now card, sticky top nav with DARK toggle, dvdrod-style footer CTA). Drop the unused 3D scenes (desktop, earth, starfield) and the emailjs dependency now that nothing imports them. After this phase, the site renders the new visual identity end-to-end at the bookends, while middle sections (About, Experience, Tech, Works) remain old code until later phases.

**Architecture:** Phase 0's foundation (theme system, Tailwind tokens, Lenis, GSAP, fonts) is in place and adopted in this phase. The Hero name uses a `<HeroDecoder>` component that cycles glyphs and decodes letter-by-letter, with an IntersectionObserver for re-trigger on scroll-back. The new Navbar is sticky with a `backdrop-blur` overlay so it stays readable when middle-section content scrolls beneath it. The new Contact is a `<footer>` element (no `<section>` wrapping) with personality pills, a giant typographic CTA wrapping a `mailto:` link, and inline social links — exactly the dvdrod pattern. ThemeToggle is a small pill in the Navbar that calls the `useTheme().toggle` action.

**Tech Stack:** React 18, Vite 4, Tailwind 3 (using the new theme-variable tokens added in Phase 0: `text-ink`, `bg-paper`, `border-edge`, `text-muted`, `bg-accent`, `font-display`, `font-sans`, `font-mono`), Framer Motion (reveal register only — entrance animations on Hero), `useTheme` hook from `src/utils/theme.jsx`. No GSAP usage in this phase yet (reserved for Phase 5).

---

## Content note

The new components consume from `src/constants/index.js`. Phase 0's Task 9 already populated `manifestoBullets`, `personalityPills`, `socials`, and `now` with placeholder values. Phase 1's Task 1 adds two more exports (`hero`, `footer`) with reasonable placeholders. **You can edit `constants/index.js` at any time during or after the implementation to refine wording — the components react to whatever's in there.** Real content from the user (final hero subtitle, location, copyright line) can land via a one-line constants edit anytime; no code change required.

---

## File structure

**New files (all under `src/components/`):**
- `src/components/HeroDecoder.jsx` — scroll-decoded letters effect. Cycles random glyphs and decodes a target string letter-by-letter. Re-triggers on scroll-back via IntersectionObserver.
- `src/components/Now.jsx` — small bordered card rendering `now.label` + `now.body` from `constants`.
- `src/components/ThemeToggle.jsx` — pill button using `useTheme()` from `src/utils/theme.jsx`.

**Files rewritten in place** (filename stays, contents replaced):
- `src/components/Hero.jsx` — full-viewport hero with HeroDecoder name, subtitle, status pill, Now card. Drops the old gradient sidebar, old heading, and commented-out `ComputersCanvas` import.
- `src/components/Navbar.jsx` — sticky top nav: logo + anchor links + ThemeToggle. Replaces the old "contact me" gradient button + mobile menu drawer. Mobile menu retained in simpler form.
- `src/components/Contact.jsx` — dvdrod-style footer: personality pills, massive CTA wrapping `mailto:`, social inline, copyright. Drops emailjs form, Earth canvas, and `SectionWrapper` HOC wrap (it's now a `<footer>`, not a section).

**Files modified:**
- `src/App.jsx` — drops `bg-test` class on the outer wrapper (so the new `--bg` theme variable shows through), removes the `<StarsCanvas />` mount and its wrapper div, removes the `StarsCanvas` import.
- `src/components/index.js` — drops `EarthCanvas`, `ComputersCanvas`, `StarsCanvas` exports. Keeps `BallCanvas` (used by `Tech.jsx` until Phase 4).
- `src/components/canvas/index.js` — same drops.
- `src/constants/index.js` — appends `hero` and `footer` exports. Existing exports untouched.
- `package.json` — removes `@emailjs/browser` and `maath`. Other legacy deps (`three`, `@react-three/fiber`, `@react-three/drei`, `react-tilt`, `react-vertical-timeline-component`) stay because they have remaining consumers.

**Files deleted:**
- `src/components/canvas/Computers.jsx`
- `src/components/canvas/Earth.jsx`
- `src/components/canvas/Stars.jsx`
- `public/desktop_pc/` (entire directory — GLTF model + 50+ texture files)
- `public/planet/` (entire directory — GLTF model + textures)

**Files explicitly NOT touched in this phase:**
- `src/components/About.jsx`, `Experience.jsx`, `Tech.jsx`, `Works.jsx` (rewritten in Phases 2–5)
- `src/components/Loader.jsx` (still used by `Ball.jsx` until Phase 4)
- `src/components/canvas/Ball.jsx` (used by `Tech.jsx` until Phase 4)
- `src/index.css` (the `.canvas-loader` class still backs `Loader.jsx`; the gradient utilities still back legacy sections)
- `src/styles.js`, `src/utils/motion.js`, `src/hoc/SectionWrapper.jsx`

---

## Verification approach

Same as Phase 0: no test framework added, every task uses manual verification via `npm run dev` (run in background via the Bash tool — PowerShell has an execution-policy issue) plus the curl/grep checks at the end. Browser-only verifications are collected into a checklist that runs once at the end (Task 11), not per task.

After Task 5 the site will look "in transition" — new Navbar over old Hero, old Contact intact. After Task 6 the Hero is new. After Task 8 the Contact is new. By Task 10 the whole bookend swap is done.

---

## Tasks

### Task 1: Add `hero` and `footer` content to `constants/index.js`

**Files:**
- Modify: `src/constants/index.js` (append-only)

- [ ] **Step 1: Append new exports**

Open `src/constants/index.js`. **Do not modify any existing export.** After the last existing export (`export const now = { ... };`), append:

```js

export const hero = {
  // Target string for HeroDecoder. \n is treated as a line break.
  name: "ADNAAN\nDASOO",
  subtitle: "Frontend · Creative Developer",
  location: "Atlanta · GMT-5",
  availability: "Available for work",
};

export const footer = {
  // The arrow ↗ is appended by the JSX, don't include it in the string.
  headline: "Say hi! Let's talk",
  email: "adnaandasoo@gmail.com",
  location: "Atlanta · GMT-5",
  copyright: "© 2026 Adnaan Dasoo · Frontend Developer",
};
```

Ensure the file still ends with a single trailing newline.

- [ ] **Step 2: Smoke test (Bash, not PowerShell)**

```bash
npm run dev
```
(`run_in_background: true`; wait ~3s; read output for "ready in"; kill background process.)

- [ ] **Step 3: Verify imports work**

In the same dev session, open the browser console and run:

```js
import("/src/constants/index.js").then(m => console.log({
  hasHero: typeof m.hero === "object" && m.hero.name && m.hero.subtitle,
  hasFooter: typeof m.footer === "object" && m.footer.email && m.footer.headline,
}));
```

Expected: `{ hasHero: true, hasFooter: true }`. (Skip this step if doing pure non-browser verification; the next task's compile is sufficient.)

- [ ] **Step 4: Commit**

```bash
git add src/constants/index.js
git commit -m "Add hero and footer content exports for Phase 1"
```

---

### Task 2: Create `ThemeToggle` component

**Files:**
- Create: `src/components/ThemeToggle.jsx`

- [ ] **Step 1: Write the component**

Create `src/components/ThemeToggle.jsx` with EXACTLY:

```jsx
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
      className="inline-flex items-center gap-2 rounded-full border border-edge px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-ink transition-colors hover:bg-ink/5"
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
```

- [ ] **Step 2: Smoke test (Bash)**

```bash
npm run dev
```
(background, wait ~3s, confirm "ready in", kill)

Component isn't mounted yet — this just verifies the file compiles.

- [ ] **Step 3: Commit**

```bash
git add src/components/ThemeToggle.jsx
git commit -m "Add ThemeToggle pill component"
```

---

### Task 3: Create `Now` card component

**Files:**
- Create: `src/components/Now.jsx`

- [ ] **Step 1: Write the component**

Create `src/components/Now.jsx` with EXACTLY:

```jsx
import { now } from "../constants";

/**
 * Bordered "Now" card. Displays the small uppercase label and the body text from
 * the `now` export in constants. Lives in the hero's bottom row on the right side.
 */
export default function Now() {
  return (
    <div className="max-w-[320px] rounded-xl border border-edge p-4 text-sm leading-relaxed text-ink">
      <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted">
        {now.label}
      </span>
      {now.body}
    </div>
  );
}
```

- [ ] **Step 2: Smoke test (Bash)**

```bash
npm run dev
```
(background, wait ~3s, confirm "ready in", kill)

- [ ] **Step 3: Commit**

```bash
git add src/components/Now.jsx
git commit -m "Add Now card component"
```

---

### Task 4: Create `HeroDecoder` component

**Files:**
- Create: `src/components/HeroDecoder.jsx`

- [ ] **Step 1: Write the component**

Create `src/components/HeroDecoder.jsx` with EXACTLY:

```jsx
import { useEffect, useRef, useState } from "react";

// Glyph set the decoder cycles through before each letter lands on its target.
// Mixed alphanumeric + symbols echoes the editorial / hacker vibe agreed in the design spec.
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";

// Animation timing. 50 ms tick + reveal-one-letter-every-4-frames matches the visual
// companion preview the user signed off on in brainstorming. Total decode time for an
// 11-character target ≈ 11 × 4 × 50ms = 2.2s.
const TICK_MS = 50;
const FRAMES_PER_REVEAL = 4;

/**
 * Renders `target` as a scroll-decoded string. On mount and again whenever the element
 * scrolls back into view (>=50% intersecting), runs the decode animation: every letter
 * cycles through random glyphs, then locks in one at a time left-to-right.
 *
 * Whitespace and newlines are not decoded — they pass through immediately. Newlines
 * render as <br> via per-line <span class="block"> wrappers.
 *
 * Props:
 *   - target: string to decode. May contain "\n" for line breaks.
 *   - className: applied to the outer <span>.
 */
export default function HeroDecoder({ target, className = "" }) {
  const [display, setDisplay] = useState(target);
  const elementRef = useRef(null);
  const intervalRef = useRef(null);
  const decodingRef = useRef(false);

  // Start one run of the decode animation. Guards against re-entry.
  function decode() {
    if (decodingRef.current) return;
    decodingRef.current = true;

    const chars = target.split("");
    // `revealed[i]` is true once char i has been "locked in".
    // Whitespace and newlines are pre-revealed so they pass straight through.
    const revealed = chars.map((c) => c === "\n" || c === " ");

    let frame = 0;
    intervalRef.current = setInterval(() => {
      frame++;

      // Lock in one new letter every FRAMES_PER_REVEAL ticks.
      if (frame % FRAMES_PER_REVEAL === 0) {
        const next = revealed.findIndex((r) => !r);
        if (next === -1) {
          // All letters revealed — settle on the final string and stop.
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          decodingRef.current = false;
          setDisplay(target);
          return;
        }
        revealed[next] = true;
      }

      // Render: revealed letters show their final char; unrevealed show a random glyph.
      const out = chars
        .map((c, i) => {
          if (revealed[i]) return c;
          return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        })
        .join("");
      setDisplay(out);
    }, TICK_MS);
  }

  useEffect(() => {
    // Run once on mount.
    decode();

    // Re-trigger when the element scrolls back into view (>=50% visible).
    const el = elementRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) decode();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      decodingRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  // Render: split by "\n" so each line wraps in its own block span.
  const lines = display.split("\n");
  return (
    <span ref={elementRef} className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block">
          {line}
        </span>
      ))}
    </span>
  );
}
```

- [ ] **Step 2: Smoke test (Bash)**

```bash
npm run dev
```
(background, wait ~3s, confirm "ready in", kill)

- [ ] **Step 3: Commit**

```bash
git add src/components/HeroDecoder.jsx
git commit -m "Add HeroDecoder component (scroll-decoded letters effect)"
```

---

### Task 5: Rewrite `Navbar.jsx`

**Files:**
- Modify: `src/components/Navbar.jsx`

- [ ] **Step 1: Replace contents**

Open `src/components/Navbar.jsx` and replace the ENTIRE file contents with EXACTLY:

```jsx
import { useState } from "react";
import { navLinks } from "../constants";
import ThemeToggle from "./ThemeToggle";

/**
 * Sticky top navigation. Holds the logo (text mark), anchor links to sections,
 * and the theme toggle. Background uses a translucent `bg-paper` with backdrop
 * blur so the nav stays readable when content scrolls beneath it. Mobile
 * collapses the link list into a stacked menu under a tap-to-open chevron.
 */
export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 backdrop-blur-md">
      <div
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 text-ink sm:px-16"
        style={{ background: "rgb(from var(--bg) r g b / 0.8)" }}
      >
        <a
          href="#"
          className="font-display text-base tracking-wider transition-opacity hover:opacity-70"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          AD.
        </a>

        {/* Desktop nav */}
        <ul className="hidden gap-8 font-mono text-[10px] uppercase tracking-widest md:flex">
          {navLinks.map((link) => (
            <li key={link.id}>
              <a
                href={`#${link.id}`}
                className="transition-opacity hover:opacity-60"
              >
                {link.title}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {/* Mobile menu trigger */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-edge text-ink md:hidden"
          >
            <span className="sr-only">Menu</span>
            <span aria-hidden="true" className="text-xs">
              {mobileOpen ? "×" : "≡"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="md:hidden"
          style={{ background: "rgb(from var(--bg) r g b / 0.95)" }}
        >
          <ul className="mx-auto max-w-7xl px-6 pb-6 pt-2 font-mono text-xs uppercase tracking-widest text-ink">
            {navLinks.map((link) => (
              <li key={link.id} className="py-2">
                <a
                  href={`#${link.id}`}
                  onClick={() => setMobileOpen(false)}
                  className="block transition-opacity hover:opacity-60"
                >
                  {link.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
```

Note on the `rgb(from ...)` syntax: this is the [relative color syntax](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_colors/Relative_colors) used to derive an `0.8` alpha version of `--bg` for the translucent overlay. Supported in Chrome 119+, Firefox 128+, Safari 16.4+ (Feb 2024). Acceptable for an awwwards-target portfolio.

- [ ] **Step 2: Smoke test (Bash)**

```bash
npm run dev
```
(background, wait ~3s, confirm "ready in", no compile errors, kill)

Note: After this step the site will look "in transition" — the new Navbar overlays the old dark hero. That's expected; Task 6 fixes it.

- [ ] **Step 3: Commit**

```bash
git add src/components/Navbar.jsx
git commit -m "Rewrite Navbar: sticky top, ThemeToggle, blurred translucent bg"
```

---

### Task 6: Rewrite `Hero.jsx`

**Files:**
- Modify: `src/components/Hero.jsx`

- [ ] **Step 1: Replace contents**

Open `src/components/Hero.jsx` and replace the ENTIRE file contents with EXACTLY:

```jsx
import { motion } from "framer-motion";
import { hero } from "../constants";
import HeroDecoder from "./HeroDecoder";
import Now from "./Now";

const ease = [0.65, 0, 0.35, 1];

/**
 * Hero section. Renders a full-viewport stage with the decoded name + subtitle in
 * the middle row, and a bottom row containing location/availability on the left
 * and the Now card on the right. Drops the old "Hi, I'm Adnaan" headline, the
 * orange gradient sidebar, the (commented-out) ComputersCanvas, and the bouncing
 * scroll indicator.
 */
export default function Hero() {
  return (
    <section className="relative min-h-screen w-full px-6 pb-12 pt-32 sm:px-16 sm:pt-40">
      <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-7xl flex-col justify-end gap-12">
        {/* Name + subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease }}
        >
          <HeroDecoder
            target={hero.name}
            className="font-display text-ink"
            // Display sizing applied via inline style because clamp() is awkward in Tailwind config.
          />
          <p className="mt-4 font-mono text-xs uppercase tracking-widest text-muted">
            {hero.subtitle}
          </p>
        </motion.div>

        {/* Bottom row: location + availability pill on the left, Now card on the right */}
        <motion.div
          className="flex flex-wrap items-end justify-between gap-6"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease }}
        >
          <div className="flex flex-col gap-2 font-mono text-[10px] uppercase tracking-widest text-muted">
            <span>{hero.location}</span>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-edge px-2.5 py-1 text-ink">
              <span
                aria-hidden="true"
                className="block h-1.5 w-1.5 rounded-full bg-accent"
                style={{ boxShadow: "0 0 0 3px rgb(from var(--accent) r g b / 0.18)" }}
              />
              {hero.availability}
            </span>
          </div>

          <Now />
        </motion.div>
      </div>

      <style>{`
        section [data-hero-decoder-style] {}
        /* The HeroDecoder renders a <span>; sizing is set via this descendant rule
           so we don't need to inline a clamp() in JSX style. */
        section :where(.font-display.text-ink) {
          font-size: clamp(60px, 11vw, 168px);
          line-height: 0.92;
          letter-spacing: -0.01em;
        }
      `}</style>
    </section>
  );
}
```

- [ ] **Step 2: Smoke test (Bash)**

```bash
npm run dev
```
(background, wait ~3s, confirm "ready in", no compile errors, kill)

Note: The site now shows the new Hero on top of old middle sections. The dropped 3D desktop scene is gone. The old `ComputersCanvas` import is no longer referenced by Hero, but it's still in `components/index.js` (`canvas/index.js` and `Computers.jsx` haven't been deleted yet) — that's the next task.

- [ ] **Step 3: Commit**

```bash
git add src/components/Hero.jsx
git commit -m "Rewrite Hero: scroll-decoded name, status pill, Now card"
```

---

### Task 7: Drop `ComputersCanvas` and its GLTF assets

**Files:**
- Delete: `src/components/canvas/Computers.jsx`
- Delete: `public/desktop_pc/` (entire directory)
- Modify: `src/components/canvas/index.js`
- Modify: `src/components/index.js`

- [ ] **Step 1: Update `src/components/canvas/index.js`**

Open the file. It currently reads:

```js
import EarthCanvas from "./Earth";
import BallCanvas from "./Ball";
import ComputersCanvas from "./Computers";
import StarsCanvas from "./Stars";

export { EarthCanvas, BallCanvas, ComputersCanvas, StarsCanvas };
```

Replace its contents with EXACTLY:

```js
import EarthCanvas from "./Earth";
import BallCanvas from "./Ball";
import StarsCanvas from "./Stars";

export { EarthCanvas, BallCanvas, StarsCanvas };
```

(Drops the `ComputersCanvas` import and re-export. `EarthCanvas` and `StarsCanvas` stay — they get removed in Tasks 9 and 10 respectively.)

- [ ] **Step 2: Update `src/components/index.js`**

Open the file. It currently re-exports `ComputersCanvas`. Replace its contents with EXACTLY:

```js
import { EarthCanvas, BallCanvas, StarsCanvas } from './canvas';
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
  EarthCanvas,
  BallCanvas,
  StarsCanvas,
};
```

(Drops `ComputersCanvas` from both the named import and the export list.)

- [ ] **Step 3: Delete `src/components/canvas/Computers.jsx`**

```bash
rm src/components/canvas/Computers.jsx
```

- [ ] **Step 4: Delete `public/desktop_pc/`**

```bash
rm -rf public/desktop_pc
```

- [ ] **Step 5: Smoke test (Bash)**

```bash
npm run dev
```
(background, wait ~3s, confirm "ready in", no compile errors, kill)

Vite must NOT report any "failed to resolve" errors. If it does, something still imports `ComputersCanvas`. Find it and fix it (likely nothing — the only previous consumer was Hero, and Task 6 dropped its import).

- [ ] **Step 6: Commit**

```bash
git add src/components/canvas/index.js src/components/index.js src/components/canvas/Computers.jsx public/desktop_pc
git commit -m "Drop ComputersCanvas + desktop_pc GLTF assets (no longer consumed)"
```

(Git records the file deletions automatically when `git add` sees the paths are gone.)

---

### Task 8: Rewrite `Contact.jsx` as the dvdrod-style footer

**Files:**
- Modify: `src/components/Contact.jsx`

- [ ] **Step 1: Replace contents**

Open `src/components/Contact.jsx` and replace the ENTIRE file contents with EXACTLY:

```jsx
import { footer, personalityPills, socials } from "../constants";

/**
 * Footer / contact section. dvdrod-style: a row of personality pills along the top,
 * a giant typographic CTA wrapping a mailto link, email + location at bottom-left,
 * inline social links at bottom-right, and a copyright line below a divider.
 * No form, no Earth canvas, no SectionWrapper wrap (this is a <footer>, not a content section).
 */
export default function Contact() {
  return (
    <footer
      id="contact"
      className="px-6 pb-10 pt-32 sm:px-16"
    >
      <div className="mx-auto max-w-7xl">
        {/* Personality pills row, right-aligned */}
        <div className="mb-24 flex flex-wrap justify-end gap-2">
          {personalityPills.map((pill) => (
            <span
              key={pill}
              className="rounded-full border border-edge px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted"
            >
              {pill}
            </span>
          ))}
        </div>

        {/* Massive CTA */}
        <a
          href={`mailto:${footer.email}`}
          className="group block text-ink"
          style={{
            fontFamily:
              "Geist, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            fontWeight: 900,
            fontSize: "clamp(60px, 12vw, 180px)",
            lineHeight: "0.92",
            letterSpacing: "-0.02em",
          }}
        >
          {footer.headline}{" "}
          <span
            aria-hidden="true"
            className="inline-block transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
          >
            ↗
          </span>
        </a>

        {/* Bottom row: email + location on left, socials on right */}
        <div className="mt-24 flex flex-wrap items-end justify-between gap-6">
          <div className="flex flex-col gap-1 font-mono text-[11px] tracking-wider text-muted">
            <span>{footer.email}</span>
            <span>{footer.location}</span>
          </div>
          <ul className="flex gap-6 font-mono text-[11px] uppercase tracking-widest">
            {socials.map((social) => (
              <li key={social.name}>
                <a
                  href={social.url}
                  className="text-ink transition-opacity hover:opacity-60"
                  target={social.url.startsWith("http") ? "_blank" : undefined}
                  rel={social.url.startsWith("http") ? "noopener noreferrer" : undefined}
                >
                  {social.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Divider + copyright */}
        <div className="mt-10 border-t border-edge pt-6 text-center font-mono text-[10px] uppercase tracking-widest text-muted">
          {footer.copyright}
        </div>
      </div>
    </footer>
  );
}
```

This file replaces the previous `Contact` component, which:
- Imported `useState`, `useRef`, `motion`, `emailjs`, `styles`, `EarthCanvas`, `SectionWrapper`, `slideIn` — none of those are needed anymore.
- Used `SectionWrapper(Contact, "")` as its export. The new Contact is exported directly because a `<footer>` doesn't need the SectionWrapper shell.

- [ ] **Step 2: Smoke test (Bash)**

```bash
npm run dev
```
(background, wait ~3s, confirm "ready in", no compile errors, kill)

After this step, the site renders the new typographic footer. The old Earth canvas is no longer referenced by Contact, but it still exists on disk and is still exported from `canvas/index.js` — Task 9 cleans that up.

- [ ] **Step 3: Commit**

```bash
git add src/components/Contact.jsx
git commit -m "Rewrite Contact as dvdrod-style footer (no form, no Earth canvas)"
```

---

### Task 9: Drop `EarthCanvas` and remove `@emailjs/browser`

**Files:**
- Delete: `src/components/canvas/Earth.jsx`
- Delete: `public/planet/` (entire directory)
- Modify: `src/components/canvas/index.js`
- Modify: `src/components/index.js`
- Modify: `package.json` (via `npm uninstall`)

- [ ] **Step 1: Update `src/components/canvas/index.js`**

Open the file. It currently reads:

```js
import EarthCanvas from "./Earth";
import BallCanvas from "./Ball";
import StarsCanvas from "./Stars";

export { EarthCanvas, BallCanvas, StarsCanvas };
```

Replace its contents with EXACTLY:

```js
import BallCanvas from "./Ball";
import StarsCanvas from "./Stars";

export { BallCanvas, StarsCanvas };
```

- [ ] **Step 2: Update `src/components/index.js`**

Open the file. Replace its contents with EXACTLY:

```js
import { BallCanvas, StarsCanvas } from './canvas';
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
  StarsCanvas,
};
```

- [ ] **Step 3: Delete `src/components/canvas/Earth.jsx`**

```bash
rm src/components/canvas/Earth.jsx
```

- [ ] **Step 4: Delete `public/planet/`**

```bash
rm -rf public/planet
```

- [ ] **Step 5: Uninstall `@emailjs/browser`**

```bash
npm uninstall @emailjs/browser
```

Expected: npm removes `@emailjs/browser` from `dependencies` in `package.json` and updates `package-lock.json`. No remaining file in the project should import from `@emailjs/browser` (verify with: `grep -rl "@emailjs" src/`; expected: no results).

- [ ] **Step 6: Smoke test (Bash)**

```bash
npm run dev
```
(background, wait ~3s, confirm "ready in", no compile errors, kill)

- [ ] **Step 7: Commit**

```bash
git add src/components/canvas/index.js src/components/index.js src/components/canvas/Earth.jsx public/planet package.json package-lock.json
git commit -m "Drop EarthCanvas + remove emailjs dependency (no longer consumed)"
```

---

### Task 10: Clean up `App.jsx`, drop `StarsCanvas`, remove `maath`

**Files:**
- Modify: `src/App.jsx`
- Delete: `src/components/canvas/Stars.jsx`
- Modify: `src/components/canvas/index.js`
- Modify: `src/components/index.js`
- Modify: `package.json` (via `npm uninstall`)

- [ ] **Step 1: Update `src/App.jsx`**

Open the file. It currently reads:

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

Replace its contents with EXACTLY:

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

Changes:
- Removed `StarsCanvas` from the imports.
- Removed the `bg-test` class from the outer div (now the body's `--bg` shows through).
- Removed the inner `<div>` wrapper around `<Navbar /><Hero />` (no longer needed; it had no styling purpose).
- Removed the outer wrapper `<div className='relative z-0'>` that contained `<Contact /><StarsCanvas />` (the new `<Contact />` is a `<footer>` element so it sits on its own).

- [ ] **Step 2: Update `src/components/canvas/index.js`**

Open the file. It currently reads:

```js
import BallCanvas from "./Ball";
import StarsCanvas from "./Stars";

export { BallCanvas, StarsCanvas };
```

Replace its contents with EXACTLY:

```js
import BallCanvas from "./Ball";

export { BallCanvas };
```

- [ ] **Step 3: Update `src/components/index.js`**

Open the file. Replace its contents with EXACTLY:

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

- [ ] **Step 4: Delete `src/components/canvas/Stars.jsx`**

```bash
rm src/components/canvas/Stars.jsx
```

- [ ] **Step 5: Uninstall `maath`**

`maath` was only used by `Stars.jsx`. With Stars gone, the package has no consumers.

```bash
npm uninstall maath
```

Verify nothing in `src/` still imports it:

```bash
grep -rl "from ['\"]maath" src/ 2>/dev/null || echo "no maath imports"
```

Expected: `no maath imports`.

- [ ] **Step 6: Smoke test (Bash)**

```bash
npm run dev
```
(background, wait ~3s, confirm "ready in", no compile errors, kill)

- [ ] **Step 7: Commit**

```bash
git add src/App.jsx src/components/canvas/index.js src/components/index.js src/components/canvas/Stars.jsx package.json package-lock.json
git commit -m "Drop StarsCanvas + bg-test wrapper; remove maath dependency"
```

---

### Task 11: Phase 1 final smoke test

**Files:**
- None modified — verification only (unless a check fails and needs a mechanical fix).

- [ ] **Step 1: Run all automated checks (Bash)**

Run each of these and confirm:

```bash
npm run dev
```
(background, wait ~5s, confirm Vite reports "ready in", note the URL, kill)

```bash
npm run build
```

Expected: Vite production build completes with no errors. Output size should be smaller than Phase 0's baseline (we just removed Three.js's `Earth` GLTF and the `desktop_pc` 60MB+ texture pack).

```bash
npm ls gsap lenis @emailjs/browser maath 2>&1 | head -20
```

Expected: `gsap` and `lenis` present at top level; `@emailjs/browser` and `maath` both report `(empty)` or "extraneous" — meaning they're no longer in `package.json`.

```bash
ls src/components/canvas/
```

Expected: only `Ball.jsx` and `index.js`.

```bash
ls public/ | grep -E "desktop_pc|planet"
```

Expected: no output (both directories deleted).

```bash
grep -rl "ComputersCanvas\|EarthCanvas\|StarsCanvas\|@emailjs\|from ['\"]maath" src/ 2>/dev/null
```

Expected: no output (no remaining references to anything we dropped).

```bash
git log --oneline portfolio_testing -15
```

Expected: 11 new commits since Phase 0's final commit (`356ec16`).

- [ ] **Step 2: Surface the manual browser checklist for the user**

The user will verify these in their browser. Report this checklist verbatim:

```
## User browser verification (Phase 1)

Open the dev server URL in a fresh tab:

1. Hard-reload (Ctrl+Shift+R). Console should be free of red errors.
2. The Hero shows "ADNAAN DASOO" in Azonix all-caps display. On first load, the letters
   scramble through random glyphs and decode left-to-right. Total decode time ≈ 2.2s.
3. Below the hero name: a small subtitle ("Frontend · Creative Developer"), then in the
   bottom row: location ("Atlanta · GMT-5") + an "Available for work" pill with a green dot.
4. To the right of the bottom row: a bordered Now card with "NOW" label and body text.
5. Sticky nav at top: "AD." logo on the left, anchor links (about / experience / projects)
   in the middle, and a "DARK" pill on the right with a half-and-half color preview circle.
6. Click the DARK pill — page flips to dark mode. The pill label changes to "LIGHT".
   Click again — back to light. The choice persists across page reloads.
7. Scroll down. The middle sections (About, Experience, Tech, Works) still render with their
   OLD design (dark backgrounds, gradients, 3D ball icons, project cards). That's expected
   — they get rewritten in Phases 2-5.
8. Scroll to the bottom. The footer is the new dvdrod-style typographic CTA: pills along the
   top right, massive "Say hi! Let's talk ↗" headline that links to mailto:, email + location
   on the left, EMAIL/GITHUB links on the right, copyright centered below.
9. Hover the "Say hi! Let's talk ↗" headline — the arrow nudges up-and-right.
10. Hover any social link — opacity fades to 60%.
11. Scroll back up to the hero. The name should decode again from random glyphs.
12. Resize the window to ~400px wide. Mobile menu trigger (≡) appears in the nav. Click it
    — a drawer with the anchor links opens. Click an anchor — drawer closes and page scrolls.
13. The "old middle sections" might look weird with the new Navbar overlapping on top —
    that's OK, Phase 2-5 fix them. The Navbar's translucent blur should let you read what's
    underneath without it disappearing.
```

- [ ] **Step 3: If any automated check fails — fix it**

If something fails mechanically (e.g., a missed import), fix and commit:

```bash
git add <files>
git commit -m "Phase 1 final smoke test fixes"
```

Otherwise no commit is needed — Phase 1 is complete.

---

## Out of scope for this plan (deferred to later phases)

- Rewriting About, Experience, Tech, Works sections (Phases 2–5).
- Removing remaining legacy deps: `three`, `@react-three/fiber`, `@react-three/drei`, `react-tilt`, `react-vertical-timeline-component`. These have remaining consumers (`Ball.jsx` uses R3F/drei; `Works.jsx` uses react-tilt; `Experience.jsx` uses the timeline lib). Removed in a cleanup commit after Phase 5.
- Replacing the `font-poppins` Tailwind shim. Still used by old `Navbar.jsx`'s mobile drawer — wait, that was the OLD navbar; the new one we wrote in Task 5 doesn't use `font-poppins`. **Check after Task 5 if `font-poppins` has any remaining consumers**: `grep -rl "font-poppins" src/`. If empty, the shim could be removed in this phase as a bonus. If still used by old section components, defer to their rewrite phases.
- Self-hosting Azonix in `public/fonts/`. CDN remains for now.
- Removing legacy `:root` and `*` CSS in `src/index.css` (gradient classes, `.canvas-loader`, etc.). Still consumed by `Ball.jsx` and old section components.
- Cursor follower pill effect (deferred to a polish pass after all sections land).
- Per-section content gates beyond what's in `constants/index.js` today.

---

## Self-review

**Spec coverage check** (against design spec §3.1 Hero and §3.6 Contact/Footer, and §4 Stack changes):

§3.1 Hero requirements:
- ✓ Top bar with logo, anchor nav, DARK toggle pill — Task 5 (Navbar) + Task 2 (ThemeToggle)
- ✓ Massive hero name with scroll-decoded effect (Option B from brainstorming) — Task 4 (HeroDecoder) + Task 6 (Hero)
- ✓ Subtitle, location/timezone, Available for work pill, Now card — Task 1 (content) + Task 3 (Now) + Task 6 (Hero)
- ✓ Entrance motion: cascade on load — Task 6 uses Framer Motion stagger
- ✓ Re-decode on scroll-back — Task 4 IntersectionObserver

§3.6 Footer requirements:
- ✓ Personality pills row, right-aligned — Task 8
- ✓ Massive "Say hi! Let's talk ↗" with mailto — Task 8
- ✓ Email + location bottom-left, socials inline bottom-right, copyright centered below divider — Task 8
- ✓ No form, no Earth canvas, no emailjs — Tasks 8, 9
- ✓ Arrow nudge on hover — Task 8 (`group-hover:-translate-y-1 group-hover:translate-x-1`)

§4 Stack changes:
- ✓ Drop `@emailjs/browser` (Task 9)
- ✓ Drop `maath` (Task 10 — only consumer was Stars)
- ✓ Three.js / R3F / drei / tilt / vertical-timeline kept (out of scope — they have remaining consumers)
- ✓ New components: HeroDecoder, Now, ThemeToggle — Tasks 2, 3, 4
- ✓ `bg-test` wrapper removed from App so `--bg` shows through — Task 10

**Placeholder scan:** All code blocks are complete and runnable. No "TBD", "implement later", or "similar to Task N". Commands are concrete with expected outputs. Component prop signatures are explicit.

**Type consistency:**
- `useTheme()` returns `{ theme, toggle }` — defined in Phase 0 `src/utils/theme.jsx`, consumed in Task 2 (`ThemeToggle`). ✓
- `HeroDecoder` accepts `{ target: string, className?: string }` — defined in Task 4, consumed in Task 6 (`Hero` passes `target={hero.name}` and `className="font-display text-ink"`). ✓
- `Now` consumes `now.label` and `now.body` from constants. `now` shape defined in Phase 0 Task 9 as `{ label: string, body: string }`. ✓
- `hero` exports defined in Task 1 (`name`, `subtitle`, `location`, `availability`), all consumed by Task 6's Hero. ✓
- `footer` exports defined in Task 1 (`headline`, `email`, `location`, `copyright`), all consumed by Task 8's Contact. ✓
- `personalityPills` (string[]) and `socials` (`{ name, url }[]`) defined in Phase 0 Task 9, consumed by Task 8. ✓
- Removed exports (`EarthCanvas`, `ComputersCanvas`, `StarsCanvas`) cleared from both `components/index.js` and `components/canvas/index.js` in the same task as the file deletion (Tasks 7, 9, 10). ✓
