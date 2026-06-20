# Portfolio V2 — Hero Wordmark + Scroll-Driven Color Blend Design

**Date:** 2026-06-20
**Branch:** `Portfolio_V2`
**Status:** Approved design → ready for implementation plan
**Scope:** Second sub-project of the V2 redesign. Two coupled changes: (1) replace the
Hero's WebGL `ADNAAN` wordmark with a DOM Moniqa wordmark that lets the field through and
recolors with the page; (2) replace the discrete per-section backdrop cross-fade with a
continuous scroll-driven color blend that drives both the WebGL field and all page text.
The **navbar** (burger / full-page nav / removing the theme toggle) is the NEXT sub-project
and is out of scope here.

---

## 1. Goal & context

The foundation sub-project (color tokens, Moniqa/Manrope, the global topographic field) is
done. This piece fixes two things the foundation left rough and lays groundwork for the
section reveals:

- The Hero's `ADNAAN` wordmark is still a self-contained Three.js component
  (`HeroBigText.jsx`) that rasterizes the word in **Clash Display** and fills its texture
  with the **opaque** background color (to avoid edge halos). That opaque band paints over
  the topographic field, so the contours don't show behind it, and it never recolors with
  the V2 palette.
- The field recolors via a **discrete** mechanism: a section reports `dark`/`light` at
  50%-in-view and the field lerps to the new color on a ~1.3s timer (`src/utils/backdrop.jsx`,
  `TopographicField.jsx`). The user wants a **continuous, scroll-coupled blend** (Lando-style)
  that also recolors the page text — which is the model the section reveals will build on.

**Relevant existing code:** `src/components/HeroBigText.jsx` (Three.js wordmark, to be
deleted), `src/components/Hero.jsx` (lazy-imports HeroBigText; has a mobile sideways
wordmark in Clash Display; carries `ctx-dark` + `useReportBackdrop`), `src/components/Manifesto.jsx`
(`ctx-light` + `useReportBackdrop`), `src/utils/backdrop.jsx` (discrete provider + IntersectionObserver
hook), `src/components/canvas/TopographicField.jsx` (rAF loop, discrete color lerp), `src/components/canvas/topoShader.js`
(`BACKDROP_COLORS` with bg/line per palette), `src/index.css` (`:root, .ctx-dark` + `.ctx-light`
token blocks), `src/utils/lenis.jsx` (Lenis scrolls the real document, so `window.scrollY` stays in sync).

---

## 2. Locked decisions

### 2.1 Hero ADNAAN wordmark
- **Delete `src/components/HeroBigText.jsx`** and remove its lazy import + usage from `Hero.jsx`.
  Removes the second WebGL context on the page (only the field remains).
- Replace it with a **DOM Moniqa wordmark**: big all-caps `ADNAAN`, **transparent background**
  (field shows through the negative space), **solid** glyphs colored with the live `--ink`
  token (so it recolors light→dark with the blend and stays legible). **Scrolls in normal
  flow** — no parallax, no cursor effect.
- The **mobile sideways wordmark** in `Hero.jsx` switches its `fontFamily` from Clash Display
  to **Moniqa** for consistency; it keeps using `--display-subtle` (a ghost shade).
- Wordmark sizing/position mirror the current full-bleed bottom band (tunable); concrete
  starting values in §3.4.

### 2.2 Continuous scroll-driven color blend ("uniform crossfade")
- The whole field is **one color at any moment**, interpolated from **scroll position**
  between adjacent sections' palettes (not a spatial gradient, not a timer).
- **One blended palette drives both** the WebGL field uniforms (`uBg`, `uLine`) and the
  page text via CSS variables (`--bg`, `--ink`, `--line`) written on `document.documentElement`
  every frame — so the field, the wordmark, the Hero headline, and section body text all
  recolor in lockstep.
- **Palettes are dark / light**, values sourced from one JS object (extend `BACKDROP_COLORS`
  to add `ink`): `dark = {bg #283021, line #DCFE4F, ink #DEE1D3}`, `light = {bg #F1EFE8, line #292C21, ink #292C21}`.

### 2.3 What this replaces
- The discrete `BackdropProvider` dark/light **state** and `useReportBackdrop` →
  an **ordered section registry** + a continuous scroll driver.
