# Portfolio V2 — Foundation Design

**Date:** 2026-06-20
**Branch:** `Portfolio_V2`
**Status:** Approved design → ready for implementation plan
**Scope:** This is the FIRST sub-project of the larger V2 redesign. It covers only the
visual **foundation**: color system, type system, and the animated topographic
background. The navbar redesign, per-section scroll reveals, and section layout work
are SEPARATE later sub-projects and are explicitly out of scope here.

---

## 1. Goal & context

Portfolio V2 re-skins the existing single-page React/Vite portfolio toward an
awwwards-tier, editorial, scroll-driven aesthetic inspired by landonorris.com. The
content stays the same; the look changes.

The hard, unproven part of that vision — the morphing "topographic blob" background —
was prototyped live and confirmed feasible (WebGL fragment shader, GPU-cheap). Colors
and fonts were pinned to exact values through visual iteration. This spec captures those
locked decisions and the plan to wire them into the real codebase so that every later
piece is designed against a site that already looks right.

**Existing stack (relevant):** React 18 + Vite, React Router, Framer Motion, GSAP
ScrollTrigger, Lenis smooth-scroll, `three@0.184` (already a dependency). Theming today
is CSS custom properties driven by `data-theme` light/dark, with Tailwind tokens
(`ink`, `paper`, `accent`, `edge`, `muted`, `flag`) mapped to those vars in
`tailwind.config.js`. Fonts today: Clash Display (self-hosted woff2), Azonix, Geist,
JetBrains Mono.

---

## 2. Locked decisions

### 2.1 Color palette

| Token role | Hex | Notes |
|---|---|---|
| Dark-green backdrop | `#283021` | Primary section background |
| Off-white backdrop | `#F1EFE8` | Warm paper, alternating section background |
| Light text (on green) | `#DEE1D3` | |
| Dark text (on paper) | `#292C21` | |
| Accent — muted green | `#B6C652` | Headline accent words; "accent text" |
| Accent — bright lime | `#DCFE4F` | **UI chrome only** (buttons, nav marks, topo lines on green) |

Two-greens rule: bright lime `#DCFE4F` is reserved for interactive/UI chrome and the
topographic lines on the dark backdrop; the muted `#B6C652` is for headline accent
words and accent text. They are not interchangeable.

Backdrops alternate **per section** (hero green → next paper → …), matching the
reference. This is NOT a user-facing light/dark toggle. The existing `data-theme`
light/dark theme and its `ThemeToggle` are superseded by V2; their removal is handled in
a later piece (navbar), not here — see §6.

### 2.2 Type system (two fonts)

- **Headlines → Moniqa Display** (Indian Type Foundry, licensed; OTFs already on disk).
  All-caps. Base **Regular 400** in the light text color; accent words **Black-Italic
  900** in muted green `#B6C652`. All relevant OpenType features ON:
  `font-feature-settings: "salt" 1, "ss01" 1, "dlig" 1, "liga" 1, "calt" 1;`
  (Verified present in the font: `liga`, `dlig`, `salt`, `ss01`.)
  Production self-hosts only the weights we use: **Regular 400**, **Black 900**,
  **Black-Italic 900** — Display optical cut, Regular width.
- **Body + UI → Manrope.** Weights 400/500/600/700.

Fonts explored and DROPPED: Clash Grotesk, Satoshi, Clash Display (as headline faces).
The full-Moniqa headline ("Option C") won.

### 2.3 Topographic field

A continuously morphing field of hairline topographic contour lines behind all content.
Domain-warped simplex-noise field; a line is drawn wherever the field crosses an
elevation band; a second slow noise field makes regions breathe in and out of existence.

**Locked visual parameters** (from the prototype, "Thinness/hairline" build):

| Param | Value | Meaning |
|---|---|---|
| Line count | 3.5 | elevation bands (how many lines) |
| Scale | 0.50 | field zoom (lower = bigger, fewer features) |
| Morph speed | 30% | evolution rate (very slow) |
| Thinness | 1.40 | sub-pixel half-width → ever-so-thin strokes |
| Coverage | 50% | how much is present at once (less empty space) |
| Breathe | 50% | how strongly regions fade in/out |
| Opacity | 10% | overall line opacity |

Colors by backdrop: **green → lime `#DCFE4F` lines**, **paper → dark-green `#292C21`
lines**. Lines are crisp/anti-aliased (no halo/blur).

---

## 3. Architecture & components

### 3.1 Color tokens (`src/index.css`, `tailwind.config.js`)

Reuse the existing var-driven token names so existing Tailwind classes keep resolving.
Replace the `data-theme` light/dark blocks with V2 values, and introduce **two backdrop
context classes** instead of a user theme:

```css
/* default page context = dark green */
:root, .ctx-dark {
  --bg:#283021; --ink:#DEE1D3; --accent:#B6C652; --lime:#DCFE4F;
  --topo-line:#DCFE4F;            /* lime on green */
  --border:rgba(222,225,211,.18); --muted:rgba(222,225,211,.62);
}
.ctx-light {
  --bg:#F1EFE8; --ink:#292C21; --accent:#B6C652; --lime:#DCFE4F;
  --topo-line:#292C21;            /* dark green on paper */
  --border:rgba(41,44,33,.18); --muted:rgba(41,44,33,.62);
}
```

Add a `lime` token to `tailwind.config.js` colors (`lime: "var(--lime)"`). A section
declares its backdrop by adding `ctx-dark` / `ctx-light` to its wrapper; text/border/
muted tokens follow automatically.

### 3.2 Fonts (`src/index.css`)

Self-host woff2 under `public/fonts/moniqa/` and `public/fonts/manrope/`. `@font-face`:

- `Moniqa` weight 400 normal, 900 normal, 900 italic (Display cut).
- `Manrope` weights 400–700 (single variable woff2 acceptable).

