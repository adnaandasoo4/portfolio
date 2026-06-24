# Radial Palette-Splash in the Nav Overlay — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When a palette swatch is clicked in the nav overlay, the overlay's topographic field blooms from that swatch (background + contour lines) from the old palette to the new one as an expanding circle over ~0.8s, instead of switching instantly.

**Architecture:** The shared field shader gains a radial two-palette mix driven by new uniforms (`uBg2`, `uLine2`, `uCenter`, `uRadius`, `uEdge`). A tiny framework-agnostic singleton (`paletteTransition.js`) holds the in-flight transition so the WebGL rAF loop can read it each frame without React re-renders. `ColorPicker` starts a transition on click; `OverlayTopo` drives the splash uniforms; the main page field sets them to a no-op. Spec: `docs/superpowers/specs/2026-06-24-palette-splash-overlay-design.md`.

**Tech Stack:** React, WebGL (raw GLSL in template strings), Vite. **No test runner is configured in this repo** (see `CLAUDE.md`), and this is a GPU/visual feature — adding a unit-test framework + WebGL mocks is out of scope (YAGNI). Verification for every task is `npm run lint` (configured with `--max-warnings 0`, so any warning fails) plus the explicit manual browser checks noted per task against the running dev server (`npm run dev`, http://localhost:5173).

> **HMR note:** The canvas components compile their shader once in a mount-effect. After editing `topoShader.js` or a canvas component, do a **full page reload** in the browser (not just HMR) so the shader recompiles.

---

## File Structure

- `src/utils/paletteTransition.js` — **new.** Singleton transition state: `startPaletteTransition(...)`, `readPaletteTransition(now)`, easing + tunable constants. One responsibility: hold/advance the current splash.
- `src/components/canvas/topoShader.js` — **modify** `FRAG`: add the 5 uniforms + radial mix. Shared by both field canvases; the change is backward-compatible (uniforms default 0 → no splash).
- `src/components/canvas/OverlayTopo.jsx` — **modify**: look up + drive the splash uniforms from the transition state each frame.
- `src/components/canvas/TopographicField.jsx` — **modify**: set the new uniforms to a no-op (`uRadius = 0`) each frame so the shared shader renders the page field unchanged.
- `src/components/ColorPicker.jsx` — **modify**: on swatch click, capture origin + from/to colors and call `startPaletteTransition` (skipped under reduced motion), then the existing `setPalette`.

---

## Task 1: Transition-state module

**Files:**
- Create: `src/utils/paletteTransition.js`

- [ ] **Step 1: Create the module**

Create `src/utils/paletteTransition.js` with exactly this content:

```js
// Drives the radial palette "splash" shown in the nav overlay when a swatch is
// picked. Framework-agnostic singleton so the WebGL render loop (rAF) can read
// it every frame WITHOUT triggering React re-renders.
//
// Colors are [r, g, b] arrays in 0..1 (same shape as BACKDROP_COLORS in
// topoShader.js). `center` is normalized uv: x = clientX / innerW,
// y = 1 - clientY / innerH (GL's uv origin is bottom-left).

export const DEFAULT_DURATION = 800; // ms — full sweep length
export const SPLASH_EDGE = 0.04; // soft-edge half-width, in aspect-corrected uv

const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const state = {
  active: false,
  fromBg: [0, 0, 0],
  fromLine: [0, 0, 0],
  toBg: [0, 0, 0],
  toLine: [0, 0, 0],
  center: [0.5, 0.5],
  start: 0,
  duration: DEFAULT_DURATION,
};

// Begin (or restart) a splash. `now` is a performance.now() timestamp supplied
// by the caller. Color args are [r,g,b] 0..1 arrays.
export function startPaletteTransition({
  fromBg,
  fromLine,
  toBg,
  toLine,
  center,
  now,
  duration = DEFAULT_DURATION,
}) {
  state.fromBg = fromBg;
  state.fromLine = fromLine;
  state.toBg = toBg;
  state.toLine = toLine;
  state.center = center;
  state.start = now;
  state.duration = duration;
  state.active = true;
}

// Returns null when idle; otherwise { fromBg, fromLine, toBg, toLine, center,
// progress } where progress is the EASED 0..1 value. Flips itself inactive once
// the raw (un-eased) progress reaches 1, so the next frame resumes steady state.
export function readPaletteTransition(now) {
  if (!state.active) return null;
  const raw = (now - state.start) / state.duration;
  if (raw >= 1) {
    state.active = false;
    return null;
  }
  return {
    fromBg: state.fromBg,
    fromLine: state.fromLine,
    toBg: state.toBg,
    toLine: state.toLine,
    center: state.center,
    progress: easeInOutCubic(Math.max(0, raw)),
  };
}
```

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: exits 0, no errors/warnings.

- [ ] **Step 3: Commit**

```bash
git add src/utils/paletteTransition.js
git commit -m "feat(v2): palette transition state module for overlay splash"
```

---

## Task 2: Extend the shared field shader

**Files:**
- Modify: `src/components/canvas/topoShader.js` (the `FRAG` template string)

- [ ] **Step 1: Add the new uniform declarations**

In `FRAG`, find this line:

```glsl
uniform vec3 uBg;uniform vec3 uLine;
```

Replace it with:

```glsl
uniform vec3 uBg;uniform vec3 uLine;
uniform vec3 uBg2;uniform vec3 uLine2;uniform vec2 uCenter;uniform float uRadius;uniform float uEdge;
```

- [ ] **Step 2: Replace the color/output tail with the radial mix**

In `FRAG`, find these three lines at the end of `main`:

```glsl
  float ink=line*breath*uAmt;
  vec3 col=mix(uBg,uLine,clamp(ink,0.0,1.0));
  gl_FragColor=vec4(col,1.0);
```

Replace them with:

```glsl
  float ink=clamp(line*breath*uAmt,0.0,1.0);
  vec3 colOld=mix(uBg,uLine,ink);
  vec3 colNew=mix(uBg2,uLine2,ink);
  float mask=0.0;
  if(uRadius>0.0){
    vec2 auv=vec2(uv.x*(uRes.x/uRes.y),uv.y);
    float d=distance(auv,uCenter);
    mask=1.0-smoothstep(uRadius-uEdge,uRadius+uEdge,d);
  }
  gl_FragColor=vec4(mix(colOld,colNew,mask),1.0);
```

(`uv` is already defined at the top of `main` as `vec2 uv=gl_FragCoord.xy/uRes.xy;`.)

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: exits 0, no errors/warnings.

- [ ] **Step 4: Manual check — no visual regression**

With `npm run dev` running, **hard-reload** http://localhost:5173. The page and the nav overlay must look exactly as before (the new uniforms are unset → default 0 → `uRadius` is 0 → `mask` stays 0 → old color path). Open the nav overlay and confirm the topographic field still renders normally. No console GL errors (no shader compile/link errors).

- [ ] **Step 5: Commit**

```bash
git add src/components/canvas/topoShader.js
git commit -m "feat(v2): radial two-palette mix in field shader (backward-compatible)"
```

---

## Task 3: Main page field sets the new uniforms to a no-op

**Files:**
- Modify: `src/components/canvas/TopographicField.jsx`

This keeps the shared shader's new uniforms explicitly neutral on the main field (the splash is overlay-only). Do this before wiring the overlay so both consumers of the shader stay consistent.

- [ ] **Step 1: Add the uniform locations**

In `TopographicField.jsx`, find the uniform-location block:

```js
          const U = (n) => gl.getUniformLocation(prog, n);
          u = {
            res: U("uRes"),
            time: U("uTime"),
            bg: U("uBg"),
            line: U("uLine"),
            density: U("uDensity"),
            scale: U("uScale"),
            weight: U("uWeight"),
            amt: U("uAmt"),
            breathe: U("uBreathe"),
            coverage: U("uCoverage"),
          };
```

Add the five new locations so it reads:

```js
          const U = (n) => gl.getUniformLocation(prog, n);
          u = {
            res: U("uRes"),
            time: U("uTime"),
            bg: U("uBg"),
            line: U("uLine"),
            density: U("uDensity"),
            scale: U("uScale"),
            weight: U("uWeight"),
            amt: U("uAmt"),
            breathe: U("uBreathe"),
            coverage: U("uCoverage"),
            bg2: U("uBg2"),
            line2: U("uLine2"),
            center: U("uCenter"),
            radius: U("uRadius"),
            edge: U("uEdge"),
          };
```

- [ ] **Step 2: Set the no-op uniforms each frame**

In the `frame` function, find:

```js
        gl.uniform3fv(u.bg, p.bg);
        gl.uniform3fv(u.line, p.line);
```

Replace with:

```js
        gl.uniform3fv(u.bg, p.bg);
        gl.uniform3fv(u.line, p.line);
        // No splash on the main page field — neutralize the shared shader's
        // radial-mix uniforms so it renders the single current palette.
        gl.uniform3fv(u.bg2, p.bg);
        gl.uniform3fv(u.line2, p.line);
        gl.uniform2f(u.center, 0, 0);
        gl.uniform1f(u.radius, 0);
        gl.uniform1f(u.edge, 0);
```

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: exits 0, no errors/warnings.

- [ ] **Step 4: Manual check**

Hard-reload http://localhost:5173. The main page field must look unchanged (scroll through the page; the white→green blend still works). No console GL errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/canvas/TopographicField.jsx
git commit -m "feat(v2): neutralize splash uniforms on the main page field"
```

---

## Task 4: Drive the splash in the overlay field

**Files:**
- Modify: `src/components/canvas/OverlayTopo.jsx`

- [ ] **Step 1: Import the transition reader + edge constant**

At the top of `OverlayTopo.jsx`, find:

```js
import { VERT, FRAG, TOPO_PARAMS, BACKDROP_COLORS } from "./topoShader";
```

Add below it:

```js
import { readPaletteTransition, SPLASH_EDGE } from "../../utils/paletteTransition";
```

- [ ] **Step 2: Add the uniform locations**

Find the uniform-location block:

```js
          const U = (n) => gl.getUniformLocation(prog, n);
          u = {
            res: U("uRes"),
            time: U("uTime"),
            bg: U("uBg"),
            line: U("uLine"),
            density: U("uDensity"),
            scale: U("uScale"),
            weight: U("uWeight"),
            amt: U("uAmt"),
            breathe: U("uBreathe"),
            coverage: U("uCoverage"),
          };
```

Replace with:

```js
          const U = (n) => gl.getUniformLocation(prog, n);
          u = {
            res: U("uRes"),
            time: U("uTime"),
            bg: U("uBg"),
            line: U("uLine"),
            density: U("uDensity"),
            scale: U("uScale"),
            weight: U("uWeight"),
            amt: U("uAmt"),
            breathe: U("uBreathe"),
            coverage: U("uCoverage"),
            bg2: U("uBg2"),
            line2: U("uLine2"),
            center: U("uCenter"),
            radius: U("uRadius"),
            edge: U("uEdge"),
          };
```

- [ ] **Step 3: Replace the static color uniforms with transition-aware logic**

In the `frame` function, find:

```js
        gl.uniform3fv(u.bg, pal.bg);
        gl.uniform3fv(u.line, pal.line);
```

Replace with:

```js
        const tr = readPaletteTransition(performance.now());
        if (tr) {
          // aspect-corrected uv (matches the shader's auv); GL viewport uses
          // device pixels but width/height share the viewport's aspect ratio.
          const aspect = canvas.width / canvas.height;
          const cx = tr.center[0] * aspect;
          const cy = tr.center[1];
          // Largest distance from the origin to any screen corner, so the
          // splash radius at progress=1 fully covers the viewport.
          let maxD = 0;
          const corners = [
            [0, 0],
            [aspect, 0],
            [0, 1],
            [aspect, 1],
          ];
          for (let i = 0; i < corners.length; i++) {
            const dx = corners[i][0] - cx;
            const dy = corners[i][1] - cy;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d > maxD) maxD = d;
          }
          gl.uniform3fv(u.bg, tr.fromBg);
          gl.uniform3fv(u.line, tr.fromLine);
          gl.uniform3fv(u.bg2, tr.toBg);
          gl.uniform3fv(u.line2, tr.toLine);
          gl.uniform2f(u.center, cx, cy);
          // +edge so the soft boundary still fully clears the far corner at end
          gl.uniform1f(u.radius, tr.progress * maxD + SPLASH_EDGE);
          gl.uniform1f(u.edge, SPLASH_EDGE);
        } else {
          gl.uniform3fv(u.bg, pal.bg);
          gl.uniform3fv(u.line, pal.line);
          gl.uniform3fv(u.bg2, pal.bg);
          gl.uniform3fv(u.line2, pal.line);
          gl.uniform2f(u.center, 0, 0);
          gl.uniform1f(u.radius, 0);
          gl.uniform1f(u.edge, 0);
        }
