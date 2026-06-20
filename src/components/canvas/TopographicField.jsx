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

    // The field's hairline contours need fwidth() (WebGL1 derivatives). If the
    // extension is missing, bail cleanly — the solid page background shows.
    if (!gl.getExtension("OES_standard_derivatives")) return;

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
    if (!vsh || !fsh) return;
    const prog = gl.createProgram();
    gl.attachShader(prog, vsh);
    gl.attachShader(prog, fsh);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);
    // Shaders are retained by the linked program; free our handles now.
    gl.deleteShader(vsh);
    gl.deleteShader(fsh);

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

    const init = BACKDROP_COLORS[backdropRef.current] || BACKDROP_COLORS.dark;
    const cur = { bg: [...init.bg], line: [...init.line] };

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
    // Single clock origin. After a hidden-tab pause `t` jumps forward by the
    // hidden duration; harmless here because the field morphs very slowly.
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
      if (!running) return;
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
