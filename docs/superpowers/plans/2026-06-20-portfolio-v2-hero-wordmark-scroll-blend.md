# Portfolio V2 — Hero Wordmark + Scroll Blend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Hero's WebGL `ADNAAN` wordmark with a DOM Moniqa wordmark that lets the field through and recolors with the page, and replace the discrete backdrop cross-fade with a continuous scroll-driven blend that drives both the field and all page text.

**Architecture:** Sections register `{el, palette}` in an ordered registry (`backdrop.jsx`). The `TopographicField` rAF loop reads scroll position against cached section offsets, computes one blended palette (`bg`/`line`/`ink`), and applies it to both the WebGL uniforms and `--bg`/`--ink`/`--line` CSS vars on `:root`. The Hero wordmark becomes solid Moniqa text colored `var(--ink)`.

**Tech Stack:** React 18, raw WebGL, CSS custom properties, Lenis (scrolls the real document, so `window.scrollY` is authoritative).

**Testing note:** No test runner in this repo. Per-task gates are `npm run lint` (`--max-warnings 0`), `npm run build`, and a manual `npm run dev` observation. The migration is sequenced so **every commit builds and runs** (back-compat shims bridge the API change until the cleanup task).

---

## File structure

**Modify:**
- `src/components/canvas/topoShader.js` — add `ink` to each `BACKDROP_COLORS` palette.
- `src/utils/backdrop.jsx` — replace the discrete provider with an ordered section registry (`BackdropProvider`, `useSectionBackdrop`, `useBackdropRegistry`); keep temporary `useReportBackdrop`/`useBackdrop` shims.
- `src/components/canvas/TopographicField.jsx` — rewrite: registry-driven scroll blend → uniforms + CSS vars; runs without WebGL; reduced-motion freezes morph but still blends color.
- `src/components/Hero.jsx` — delete WebGL wordmark, add DOM Moniqa wordmark, mobile wordmark → Moniqa, switch hook, drop `ctx-dark`.
- `src/components/Manifesto.jsx` — switch hook, drop `ctx-light`.
- `src/index.css` — drop `.ctx-dark`/`.ctx-light` token blocks.

**Delete:**
- `src/components/HeroBigText.jsx`.

---

## Task 1: Add `ink` to backdrop palettes

**Files:** Modify `src/components/canvas/topoShader.js`

- [ ] **Step 1: Add `ink` to both palettes**

Find:
```js
export const BACKDROP_COLORS = {
  dark: { bg: rgb("#283021"), line: rgb("#DCFE4F") }, // green bg, lime lines
  light: { bg: rgb("#F1EFE8"), line: rgb("#292C21") }, // paper bg, dark-green lines
};
```
Replace with:
```js
export const BACKDROP_COLORS = {
  dark: { bg: rgb("#283021"), line: rgb("#DCFE4F"), ink: rgb("#DEE1D3") }, // green bg, lime lines, light ink
  light: { bg: rgb("#F1EFE8"), line: rgb("#292C21"), ink: rgb("#292C21") }, // paper bg, dark-green lines, dark ink
};
```

- [ ] **Step 2: Verify**

Run: `npm run lint` → passes clean. Run: `npm run build` → succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/canvas/topoShader.js
git commit -m "feat(v2): add ink color to backdrop palettes"
```

---

## Task 2: Section registry (replace discrete backdrop provider)

**Files:** Modify `src/utils/backdrop.jsx`

- [ ] **Step 1: Replace the entire file contents with:**

```jsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const BackdropContext = createContext(null);

/**
 * Holds an ordered registry of sections and the backdrop palette each one
 * wants ('dark' green / 'light' off-white). The TopographicField reads the
 * registry every frame to compute a continuous, scroll-driven color blend
 * that drives both the field colors and the page text. Sections register
 * themselves via useSectionBackdrop.
 */
