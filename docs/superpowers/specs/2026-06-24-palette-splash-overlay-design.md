# Radial palette-splash in the nav overlay

**Date:** 2026-06-24
**Status:** Approved design — ready for implementation plan
**Branch:** Portfolio_V2

## Problem

Changing the color palette (via the `ColorPicker` swatches in the full-page nav
overlay) recolors the whole site **in a single frame**. The `setPalette` call
flips `data-palette` on `<html>` and mutates the live `BACKDROP_COLORS.dark`
object that the WebGL topographic field reads each frame, so the field and DOM
snap to the new colors instantly.

We want the change to read as a **radial "splash"**: when a swatch is clicked,
the new palette blooms outward from that swatch in an expanding circle over
~0.8s, instead of switching all at once.

## Decisions (from brainstorming)

- **Motion shape:** radial splash (circle expanding from the clicked swatch).
- **Where it plays:** the **nav overlay only** (`OverlayTopo`). The `ColorPicker`
  lives inside the open overlay, so the splash gives immediate feedback right
  where the user clicks. The hidden main page adopts the new palette live
  (instantly); when the overlay closes, the page is already the new color.
- **Approach:** shader-driven radial color mix (the field holds old + new colors
  and mixes them per-pixel by an expanding radius). Chosen over a dual-canvas
  clip-path reveal or a flat DOM gradient disc because it is the only option
  where the **contour lines themselves sweep** with the background, GPU-cheap,
  and reuses the existing single shader.

## Current architecture (relevant pieces)

- `src/components/canvas/topoShader.js` — exports `VERT`, `FRAG` (shared by both
  field canvases), `TOPO_PARAMS`, `BACKDROP_COLORS`, `DARK_PALETTES`,
  `setDarkPalette(name)`. `setDarkPalette` **mutates** `BACKDROP_COLORS.dark` in
  place so live readers pick up swaps without re-instantiating GL.
- `src/utils/palette.jsx` — `PaletteProvider` / `usePalette`. `setPalette(id)`
  sets state; an effect sets `data-palette`, calls `setDarkPalette(id)`, and
  persists to `localStorage`.
- `src/components/ColorPicker.jsx` — the 2×2 swatch grid (bottom-left of the
  overlay). Each swatch button calls `setPalette(p.id)`.
- `src/components/canvas/OverlayTopo.jsx` — second WebGL canvas inside the
  overlay. Captures `pal = BACKDROP_COLORS.dark` once and feeds `pal.bg` /
  `pal.line` to the shader each frame; only paints while `active` (overlay open).
- `src/components/canvas/TopographicField.jsx` — the main full-page field (z-0),
  shares `FRAG`, blends palette by scroll.

## Design

### 1. Shared shader — `topoShader.js` (`FRAG`)

The contour "ink" value (`ink`, the line/breathe math) is **color-independent**,
so compute it once, then produce two colorings and mix by a radial mask.

New uniforms:

- `uBg2` (vec3), `uLine2` (vec3) — the **incoming** palette's bg + line colors.
- `uCenter` (vec2) — splash origin in **aspect-corrected uv** (see below).
- `uRadius` (float) — current splash radius in the same aspect-corrected units.
- `uEdge` (float) — soft-edge half-width for the splash boundary.

Fragment tail becomes:

```glsl
float inkc = clamp(ink, 0.0, 1.0);
vec3 colOld = mix(uBg,  uLine,  inkc);
vec3 colNew = mix(uBg2, uLine2, inkc);
float mask = 0.0;
if (uRadius > 0.0) {
  // aspect-corrected distance so the bloom is a circle, not an ellipse
  vec2 auv = vec2(uv.x * (uRes.x / uRes.y), uv.y);
  float d  = distance(auv, uCenter);
  // 1 inside the radius, 0 outside (edge0 < edge1 — valid smoothstep)
  mask = 1.0 - smoothstep(uRadius - uEdge, uRadius + uEdge, d);
}
gl_FragColor = vec4(mix(colOld, colNew, mask), 1.0);
```

`uv` is `gl_FragCoord.xy / uRes.xy` (already computed at the top of `main`).
`uCenter.x` is supplied already multiplied by the aspect ratio so it matches
`auv`.

Steady state (no transition) is expressed by `uRadius = 0` → the `if` is skipped,
`mask = 0` → the existing `colOld` (= current palette) is used everywhere. So the
visual is identical to today whenever no splash is running, and the shader is safe
even if a consumer never sets the new uniforms (they default to 0).

### 2. Transition state — `src/utils/paletteTransition.js` (new module)

A tiny framework-agnostic singleton (no React) so the rAF render loop can read it
without re-renders.

State: `{ active, fromBg, fromLine, toBg, toLine, center:[u,v], start, duration }`
where colors are `[r,g,b]` 0–1 arrays (same form as `BACKDROP_COLORS`), and
`center` is **normalized uv** (`x = clientX / innerW`, `y = 1 - clientY / innerH`).

API:

