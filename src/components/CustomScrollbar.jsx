import { useEffect, useRef, useState } from "react";
import { useLenis } from "../utils/lenis";

/**
 * Custom overlay scrollbar. The native scrollbar is hidden globally (see
 * index.css); this draws a thin thumb on the right that:
 *   - tracks scroll position via a rAF loop, reading Lenis's own `scroll`/`limit`
 *     when smooth-scroll is active (exact, so the thumb reaches the very bottom)
 *     and falling back to window metrics otherwise,
 *   - is draggable — dragging maps the thumb's position back to a scroll target,
 *   - blends per section: the thumb uses `var(--ink)`, which the topographic
 *     field recolors to the active section's ink, so it stays visible,
 *   - only appears while the user is actively scrolling (or hovering), fading
 *     out after a short idle; hovering also expands it slightly (see index.css).
 */
export default function CustomScrollbar() {
  const lenis = useLenis();
  const trackRef = useRef(null);
  const thumbRef = useRef(null);
  const dragRef = useRef(null);
  const lastScrollRef = useRef(0);
  const hideTimerRef = useRef(null);
  const [active, setActive] = useState(false);

  // Current scroll position + max scroll, preferring Lenis's smoothed values.
  const metrics = () => {
    const vh = window.innerHeight;
    if (lenis) {
      const limit = Math.max(1, lenis.limit);
      return { scroll: Math.min(Math.max(lenis.scroll, 0), limit), maxScroll: limit, vh };
    }
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - vh);
    const scroll = Math.min(Math.max(window.scrollY || 0, 0), maxScroll);
    return { scroll, maxScroll, vh };
  };

  // rAF loop: size + position the thumb, and detect scroll activity to show it.
  useEffect(() => {
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (!track || !thumb) return;
    let raf = 0;
    const update = () => {
      const { scroll, maxScroll, vh } = metrics();
      const docH = maxScroll + vh;
      const trackH = track.clientHeight;
      const thumbH = Math.max(40, (vh / docH) * trackH);
      const top = (scroll / maxScroll) * (trackH - thumbH);
      thumb.style.height = `${thumbH}px`;
      thumb.style.transform = `translateY(${top}px)`;
      track.style.display = docH <= vh + 2 ? "none" : "";

      // Activity: any change in scroll position shows the bar, then it fades
      // after 1.2s idle. Refs + the guarded setState keep this off the render
      // path except on the actual show/hide edges.
      if (Math.abs(scroll - lastScrollRef.current) > 0.5) {
        lastScrollRef.current = scroll;
        setActive(true);
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = setTimeout(() => setActive(false), 1200);
      }
      raf = requestAnimationFrame(update);
    };
    update();
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(hideTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lenis]);

  // Pointer interaction: drag the thumb, or click the track to jump.
  useEffect(() => {
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (!track || !thumb) return;

    const scrollToY = (y, immediate) => {
      if (lenis) lenis.scrollTo(y, immediate ? { immediate: true } : undefined);
      else window.scrollTo({ top: y, behavior: immediate ? "auto" : "smooth" });
    };

    const onThumbDown = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const trackTop = track.getBoundingClientRect().top;
      dragRef.current = {
        startY: e.clientY,
        startTop: thumb.getBoundingClientRect().top - trackTop,
        trackH: track.clientHeight,
        thumbH: thumb.offsetHeight,
      };
      thumb.setPointerCapture?.(e.pointerId);
      document.body.style.userSelect = "none";
    };
    const onMove = (e) => {
      const d = dragRef.current;
      if (!d) return;
      const newTop = Math.min(Math.max(0, d.startTop + (e.clientY - d.startY)), d.trackH - d.thumbH);
      scrollToY((newTop / (d.trackH - d.thumbH)) * metrics().maxScroll, true);
    };
    const onUp = () => {
      dragRef.current = null;
      document.body.style.userSelect = "";
    };
    const onTrackDown = (e) => {
      if (e.target === thumb) return;
      const trackTop = track.getBoundingClientRect().top;
      const thumbH = thumb.offsetHeight;
      const trackH = track.clientHeight;
      const newTop = Math.min(Math.max(0, e.clientY - trackTop - thumbH / 2), trackH - thumbH);
      scrollToY((newTop / (trackH - thumbH)) * metrics().maxScroll, false);
    };

    thumb.addEventListener("pointerdown", onThumbDown);
    track.addEventListener("pointerdown", onTrackDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      thumb.removeEventListener("pointerdown", onThumbDown);
      track.removeEventListener("pointerdown", onTrackDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lenis]);

  return (
    <div ref={trackRef} className={`custom-scrollbar${active ? " is-active" : ""}`}>
      <div ref={thumbRef} className="custom-scrollbar-thumb" />
    </div>
  );
}