export function BackdropProvider({ children }) {
  const registryRef = useRef([]);
  const [version, setVersion] = useState(0);

  const register = useCallback((entry) => {
    registryRef.current = [...registryRef.current, entry];
    setVersion((v) => v + 1);
    return () => {
      registryRef.current = registryRef.current.filter((e) => e !== entry);
      setVersion((v) => v + 1);
    };
  }, []);

  const value = useMemo(
    () => ({ registryRef, version, register }),
    [version, register],
  );
  return (
    <BackdropContext.Provider value={value}>
      {children}
    </BackdropContext.Provider>
  );
}

/**
 * Register `ref`'s element with the given palette ('dark' | 'light') while it
 * is mounted. The field measures each registered element's position to blend
 * colors across sections as the user scrolls.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useSectionBackdrop(ref, palette) {
  const ctx = useContext(BackdropContext);
  const register = ctx && ctx.register;
  useEffect(() => {
    if (!register || !ref.current) return;
    const entry = { el: ref.current, palette };
    return register(entry);
  }, [ref, palette, register]);
}

/**
 * Accessor for the field: the live registry ref plus a version counter that
 * bumps whenever sections register/unregister (so cached offsets recompute).
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useBackdropRegistry() {
  const ctx = useContext(BackdropContext);
  if (ctx) return { registryRef: ctx.registryRef, version: ctx.version };
  return { registryRef: { current: [] }, version: 0 };
}

/**
 * TEMPORARY back-compat shims so existing imports keep building during the
 * migration. Both are removed in the cleanup task once all callers move to
 * useSectionBackdrop / useBackdropRegistry.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useReportBackdrop(ref, value) {
  useSectionBackdrop(ref, value);
}
// eslint-disable-next-line react-refresh/only-export-components
export function useBackdrop() {
  return "dark";
}
```

- [ ] **Step 2: Verify**

Run: `npm run lint` → passes clean. Run: `npm run build` → succeeds. (The existing `TopographicField` still imports `useBackdrop` and renders dark — the blend arrives in Task 3. Hero/Manifesto still import `useReportBackdrop` via the shim. Build stays green.)

- [ ] **Step 3: Commit**

```bash
git add src/utils/backdrop.jsx
git commit -m "feat(v2): ordered section registry for scroll-blend"
```

---

## Task 3: Rewrite TopographicField — scroll-driven blend

**Files:** Modify `src/components/canvas/TopographicField.jsx`

- [ ] **Step 1: Replace the entire file contents with:**

```jsx
import { useCallback, useEffect, useRef } from "react";
import { useBackdropRegistry } from "../../utils/backdrop";
import { VERT, FRAG, TOPO_PARAMS, BACKDROP_COLORS } from "./topoShader";

// Reference line for the blend (fraction of viewport height from the top) and
// the blend band width (fraction of viewport height over which one section's
// boundary crosses from fully-previous to fully-next color). Tunable.
const REF_POINT = 0.5;
const BLEND_BAND_FRAC = 0.6;

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const mix = (a, b, t) => a + (b - a) * t;
const mixArr = (a, b, t) => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];
const rgbStr = (c) =>
  `rgb(${Math.round(c[0] * 255)}, ${Math.round(c[1] * 255)}, ${Math.round(c[2] * 255)})`;

/**
 * Given cached section offsets (sorted by absolute top), the scroll position,
 * and viewport height, return the uniformly-blended palette {bg,line,ink}.
 * The whole screen is one color; the color tracks scroll as each section
 * boundary crosses the reference line.
 */