- `startPaletteTransition({ fromBg, fromLine, toBg, toLine, center, duration })`
  — records the transition; `start` is stamped by the caller-passed `now`
  (`performance.now()`), `active = true`.
- `readPaletteTransition(now)` — returns `null` if inactive; otherwise
  `{ fromBg, fromLine, toBg, toLine, center, progress }` where `progress` is the
  **eased** 0→1 value (`easeInOutCubic`). When raw progress ≥ 1 it sets
  `active = false` and returns `null` (steady state resumes next frame).

Tunables (module constants): `DEFAULT_DURATION = 800` (ms), easing fn, and the
shader edge softness can live here or in `OverlayTopo` — keep them named.

Geometry note: the module stays pure timing + colors + uv center. The **canvas**
converts uv center to aspect-corrected units and computes
`uRadius = progress × maxCornerDistance`, where `maxCornerDistance` is the
largest aspect-corrected distance from the center to any of the four screen
corners (guarantees the splash fully covers the viewport).

### 3. `ColorPicker.jsx`

On a swatch button click (in addition to the existing `setPalette(p.id)`):

1. Compute the splash origin from the button's `getBoundingClientRect()` center →
   normalized uv (`cx/innerW`, `1 - cy/innerH`).
2. Capture `from = BACKDROP_COLORS.dark` (clone `bg` + `line`) **before** the
   swap.
3. Read `to = DARK_PALETTES[p.id]` directly (so we have the target synchronously
   rather than waiting on the `PaletteProvider` effect).
4. Call `setPalette(p.id)` (unchanged — still flips `data-palette`,
   `setDarkPalette`, persists).
5. If **not** `prefers-reduced-motion`, call `startPaletteTransition({ from…,
   to…, center, duration, now: performance.now() })`.

Under reduced motion, skip step 5 → instant swap (current behavior).
Re-clicking another swatch simply calls `startPaletteTransition` again; `from`
is whatever `BACKDROP_COLORS.dark` currently holds (the previous target).

### 4. `OverlayTopo.jsx`

- Look up the 5 new uniform locations alongside the existing ones.
- In the frame loop, call `readPaletteTransition(performance.now())`:
  - **Active:** set `uBg=fromBg`, `uLine=fromLine`, `uBg2=toBg`, `uLine2=toLine`;
    `uCenter = [center[0]*aspect, center[1]]`; `uRadius = progress *
    maxCornerDistance(center, aspect)`; `uEdge = EDGE`.
  - **Idle:** `uBg=pal.bg`, `uLine=pal.line` (as today), `uBg2=pal.bg`,
    `uLine2=pal.line`, `uCenter=[0,0]`, `uRadius=0`, `uEdge=0`.
- The loop already runs while the overlay is open, which is the only time a
  transition can start, so no change to the active/idle gating is needed.

### 5. `TopographicField.jsx` (main page field)

Shares `FRAG`, so it must set the new uniforms to a **no-op** every frame:
`uBg2 = bg`, `uLine2 = line`, `uCenter = [0,0]`, `uRadius = 0`, `uEdge = 0`. It
does not run the splash. (The page is hidden behind the overlay during a pick;
it just adopts the new palette live as it already does.)

## Scope / non-goals

- **CSS chrome accents** (`--lime`, `--accent`, etc. via `:root[data-palette]`)
  continue to switch **instantly**. Only the field background + contour lines
  sweep. The field is the dominant color, so it reads as the splash; the small
  lime UI accents popping immediately is acceptable for now.
- The main page field is intentionally **not** swept (overlay-only decision).
- No new dependencies; no change to palette persistence or the set of palettes.

## Edge cases

- **Rapid swatch clicks:** restart the sweep from the current target; brief pop
  mid-sweep is acceptable.
- **prefers-reduced-motion:** no splash; instant swap (unchanged).
- **No WebGL / no derivatives:** field draw is already skipped; the swap is
  instant and the CSS chrome still switches. The splash simply doesn't run.
- **Overlay closed mid-sweep:** `OverlayTopo` idles; the transition flips
  inactive on its own once progress ≥ 1; reopening shows the steady new palette.

## Verification

- `npm run lint` clean (`--max-warnings 0`).
- Manual: open the nav overlay, click each of the four swatches; confirm the
  field (background + contour lines) blooms radially from the clicked swatch over
  ~0.8s to the new palette, with no flash of the old/new color elsewhere.
- Confirm steady-state rendering is visually identical to before when no
  transition is running (both overlay and main page).
- Confirm reduced-motion swaps instantly with no errors.
- Confirm the main page (scroll out of the overlay after a pick) shows the new
  palette correctly.

## Files touched

- `src/components/canvas/topoShader.js` — extend `FRAG`.
- `src/utils/paletteTransition.js` — **new** transition-state module.
- `src/components/ColorPicker.jsx` — trigger the transition on swatch click.
- `src/components/canvas/OverlayTopo.jsx` — drive the splash uniforms.
- `src/components/canvas/TopographicField.jsx` — set no-op uniforms.
