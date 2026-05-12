import { useEffect, useRef } from "react";
import { useLenis } from "../utils/lenis";
import { gsap, ScrollTrigger } from "../utils/gsap";
import { selectedWork, projects } from "../constants";
import { SectionWrapper } from "../hoc";

/**
 * Selected Work — the signature scroll set-piece. On desktop (>=768px) the section
 * pins at the top of the viewport and the user's vertical scroll input scrubs the
 * inner track horizontally; below 768px the slides stack vertically with CSS
 * scroll-snap, no pin. GSAP-only — no Framer Motion overlap per design spec §3.3.
 */
function SelectedWork() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const lenis = useLenis();

  useEffect(() => {
    // Wait for Lenis to mount so its scrollerProxy is in place before we register
    // any ScrollTriggers (set up at app root in src/utils/gsap.js).
    if (!lenis) return;
    if (!sectionRef.current || !trackRef.current) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const section = sectionRef.current;
      const track = trackRef.current;
      // Distance to translate = total track width minus one viewport
      // (the last slide should end aligned to the viewport's right edge).
      const distance = () => track.scrollWidth - window.innerWidth;

      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });

    return () => mm.revert();
  }, [lenis]);

  return (
    <div ref={sectionRef} className="relative">
      {/* Section label — stays inside the section but above the pinned track */}
      <div className="px-6 pt-24 pb-12 sm:px-16">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
          {selectedWork.label}
        </span>
      </div>

      {/* Track: horizontal flex on desktop, vertical stack with snap on mobile */}
      <div
        ref={trackRef}
        className="flex snap-y snap-mandatory flex-col md:h-screen md:snap-none md:flex-row"
      >
        {projects.map((project, i) => (
          <article
            key={project.name}
            className="flex h-screen w-screen flex-shrink-0 snap-start flex-col gap-8 px-6 py-12 sm:px-16 md:flex-row md:gap-16 md:py-24"
          >
            {/* Left: meta */}
            <div className="flex flex-1 flex-col justify-between md:max-w-[40%]">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted">
                {String(i + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
              </div>

              <div>
                <h3
                  className="text-ink"
                  style={{
                    fontFamily:
                      "Geist, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    fontWeight: 900,
                    fontSize: "clamp(40px, 6vw, 96px)",
                    lineHeight: "0.95",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {project.name}
                </h3>
                <p className="mt-6 max-w-md text-base leading-relaxed text-ink">
                  {project.description}
                </p>
                <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-1">
                  {project.techStack.map((tech) => (
                    <li
                      key={tech}
                      className="font-mono text-[10px] uppercase tracking-widest text-muted"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-6">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[10px] uppercase tracking-widest text-ink transition-opacity hover:opacity-60"
                  >
                    Live ↗
                  </a>
                )}
                {project.sourceUrl && (
                  <a
                    href={project.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[10px] uppercase tracking-widest text-ink transition-opacity hover:opacity-60"
                  >
                    Code ↗
                  </a>
                )}
              </div>
            </div>

            {/* Right: cover (image or numbered placeholder) */}
            <div className="relative flex-1">
              {project.coverImage ? (
                <img
                  src={project.coverImage}
                  alt={project.name}
                  className="absolute inset-0 h-full w-full rounded-md object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-md border border-edge">
                  <span
                    aria-hidden="true"
                    style={{
                      fontFamily:
                        "Geist, ui-sans-serif, system-ui, sans-serif",
                      fontWeight: 900,
                      fontSize: "clamp(120px, 18vw, 360px)",
                      lineHeight: "1",
                      letterSpacing: "-0.04em",
                      color: "var(--muted)",
                      opacity: 0.5,
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default SectionWrapper(SelectedWork, "projects", { scrollTriggered: true });
