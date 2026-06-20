# Portfolio V2 Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the V2 visual foundation into the real codebase — the color token system, the Moniqa + Manrope type system, and a single global morphing WebGL topographic background — proven on the Hero.

**Architecture:** Color tokens become CSS custom properties on `:root` (dark-green context) with a `.ctx-light` override (off-white context); sections opt into a backdrop via class + an IntersectionObserver report. One fixed full-viewport `<TopographicField>` WebGL canvas sits behind all content and cross-fades its background/line colors toward whichever backdrop the in-view section reports. Fonts are self-hosted (Moniqa OTF) or CDN-imported (Manrope, matching the existing Geist pattern).

**Tech Stack:** React 18, Vite, raw WebGL (WebGL1 + `OES_standard_derivatives`), Tailwind (var-driven tokens), Google Fonts CDN (Manrope), self-hosted Moniqa OTF.

**Note on testing:** This repo has **no test runner** (`package.json` has no test script). Per-task verification is therefore: `npm run lint` (ESLint, `--max-warnings 0`, must pass clean), `npm run build` where a build regression is possible, and a **manual dev-server observation** with the exact thing to look for. These are the gates in place of unit tests.

---

## File structure

**Create:**
- `public/fonts/moniqa/Moniqa-Display.otf`, `Moniqa-BlackDisplay.otf`, `Moniqa-BlackItalicDisplay.otf` — self-hosted headline font (copied from the local package).
- `src/utils/backdrop.jsx` — `BackdropProvider`, `useBackdrop`, `useSetBackdrop`, `useReportBackdrop` (which section backdrop is active + how sections report it).
- `src/components/canvas/topoShader.js` — GLSL strings, locked params, per-backdrop colors.
- `src/components/canvas/TopographicField.jsx` — the WebGL background component.

**Modify:**
- `src/index.css` — Manrope import, Moniqa `@font-face`, token blocks, display utility classes, body font.
- `tailwind.config.js` — `lime` color token, `display`→Moniqa, `sans`→Manrope.
- `src/App.jsx` — mount `BackdropProvider` + `<TopographicField/>`, raise content stacking.
- `src/components/Hero.jsx` — report `dark` backdrop + Moniqa headline proof.
- `src/components/Manifesto.jsx` — report `light` backdrop + `ctx-light` (recolor demo).

---

## Task 1: Color tokens + fonts

**Files:**
- Create: `public/fonts/moniqa/Moniqa-Display.otf`, `Moniqa-BlackDisplay.otf`, `Moniqa-BlackItalicDisplay.otf`
- Modify: `src/index.css`, `tailwind.config.js`

- [ ] **Step 1: Copy the three Moniqa OTFs into public/**

Run:
```bash
mkdir -p "public/fonts/moniqa"
SRC="/c/Users/Adnaan Dasoo/Downloads/MONIQA_v.1.0/MONIQA_v.1.0/Fonts/OpenType-PS (OTF)"
cp "$SRC/Moniqa-Display.otf"            "public/fonts/moniqa/"
cp "$SRC/Moniqa-BlackDisplay.otf"       "public/fonts/moniqa/"
cp "$SRC/Moniqa-BlackItalicDisplay.otf" "public/fonts/moniqa/"
ls -1 public/fonts/moniqa
```
Expected: the three `.otf` files listed.

- [ ] **Step 2: Replace the top of `src/index.css` (font import + add @font-face)**

Replace the existing first line (the Geist/JetBrains `@import`) and keep the existing Clash Display / Azonix `@font-face` blocks intact below it. The new top of the file (lines 1–24 region) becomes:

```css
@import url("https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap");

/* Moniqa Display — V2 headline face (self-hosted OTF; only the 3 weights we use). */
@font-face{font-family:'Moniqa';font-weight:400;font-style:normal;src:url('/fonts/moniqa/Moniqa-Display.otf') format('opentype');font-display:swap;}
@font-face{font-family:'Moniqa';font-weight:900;font-style:normal;src:url('/fonts/moniqa/Moniqa-BlackDisplay.otf') format('opentype');font-display:swap;}
@font-face{font-family:'Moniqa';font-weight:900;font-style:italic;src:url('/fonts/moniqa/Moniqa-BlackItalicDisplay.otf') format('opentype');font-display:swap;}
```

(Leave the existing `'Clash Display'` and `'Azonix'` `@font-face` blocks and the `@tailwind` directives exactly as they are — they're removed in a later piece, not here.)

- [ ] **Step 3: Replace the `:root[data-theme=...]` token blocks in `src/index.css`**

Delete BOTH existing `:root[data-theme="light"]{...}` and `:root[data-theme="dark"]{...}` blocks and replace them with these two blocks:

```css
/* V2 default context — dark green. data-theme is no longer read (the old
   theme toggle becomes a no-op until it is removed in the navbar piece). */
