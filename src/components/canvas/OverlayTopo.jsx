import { useEffect, useRef } from "react";
import { VERT, FRAG, TOPO_PARAMS, BACKDROP_COLORS } from "./topoShader";

/**
 * Dedicated topographic-field canvas that lives *inside* the full-page nav
 * overlay. The main `TopographicField` sits at z-0 behind all page content, so
 * the opaque overlay (z-40) hides it while the menu is open; this gives the
 * overlay its own morphing blob backdrop instead of a flat green panel.
 *
 * Unlike the main field, the palette is locked to the dark backdrop (green bg +
 * lime lines) — no scroll blending — and the morph loop only runs while `active`
 * so a closed menu costs nothing. Self-contained second WebGL context.
 */
export default function OverlayTopo({ active }) {
  const canvasRef = useRef(null);
  const activeRef = useRef(active);
  activeRef.current = active;

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

    const pal = BACKDROP_COLORS.dark;

    let raf = 0;
    const start = performance.now();
    const frame = () => {
      // Only paint while the overlay is open; idle when closed.
      if (!activeRef.current) {
        raf = requestAnimationFrame(frame);
        return;
      }
      if (hasGL) {
        const t = reduce
          ? 0
          : ((performance.now() - start) / 1000) * (TOPO_PARAMS.speedPct / 40);
        gl.uniform2f(u.res, canvas.width, canvas.height);
        gl.uniform1f(u.time, t);
        gl.uniform3fv(u.bg, pal.bg);
        gl.uniform3fv(u.line, pal.line);
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

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      if (gl && prog) gl.deleteProgram(prog);
      if (gl && buf) gl.deleteBuffer(buf);
    };
  }, []);

  return <canvas ref={canvasRef} className="nv-topo" aria-hidden="true" />;
}
