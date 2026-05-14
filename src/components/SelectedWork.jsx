import { useEffect, useRef, useState } from "react";
import { useLenis } from "../utils/lenis";
import { gsap } from "../utils/gsap";
import { selectedWork, projects } from "../constants";
import { SectionWrapper } from "../hoc";

/**
 * Selected Work — compact horizontal pinned scroll, modeled on the itsjay.us
 * featured-work pattern.
 *
 *   - Tiles are portrait (~3:4) and much smaller than the viewport, so 3–4 fit
 *     in view at once on a wide screen.
 *   - Pin distance = track scrollWidth − viewport width. With ~4 tiles totalling
 *     roughly 1.2–1.4 viewport widths, the pin only consumes a fraction of a
 *     viewport-height of vertical scroll, keeping the page flowing instead of
 *     the multi-screen pause the prior full-bleed implementation produced.
 *   - A small progress bar below the tile row tracks horizontal scroll position
 *     via ScrollTrigger's `onUpdate` callback updating a scaleX transform.
 *   - Hovering any tile (desktop only) fades in a larger preview overlay
 *     showing that project's cover image / placeholder + name. The overlay is
 *     `pointer-events: none` so it never intercepts the underlying tile hover.
 *   - Mobile (<768px): native horizontal scroll with snap, no pin, no overlay.
 */