:root{
  --bg:#283021;
  --ink:#DEE1D3;
  --accent:#B6C652;            /* muted green — headline accents / accent text */
  --lime:#DCFE4F;              /* bright lime — UI chrome only */
  --border:rgba(222,225,211,0.18);
  --muted:rgba(222,225,211,0.62);
  --display-subtle:#20231A;    /* ghost wordmark on green */
  --flag:#DCFE4F;              /* wayfinding accent (was orange) → lime in V2 */
}

/* Off-white section context — opt in by adding `ctx-light` to a section. */
.ctx-light{
  --bg:#F1EFE8;
  --ink:#292C21;
  --accent:#B6C652;
  --lime:#DCFE4F;
  --border:rgba(41,44,33,0.18);
  --muted:rgba(41,44,33,0.62);
  --display-subtle:#E6E4DC;
  --flag:#DCFE4F;
}
```

- [ ] **Step 4: Add display utility classes + switch body font in `src/index.css`**

Change the `html, body` rule's `font-family` to Manrope, and append the display helpers at the end of the file:

```css
html, body {
  background: var(--bg);
  color: var(--ink);
  font-family: "Manrope", system-ui, -apple-system, sans-serif;
  overflow-x: hidden;
}

/* V2 headline treatment — Moniqa all-caps with every OpenType feature on.
   Accent words are authored as <em> and render Black-italic in muted green. */
