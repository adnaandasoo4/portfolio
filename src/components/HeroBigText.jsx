import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * WebGL-rendered display word for the Hero.
 *
 * The text is first rasterized to an off-screen <canvas> at high resolution
 * using Clash Display, then uploaded to Three.js as a `CanvasTexture` and
 * sampled by a fragment shader. The shader displaces UVs radially around
 * the mouse position and overlays a stippled grain pattern, producing the
 * cursor-following "glitch / morph" effect inspired by ethansuero.com.
 *
 * The component is fully self-contained — it owns the renderer, scene,
 * camera, mesh, RAF loop, and resize/mouse listeners. Cleanup in the
 * effect's return tears down every GL resource so React StrictMode's
 * double-mount in dev doesn't leak contexts.
 */

const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uTexture;
  uniform vec2  uMouse;       // 0..1, origin bottom-left
  uniform float uHover;       // 0..1, smoothed
  uniform float uTime;        // unused for the blur effect; kept on the
                              // material so the JS side doesn't have to
                              // care about which shader is mounted
  uniform float uAspect;      // plane width / height — corrects radial distance

  // Localized box-blur around the cursor. Two concentric rings + center
  // = 25 samples averaged. The blur radius scales with cursor strength,
  // so far from the cursor every sample lands on the same UV → zero
  // blur for free, no branch needed.
  const int RING_SAMPLES = 12;
  const float TAU = 6.28318530718;

  void main() {
    vec2 uv = vUv;

    // Aspect-corrected distance from cursor so the falloff is circular
    // on screen rather than elliptical in UV space.
    vec2 ar = vec2(uAspect, 1.0);
    float dist = distance(uv * ar, uMouse * ar);

    // Effect radius — tighter so the blur lens reads as a contained
    // pocket around the cursor rather than spreading out across the
    // wordmark.
    float falloff = smoothstep(0.38, 0.0, dist);
    float strength = uHover * falloff;

    // Blur strength: radius in UV space. ~80 source-texture pixels at
    // peak — visible glass blur without smearing letters across each
    // other.
    float r = 0.020 * strength;

    vec4 acc = texture2D(uTexture, uv); // center

    // Outer ring
    for (int i = 0; i < RING_SAMPLES; i++) {
      float a = float(i) / float(RING_SAMPLES) * TAU;
      acc += texture2D(uTexture, uv + vec2(cos(a), sin(a)) * r);
    }
    // Inner ring at half radius, offset by half a step for variety
    for (int i = 0; i < RING_SAMPLES; i++) {
      float a = (float(i) + 0.5) / float(RING_SAMPLES) * TAU;
      acc += texture2D(uTexture, uv + vec2(cos(a), sin(a)) * (r * 0.5));
    }

    gl_FragColor = acc / float(RING_SAMPLES * 2 + 1);
  }
