import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

/**
 * Wire GSAP ScrollTrigger to read scroll position from Lenis instead of native window scroll.
 * Call once when a Lenis instance becomes available.
 *
 * Returns a cleanup function that unwires the proxy.
 */
export function setupGsap(lenis) {
  if (!lenis) return () => {};
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }

  ScrollTrigger.scrollerProxy(document.body, {
    scrollTop(value) {
      if (arguments.length) {
        lenis.scrollTo(value, { immediate: true });
      }
      return lenis.scroll;
    },
    getBoundingClientRect() {
      return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
    },
  });

  const onScroll = () => ScrollTrigger.update();
  lenis.on("scroll", onScroll);

  ScrollTrigger.defaults({ scroller: document.body });
  ScrollTrigger.refresh();

  return () => {
    lenis.off("scroll", onScroll);
    ScrollTrigger.killAll();
  };
}

export { gsap, ScrollTrigger };