```

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: exits 0, no errors/warnings.

- [ ] **Step 5: Manual check (no trigger yet)**

Hard-reload http://localhost:5173, open the nav overlay. The overlay field must look unchanged — no transition fires yet because `ColorPicker` doesn't call `startPaletteTransition` until Task 5, so `readPaletteTransition` always returns `null` (idle path). No console GL errors. Clicking a swatch should still switch the palette instantly (existing behavior) for now.

- [ ] **Step 6: Commit**

```bash
git add src/components/canvas/OverlayTopo.jsx
git commit -m "feat(v2): drive radial palette splash uniforms in OverlayTopo"
```

---

## Task 5: Trigger the splash from the ColorPicker

**Files:**
- Modify: `src/components/ColorPicker.jsx`

- [ ] **Step 1: Add imports**

At the top of `ColorPicker.jsx`, find:

```js
import { useRef, useState } from "react";
import { usePalette } from "../utils/palette";
```

Replace with:

```js
import { useRef, useState } from "react";
import { usePalette } from "../utils/palette";
import { BACKDROP_COLORS, DARK_PALETTES } from "./canvas/topoShader";
import { startPaletteTransition } from "../utils/paletteTransition";
```

- [ ] **Step 2: Add a click handler that starts the transition then sets the palette**

Inside the `ColorPicker` component, find:

```js
  const [hovering, setHovering] = useState(false);