function blendedPalette(offsets, scrollY, vh) {
  if (offsets.length === 0) return BACKDROP_COLORS.dark;
  if (offsets.length === 1) return BACKDROP_COLORS[offsets[0].palette] || BACKDROP_COLORS.dark;
  const refY = scrollY + vh * REF_POINT;
  const band = Math.max(1, vh * BLEND_BAND_FRAC);
  // Boundary = top edge of each section after the first. Pick the nearest.
  let k = 1;
  let best = Infinity;
  for (let i = 1; i < offsets.length; i++) {
    const d = Math.abs(offsets[i].top - refY);
    if (d < best) {
      best = d;
      k = i;
    }
  }
  const A = BACKDROP_COLORS[offsets[k - 1].palette] || BACKDROP_COLORS.dark;
  const B = BACKDROP_COLORS[offsets[k].palette] || BACKDROP_COLORS.dark;
  const progress = clamp((refY - offsets[k].top) / band + 0.5, 0, 1);
  return {
    bg: mixArr(A.bg, B.bg, progress),
    line: mixArr(A.line, B.line, progress),
    ink: mixArr(A.ink, B.ink, progress),
  };
}

/**
 * Single fixed full-viewport WebGL canvas behind all content. Renders the
 * morphing topographic field and continuously blends its colors — and the
 * page's --bg/--ink/--line CSS vars — toward the section palette at the
 * current scroll position. One WebGL context for the whole app.
 *
 * Accessibility/perf: prefers-reduced-motion freezes the morph (t=0) but the
 * color still follows scroll (user-driven). The loop pauses while the tab is
 * hidden. With no WebGL (or no derivatives), the field draw is skipped but the
 * CSS-var color blend still runs so page text recolors on scroll.
 */
