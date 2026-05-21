import { HIDE_SECTION_LABELS, footer, socials } from "../constants";

/**
 * Footer — compact set-piece modeled on davidrodriguez.studio's /contact:
 * small mono kicker, two-line display CTA, then a single mono row at the
 * bottom (email + location | copyright | socials). No forced viewport
 * gap, no giant wordmark — the empty space is left to breathe naturally
 * from the section's own pt-32 + mt-24 rhythm.
 *
 * Font family pulls from tailwind's `font-display` token (Clash Display
 * Bold), the same source Hero uses, so the two display moments share a
 * single typeface definition.
 */
export default function Contact() {
  return (
    <footer
      id="contact"
      className="relative flex w-full flex-col px-6 pt-32 sm:px-16"
    >
      <div className="mx-auto flex w-full max-w-[1800px] flex-col">
        {!HIDE_SECTION_LABELS && (
          <span className="font-mono text-xs uppercase tracking-widest text-muted">
            {footer.kicker}
          </span>
        )}

        <a
          href={`mailto:${footer.email}`}
          data-cursor="say hi 👋"
          className="group mt-10 inline-block font-display text-ink"
          style={{
            fontWeight: 700,
            fontSize: "clamp(56px, 11vw, 180px)",
            lineHeight: "0.95",
            letterSpacing: "-0.01em",
          }}
        >
          <span className="block">{footer.headlineLead}</span>
          <span className="block whitespace-nowrap transition-colors duration-300 group-hover:text-flag">
            {footer.headlineHighlight}{" "}
            <span
              aria-hidden="true"
              className="inline-block align-baseline transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
            >
              {/*
                Line-art arrow. viewBox is 100×100; stroke width 10 reads
                visually heavy enough to sit next to the 900-weight display
                text without looking thin. strokeLinecap="butt" gives the
                clean square corners shown in the reference photo.
              */}
              <svg
                viewBox="0 0 100 100"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                strokeLinecap="butt"
                strokeLinejoin="miter"
                className="inline-block h-[0.78em] w-[0.78em]"
              >
                <line x1="22" y1="78" x2="78" y2="22" />
                <polyline points="36,22 78,22 78,64" />
              </svg>
            </span>
          </span>
        </a>

        <div className="mt-24 grid grid-cols-1 gap-6 pb-8 font-mono text-sm uppercase tracking-widest text-muted sm:grid-cols-3 sm:items-end">
          <div className="flex flex-col gap-1">
            <span>{footer.email}</span>
            <span>{footer.location}</span>
          </div>
          <div className="text-muted sm:text-center">{footer.copyright}</div>
          <ul className="flex gap-6 sm:justify-end">
            {socials.map((social) => (
              <li key={social.name}>
                <a
                  href={social.url}
                  data-cursor="say hi 👋"
                  className="inline-flex min-h-[44px] items-center text-ink transition-opacity hover:opacity-60 sm:min-h-0"
                  target={social.url.startsWith("http") ? "_blank" : undefined}
                  rel={
                    social.url.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                >
                  {social.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
