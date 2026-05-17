import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { useLenis } from "../utils/lenis";
import { gsap } from "../utils/gsap";
import { HIDE_SECTION_LABELS, projects, selectedWork } from "../constants";
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
      {!HIDE_SECTION_LABELS && (
        <div className="mx-auto flex max-w-screen-2xl items-baseline justify-between px-6 pt-24 sm:px-16">
          <span className="font-mono text-xs uppercase tracking-widest text-muted">
            {selectedWork.label}
          </span>
        </div>
      )}

      {/* Big display heading — matches the Tech section's heading treatment.
          Sits in the same max-w-screen-2xl rail as the rest of the page so
          its left edge lines up with section content above. */}
      <div className="mx-auto w-full max-w-screen-2xl px-6 pt-24 sm:px-16">
        <h2
          className="font-display uppercase text-ink"
          style={{
            fontWeight: 700,
            fontSize: "clamp(40px, 6vw, 96px)",
            lineHeight: 1,
            letterSpacing: "-0.01em",
          }}
        >
          {selectedWork.heading}
        </h2>
      </div>

      {/* Tile row. Track translates horizontally; each tile owns its own
          hover-preview overlay as an inset child so the preview sits exactly
          on top of the hovered tile (rather than in viewport center). */}
      <div
        ref={trackWrapperRef}
        // Mobile (or any viewport with prefers-reduced-motion: reduce) uses
        // a normal vertical stack — no overflow gymnastics. md+ AND motion-
        // safe flips to overflow-hidden so GSAP can drive the pinned
        // horizontal scrub without competing with native scroll. Gating on
        // `md:motion-safe:` (instead of `md:`) means reduced-motion users
        // on desktop fall back cleanly to the mobile stack instead of
        // seeing a frozen track they can't scroll past — the bug a friend
        // reported in May 2026.
        className="relative mt-12 md:motion-safe:overflow-hidden"
        onMouseLeave={() => setHoveredIdx(null)}
      >
        <div
          ref={trackRef}
          // Mobile / reduced-motion: flex-col stacks tiles vertically,
          // full-width within section padding. Tap each tile to open the
          // project.
          // Desktop + motion-safe: pl-[50vw] starts the first tile's left
          // edge at viewport center, pr-[40vw] ends translation roughly
          // when the LAST tile reaches viewport center. flex-row + GSAP
          // transform drives the horizontal pinned scroll. All the desktop
          // pin classes are gated on `md:motion-safe:` so they only apply
          // when both the viewport is wide enough AND the user hasn't
          // opted out of motion — see the wrapper's class above.
          className="flex flex-col gap-6 px-6 md:motion-safe:flex-row md:motion-safe:gap-4 md:motion-safe:px-16 md:motion-safe:pl-[50vw] md:motion-safe:pr-[40vw]"
          style={{ willChange: "transform" }}
        >
          {projects.map((project, i) => {
            const isHovered = hoveredIdx === i;
            return (
              <Link
                key={project.slug}
                to={`/works/${project.slug}`}
                data-cursor="check out my work"
                aria-label={project.name}
                onMouseEnter={() => setHoveredIdx(i)}
                // Mobile / reduced-motion: full-width tile in the vertical
                // stack. Desktop + motion-safe: clamp width on the
                // horizontal track. Gated on motion-safe so reduced-motion
                // users get the full-width stacked tiles.
                className="relative block w-full overflow-hidden bg-edge md:motion-safe:w-[clamp(280px,45vw,720px)] md:motion-safe:flex-shrink-0"
                style={{ aspectRatio: "16 / 10" }}
              >
                {/* Tile cover — project screenshot, or a small typographic
                    fallback (numbered + name) when the project has no
                    coverImage URL set in the constants. On hover the cover
                    blurs + scales 1.05× so the info card on top reads as
                    "in focus" while the background defocuses behind it —
                    preserves the screenshot's colors / saturation (unlike
                    a dim overlay) while still giving the card visual
                    primacy. The 1.05 scale + the parent's overflow-hidden
                    hides the transparent edge bleed that CSS blur()
                    produces on the image perimeter. */}
                {project.coverImage ? (
                  <img
                    src={project.coverImage}
                    alt={project.name}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{
                      filter: isHovered ? "blur(12px)" : "none",
                      transform: isHovered ? "scale(1.05)" : "scale(1)",
                      transition:
                        "filter 500ms cubic-bezier(0.65, 0, 0.35, 1), transform 500ms cubic-bezier(0.65, 0, 0.35, 1)",
                    }}
                  />
                ) : (
                  // Text fallback for projects without a coverImage URL.
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center px-4 text-ink"
                    style={{
                      filter: isHovered ? "blur(12px)" : "none",
                      transform: isHovered ? "scale(1.05)" : "scale(1)",
                      transition:
                        "filter 500ms cubic-bezier(0.65, 0, 0.35, 1), transform 500ms cubic-bezier(0.65, 0, 0.35, 1)",
                    }}
                  >
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
                    tile. clip-path inset starts at the center horizontal
                    line (top:50% + bottom:50% = zero-height strip) and
                    animates outward to inset(0) on hover, producing the
                    "split-open from center" effect (top half slides up,
                    bottom half down). No border — the visual separation
                    comes from the dimmed screenshot behind it. */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div
                    className="relative overflow-hidden bg-paper"
                    style={{
                      width: "78%",
                      aspectRatio: "16 / 10",
                      clipPath: isHovered
                        ? "inset(0 0 0 0)"
                        : "inset(50% 0 50% 0)",
                      transition:
                        "clip-path 500ms cubic-bezier(0.65, 0, 0.35, 1)",
                    }}
                  >
                    <div className="flex h-full w-full flex-col justify-between p-5 text-ink">
                      <div className="flex flex-col gap-2">
                        <span className="font-mono text-[10px] uppercase tracking-widest opacity-60">
                          {String(i + 1).padStart(2, "0")} /{" "}
                          {String(projects.length).padStart(2, "0")}
                        </span>
                        <h3
                          className="font-display uppercase"
                          style={{
                            fontWeight: 700,
                            fontSize: "clamp(18px, 1.8vw, 28px)",
                            lineHeight: 1.05,
                            letterSpacing: "-0.005em",
                          }}
                        >
                          {project.name}
                        </h3>
                        <p
                          className="opacity-80"
                          style={{
                            fontSize: "13px",
                            lineHeight: 1.45,
                          }}
                        >
                          {project.description}
                        </p>
                      </div>
                      <div className="flex items-end justify-between gap-3">
                        <ul className="flex flex-wrap gap-1.5">
                          {project.techStack.slice(0, 4).map((tech) => (
                            <li
                              key={tech}
                              className="border border-ink/30 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest"
                            >
                              {tech}
                            </li>
                          ))}
                        </ul>
                        <span
                          className="whitespace-nowrap font-mono text-xs uppercase tracking-widest"
                          aria-hidden="true"
                        >
                          View ↗
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Progress bar — solid horizontal bar, thicker than the original 1px
          hairline. scaleX driven by GSAP's `onUpdate` grows the ink fill
          from left to right as the user scrolls through the pinned section.
          Hidden under reduced-motion since there's no pin to track —
          tiles render as a stack and progress is meaningless. */}
      <div className="mt-12 flex justify-center">
        <div className="relative h-1.5 w-56 bg-edge motion-reduce:hidden">
          <div
            ref={progressRef}
            className="absolute left-0 top-0 h-full w-full origin-left bg-ink"
            style={{ transform: "scaleX(0)" }}
          />
        </div>
      </div>

      {/* View all works — letter-wave link matching the Read the resume
          treatment in the Experience section. Right-aligned within the
          inner rail, mirroring the Read the resume alignment. */}
      <div className="mx-auto mt-12 flex max-w-screen-2xl justify-end px-6 pb-24 sm:px-16">
        <Link
          to="/works"
          aria-label="View all works"
          className="group inline-block focus:outline-none"
        >
          <span
            aria-hidden="true"
            className="block whitespace-nowrap text-xl sm:text-2xl leading-[1.25] text-ink"
          >
            {Array.from("View all works ↗").map((char, i) => (
              <span
                key={i}
                className="relative inline-block h-[1.25em] overflow-hidden align-bottom"
              >
                <span
                  className="block transition-transform duration-[360ms] group-hover:-translate-y-full group-focus-visible:-translate-y-full"
                  style={{
                    transitionDelay: `${i * 7}ms`,
                    transitionTimingFunction: "cubic-bezier(0.65, 0, 0.35, 1)",
                  }}
                >
                  {char === " " ? " " : char}
                </span>
                <span
                  className="absolute inset-0 translate-y-full transition-transform duration-[360ms] group-hover:translate-y-0 group-focus-visible:translate-y-0"
                  style={{
                    transitionDelay: `${i * 7}ms`,
                    transitionTimingFunction: "cubic-bezier(0.65, 0, 0.35, 1)",
                  }}
                >
                  {char === " " ? " " : char}
                </span>
              </span>
            ))}
          </span>
          <span
            className="block h-px origin-left scale-x-0 bg-ink transition-transform duration-[400ms] group-hover:scale-x-100 group-focus-visible:scale-x-100"
            style={{ transitionTimingFunction: "cubic-bezier(0.65, 0, 0.35, 1)" }}
          />
        </Link>
      </div>
    </div>
  );
}

const SelectedWorkSection = SectionWrapper(SelectedWork, "projects", { scrollTriggered: true, fullBleed: true });
export default SelectedWorkSection;
