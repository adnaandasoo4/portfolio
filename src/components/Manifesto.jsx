import { useEffect, useMemo, useRef } from "react";
import { HIDE_SECTION_LABELS, manifesto } from "../constants";
import { SectionWrapper } from "../hoc";
import { useSectionBackdrop } from "../utils/backdrop";
import { useLenis } from "../utils/lenis";
import { gsap, ScrollTrigger } from "../utils/gsap";

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const lerp = (a, b, t) => a + (b - a) * t;

// Unlit word opacity (grayed) → 1 (full color).
const DIM = 0.2;
// Words mid-transition at the leading edge (soft fill instead of a hard step).
const RAMP = 5;
// Fraction of the pin over which the fill completes (the rest holds full color
// before the section releases and scrolls up).
const FILL_END = 0.85;

function Manifesto() {
  const ref = useRef(null);
  const innerRef = useRef(null);
  const wordEls = useRef([]);
  const lenis = useLenis();
  // Light/paper through hero → video → about; the white→dark fade begins at the
  // About → Experience handoff (Experience is the first 'dark' section).
  useSectionBackdrop(ref, "light");

  // Tokenize the intro into words (+ whitespace). Each word gets a sequential
  // index so it can light left→right as the section scrolls.
  const tokens = useMemo(() => {
    const out = [];
    let wi = 0;
    manifesto.intro.forEach((seg) => {
      seg.text.split(/(\s+)/).forEach((part) => {
        if (part === "") return;
        if (/^\s+$/.test(part)) out.push({ space: true, text: part });
        else out.push({ space: false, text: part, highlight: !!seg.highlight, wi: wi++ });
      });
    });
    return out;
  }, []);
  const wordCount = useMemo(() => tokens.filter((t) => !t.space).length, [tokens]);

  // Pin the centered text and fill it with color as the user scrolls through.
  // Mirrors SelectedWork's ScrollTrigger setup (waits for Lenis's scrollerProxy).
  useEffect(() => {
    if (!lenis || !innerRef.current) return;

    const setFill = (progress) => {
      const front = clamp(progress / FILL_END, 0, 1) * (wordCount + RAMP);
      wordEls.current.forEach((el, wi) => {
        if (!el) return;
        el.style.opacity = String(lerp(DIM, 1, clamp((front - wi) / RAMP, 0, 1)));
      });
    };

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const st = ScrollTrigger.create({
        trigger: innerRef.current,
        pin: innerRef.current,
        start: "top top",
        end: "+=120%",
        scrub: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => setFill(self.progress),
      });
      return () => st.kill();
    });
    // Reduced motion: no pin — just present the text fully colored.
    mm.add("(prefers-reduced-motion: reduce)", () => {
      setFill(1);
      return () => {};
    });
    return () => mm.revert();
  }, [lenis, wordCount]);

  return (
    <div ref={ref}>
      {/* Pinned, viewport-centered text. ScrollTrigger pins this h-screen block
          while the words fill in; afterward it releases and scrolls up. */}
      <div ref={innerRef} className="flex h-screen flex-col justify-center gap-8">
        {!HIDE_SECTION_LABELS && (
          <span className="font-mono text-xs uppercase tracking-widest text-muted">
            {manifesto.label}
          </span>
        )}
        <p
          className="text-ink"
          style={{
            fontWeight: 700,
            fontSize: "clamp(34px, 5vw, 72px)",
            lineHeight: 1.1,
            letterSpacing: "-0.015em",
            maxWidth: "60ch",
          }}
        >
          {tokens.map((t, i) =>
            t.space ? (
              <span key={i}>{t.text}</span>
            ) : (
              <span
                key={i}
                ref={(el) => {
                  wordEls.current[t.wi] = el;
                }}
                style={{ opacity: DIM, color: t.highlight ? "var(--lime)" : undefined }}
              >
                {t.text}
              </span>
            ),
          )}
        </p>
      </div>
    </div>
  );
}

const ManifestoSection = SectionWrapper(Manifesto, "about", { scrollTriggered: true });
export default ManifestoSection;