`;

/**
 * @param {object} props
 * @param {string} [props.text] - The word to render. Defaults to "ADNAAN".
 */
export default function HeroBigText({ text = "ADNAAN" }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- Renderer + scene ---
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      premultipliedAlpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    const scene = new THREE.Scene();
    // Orthographic camera. The plane spans 2 units wide in scene space; the
    // camera frustum is sized to exactly match it so the plane fills the
    // viewport regardless of aspect.
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10);
    camera.position.z = 1;

    // --- Text canvas + texture ---
    // Render the text into a high-resolution off-screen canvas, then upload
    // as a Three.js texture. Sized to a 4:1 aspect so 5-6 wide letters fit
    // comfortably without the texture pixels being too tall (= wasted).
    // On small viewports we halve both dimensions (16MB → 4MB GPU memory)
    // since the rendered display size is much smaller there.
    const isSmallViewport =
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 640px)").matches;
    const TEX_W = isSmallViewport ? 2048 : 4096;
    const TEX_H = isSmallViewport ? 512 : 1024;
    const textCanvas = document.createElement("canvas");
    textCanvas.width = TEX_W;
    textCanvas.height = TEX_H;
    const ctx = textCanvas.getContext("2d");

    // Resolve theme-driven colors. `--display-subtle` is the wordmark color
    // (a near-bg shade so it reads as a ghost); `--bg` is the section
    // background, painted into the canvas so antialiased letter edges
    // blend against the real bg color instead of against transparent
    // pixels (which produced visible halos around the text in light mode).
    function resolveDisplayColor() {
      return (
        getComputedStyle(document.documentElement)
          .getPropertyValue("--display-subtle")
          .trim() || "#2A2A2A"
      );
    }
    function resolveBgColor() {
      return (
        getComputedStyle(document.documentElement)
          .getPropertyValue("--bg")
          .trim() || "#1A1A1A"
      );
    }

    function drawText() {
      // Step 1 — paint the canvas with the section bg color. The text canvas
      // is now fully opaque; the blur shader samples opaque RGB everywhere
      // so there's no alpha-blending math at the letter edges. The plane
      // is then composited onto the page bg of the SAME color, so the
      // rectangle's boundary is invisible.
      ctx.fillStyle = resolveBgColor();
      ctx.fillRect(0, 0, TEX_W, TEX_H);

      // Step 2 — pick a font size that fits "ADNAAN" inside ~78% of the
      // canvas width. Measure first, then scale down if needed. Without
      // this, at TEX_H * 0.95 the rendered text exceeded TEX_W and the
      // canvas clipped the outer letters before the plane ever saw them.
      const TARGET_TEXT_WIDTH = TEX_W * 0.78;
      let fontSize = Math.floor(TEX_H * 0.95);
      ctx.font = `700 ${fontSize}px "Clash Display", "Geist", system-ui, sans-serif`;
      const measured = ctx.measureText(text);
      if (measured.width > TARGET_TEXT_WIDTH) {
        fontSize = Math.floor(fontSize * (TARGET_TEXT_WIDTH / measured.width));
        ctx.font = `700 ${fontSize}px "Clash Display", "Geist", system-ui, sans-serif`;
      }

      ctx.fillStyle = resolveDisplayColor();
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.fillText(text, TEX_W / 2, TEX_H / 2 + fontSize * 0.04);
    }

    // The first draw may use a fallback font if Clash Display hasn't loaded
    // yet. Re-draw once the font resolves and flag the texture dirty.
    drawText();
    if (document.fonts && document.fonts.load) {
      document.fonts.load('700 100px "Clash Display"').then(() => {
        drawText();
        texture.needsUpdate = true;
      });
    }

    const texture = new THREE.CanvasTexture(textCanvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    // --- Plane mesh ---
    const PLANE_ASPECT = TEX_W / TEX_H;
    const geometry = new THREE.PlaneGeometry(2, 2 / PLANE_ASPECT);
    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      uniforms: {
        uTexture: { value: texture },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uHover: { value: 0 },
        uTime: { value: 0 },
        uAspect: { value: PLANE_ASPECT },
      },
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // --- Size / camera framing ---
    // Plane stays 2 units wide; camera frustum width also 2 so the plane
    // fills viewport horizontally. Camera height adapts to container aspect.
    function resize() {
      const { width, height } = container.getBoundingClientRect();
      if (width === 0 || height === 0) return;

      renderer.setSize(width, height, false);

      // The plane is `2 × 2 / PLANE_ASPECT` units. We frame the camera so
      // the plane exactly fills the canvas horizontally and is vertically
      // centered (clipped naturally if container is shorter than the plane).
      const containerAspect = width / height;
      camera.left = -1;
      camera.right = 1;
      camera.top = 1 / containerAspect;
      camera.bottom = -1 / containerAspect;
      camera.updateProjectionMatrix();
    }
    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    // Re-rasterize text when the theme flips (--ink changes value).
    const themeObserver = new MutationObserver(() => {
      drawText();
      texture.needsUpdate = true;
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    // --- Mouse tracking ---
    // `target` is the raw mouse state; the uniform values lerp toward it
    // every frame so the effect feels smooth instead of snapping.
    const target = { mx: 0.5, my: 0.5, hover: 0 };

    function onPointerMove(e) {
      const rect = container.getBoundingClientRect();
      target.mx = (e.clientX - rect.left) / rect.width;
      target.my = 1 - (e.clientY - rect.top) / rect.height; // flip Y for GL
      target.hover = 1;
    }
    function onPointerLeave() {
      target.hover = 0;
    }

    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerleave", onPointerLeave);

    // --- Animation loop ---
    let rafId = null;
    const start = performance.now();
    function tick() {
      const now = performance.now();
      material.uniforms.uTime.value = (now - start) * 0.001;

      const m = material.uniforms.uMouse.value;
      m.x += (target.mx - m.x) * 0.12;
      m.y += (target.my - m.y) * 0.12;
      const h = material.uniforms.uHover;
      h.value += (target.hover - h.value) * 0.07;

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    // --- Teardown ---
    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);

      geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [text]);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={text}
      className="pointer-events-auto absolute bottom-[-5vw] left-0 right-0 h-[26vw] w-full select-none"
    />
  );
}