export default function TopographicField() {
  const canvasRef = useRef(null);
  const { registryRef, version } = useBackdropRegistry();
  const offsetsRef = useRef([]);

  // Cache each registered section's absolute top + height, sorted by top.
  // Read once here (layout), never per-frame.
  const recompute = useCallback(() => {
    const scrollY = window.scrollY || window.pageYOffset || 0;
    offsetsRef.current = registryRef.current
      .filter((e) => e.el)
      .map(({ el, palette }) => {
        const r = el.getBoundingClientRect();
        return { top: r.top + scrollY, height: r.height, palette };
      })
      .sort((a, b) => a.top - b.top);
  }, [registryRef]);

  useEffect(() => {
    recompute();
    window.addEventListener("resize", recompute);
    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(recompute) : null;
    if (ro) ro.observe(document.body);
    return () => {
      window.removeEventListener("resize", recompute);
      if (ro) ro.disconnect();
    };
  }, [recompute, version]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext("webgl", {
      antialias: true,
      premultipliedAlpha: false,
    });

    let hasGL = false;
    let prog = null;
    let buf = null;
    let u = null;

    if (gl && gl.getExtension("OES_standard_derivatives")) {
      const compile = (type, src) => {
        const s = gl.createShader(type);
        if (!s) return null;
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
          console.error(gl.getShaderInfoLog(s));
        }
        return s;
      };
      const vsh = compile(gl.VERTEX_SHADER, VERT);
      const fsh = compile(
        gl.FRAGMENT_SHADER,
        "#extension GL_OES_standard_derivatives : enable\n" + FRAG,
      );
      if (vsh && fsh) {
        prog = gl.createProgram();
        gl.attachShader(prog, vsh);
        gl.attachShader(prog, fsh);
        gl.linkProgram(prog);
        if (gl.getProgramParameter(prog, gl.LINK_STATUS)) {
          gl.useProgram(prog);
          gl.deleteShader(vsh);
          gl.deleteShader(fsh);
          buf = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, buf);
          gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([-1, -1, 3, -1, -1, 3]),
            gl.STATIC_DRAW,
          );
          const loc = gl.getAttribLocation(prog, "p");
          gl.enableVertexAttribArray(loc);
          gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
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
          hasGL = true;
        } else {
          console.error(gl.getProgramInfoLog(prog));
        }
      }
    }

    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      if (!hasGL) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const root = document.documentElement;
    let lastKey = "";
    const applyCssVars = (p) => {
      const bg = rgbStr(p.bg);
      const ink = rgbStr(p.ink);
      const line = rgbStr(p.line);
      const key = bg + ink + line;
      if (key === lastKey) return; // skip redundant style writes when static
      lastKey = key;
      root.style.setProperty("--bg", bg);
      root.style.setProperty("--ink", ink);
      root.style.setProperty("--line", line);
    };

    let raf = 0;
    let running = true;
    const start = performance.now();

    const frame = () => {
      if (!running) return;
      const vh = window.innerHeight;
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const p = blendedPalette(offsetsRef.current, scrollY, vh);
      applyCssVars(p);
      if (hasGL) {
        const t = reduce
          ? 0
          : ((performance.now() - start) / 1000) * (TOPO_PARAMS.speedPct / 40);
        gl.uniform2f(u.res, canvas.width, canvas.height);
        gl.uniform1f(u.time, t);
        gl.uniform3fv(u.bg, p.bg);
        gl.uniform3fv(u.line, p.line);
        gl.uniform1f(u.density, TOPO_PARAMS.density);
        gl.uniform1f(u.scale, TOPO_PARAMS.scale);
        gl.uniform1f(u.weight, TOPO_PARAMS.weight);
        gl.uniform1f(u.amt, TOPO_PARAMS.opacityPct / 100);
        gl.uniform1f(u.breathe, TOPO_PARAMS.breathe);
        gl.uniform1f(u.coverage, TOPO_PARAMS.coverage);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
      raf = requestAnimationFrame(frame);
    };
    frame();

    const onVis = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        frame();
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
      if (gl && prog) gl.deleteProgram(prog);
      if (gl && buf) gl.deleteBuffer(buf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run lint` → passes clean. Run: `npm run build` → succeeds.
Run: `npm run dev`. Scroll Hero→Manifesto: the field now **continuously** blends green→white with scroll (and back up). (Manifesto's text still snaps because it still has the `ctx-light` class — fixed in Task 5. That's expected at this commit.)

- [ ] **Step 3: Commit**

```bash
git add src/components/canvas/TopographicField.jsx
git commit -m "feat(v2): continuous scroll-driven color blend (field + CSS vars)"
```

---

## Task 4: Hero — Moniqa wordmark, drop WebGL

**Files:** Modify `src/components/Hero.jsx`; Delete `src/components/HeroBigText.jsx`

- [ ] **Step 1: Trim the React import (remove `lazy`, `Suspense`)**

Find:
```jsx
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
```
Replace with:
```jsx
import { useEffect, useMemo, useRef, useState } from "react";
```

- [ ] **Step 2: Remove the HeroBigText lazy import**

Delete this block (the comment + the `const HeroBigText = lazy(...)` line):
```jsx
// HeroBigText pulls in Three.js (~365 KB). Code-splitting it into its own
// chunk lets the rest of the page (Manifesto, Experience, Tech, Selected
// Work, Contact) finish downloading first; the wordmark fills in as Three
// loads in parallel. Fallback is null so the wordmark area stays empty
// during the swap — the page background already covers it.
const HeroBigText = lazy(() => import("./HeroBigText"));
```

- [ ] **Step 3: Switch the backdrop import + call to the registry hook**

Find:
```jsx
import { useReportBackdrop } from "../utils/backdrop";
```
Replace with:
```jsx
import { useSectionBackdrop } from "../utils/backdrop";
```
Find:
```jsx
  useReportBackdrop(sectionRef, "dark");
```
Replace with:
```jsx
  useSectionBackdrop(sectionRef, "dark");
```

- [ ] **Step 4: Drop the `ctx-dark` class from the section**

Find:
```jsx
    <section ref={sectionRef} className="ctx-dark relative flex min-h-screen min-h-[100dvh] w-full flex-col overflow-hidden px-6 pb-0 pt-32 sm:px-16 sm:pb-12 sm:pt-40">
```
Replace with:
```jsx
    <section ref={sectionRef} className="relative flex min-h-screen min-h-[100dvh] w-full flex-col overflow-hidden px-6 pb-0 pt-32 sm:px-16 sm:pb-12 sm:pt-40">
```

- [ ] **Step 5: Mobile sideways wordmark → Moniqa**

Find (inside the mobile sideways wordmark's `style`):
```jsx
          fontFamily: '"Clash Display", "Geist", system-ui, sans-serif',
          fontWeight: 700,
```
Replace with:
```jsx
          fontFamily: '"Moniqa", Georgia, serif',
          fontWeight: 900,
```

- [ ] **Step 6: Replace the WebGL wordmark block with a DOM Moniqa wordmark**

Find:
```jsx
      {/* WebGL display word, full-bleed at the bottom. Lazy-loaded so
          Three.js doesn't block the rest of the page's initial paint.
          Desktop/tablet only — on mobile, the sideways wordmark above
          carries the name. */}
      <div className="hidden sm:contents">
        <Suspense fallback={null}>
          <HeroBigText text={hero.name} />
        </Suspense>
      </div>
```
Replace with:
```jsx
      {/* Desktop wordmark — solid Moniqa ADNAAN. Transparent background so the
          topographic field shows through the negative space; color follows the
          live --ink token so it recolors with the scroll blend. Desktop/tablet
          only; on mobile the sideways wordmark above carries the name. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-1vw] left-0 right-0 z-0 hidden select-none text-center uppercase sm:block"
        style={{
          fontFamily: '"Moniqa", Georgia, serif',
          fontWeight: 900,
          fontSize: "clamp(96px, 26vw, 460px)",
          lineHeight: 0.8,
          letterSpacing: "0.01em",
          color: "var(--ink)",
        }}
      >
        {hero.name}
      </div>
```

- [ ] **Step 7: Delete the now-unused WebGL component**

Run:
```bash
git rm src/components/HeroBigText.jsx
```

- [ ] **Step 8: Verify**

Run: `npm run lint` → passes clean (no unused `lazy`/`Suspense`/`HeroBigText`). Run: `npm run build` → succeeds (and the separate HeroBigText/Three chunk no longer builds from the Hero path).
Run: `npm run dev`. The Hero `ADNAAN` renders as solid **Moniqa**, with the **topographic field visible through/around the letters** (no opaque band), and it recolors as you scroll.

- [ ] **Step 9: Commit**

```bash
git add src/components/Hero.jsx
git commit -m "feat(v2): DOM Moniqa hero wordmark, remove WebGL HeroBigText"
```

---

## Task 5: Manifesto — registry hook, drop `ctx-light`

**Files:** Modify `src/components/Manifesto.jsx`

- [ ] **Step 1: Switch the hook import + call**

Find:
```jsx
import { useReportBackdrop } from "../utils/backdrop";
```
Replace with:
```jsx
import { useSectionBackdrop } from "../utils/backdrop";
```
Find:
```jsx
  useReportBackdrop(ref, "light");
```
Replace with:
```jsx
  useSectionBackdrop(ref, "light");
```

- [ ] **Step 2: Drop the `ctx-light` class**

Find:
```jsx
    <div ref={ref} className="ctx-light flex flex-col gap-10 py-6 sm:py-24">
```
Replace with:
```jsx
    <div ref={ref} className="flex flex-col gap-10 py-6 sm:py-24">
```

- [ ] **Step 3: Verify**

Run: `npm run lint` → passes clean. Run: `npm run build` → succeeds.
Run: `npm run dev`. Scrolling Hero→Manifesto now blends the field **and** the Manifesto text/colors continuously (no per-section snap); the Manifesto paragraph reads in dark ink once the blend lands on paper.

- [ ] **Step 4: Commit**

```bash
git add src/components/Manifesto.jsx
git commit -m "feat(v2): Manifesto registers via section registry, drops ctx-light"
```

---

## Task 6: Cleanup — remove shims + dead CSS

**Files:** Modify `src/utils/backdrop.jsx`, `src/index.css`

- [ ] **Step 1: Confirm the shims are now unused**

Run:
```bash
grep -rn "useReportBackdrop\|useBackdrop\b" src --include=*.jsx --include=*.js
```
Expected: matches ONLY inside `src/utils/backdrop.jsx` (the definitions). If any other file still references them, that file was missed in Tasks 3–5 — fix it before continuing.

- [ ] **Step 2: Remove the two shims from `src/utils/backdrop.jsx`**

Delete this trailing block:
```jsx
/**
 * TEMPORARY back-compat shims so existing imports keep building during the
 * migration. Both are removed in the cleanup task once all callers move to
 * useSectionBackdrop / useBackdropRegistry.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useReportBackdrop(ref, value) {
  useSectionBackdrop(ref, value);
}
// eslint-disable-next-line react-refresh/only-export-components
export function useBackdrop() {
  return "dark";
}
```

- [ ] **Step 3: Remove the `.ctx-dark` alias and `.ctx-light` block from `src/index.css`**

Find:
```css
:root, .ctx-dark{
```
Replace with:
```css
:root{
```
Then delete the entire `.ctx-light{ … }` block (the comment line `/* Off-white section context — opt in by adding `ctx-light` to a section. */` and the full `.ctx-light{ ... }` rule). The `:root` block, `.display-head`/`.display-head em`, `.hash-span`, fonts, and `@tailwind` directives all remain.

- [ ] **Step 4: Verify**

Run: `npm run lint` → passes clean. Run: `npm run build` → succeeds.
Run: `grep -rn "ctx-light\|ctx-dark" src` → no matches (classes fully removed).
Run: `npm run dev` → behavior unchanged from Task 5 (full scroll blend across Hero↔Manifesto).

- [ ] **Step 5: Commit**

```bash
git add src/utils/backdrop.jsx src/index.css
git commit -m "chore(v2): remove backdrop shims + dead ctx token classes"
```

---

## Final verification (maps to spec §6)

Run `npm run dev` and confirm all of:

1. Hero `ADNAAN` is **Moniqa**, solid, with the **field visible around the letters** (no opaque band). Mobile sideways wordmark is Moniqa. *(Task 4)*
2. Scrolling Hero→Manifesto **continuously** blends field AND all text/bg green→white (and back up), coupled to scroll position (pausing mid-scroll holds the blend). *(Tasks 3, 5)*
3. Hero headline, wordmark, and Manifesto text recolor together — no per-section snap. *(Tasks 3, 5, 6)*
4. DevTools emulate `prefers-reduced-motion: reduce` → field morph is frozen, but colors still blend as you scroll. *(Task 3)*
5. Disable WebGL → page colors still blend on scroll (no contour lines); no console errors. *(Task 3)*
6. Hidden tab pauses the loop; returning resumes. *(Task 3)*
7. `npm run lint` passes (`--max-warnings 0`); `npm run build` succeeds; `HeroBigText.jsx` is gone with no dangling imports; `grep ctx-light\|ctx-dark src` is empty. *(all)*

---

## Self-review notes (author)

- **Spec coverage:** wordmark delete+replace+mobile (Task 4) · `ink` palette (Task 1) · registry (Task 2) · scroll-blend driver → uniforms + CSS vars, reduced-motion/no-WebGL/hidden-tab (Task 3) · Hero/Manifesto register + drop ctx classes (Tasks 4–5) · CSS `:root`/`.ctx-light` cleanup (Task 6). Navbar correctly out of scope.
- **Green-build sequencing:** Task 2 keeps `useReportBackdrop`/`useBackdrop` shims so Tasks 1–5 each build; Task 6 removes them after a grep proves they're unused.
- **Naming consistency:** `BackdropProvider`, `useSectionBackdrop`, `useBackdropRegistry`, `registryRef`, `version`, `blendedPalette`, `REF_POINT`, `BLEND_BAND_FRAC`, palette keys `bg`/`line`/`ink`, CSS vars `--bg`/`--ink`/`--line` — consistent across Tasks 1–6. The field reads `BACKDROP_COLORS[...]` which has `ink` after Task 1 (Task 3 depends on Task 1).
- **Three.js:** only the Hero used `HeroBigText`; deleting it removes that import. The `three` dependency stays installed (out of scope; other usages, if any, are unaffected).