.display-head{
  font-family:'Moniqa', Georgia, serif;
  text-transform:uppercase;
  font-weight:400;
  letter-spacing:0.01em;
  font-feature-settings:"salt" 1,"ss01" 1,"dlig" 1,"liga" 1,"calt" 1;
}
.display-head em{
  font-style:italic;
  font-weight:900;
  color:var(--accent);
}
```

(The existing `.hash-span` rule stays.)

- [ ] **Step 5: Update `tailwind.config.js` — add `lime`, repoint fonts**

In the `colors` object add the `lime` token, and replace the `fontFamily` `display` and `sans` entries:

```js
      colors: {
        ink: "var(--ink)",
        paper: "var(--bg)",
        accent: "var(--accent)",
        edge: "var(--border)",
        muted: "var(--muted)",
        flag: "var(--flag)",
        lime: "var(--lime)",
      },
      screens: {
        xs: "450px",
      },
      fontFamily: {
        display: ["Moniqa", "Georgia", "serif"],
        sans: [
          "Manrope",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
```

- [ ] **Step 6: Verify (lint + dev server)**

Run: `npm run lint`
Expected: passes with no errors/warnings.

Run: `npm run dev`, open the site. Expected: page background is dark green `#283021`, body/UI text renders in **Manrope** (not Geist), nothing is broken/unstyled. (Sections will look transitional — that's expected.)

- [ ] **Step 7: Commit**

```bash
git add public/fonts/moniqa src/index.css tailwind.config.js
git commit -m "feat(v2): color tokens + Moniqa/Manrope type system"
```

---

## Task 2: Backdrop context

**Files:**
- Create: `src/utils/backdrop.jsx`

- [ ] **Step 1: Write `src/utils/backdrop.jsx`**

```jsx
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const BackdropContext = createContext(null);

/**
 * Holds which backdrop the in-view section is requesting: 'dark' (green) or
 * 'light' (off-white). The TopographicField reads this to cross-fade its
 * colors; sections set it via useReportBackdrop as they scroll into view.
 */
export function BackdropProvider({ children, initial = "dark" }) {
  const [backdrop, setBackdrop] = useState(initial);
  const value = useMemo(() => ({ backdrop, setBackdrop }), [backdrop]);
  return (
    <BackdropContext.Provider value={value}>
      {children}
    </BackdropContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBackdrop() {
  const ctx = useContext(BackdropContext);
  return ctx ? ctx.backdrop : "dark";
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSetBackdrop() {
  const ctx = useContext(BackdropContext);
  return ctx ? ctx.setBackdrop : () => {};
}

/**
 * Report `value` ('dark' | 'light') as the active backdrop while the element
 * referenced by `ref` is at least half in view.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useReportBackdrop(ref, value) {
  const setBackdrop = useSetBackdrop();
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && e.intersectionRatio >= 0.5) setBackdrop(value);
        });
      },
      { threshold: [0.5] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, value, setBackdrop]);
}
```

- [ ] **Step 2: Verify (lint)**

Run: `npm run lint`
Expected: passes clean (the `react-refresh/only-export-components` disables suppress the mixed-export warnings, matching `src/utils/theme.jsx`).

- [ ] **Step 3: Commit**

```bash
git add src/utils/backdrop.jsx
git commit -m "feat(v2): backdrop context + section reporting hook"
```

---

## Task 3: Topographic shader module

**Files:**
- Create: `src/components/canvas/topoShader.js`

- [ ] **Step 1: Write `src/components/canvas/topoShader.js`**

This ports the locked prototype shader (hairline contours + coverage + breathe) and the locked slider values. `FRAG` must be compiled with the derivatives extension prepended (done in Task 4).

```js
// Locked visual parameters (from the approved prototype). See the foundation
// spec §2.3. These map 1:1 to the prototype's final slider values.
export const TOPO_PARAMS = {
  density: 3.5, // Line count
  scale: 50, // Scale slider raw value (shader multiplies by 0.01 -> 0.50)
  speedPct: 30, // Morph speed %
  weight: 140, // Thinness slider raw value (shader * 0.01 -> 1.40 px half-width)
  coverage: 50, // Coverage %
  breathe: 50, // Breathe %
  opacityPct: 10, // Opacity %
};

const rgb = (h) => [
  parseInt(h.slice(1, 3), 16) / 255,
  parseInt(h.slice(3, 5), 16) / 255,
  parseInt(h.slice(5, 7), 16) / 255,
];

// Per-backdrop background + contour-line colors.
export const BACKDROP_COLORS = {
  dark: { bg: rgb("#283021"), line: rgb("#DCFE4F") }, // green bg, lime lines
  light: { bg: rgb("#F1EFE8"), line: rgb("#292C21") }, // paper bg, dark-green lines
};

export const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}`;

export const FRAG = `
precision highp float;
uniform vec2 uRes;uniform float uTime;
uniform vec3 uBg;uniform vec3 uLine;
uniform float uDensity;uniform float uScale;uniform float uWeight;uniform float uAmt;
uniform float uBreathe;uniform float uCoverage;
vec3 permute(vec3 x){return mod(((x*34.0)+1.0)*x,289.0);}
float snoise(vec2 v){
  const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
  vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);
  vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);
  vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod(i,289.0);
  vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
  vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);
  m=m*m;m=m*m;
  vec3 x=2.0*fract(p*C.www)-1.0;vec3 h=abs(x)-0.5;vec3 ox=floor(x+0.5);vec3 a0=x-ox;
  m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
  vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;
  return 130.0*dot(m,g);
}
float fbm(vec2 p){
  float s=0.0,a=0.6;mat2 r=mat2(0.8,-0.6,0.6,0.8);
  for(int i=0;i<2;i++){s+=a*snoise(p);p=r*p*2.0;a*=0.5;}
  return s;
}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes.xy;
  vec2 p=vec2(uv.x*(uRes.x/uRes.y),uv.y)*(uScale*0.01);
  float t=uTime;
  vec2 q=vec2(fbm(p+vec2(0.0,t*0.04)),fbm(p+vec2(3.7,1.1-t*0.035)));
  float n=fbm(p+0.6*q+vec2(t*0.015,t*0.01));
  float bands=n*uDensity;
  float dpx=abs(fract(bands)-0.5)/fwidth(bands);
  float lw=uWeight*0.01;
  float line=1.0-smoothstep(0.0,lw,dpx);
  float b1=fbm(p*0.9+vec2(-t*0.035,t*0.028));
  float b2=fbm(p*1.5+vec2(t*0.022,-t*0.03)+11.0);
  float br=0.6*b1+0.4*b2;
  float bias=(uCoverage-50.0)*0.02;
  float breath=mix(1.0,smoothstep(-0.75,0.55,br+bias),uBreathe*0.01);
  float ink=line*breath*uAmt;
  vec3 col=mix(uBg,uLine,clamp(ink,0.0,1.0));
  gl_FragColor=vec4(col,1.0);
}`;
```

- [ ] **Step 2: Verify (lint)**

Run: `npm run lint`
Expected: passes clean.

- [ ] **Step 3: Commit**

```bash
git add src/components/canvas/topoShader.js
git commit -m "feat(v2): topographic field shader + locked params"
```

---

## Task 4: TopographicField component + mount

**Files:**
- Create: `src/components/canvas/TopographicField.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Write `src/components/canvas/TopographicField.jsx`**

```jsx
import { useEffect, useRef } from "react";
import { useBackdrop } from "../../utils/backdrop";
import { VERT, FRAG, TOPO_PARAMS, BACKDROP_COLORS } from "./topoShader";

const lerp = (a, b, t) => a + (b - a) * t;

/**
 * Single fixed full-viewport WebGL canvas behind all content. Renders the
 * morphing topographic field and cross-fades its bg/line colors toward the
 * backdrop reported by the in-view section. One WebGL context for the whole
 * app (per-section canvases would blow the browser's context limit).
 *
 * Accessibility/perf: prefers-reduced-motion freezes the morph (static frame,
 * colors still settle); the loop pauses while the tab is hidden; no-WebGL
 * falls back to the solid page background.
 */
export default function TopographicField() {
  const canvasRef = useRef(null);
  const backdrop = useBackdrop();
  const backdropRef = useRef(backdrop);
  useEffect(() => {
    backdropRef.current = backdrop;
  }, [backdrop]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext("webgl", {
      antialias: true,
      premultipliedAlpha: false,
    });
    if (!gl) return; // no-WebGL fallback: page background shows through

    gl.getExtension("OES_standard_derivatives");

    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        // eslint-disable-next-line no-console
        console.error(gl.getShaderInfoLog(s));
      }
      return s;
    };

    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(
      prog,
      compile(
        gl.FRAGMENT_SHADER,
        "#extension GL_OES_standard_derivatives : enable\n" + FRAG,
      ),
    );
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
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
    const u = {
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

    const cur = {
      bg: [...BACKDROP_COLORS[backdropRef.current].bg],
      line: [...BACKDROP_COLORS[backdropRef.current].line],
    };

    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    let running = true;
    const start = performance.now();

    const draw = (t) => {
      const target = BACKDROP_COLORS[backdropRef.current] || BACKDROP_COLORS.dark;
      const k = reduce ? 1 : 0.04; // color cross-fade rate per frame
      for (let i = 0; i < 3; i++) {
        cur.bg[i] = lerp(cur.bg[i], target.bg[i], k);
        cur.line[i] = lerp(cur.line[i], target.line[i], k);
      }
      gl.uniform2f(u.res, canvas.width, canvas.height);
      gl.uniform1f(u.time, t);
      gl.uniform3fv(u.bg, cur.bg);
      gl.uniform3fv(u.line, cur.line);
      gl.uniform1f(u.density, TOPO_PARAMS.density);
      gl.uniform1f(u.scale, TOPO_PARAMS.scale);
      gl.uniform1f(u.weight, TOPO_PARAMS.weight);
      gl.uniform1f(u.amt, TOPO_PARAMS.opacityPct / 100);
      gl.uniform1f(u.breathe, TOPO_PARAMS.breathe);
      gl.uniform1f(u.coverage, TOPO_PARAMS.coverage);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const frame = () => {
      const t =
        ((performance.now() - start) / 1000) * (TOPO_PARAMS.speedPct / 40);
      draw(t);
      raf = requestAnimationFrame(frame);
    };

    if (reduce) {
      draw(0); // static frame
    } else {
      frame();
    }

    // Re-settle colors even under reduced motion when the backdrop changes.
    const settleId = setInterval(() => {
      if (reduce && running) draw(0);
    }, 60);

    const onVis = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        if (!reduce) frame();
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      clearInterval(settleId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
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

- [ ] **Step 2: Mount it in `src/App.jsx`**

Add imports near the existing util imports:

```jsx
import { BackdropProvider } from './utils/backdrop';
import TopographicField from './components/canvas/TopographicField';
```

Then change the returned tree of `App` so the provider wraps everything and the field sits behind raised content. Replace the existing `return ( ... )` body of `App` with:

```jsx
  return (
    <ThemeProvider>
      <LenisProvider>
        <BackdropProvider>
          <GsapBootstrap />
          <TopographicField />
          {/* Navbar, ScrollToTop, CustomCursor, and Preloader sit OUTSIDE
              Routes so they render on every page without remounting. Content
              is raised above the fixed field canvas (z-0) via z-10. */}
          <div className='relative z-10'>
            <Navbar onReplayPreloader={replayPreloader} />
            <ScrollOnRouteChange />
            <Routes>
              <Route path='/' element={<Home ready={pageReady} />} />
              <Route path='/works' element={<AllWorks />} />
              <Route path='/works/:slug' element={<ProjectDetail />} />
            </Routes>
          </div>
          <ScrollToTop />
          <CustomCursor />
          <Preloader key={preloaderRunId} onReady={handlePreloaderReady} />
        </BackdropProvider>
      </LenisProvider>
    </ThemeProvider>
  )
```

- [ ] **Step 3: Verify (lint + build + dev server)**

Run: `npm run lint` → passes clean.
Run: `npm run build` → succeeds (no errors).
Run: `npm run dev` → behind the Hero you should see slow-moving **hairline lime contour lines** on the green background, very subtle, breathing in and out. No interaction is blocked (pointer-events none). FPS smooth.

- [ ] **Step 4: Commit**

```bash
git add src/components/canvas/TopographicField.jsx src/App.jsx
git commit -m "feat(v2): global topographic WebGL background"
```

---

## Task 5: Backdrop reporting on Hero + Manifesto (recolor proof)

**Files:**
- Modify: `src/components/Hero.jsx`, `src/components/Manifesto.jsx`

- [ ] **Step 1: Hero reports `dark`**

In `src/components/Hero.jsx`, add imports:

```jsx
import { useRef } from "react";
import { useReportBackdrop } from "../utils/backdrop";
```

(Merge `useRef` into the existing `react` import line — it currently imports `lazy, Suspense, useEffect, useMemo, useState`; add `useRef`.)

Inside `Hero`, before the `return`, add:

```jsx
  const sectionRef = useRef(null);
  useReportBackdrop(sectionRef, "dark");
```

Attach the ref and a `ctx-dark` marker class to the root `<section>` — change its opening tag to:

```jsx
    <section ref={sectionRef} className="ctx-dark relative flex min-h-screen min-h-[100dvh] w-full flex-col overflow-hidden px-6 pb-0 pt-32 sm:px-16 sm:pb-12 sm:pt-40">
```

- [ ] **Step 2: Manifesto reports `light` + uses light tokens**

In `src/components/Manifesto.jsx`, add imports:

```jsx
import { useRef } from "react";
import { useReportBackdrop } from "../utils/backdrop";
```

Inside `Manifesto`, before `return`:

```jsx
  const ref = useRef(null);
  useReportBackdrop(ref, "light");
```

Attach the ref and `ctx-light` to the root inner div — change its opening tag to:

```jsx
    <div ref={ref} className="ctx-light flex flex-col gap-10 py-6 sm:py-24">
```

- [ ] **Step 3: Verify (lint + dev server)**

Run: `npm run lint` → passes clean.
Run: `npm run dev`. Scroll from the Hero down to the "about"/Manifesto section: the field should **cross-fade** from lime-on-green to **dark-green contours on off-white**, and the Manifesto text should read in dark ink on the paper field. Scroll back up → it returns to green.

- [ ] **Step 4: Commit**

```bash
git add src/components/Hero.jsx src/components/Manifesto.jsx
git commit -m "feat(v2): wire Hero(dark) + Manifesto(light) backdrop reporting"
```

---

## Task 6: Hero Moniqa headline proof

**Files:**
- Modify: `src/components/Hero.jsx`

- [ ] **Step 1: Add the display headline to the Hero**

In `src/components/Hero.jsx`, inside the inner content container (the `<div className="relative mx-auto flex w-full max-w-[1800px] flex-1 flex-col px-6 sm:px-16">`), directly AFTER the closing `</div>` of the top `flex items-start justify-between` row and BEFORE the inner container's closing `</div>`, insert:

```jsx
        {/* V2 foundation proof — Moniqa headline treatment. Copy is
            provisional; the full Hero composition is a later piece. */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={ready ? { opacity: 1, y: 0 } : false}
          transition={{ duration: 0.7, delay: 0.35, ease }}
          className="display-head mt-16 max-w-[18ch] text-ink"
          style={{ fontSize: "clamp(40px, 6vw, 104px)", lineHeight: 0.98 }}
        >
          Designing <em>Systems</em>, Shipping <em>Experiences</em>.
        </motion.h1>
```

- [ ] **Step 2: Verify (lint + build + dev server)**

Run: `npm run lint` → passes clean.
Run: `npm run build` → succeeds.
Run: `npm run dev`. The Hero shows an all-caps **Moniqa** headline with "SYSTEMS" and "EXPERIENCES" in **Black-italic muted green**, over the live field. Confirm the OpenType alternates are active (the letterforms differ from a plain serif — compare the "S"/"G"). It animates in with the preloader reveal.

- [ ] **Step 3: Commit**

```bash
git add src/components/Hero.jsx
git commit -m "feat(v2): Moniqa headline proof on Hero"
```

---

## Final verification (maps to spec §7)

Run `npm run dev` and confirm all of:

1. Field renders behind the Hero — hairline lime contours on green, slow morph + breathe, smooth FPS. *(Task 4)*
2. Hero headline in Moniqa all-caps, Black-italic green accents, OpenType alternates visible. *(Task 6)*
3. Scrolling to Manifesto cross-fades the field to dark-green lines on off-white. *(Task 5)*
4. DevTools → emulate `prefers-reduced-motion: reduce` → reload → field is static (no morph), colors still correct. *(Task 4)*
5. Switch to another tab and back → no runaway CPU/GPU; animation resumes. *(Task 4)*
6. Temporarily disable WebGL (e.g. `chrome://flags` or test in a context without it) → page shows solid backdrop color, no console errors thrown by the component. *(Task 4)*
7. `npm run lint` passes (`--max-warnings 0`) and `npm run build` succeeds. *(all tasks)*

If any fail, fix before declaring the foundation done.

---

## Self-review notes (author)

- **Spec coverage:** palette tokens (Task 1) · two-greens via `--accent`/`--lime` (Task 1) · Moniqa+Manrope with features-on helper (Task 1, 6) · self-host Moniqa / CDN Manrope (Task 1; deviation from spec's "self-host Manrope" — justified: matches the existing Geist CDN pattern and removes the missing-woff2-tooling risk) · single global field w/ locked params (Task 3, 4) · backdrop context + IntersectionObserver recolor (Task 2, 5) · reduced-motion/hidden-tab/no-WebGL (Task 4) · Hero proof (Task 6). Deferred items (navbar, theme-toggle removal, other sections) correctly untouched.
- **Tooling reality:** OTF→woff2 converter is NOT installed, so Moniqa ships as OTF (3 files, ~285 KB). Optimization to subset/woff2 is out of scope.
- **Naming consistency:** `BackdropProvider`/`useBackdrop`/`useSetBackdrop`/`useReportBackdrop`, `TOPO_PARAMS`/`BACKDROP_COLORS`/`VERT`/`FRAG`, and uniform names (`uBg`,`uLine`,`uDensity`,`uScale`,`uWeight`,`uAmt`,`uBreathe`,`uCoverage`) are consistent across Tasks 2–6.
