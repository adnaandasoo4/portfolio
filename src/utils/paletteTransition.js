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