```

Immediately ABOVE that line (still inside the component body, after the `setPalette` definition), the component already has `palette`/`setPalette` from `usePalette()`. Add this handler right after the existing `const setPalette = ...` line:

```js
  // Picking a swatch: kick off the radial splash from the clicked swatch (the
  // overlay's OverlayTopo reads this each frame), THEN apply the palette. `from`
  // is cloned before setPalette runs so the eventual setDarkPalette mutation of
  // BACKDROP_COLORS.dark can't change it under us. Skipped under reduced motion.
  const handlePick = (p, e) => {
    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) {
      const r = e.currentTarget.getBoundingClientRect();
      const cx = (r.left + r.width / 2) / window.innerWidth;
      const cy = 1 - (r.top + r.height / 2) / window.innerHeight;
      const from = BACKDROP_COLORS.dark;
      const to = DARK_PALETTES[p.id] || DARK_PALETTES.green;
      startPaletteTransition({
        fromBg: [...from.bg],
        fromLine: [...from.line],
        toBg: [...to.bg],
        toLine: [...to.line],
        center: [cx, cy],
        now: performance.now(),
      });
    }
    setPalette(p.id);
  };
```

> Note: the exact existing lines are `const setPalette = ctx?.setPalette ?? (() => {});` followed by `const [hovering, setHovering] = useState(false);`. Insert `handlePick` between them.

- [ ] **Step 3: Wire the swatch button to the handler**

Find the swatch button's click handler:

```js
              onClick={() => setPalette(p.id)}
