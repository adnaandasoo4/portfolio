/**
 * Per-letter vertical text swap. Each glyph is its own overflow-hidden slot
 * holding two stacked copies; on hover of the enclosing Tailwind `.group`, the
 * top copy slides up and out while a duplicate rises from below, staggered
 * left→right for a diagonal wave.
 *
 * Purely decorative: the container is aria-hidden, so the enclosing control
 * must carry its own accessible name (aria-label / adjacent text).
 *
 * Timing (delay `i * 25ms`, duration `450ms`, cubic-bezier(.65,0,.35,1)) is
 * shared across the footer nav links and the full-page nav overlay so every
 * swap on the site reads identically. Override via props if a spot needs to
 * differ.
 */
export default function SwapText({
  text,
  delayStep = 25,
  duration = 450,
  className = "",
}) {
  const ease = "cubic-bezier(0.65, 0, 0.35, 1)";
  return (
    <span
      aria-hidden="true"
      className={`block whitespace-nowrap leading-[1.25] ${className}`}
    >
      {Array.from(text).map((char, i) => (
        <span
          key={i}
          className="relative inline-block h-[1.25em] overflow-hidden align-bottom"
        >
          <span
            className="block transition-transform group-hover:-translate-y-full group-focus-visible:-translate-y-full"
            style={{
              transitionDuration: `${duration}ms`,
              transitionDelay: `${i * delayStep}ms`,
              transitionTimingFunction: ease,
            }}
          >
            {char === " " ? " " : char}
          </span>
          <span
            className="absolute inset-0 translate-y-full transition-transform group-hover:translate-y-0 group-focus-visible:translate-y-0"
            style={{
              transitionDuration: `${duration}ms`,
              transitionDelay: `${i * delayStep}ms`,
              transitionTimingFunction: ease,
            }}
          >
            {char === " " ? " " : char}
          </span>
        </span>
      ))}
    </span>
  );
}
