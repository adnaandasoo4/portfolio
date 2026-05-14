M# Portfolio v2 — Design Spec

**Date:** 2026-05-12
**Status:** Approved, ready for implementation planning
**Working branch:** `portfolio_testing`

---

## 1. Goals & non-goals

### Goals
Redesign the existing portfolio (currently a JS Mastery-style React + Three.js site at https://github.com/adnaandasoo4/portfolio) into a modern, typographic, motion-led site that:

- Functions as a "walking resume" — sections guide a visitor through identity, capability, history, work, and contact, in that order.
- Demonstrates frontend / creative-developer craft through deliberate motion and one scroll-driven set-piece.
- Targets an Awwwards-quality bar: editorial typography, restrained palette, considered hover/interaction states, no decorative noise.
- Ships incrementally, phase by phase, on the `portfolio_testing` branch.

### Non-goals
- Mobile pixel-parity for the Selected Work pin-scroll. We degrade gracefully to a vertical stack on small screens.
- A blog, multi-page routing, or `/case-study/[slug]` routes. React Router stays installed but no routes are added beyond the root.
- Analytics, SEO beyond a clean `<title>` + OG meta, or a full accessibility audit. These come after the redesign lands.
- Backwards compatibility with the current content data shape. `constants/index.js` is restructured outright.

### Positioning
Audience: people evaluating Adnaan for **frontend / creative-developer** roles. The site itself is a work sample.

---

## 2. Visual system

### Palette
Light is the default; dark is a toggle persisted in `localStorage`. The first-visit default respects `prefers-color-scheme` if set, else light.

| Token | Light | Dark |
|---|---|---|
| `--bg` | `#F2EFE9` (warm cream) | `#0A0A0A` (near-black) |
| `--ink` | `#0A0A0A` | `#F2EFE9` |
| `--accent` | `#3A6B3A` (muted green) | `#3A6B3A` |
| `--border` | `rgba(10,10,10,0.18)` | `rgba(242,239,233,0.18)` |
| `--muted` | `rgba(10,10,10,0.62)` | `rgba(242,239,233,0.62)` |

`--accent` is used **only** for the "available for work" status dot. The site is otherwise monochrome.

### Typography
| Use | Family | Weight | Notes |
|---|---|---|---|
| Hero name | **Azonix** | single weight, all-caps | Loaded from `https://fonts.cdnfonts.com/css/azonix` for dev; self-hosted in `public/fonts/` for production. Free for personal use. |
| Display headings (section H2s) | **Geist** | 900 | Free, via Google Fonts. |
| Body, UI | **Geist** | 400 / 500 / 700 | |
| Mono labels (e.g., "01 — INDEX", status text) | **JetBrains Mono** | 500 | Free, via Google Fonts. |

Type scale (desktop):
- Hero name: `clamp(60px, 11vw, 168px)`
- Section H2: `clamp(48px, 7vw, 96px)`
- Body: 16–18px, line-height 1.5
- Mono label: 11px, letter-spacing 0.08em, uppercase

### Spacing & layout
- Container max-width 1440px, horizontal padding `clamp(24px, 6vw, 96px)`.
- Vertical gap between sections: 15vh desktop, 10vh mobile.
- No card shadows, no gradients, no decorative dividers. Borders are 1px solid `--border`.

### Motion principles
Two motion registers, never overlapping:

- **Reveal** — section content fades + Y-shifts 12px on first scroll-in, 600ms, ease `cubic-bezier(0.65, 0, 0.35, 1)`. Runs once per element. Implementation: **Framer Motion** with `viewport={{ once: true, amount: 0.25 }}`.
- **Signature** — the hero scroll-decoded letters and the Selected Work pinned horizontal scroll. Scroll-position-driven, not time-driven. Implementation: **GSAP + ScrollTrigger**, scrubbed by **Lenis** scroll position.

Other motion:
- **Smooth scroll** — Lenis at app root, default lerp ~0.1, no over-easing.
- **Cursor** — subtle follower pill on interactive elements only. No full custom-cursor takeover.
- **Hover states** — every link and interactive element has an explicit hover (underline reveal, arrow nudge, border highlight). No default-browser hovers anywhere.

---

## 3. Sections

The site is a vertical scroll. Six sections, with deliberately uneven weights — two headline moments (Hero, Selected Work), two medium (Manifesto, Experience), two detail (Tech stack, Footer).

### 3.1 Hero — *headline*
**Layout:** Top bar with logo, anchor nav (Work / Experience / Contact), and a "DARK" toggle pill in the top-right. Massive hero name in Azonix all-caps, breaking onto two lines. Below the name, a Geist subtitle line ("Frontend · Creative Developer"). Bottom row has location/timezone meta and the "Available for work" pill on the left, and a bordered "Now" card on the right (e.g., "Currently building portfolio.v2 — shipping motion-led case studies for selected work").

**Signature interactive moment — scroll-decoded letters (Option B):** On initial page load and again when the user scrolls back to the hero, the name's characters cycle through random glyphs and decode into "ADNAAN DASOO" letter by letter with a ~50ms tick and reveal-one-letter-every-4-frames cadence. After decoding the name is static text. Implementation: pure DOM/JS in a `<HeroDecoder />` component, no shader, no WebGL.

**Entrance motion (on load):** Top bar fades in (200ms), name decodes (~1s total), subtitle fades + Y-shift (300ms after decode completes), bottom row staggers up (status pill, then Now card).

### 3.2 Manifesto — *medium*
**Replaces** the current About + services-cards section. Layout: small mono label `01 — INDEX`, then a 2–3 sentence intro in display weight (clamp 28–56px, Geist 700), then 3–4 short skill/value pills in a row underneath (`Motion`, `Scroll-driven UI`, `WebGL`, `Design systems` — content TBD).

**Motion:** Reveal register only — lines stagger in on scroll-in.

### 3.3 Selected Work — *headline*
**Replaces** the current `Works.jsx` card grid. Layout: small mono label `02 — SELECTED WORK`, then a pinned horizontal scroll set-piece. Each project entry occupies one full-viewport "slide":

- Number (`01` / `02` / `03` / `04`) in mono, top-left
- Project name in Geist 900 display weight, mid-left
- Short 1–2 sentence description, body weight
- Tech stack as inline mono labels
- A large preview image or autoplaying video, taking 50–60% of the slide

The user's vertical scroll wheel/trackpad input is converted to horizontal motion while the section is pinned. After the last project slide, vertical scroll resumes.

**Signature interactive moment — horizontal pin-scroll:** Implementation: GSAP ScrollTrigger with `pin: true`, `scrub: 1`, horizontal track using a wide flex container translated on the X axis as scroll progresses. Lenis provides smooth scroll input via `scrollerProxy`.

**Mobile degradation:** Below 768px, pin-scroll is disabled and slides stack vertically with a snap-scroll feel.

**Motion:** GSAP-only for this section. No Framer Motion overlap.

### 3.4 Experience — *medium*
**Replaces** the current `Experience.jsx` + `react-vertical-timeline-component`. Layout: small mono label `03 — EXPERIENCE`, then a vertical text list. Each row:

- Left: role + company in Geist 700, body size
- Right: date range in mono
- Below (collapsed by default): 1–2 sentence description, expandable on row click or hover

**Motion:** Reveal register on scroll-in, per-row stagger. Hover/click expansion uses a height transition.

### 3.5 Tech stack — *detail*
**Replaces** the current `Tech.jsx` + 3D ball icons. Layout: small mono label `04 — STACK`, then a 4-column grid (auto-rows) of monochrome SVG tech logos in bordered cells. Each cell labels the tech below the logo in mono.

**Asset note:** Each cell renders a monochrome SVG logo, colored via `currentColor` so the icon flips with the theme. Source of the SVGs (icon pack like Simple Icons vs. hand-converted from existing PNGs) is deferred to Phase 4 — see §6.

**Motion:** Reveal register only — cells fade in with light stagger on scroll. Hover: cell border highlights.

### 3.6 Contact / Footer — *detail*
**Replaces** the current `Contact.jsx` + emailjs form + 3D earth. Layout (dvdrod-inspired):

- Top: row of 4–6 personality/skill pills, right-aligned (e.g., "Motion", "WebGL", "Design systems", "Good vibes" — content TBD)
- Center-left: massive "Say hi! Let's talk ↗" in Geist 900, with the arrow as part of the typography (anchored to a `mailto:` link)
- Bottom-left: email + location stacked
- Bottom-right: inline social links (EMAIL · LINKEDIN · GITHUB · TWITTER — content TBD)
- Below a 1px divider: centered copyright

**No form. No 3D scene. No emailjs.**

**Motion:** Arrow ↗ nudges 4px on hover. Pills stagger on scroll-in.

---

## 4. Tech architecture

### Stack changes
| Dependency | Action | Reason |
|---|---|---|
| `@emailjs/browser` | remove | No contact form. |
| `@react-three/drei`, `@react-three/fiber`, `three`, `maath` | remove | All 3D scenes dropped. |
| `react-tilt` | remove | Project cards reskinned without it. |
| `react-vertical-timeline-component` | remove | Experience uses plain DOM. |
| `framer-motion` | keep, limit | Used only for reveal-register animations. |
| `gsap` (+ ScrollTrigger plugin) | **add** | Powers Selected Work pin-scroll. |
| `@studio-freight/lenis` | **add** | Smooth scroll, app-wide. |
| `react-router-dom` | keep | Already mounted; reserved for future routes. |

Bundle impact: removing Three.js + drei + maath alone should shrink the gzipped JS bundle by ~600KB. Target post-redesign: < 250KB gzipped.

### File-system changes
**Deleted:**
- `src/components/canvas/` (entire directory — Ball, Computers, Earth, Stars)
- `public/desktop_pc/` (GLTF model + textures)
- `public/planet/` (GLTF model + textures)
- All hero-related background image assets that no longer apply

**Kept (modified):**
- `src/hoc/SectionWrapper.jsx` — still wraps each section, still injects the anchor span + shared padding. Adds an optional `scrollTriggered?: boolean` prop for sections that integrate with GSAP ScrollTrigger instead of Framer Motion.
- `src/utils/motion.js` — Framer Motion variants stay for the reveal register.
- `src/styles.js` — type-scale helpers updated for the new system.
- Section components are rewritten in place where the new role still maps cleanly to the old name (`Hero.jsx`, `Experience.jsx`, `Tech.jsx`, `Contact.jsx`). Two are renamed because their roles have changed substantively: `About.jsx` → `Manifesto.jsx`, `Works.jsx` → `SelectedWork.jsx`. The barrel export in `src/components/index.js` is updated to match.

**New:**
- `src/components/HeroDecoder.jsx` — the scroll-decoded letters effect, isolated and reusable.
- `src/components/Now.jsx` — the bordered "Now" card.
- `src/utils/lenis.js` — single Lenis instance, exposed via React context so GSAP ScrollTrigger can use it.
- `src/utils/theme.js` — light/dark hook, persists to `localStorage`, applies `data-theme="dark"` on `<html>`, respects `prefers-color-scheme` for first visit.
- `public/fonts/azonix/` — self-hosted Azonix `.otf`/`.woff2` files (for production reliability).

### Content model (`src/constants/index.js`)
Restructured:
- **Dropped:** `services` (subsumed into Manifesto bullets).
- **Renamed:** `projects` → `selectedWork`. Shape changes: adds `coverImage`, `coverVideo`, `caseStudyUrl`. Drops `tags` array in favor of `techStack: string[]`.
- **Kept:** `experiences` (real entries replace placeholders), `technologies` (kept, used by Tech stack section), `navLinks` (kept).
- **Added:** `manifestoBullets: string[]`, `personalityPills: string[]` (footer), `socials: { name, url }[]`, `now: { label, body }`.

### Theme system
- CSS custom properties on `:root[data-theme="light"]` and `:root[data-theme="dark"]` in `src/index.css`.
- Tailwind config reads from CSS variables (`colors: { ink: 'rgb(var(--ink))', ... }`).
- `useTheme()` hook handles toggle + persistence.
- Initial paint reads `localStorage` synchronously via a small script in `index.html` to avoid theme flash.

### Motion architecture
- **Lenis** wraps the app body. Single instance. Initialized in a `LenisProvider` at app root.
- **GSAP ScrollTrigger** registered once at root. Uses `scrollerProxy` to read scroll position from Lenis instead of native scroll.
- **Framer Motion** runs independently for reveals.
- Boundary rule: one-shot scroll-in reveals → Framer Motion; scroll-scrubbed or pinned → GSAP. Never both on the same element.

---

## 5. Delivery plan

Section-by-section delivery on `portfolio_testing`. Each phase is its own commit/PR target, individually verifiable. User approves each phase before the next begins. Merge to `main` only at end-of-redesign (or per-phase if the user later opts for rolling release).

| Phase | Ships | Depends on | Effort |
|---|---|---|---|
| **0 · Foundation** | Theme system + Lenis + GSAP wiring + webfonts + Tailwind tokens swap + old-dep removal + `constants/index.js` restructure + `SectionWrapper` tweak. Site is broken end-to-end at this point; that's fine because nothing else has been rebuilt yet. | — | small (but load-bearing) |
| **1 · Hero + Footer** | `<Hero>` with `<HeroDecoder>`, top nav with DARK toggle, status pill, Now card. dvdrod-style footer replacing Contact. Visual identity is now end-to-end coherent even if middle sections are placeholder. | Phase 0 + hero/footer content | medium |
| **2 · Manifesto** | Replaces About + services. | Phase 0 + manifesto bullets | small |
| **3 · Experience** | Vertical text list with hover-expand. | Phase 0 + real job entries | small |
| **4 · Tech stack** | Grid of monochrome SVG logos in cells. | Phase 0 + SVG asset pass | small |
| **5 · Selected Work** | Pinned horizontal scroll set-piece. The biggest engineering push. Saved for last. | Phase 0 + case-study content (names, descriptions, cover images/videos, links) | large |

### Content gates
Adnaan provides content at the start of each content-bearing phase:
- Phase 1 needs: hero subtitle (one short line), location/timezone, "Now" card copy, footer email, socials, copyright line, personality pills (4–6 short strings).
- Phase 2 needs: manifesto paragraph (2–3 sentences) + 3–4 skill/value pills.
- Phase 3 needs: real job entries with role, company, dates, 1–2 sentence description per role.
- Phase 5 needs: 3–4 project case studies — name, 1–2 sentence description, tech stack list, cover image or video, optional case-study link.

---

## 6. Open decisions deferred to implementation
These are not blocking for the spec but will be decided during planning or implementation:

1. **Azonix licensing path** — confirm we're shipping the personal-use license; document this in the repo so future Adnaan doesn't get caught off-guard.
2. **Cursor follower pill** — exact shape, behavior on which elements. Decide during Phase 1.
3. **SVG tech logos** — source from a single icon pack (e.g., Simple Icons) vs. hand-converting existing PNGs. Decide during Phase 4.
4. **Selected Work cover assets** — image vs. autoplaying muted video vs. mixed. Decided per-project during Phase 5 content gate.
5. **"Now" card content cadence** — manual edit, or read from a markdown file, or pulled from a tiny JSON endpoint. Decide during Phase 1; default is manual edit.

---

## 7. Out of scope (reiterated)
- Mobile parity on Selected Work pin-scroll beyond a vertical-stack fallback.
- Routing beyond `/`.
- Analytics, full SEO/meta, accessibility audit.
- Server-side rendering / SSG / migration to Next.js.
