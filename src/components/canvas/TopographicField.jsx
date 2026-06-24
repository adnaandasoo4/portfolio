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
  // Active pair straddles the reference line: B is the first section whose top
  // is past refY; A is the one before it. Clamp so the page ends hold the
  // first/last palette.
  let k = 1;
  while (k < offsets.length && offsets[k].top <= refY) k++;
  k = Math.min(k, offsets.length - 1);
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
            bg2: U("uBg2"),
            line2: U("uLine2"),
            center: U("uCenter"),
            radius: U("uRadius"),
            edge: U("uEdge"),
          };
          hasGL = true;
        } else {
          console.error(gl.getProgramInfoLog(prog));
          gl.deleteShader(vsh);
          gl.deleteShader(fsh);
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
        // No splash on the main page field — neutralize the shared shader's
        // radial-mix uniforms so it renders the single current palette.
        gl.uniform3fv(u.bg2, p.bg);
        gl.uniform3fv(u.line2, p.line);
        gl.uniform2f(u.center, 0, 0);
        gl.uniform1f(u.radius, 0);
        gl.uniform1f(u.edge, 0);
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