Tailwind `fontFamily`: `display: ["Moniqa", "Georgia", "serif"]`,
`sans: ["Manrope", system-ui, sans-serif]`. Body `font-family` → Manrope.

A small headline helper encapsulates the locked treatment so sections don't re-spell it:

- A `Display` component (or `.display-head` / `.display-accent` utility classes) that
  applies: `font-family:Moniqa; text-transform:uppercase; font-feature-settings:(all on)`
  for the base, and `font-style:italic; font-weight:900; color:var(--accent)` for accent
  words. Accent words are authored as `<em>` (or `<Accent>`) inside the headline.

### 3.3 `TopographicField` background (single global WebGL canvas)

One fixed, full-viewport canvas mounted **once** at the app root (replacing the role the
old `StarsCanvas` had), behind all content. A single WebGL context (NOT one per section —
browsers cap WebGL contexts and each is costly).

- **Component:** `src/components/canvas/TopographicField.jsx` + shader strings in
  `src/components/canvas/topoShader.js`. Raw WebGL (or a minimal `three` ortho fullscreen
  quad — either is fine; raw WebGL keeps it dependency-light).
- **Locked params** baked as constants (§2.3). Renders at `devicePixelRatio` capped at 2.
- **Backdrop recolor on scroll:** a `BackdropProvider` React context holds the current
  backdrop (`'dark' | 'light'`). Sections report their backdrop as they enter the
  viewport (IntersectionObserver, threshold ~0.5). The field cross-fades its `uBg` and
  `uTopoLine` uniforms toward the active backdrop over ~0.6 s (uniform lerp in the rAF
  loop). For THIS sub-project, only the Hero needs to drive it (green); the
  provider/observer wiring is built but full per-section coverage lands as sections are
  restyled later.
- **Accessibility / perf:**
  - `prefers-reduced-motion: reduce` → freeze time (render one static frame, no rAF
    loop).
  - Pause the rAF loop when `document.hidden` (tab hidden).
  - `pointer-events:none`, `aria-hidden`, fixed behind content (low z-index).
  - **No-WebGL fallback:** if `getContext('webgl')` is null, render nothing — the page
    just shows the solid backdrop color (`--bg`). Acceptable graceful degradation.

### 3.4 App composition (`src/App.jsx`)

Wrap the app in `BackdropProvider`; mount `<TopographicField />` once inside the root,
behind `<Routes>`. Hero sets `ctx-dark` and reports `'dark'` to the provider.

### 3.5 Hero proof (`src/components/Hero.jsx`)

Restyle ONLY the Hero headline as the foundation proof: Moniqa all-caps with `<em>`
accent words (Black-Italic 900, muted green), on the green backdrop, over the live field.
This validates fonts + tokens + field together. Other sections are not restyled in this
sub-project; they keep working and inherit the new tokens (they will look transitional
until their own later pieces).

---

## 4. Data flow

```
BackdropProvider (state: 'dark'|'light')
  ├─ TopographicField  ── reads backdrop ──> lerps uBg/uTopoLine uniforms each frame
  └─ Sections          ── IntersectionObserver onEnter ──> setBackdrop('dark'|'light')
```

Color tokens flow purely through CSS: a section's `ctx-*` class sets `--bg/--ink/...`;
Tailwind utilities (`bg-paper`, `text-ink`, `text-accent`, `text-lime`) resolve to them.

---

## 5. Asset preparation (implementation tasks)

- Convert the three needed Moniqa OTFs (`Moniqa-Display`, `Moniqa-BlackDisplay`,
  `Moniqa-BlackItalicDisplay`) from the local package to **woff2** (via `fonttools`
  `ttx`/`compreffor` or `woff2_compress`; confirm tool availability, else document the
  manual step). Place in `public/fonts/moniqa/`.
- Acquire **Manrope** woff2 (variable) and place in `public/fonts/manrope/`.
- The prototype's base64-inlined fonts were a brainstorming convenience only — NOT used
  in production.

---

## 6. Out of scope (explicitly deferred to later pieces)

- Navbar redesign / full-page navigation, and removal of the old `ThemeToggle` +
  `data-theme` light/dark machinery and the Azonix logo font.
- Per-section scroll-reveal animations and playful motion.
- Restyling Manifesto, Process, Experience, Marquee, Tech, SelectedWork, Contact layouts.
- Per-section backdrop assignment for the whole page (only Hero is wired here; the
  mechanism is built so later pieces just add `ctx-*` + a report call).

---

## 7. Verification (no test runner configured)

Manual, via `npm run dev`:

1. Field renders behind the Hero, hairline lime contours on green, slow morph + breathe,
   ~60 fps.
2. Hero headline renders in Moniqa all-caps with Black-Italic green accent words and
   OpenType alternates active (visible alternate letterforms).
3. Scrolling to a section that reports `'light'` cross-fades the field to dark-green
   lines on paper (temporary test hook acceptable for this sub-project).
4. `prefers-reduced-motion` (DevTools emulation) → field is static, no animation.
5. Hidden tab → rAF loop pauses (no CPU/GPU churn).
6. Browser without WebGL → page shows solid backdrop, no errors.
7. `npm run lint` passes with `--max-warnings 0`. `npm run build` succeeds.

---

## 8. Risks / notes

- **OTF→woff2 tooling** may not be installed; if conversion can't be automated, the
  fallback is to ship the OTFs via `@font-face` (larger, but functional) and revisit.
- **Color accuracy** was sampled from compressed screenshots, not Lando's CSS; values are
  a faithful approximation and may be nudged once seen live against the reference tab.
- **Single global field + scroll recolor** is the chosen architecture for performance;
  the alternative (per-section canvases) is rejected due to WebGL context limits.