```

Replace with:

```js
              onClick={(e) => handlePick(p, e)}
```

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: exits 0, no errors/warnings.

- [ ] **Step 5: Manual check — the splash works**

Hard-reload http://localhost:5173, open the nav overlay, and click each of the four swatches in turn. Expected for each: the overlay's topographic field (background **and** contour lines) blooms outward in a circle **from the clicked swatch** (bottom-left grid) over ~0.8s into the new palette — not an instant flip, no flash of the wrong color at the far edges. Picking a second swatch mid-sweep restarts from the current color (a small pop is acceptable). No console GL errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/ColorPicker.jsx
git commit -m "feat(v2): trigger radial palette splash on swatch pick"
```

---

## Task 6: Final verification

- [ ] **Step 1: Lint the whole project**

Run: `npm run lint`
Expected: exits 0, no errors/warnings.

- [ ] **Step 2: Production build smoke test**

Run: `npm run build`
Expected: build succeeds (no shader-string or import errors).

- [ ] **Step 3: Manual acceptance pass** (matches the spec's Verification section)

With the dev server, hard-reload and verify all of:
1. Open the overlay; click each of the 4 swatches → radial bloom from the swatch over ~0.8s, background + contour lines together, no edge flash.
2. Steady state (no transition running) looks identical to before — in both the overlay and the main page.
3. Reduced motion: with OS "reduce motion" on (or DevTools emulate `prefers-reduced-motion: reduce`), picking a swatch swaps **instantly** with no errors.
4. After picking a color, close the overlay and scroll the page → the main page shows the new palette correctly.

- [ ] **Step 4: Tuning checkpoint (optional)**

If the sweep feels too fast/slow or the edge too hard/soft, adjust `DEFAULT_DURATION` and `SPLASH_EDGE` in `src/utils/paletteTransition.js`. Re-run `npm run lint` and commit if changed.

---

## Self-review notes (for the implementer)

- The shader change is backward-compatible: with `uRadius = 0` the `if` is skipped and the original single-palette path runs, so Tasks 2–4 can land before Task 5 without breaking rendering.
- Uniform key names are consistent across all three canvas edits: `bg2`, `line2`, `center`, `radius`, `edge` → `uBg2`, `uLine2`, `uCenter`, `uRadius`, `uEdge`.
- `from` colors are cloned (`[...from.bg]`) in `ColorPicker` because `setDarkPalette` mutates `BACKDROP_COLORS.dark` in place.
- `center` is normalized uv with a flipped Y (GL origin bottom-left); `OverlayTopo` multiplies X by the aspect ratio to match the shader's `auv`.
