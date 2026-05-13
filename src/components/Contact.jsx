import { footer, navLinks, socials } from "../constants";

// Display font stack used for the big CTA and the bottom wordmark.
// Loaded from Fontshare at weight 900 in index.css (Cabinet Grotesk Black).
// Hoisted so both elements share the exact same fallback chain.
const DISPLAY_FONT_STACK =
  "Cabinet Grotesk, Geist, ui-sans-serif, system-ui, sans-serif";

/**
 * Footer — full-viewport "set-piece" footer inspired by ethansuero.com.
 *
 * Layout (top → bottom):
 *   1. Headline CTA on the left, anchor nav on the right
 *   2. Flex spacer
 *   3. Small mono row: email + location | socials | copyright
 *   4. Giant "ADNAAN DASOO" wordmark anchored to the footer's bottom edge,
 *      rendered twice: a muted ghost copy offset upward, layered behind a solid
 *      copy that bleeds slightly below the container — the double-shadow effect.
 *
 * The personality pills row from the previous footer iteration is removed —
 * it read as jargon clutter against the cleaner minimal direction.
 */
export default function Contact() {
  return (
    <footer
      id="contact"
      className="relative flex min-h-screen w-full flex-col overflow-hidden px-6 pt-32 sm:px-16"
    >
      <div className="mx-auto flex w-full max-w-screen-2xl flex-1 flex-col">
        {/* Top: huge CTA on the left, vertical anchor nav on the right */}
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-[1fr_auto] sm:items-start">
          <a
            href={`mailto:${footer.email}`}
            className="group block text-ink"
            style={{
              fontFamily: DISPLAY_FONT_STACK,
              fontWeight: 900,
              fontSize: "clamp(60px, 12vw, 180px)",
              lineHeight: "0.92",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            {footer.headlineLead}{" "}
            <span className="whitespace-nowrap transition-colors duration-300 group-hover:text-accent">
              {footer.headlineHighlight}{" "}
              <span
                aria-hidden="true"
                className="inline-block transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
              >
                ↗
              </span>
            </span>
          </a>

          <nav>
            <ul className="flex flex-col gap-2 font-mono text-xs uppercase tracking-widest sm:text-sm sm:items-end">
              {navLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    className="text-ink transition-opacity hover:opacity-60"
                  >
                    {link.title}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#"
                  className="text-ink transition-opacity hover:opacity-60"
                >
                  home
                </a>
              </li>
            </ul>
          </nav>
        </div>

        {/* Flexible spacer — pushes the small row + wordmark to the bottom */}
        <div className="flex-1 min-h-[6rem]" />

        {/* Small mono row: email + location | copyright | socials */}
        <div className="grid grid-cols-1 gap-6 pb-8 font-mono text-[11px] uppercase tracking-widest text-muted sm:grid-cols-3 sm:items-end">
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
                  className="text-ink transition-opacity hover:opacity-60"
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

      {/*
        Giant wordmark with ghost-shadow effect.

        Two absolutely-positioned <span>s share the same content and font sizing
        but differ in color + vertical offset:
          - Ghost: muted color, offset upward (bottom: 0.3em) so it appears
            stacked behind/above the solid copy.
          - Solid: ink color, bleeds slightly below the container (bottom:
            -0.12em) so the letters' bottoms kiss the viewport edge.

        Container is full-bleed (extends past the page padding) so the
        wordmark can stretch edge-to-edge regardless of the inner max-width.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none relative w-full select-none overflow-hidden"
        style={{ height: "clamp(110px, 19vw, 320px)" }}
      >
        <span
          className="absolute left-0 right-0 whitespace-nowrap text-center"
          style={{
            bottom: "0.3em",
            fontFamily: DISPLAY_FONT_STACK,
            fontWeight: 900,
            fontSize: "clamp(64px, 15vw, 260px)",
            lineHeight: "0.85",
            letterSpacing: "0.04em",
            color: "var(--muted)",
            opacity: 0.35,
          }}
        >
          {footer.wordmark}
        </span>
        <span
          className="absolute left-0 right-0 whitespace-nowrap text-center"
          style={{
            bottom: "-0.12em",
            fontFamily: DISPLAY_FONT_STACK,
            fontWeight: 900,
            fontSize: "clamp(64px, 15vw, 260px)",
            lineHeight: "0.85",
            letterSpacing: "0.04em",
            color: "var(--ink)",
          }}
        >
          {footer.wordmark}
        </span>
      </div>
    </footer>
  );
}
