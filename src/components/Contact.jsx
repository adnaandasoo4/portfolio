import { footer, personalityPills, socials } from "../constants";

/**
 * Footer / contact section. dvdrod-style: a row of personality pills along the top,
 * a giant typographic CTA wrapping a mailto link, email + location at bottom-left,
 * inline social links at bottom-right, and a copyright line below a divider.
 * No form, no Earth canvas, no SectionWrapper wrap (this is a <footer>, not a content section).
 */
export default function Contact() {
  return (
    <footer
      id="contact"
      className="px-6 pb-10 pt-32 sm:px-16"
    >
      <div className="mx-auto max-w-7xl">
        {/* Personality pills row, right-aligned */}
        <div className="mb-24 flex flex-wrap justify-end gap-2">
          {personalityPills.map((pill) => (
            <span
              key={pill}
              className="rounded-full border border-edge px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted"
            >
              {pill}
            </span>
          ))}
        </div>

        {/* Massive CTA — only the `headlineHighlight` portion (and the arrow)
            shift to the accent color on hover. The last word of the highlight
            is kept together with the arrow via whitespace-nowrap so the arrow
            can't orphan onto a new line. */}
        {(() => {
          const words = footer.headlineHighlight.split(" ");
          const highlightLead = words.slice(0, -1).join(" ");
          const highlightTail = words[words.length - 1];
          return (
            <a
              href={`mailto:${footer.email}`}
              className="group block text-ink"
              style={{
                fontFamily: "Azonix, Geist, ui-sans-serif, system-ui, sans-serif",
                fontWeight: 400,
                fontSize: "clamp(60px, 12vw, 180px)",
                lineHeight: "0.92",
                letterSpacing: "-0.01em",
                textTransform: "uppercase",
              }}
            >
              {footer.headlineLead}{" "}
              <span className="transition-colors duration-300 group-hover:text-accent">
                {highlightLead && <>{highlightLead}{" "}</>}
                <span className="whitespace-nowrap">
                  {highlightTail}{" "}
                  <span
                    aria-hidden="true"
                    className="inline-block transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
                  >
                    ↗
                  </span>
                </span>
              </span>
            </a>
          );
        })()}

        {/* Bottom row: email + location on left, socials on right */}
        <div className="mt-24 flex flex-wrap items-end justify-between gap-6">
          <div className="flex flex-col gap-1 font-mono text-[11px] tracking-wider text-muted">
            <span>{footer.email}</span>
            <span>{footer.location}</span>
          </div>
          <ul className="flex gap-6 font-mono text-[11px] uppercase tracking-widest">
            {socials.map((social) => (
              <li key={social.name}>
                <a
                  href={social.url}
                  className="text-ink transition-opacity hover:opacity-60"
                  target={social.url.startsWith("http") ? "_blank" : undefined}
                  rel={social.url.startsWith("http") ? "noopener noreferrer" : undefined}
                >
                  {social.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Divider + copyright */}
        <div className="mt-10 border-t border-edge pt-6 text-center font-mono text-[10px] uppercase tracking-widest text-muted">
          {footer.copyright}
        </div>
      </div>
    </footer>
  );
}