- The field's timed color lerp → per-frame scroll-derived color.
- The `ctx-dark` / `ctx-light` **classes** on Hero/Manifesto are **removed** (inline root
  vars set by the driver would otherwise be re-overridden by a descendant class via
  specificity). Sections now only **register** their palette. In `src/index.css`,
  `:root, .ctx-dark{…}` reverts to `:root{…}` (kept as the pre-JS fallback = dark) and the
  `.ctx-light{…}` block is deleted (its values now live in the JS palette object).

---

## 3. Architecture & components

### 3.1 Section registry (`src/utils/backdrop.jsx` — refactor)
Replace the discrete provider/hook with an ordered registry:

- `BackdropProvider` holds a **mutable ordered list ref** of `{ el, palette }` plus
  `register(entry)` / `unregister(entry)` callbacks (stable via `useCallback`), exposed
  through context. (Keeping the component name avoids churn in `App.jsx`.)
- `useSectionBackdrop(ref, palette)` — `palette` is `'dark' | 'light'`. On mount it
  registers `{ el: ref.current, palette }`; on unmount it unregisters. (Replaces
  `useReportBackdrop`.)
- A `useBackdropRegistry()` accessor returns the list ref + a `version` counter that bumps
  on register/unregister, so the field knows to recompute cached offsets.
- Hooks that mix with the component export keep the existing
  `// eslint-disable-next-line react-refresh/only-export-components` pattern.

### 3.2 Palette source (`src/components/canvas/topoShader.js`)
Extend `BACKDROP_COLORS` so each palette includes `ink` alongside `bg`/`line`:
```js
dark:  { bg: rgb("#283021"), line: rgb("#DCFE4F"), ink: rgb("#DEE1D3") },
light: { bg: rgb("#F1EFE8"), line: rgb("#292C21"), ink: rgb("#292C21") },
```

### 3.3 Scroll-blend driver (`src/components/canvas/TopographicField.jsx`)
The driver is folded into the field's existing rAF loop (no second loop):

- **Cached offsets:** on mount, on `window` resize, on registry `version` change, and via a
  `ResizeObserver` on `document.body` (content height changes, e.g. accordions), compute and
  cache each registered section's absolute top (`getBoundingClientRect().top + window.scrollY`)
  and height, in DOM order. Per-frame code reads only the cache + `window.scrollY` (no layout reads).
- **Blend math (per frame):**
  - `refDocY = window.scrollY + innerHeight * REF_POINT` (`REF_POINT = 0.5`, viewport center).
  - Find the section **boundary** (top edge of each section after the first) nearest `refDocY`;
    call the sections above/below it A and B (`A = palette[k-1]`, `B = palette[k]`).
  - `progress = clamp((refDocY - topB) / BLEND_BAND + 0.5, 0, 1)` (`BLEND_BAND = 0.6 * innerHeight`,
    tunable). Before the first boundary → `palette[0]`; after the last → `palette[last]`.
  - `blended.{bg,line,ink} = mix(A.{…}, B.{…}, progress)`.
- **Apply each frame:**
  - If WebGL present: set `uBg = blended.bg`, `uLine = blended.line` (replaces the old
    target-lerp; the blend itself is the smoothing).
  - Always (even with no WebGL): write CSS vars on `document.documentElement` —
    `--bg`, `--ink`, `--line` as `rgb(r,g,b)` strings from the blended 0–1 values.
- **Morph time:** `uTime` advances as before, EXCEPT under `prefers-reduced-motion` it is
  frozen at 0 (no autonomous morph) — but the loop still runs so the **color still follows
  scroll** (user-driven, not autonomous, so reduced-motion-safe). The old reduced-motion
  "draw once + settle interval" path is removed.
- **No-WebGL:** the loop still runs to drive the CSS-var blend (page text recolors on
  scroll); only the field draw is skipped. The body shows its `--bg`.
- **Hidden tab:** pause the loop on `visibilitychange` (resume on return), as today.
- Registry access: the field reads the list ref from `useBackdropRegistry()`.

### 3.4 Hero (`src/components/Hero.jsx`)
- Remove `const HeroBigText = lazy(...)`, the `<Suspense><HeroBigText/></Suspense>` block,
  and the `lazy`/`Suspense` imports if now unused.