function SelectedWork() {
  const sectionRef = useRef(null);
  const trackWrapperRef = useRef(null);
  const trackRef = useRef(null);
  const progressRef = useRef(null);
  const lenis = useLenis();
  const [hoveredIdx, setHoveredIdx] = useState(null);

  useEffect(() => {
    // Wait for Lenis to mount so its scrollerProxy is in place before we
    // register any ScrollTriggers (set up at app root in src/utils/gsap.js).
    if (!lenis || !sectionRef.current || !trackRef.current) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      const section = sectionRef.current;
      const wrapper = trackWrapperRef.current;
      const track = trackRef.current;
      // Horizontal distance the track translates by — the content that
      // overflows the viewport. With pl-[50vw] lead-in and pr-[40vw] trail,
      // this works out to roughly 1.4 viewport widths.
      const horizontalDistance = () =>
        Math.max(0, track.scrollWidth - window.innerWidth);
      // Pin duration = horizontal distance, so the tiles translate
      // continuously from pin-engage to pin-release. No rest phase —
      // tiles move the entire time the pin is engaged.
      const pinDuration = () =>
        Math.max(horizontalDistance(), window.innerHeight * 0.8);
      if (horizontalDistance() === 0) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          // Trigger fires when the tile row's vertical center reaches the
          // viewport's vertical center. With the section header above the
          // wrapper, this is noticeably earlier than `trigger: section,
          // start: "top top"` — the user sees the tiles approach center,
          // then the pin engages and the horizontal scrub begins.
          // `pin: section` keeps the whole section locked (header + tiles +
          // progress bar move together).
          trigger: wrapper,
          pin: section,
          start: "center center",
          end: () => `+=${pinDuration()}`,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (progressRef.current) {
              progressRef.current.style.transform = `scaleX(${self.progress})`;
            }
          },
        },
      });

      tl.to(
        track,
        {
          x: () => -horizontalDistance(),
          ease: "none",
          duration: 1,
        },
        0
      );

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    });

    return () => mm.revert();
  }, [lenis]);

  return (
    <div ref={sectionRef} className="relative">
      {/* Header — just the small label on the left for section numbering.
          The carousel below is still fullBleed (edge-to-edge), but the header
          is constrained to `max-w-screen-2xl mx-auto` with the same px-6
          sm:px-16 padding the other sections use via SectionWrapper, so the
          "04 — Featured Work" label aligns vertically with the labels on
          Manifesto / Experience / Tech. */}
      <div className="mx-auto flex max-w-screen-2xl items-baseline justify-between px-6 pt-24 sm:px-16">
        <span className="font-mono text-xs uppercase tracking-widest text-muted">
          {selectedWork.label}
        </span>
      </div>

      {/* Tile row. Track translates horizontally; each tile owns its own
          hover-preview overlay as an inset child so the preview sits exactly
          on top of the hovered tile (rather than in viewport center). */}
      <div
        ref={trackWrapperRef}
        // Mobile uses a normal vertical stack (no overflow gymnastics).
        // md+ flips to overflow-hidden so GSAP can drive the pinned
        // horizontal scrub without competing with native scroll.
        className="relative mt-12 md:overflow-hidden"
        onMouseLeave={() => setHoveredIdx(null)}
      >
        <div
          ref={trackRef}
          // Mobile: flex-col stacks tiles vertically, full-width within
          // section padding. Tap each tile to open the project.
          // Desktop: pl-[50vw] starts the first tile's left edge at
          // viewport center, pr-[40vw] ends translation roughly when the
          // LAST tile reaches viewport center. flex-row + GSAP transform
          // drives the horizontal pinned scroll.
          className="flex flex-col gap-6 px-6 md:flex-row md:gap-4 md:px-16 md:pl-[50vw] md:pr-[40vw]"
          style={{ willChange: "transform" }}
        >
          {projects.map((project, i) => {
            const isHovered = hoveredIdx === i;
            const href = project.liveUrl || project.sourceUrl || "#";
            const isExternal = href !== "#";
            return (
              <a
                key={project.name}
                href={href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                data-cursor="check out my work"
                aria-label={project.name}
                onMouseEnter={() => setHoveredIdx(i)}
                // Mobile: full-width tile in the vertical stack.
                // Desktop: clamp width on the horizontal track.
                className="relative block w-full overflow-hidden bg-edge md:w-[clamp(280px,45vw,720px)] md:flex-shrink-0"
                style={{ aspectRatio: "16 / 10" }}
              >
                {/* Tile background — cover image fills the whole tile. */}
                {project.coverImage ? (
                  <img
                    src={project.coverImage}
                    alt={project.name}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  // Text fallback for projects without a coverImage URL.
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-ink">
                    <span
                      className="font-mono text-[10px] uppercase tracking-widest text-muted"
                      aria-hidden="true"
                    >
                      {String(i + 1).padStart(2, "0")} /{" "}
                      {String(projects.length).padStart(2, "0")}
                    </span>
                    <span
                      className="mt-3 text-center"
                      style={{
                        fontFamily:
                          "Clash Display, Geist, system-ui, sans-serif",
                        fontWeight: 700,
                        fontSize: "clamp(18px, 1.8vw, 28px)",
                        letterSpacing: "0.02em",
                        textTransform: "uppercase",
                        lineHeight: 1.05,
                      }}
                    >
                      {project.name}
                    </span>
                  </div>
                )}

                {/* Hover preview — small landscape rectangle centered on the
                    tile. clip-path inset starts at the center horizontal line
                    (top:50% + bottom:50% = zero-height strip) and animates
                    outward to inset(0) on hover, producing the "split-open
                    from center" effect (top half slides up, bottom half down).
                    Border lives inside the clip-path so the border edges
                    "draw" open from the center alongside the image. The
                    asymmetric thickness — fatter on the sides than on
                    top/bottom — gives the overlay a frame-like silhouette
                    that reads clearly against the cover image underneath. */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  {/* Hover preview uses a CSS background-image rather than
                      a second <img> — the browser caches the URL after the
                      tile <img> above downloads it once, and dropping the
                      duplicate DOM node keeps the tree leaner. */}
                  <div
                    className="relative overflow-hidden border-y-[8px] border-x-[24px] border-white bg-ink bg-cover bg-center"
                    style={{
                      width: "65%",
                      aspectRatio: "16 / 10",
                      clipPath: isHovered
                        ? "inset(0 0 0 0)"
                        : "inset(50% 0 50% 0)",
                      transition:
                        "clip-path 500ms cubic-bezier(0.65, 0, 0.35, 1)",
                      backgroundImage: project.coverImage
                        ? `url(${project.coverImage})`
                        : undefined,
                    }}
                  />
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* Progress bar — solid horizontal bar, thicker than the original 1px
          hairline. scaleX driven by GSAP's `onUpdate` grows the ink fill
          from left to right as the user scrolls through the pinned section. */}
      <div className="mt-12 flex justify-center pb-24">
        <div className="relative h-1.5 w-56 bg-edge">
          <div
            ref={progressRef}
            className="absolute left-0 top-0 h-full w-full origin-left bg-ink"
            style={{ transform: "scaleX(0)" }}
          />
        </div>
      </div>
    </div>
  );
}

const SelectedWorkSection = SectionWrapper(SelectedWork, "projects", { scrollTriggered: true, fullBleed: true });
export default SelectedWorkSection;
