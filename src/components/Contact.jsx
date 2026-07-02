import { useState } from "react";
import { LuCopy, LuCheck } from "react-icons/lu";
import { HIDE_SECTION_LABELS, footer, socials } from "../constants";

/**
 * Per-letter vertical text swap — same pattern as the Experience /
 * SelectedWork links. Each glyph is its own overflow-hidden slot holding two
 * stacked copies; on hover of the enclosing `.group`, the top copy slides up
 * and out while a duplicate rises from below, staggered left→right for a
 * diagonal wave. Purely decorative, so the visible text is aria-hidden and the
 * link carries its own accessible name.
 */
function SwapText({ text }) {
  return (
    <span aria-hidden="true" className="block whitespace-nowrap leading-[1.25]">
      {Array.from(text).map((char, i) => (
        <span
          key={i}
          className="relative inline-block h-[1.25em] overflow-hidden align-bottom"
        >
          <span
            className="block transition-transform duration-[450ms] group-hover:-translate-y-full group-focus-visible:-translate-y-full"
            style={{
              transitionDelay: `${i * 25}ms`,
              transitionTimingFunction: "cubic-bezier(0.65, 0, 0.35, 1)",
            }}
          >
            {char === " " ? " " : char}
          </span>
          <span
            className="absolute inset-0 translate-y-full transition-transform duration-[450ms] group-hover:translate-y-0 group-focus-visible:translate-y-0"
            style={{
              transitionDelay: `${i * 25}ms`,
              transitionTimingFunction: "cubic-bezier(0.65, 0, 0.35, 1)",
            }}
          >
            {char === " " ? " " : char}
          </span>
        </span>
      ))}
    </span>
  );
}

/**
 * Footer — compact set-piece modeled on davidrodriguez.studio's /contact:
 * small mono kicker, two-line display CTA, then a single mono row at the
 * bottom (email + location | copyright | socials). No forced viewport
 * gap, no giant wordmark — the empty space is left to breathe naturally
 * from the section's own pt-32 + mt-24 rhythm.
 *
 * Font family pulls from tailwind's `font-display` token (Clash Display,
 * heavy + all-caps), the same source Hero uses, so the two display moments
 * share a single typeface definition.
 */
export default function Contact() {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard?.writeText(footer.email).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    });
  };

  return (
    <footer
      id="contact"
      className="relative flex w-full flex-col px-4 pt-10 sm:px-8 sm:pt-32"
    >
      <div className="flex w-full flex-col">
        {!HIDE_SECTION_LABELS && (
          <span className="font-sans text-xs uppercase tracking-widest text-muted">
            {footer.kicker}
          </span>
        )}

        <a
          href={`mailto:${footer.email}`}
          className="mt-10 inline-block font-display text-ink"
          style={{
            fontWeight: 700,
            // Min lowered from 56 → 36 and vw factor from 11 → 10 so
            // "Let's build it ↗" fits on a single line at mobile widths
            // without wrapping the arrow off the rest of the phrase.
            fontSize: "clamp(36px, 10vw, 180px)",
            lineHeight: "0.95",
            letterSpacing: "-0.01em",
          }}
        >
          <span className="block" style={{ fontSize: "0.78em" }}>
            {/* data-cursor sits on inline spans that hug the glyphs (not the
                block/<a>) so the "say hi" pill only shows over the actual
                words, never the empty box area around them. */}
            <span data-cursor="say hi 👋">{footer.headlineLead}</span>
          </span>
          <span className="block whitespace-nowrap">
            {/* `group` lives on this inner inline-block (not the whole <a>) so
                only hovering "Let's build it" + arrow triggers the color /
                underline / arrow-nudge — not "Got an idea?" or empty box space.
                inline-block hugs text + arrow so the underline width matches. */}
            <span
              data-cursor="say hi 👋"
              className="group relative inline-block transition-colors duration-[600ms] ease-out hover:text-flag"
            >
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
            {/* Underline sweep — grows from left to right on hover. origin-left
                + scale-x keeps the animation GPU-cheap; height scales with the
                display text via em units. */}
            <span
              aria-hidden="true"
              className="absolute bottom-0 left-0 h-[0.05em] w-full origin-left scale-x-0 bg-flag transition-transform duration-[450ms] ease-out group-hover:scale-x-100"
            />
            </span>
          </span>
        </a>

        <div className="mt-24 grid grid-cols-1 gap-6 pb-8 font-sans text-sm uppercase tracking-widest text-muted sm:grid-cols-3 sm:items-end">
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={handleCopyEmail}
              data-cursor="say hi 👋"
              aria-label={`Copy email address ${footer.email}`}
              className="group/email inline-flex w-fit cursor-pointer items-center gap-2 uppercase tracking-widest text-muted transition-colors hover:text-ink"
            >
              <span>{copied ? "Copied!" : footer.email}</span>
              {copied ? (
                <LuCheck
                  className="h-3.5 w-3.5 text-flag"
                  aria-hidden="true"
                />
              ) : (
                <LuCopy
                  className="h-3.5 w-3.5 opacity-0 transition-opacity duration-200 group-hover/email:opacity-100"
                  aria-hidden="true"
                />
              )}
            </button>
            <span>{footer.location}</span>
          </div>
          <div className="text-muted sm:text-center">{footer.copyright}</div>
          <ul className="flex gap-6 sm:justify-end">
            {socials.map((social) => (
              <li key={social.name}>
                <a
                  href={social.url}
                  data-cursor="say hi 👋"
                  aria-label={social.name}
                  className="group inline-flex min-h-[44px] items-center text-ink focus:outline-none sm:min-h-0"
                  target={social.url.startsWith("http") ? "_blank" : undefined}
                  rel={
                    social.url.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                >
                  <SwapText text={social.name} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