- Add the DOM wordmark in the same bottom-band slot (desktop; `hidden sm:block`), e.g.:
  ```jsx
  <div aria-hidden="true"
       className="pointer-events-none absolute bottom-[-2vw] left-0 right-0 hidden select-none text-center uppercase sm:block"
       style={{ fontFamily: "Moniqa, Georgia, serif", fontWeight: 900,
                fontSize: "clamp(96px, 26vw, 460px)", lineHeight: 0.8,
                letterSpacing: "0.01em", color: "var(--ink)" }}>
    {hero.name}
  </div>
  ```
  (Exact size/offset tunable during implementation; it must read in Moniqa with the field
  visible around the letters.)
- Mobile sideways wordmark: change its inline `fontFamily` from Clash Display to
  `"Moniqa", Georgia, serif` (keeps `--display-subtle`).
- Swap `useReportBackdrop(sectionRef, "dark")` → `useSectionBackdrop(sectionRef, "dark")`;
  **remove** the `ctx-dark` class from the `<section>` (keep `ref={sectionRef}`).

### 3.5 Manifesto (`src/components/Manifesto.jsx`)
- Swap `useReportBackdrop(ref, "light")` → `useSectionBackdrop(ref, "light")`; **remove** the
  `ctx-light` class from the root div (keep `ref={ref}`).

### 3.6 CSS (`src/index.css`)
- Revert `:root, .ctx-dark{` → `:root{` (still the dark default / pre-JS fallback).
- Delete the `.ctx-light{ … }` block.

### 3.7 App (`src/App.jsx`)
- No structural change required (provider keeps its name and position). Confirm
  `TopographicField` still mounts inside the provider.

---

## 4. Data flow

```
BackdropProvider (ordered registry ref: [{el, palette}, …], version)
  ├─ Sections: useSectionBackdrop(ref, 'dark'|'light')  → register/unregister
  └─ TopographicField rAF loop (every frame):
        scrollY + cached offsets → nearest boundary → progress → blended {bg,line,ink}
          ├─ WebGL uniforms uBg/uLine        (field contours recolor)
          └─ documentElement style --bg/--ink/--line  (all DOM text recolors)
Hero wordmark + headline + body text use var(--ink); body bg uses var(--bg).
```

---

## 5. Out of scope (next sub-projects)
- Navbar reinvention: big custom burger top-right opening a full-page nav (Lando-style),
  and removal of the now-inert `ThemeToggle` + `ThemeProvider`/`data-theme` machinery.
- Per-section scroll-reveal animations and restyling the other sections (Process, Experience,
  Tech, SelectedWork, Contact) onto the blend system (they'll each register a palette).
- Tuning `REF_POINT` / `BLEND_BAND` to taste is expected during/after implementation.

---

## 6. Verification (no test runner — manual via `npm run dev` + lint/build)
1. Hero `ADNAAN` renders in **Moniqa**, solid, with the **topographic field visible around
   the letters** (no opaque band). Mobile sideways wordmark is Moniqa.
2. Scrolling Hero→Manifesto **continuously** blends the field AND all text/bg green→white
   (and back on scroll up), coupled to scroll position (pausing mid-scroll holds the blend).
3. The Hero headline, wordmark, and Manifesto text all recolor together (no per-section snap).
4. `prefers-reduced-motion`: field morph is frozen, but colors still blend as you scroll.
5. No-WebGL: page colors still blend on scroll (no contour lines); no console errors.
6. Hidden tab pauses the loop; returning resumes.
7. `npm run lint` passes (`--max-warnings 0`); `npm run build` succeeds. `HeroBigText.jsx`
   is deleted and no dangling imports remain.

---

## 7. Risks / notes
- **Per-frame `documentElement` style writes** are cheap (3 custom properties) but happen
  every frame; acceptable. Offsets are cached to avoid per-frame layout reads.
- **Three.js still bundled** (used elsewhere? confirm) — deleting HeroBigText removes the
  Hero's use; if no other importer remains, the Three chunk drops from the Hero path. Do not
  remove the `three` dependency in this piece (out of scope; verify usage first).
- **Boundary model** assumes sections are registered in DOM order and are vertically stacked
  (they are). Non-registered sections between two registered ones would create a gap where the
  blend holds the last palette — acceptable; full per-section coverage comes as sections are
  restyled.
- **Color accuracy** values reuse the locked palette; unchanged from the foundation.
