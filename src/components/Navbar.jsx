import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { navLinks, socials } from "../constants";
import ThemeToggle from "./ThemeToggle";

const ease = [0.65, 0, 0.35, 1];

/**
 * Sticky top navigation. Holds the logo (text mark), anchor links to sections,
 * and the theme toggle. Background uses a translucent `bg-paper` with backdrop
 * blur so the nav stays readable when content scrolls beneath it.
 *
 * On mobile (<md), the hamburger trigger opens a full-page overlay that
 * animates down from the top: nav links stagger in as large display text,
 * followed by a pill-styled Resume CTA and a row of social links along the
 * bottom. The navbar bar (z-50) sits on top of the overlay (z-40) so the
 * close (×) button is always tappable. Body scroll is locked while open.
 */
export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Lock body scroll while the mobile overlay is open so the underlying
  // page can't scroll behind it. Cleanup unlocks defensively if the
  // component ever unmounts mid-open.
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  // Close on Escape — keyboard accessibility nicety even though the
  // overlay is mobile-only (some users have BT keyboards on tablets).
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  return (
    <>
      <nav className="fixed left-0 right-0 top-0 z-50 backdrop-blur-md">
        <div
          className="flex items-center justify-between px-6 py-5 text-ink sm:px-16"
          style={{ background: "rgb(from var(--bg) r g b / 0.8)" }}
        >
          <a
            href="#"
            aria-label="Home"
            className="text-base tracking-wider transition-opacity hover:opacity-70"
            style={{ fontFamily: "Azonix, Clash Display, system-ui, sans-serif" }}
            onClick={(e) => {
              e.preventDefault();
              setMobileOpen(false);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            AD.
          </a>

          {/* Desktop nav */}
          <ul className="hidden gap-8 font-mono text-[10px] uppercase tracking-widest md:flex">
            {navLinks.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  data-cursor="jump here"
                  className="transition-opacity hover:opacity-60"
                >
                  {link.title}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-edge text-ink md:hidden"
            >
              <span className="sr-only">Menu</span>
              <span aria-hidden="true" className="text-xs">
                {mobileOpen ? "×" : "≡"}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Full-page mobile menu — animates down from the top, stays under
          the navbar (z-40 vs z-50) so the close button is always accessible. */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.5, ease }}
            className="fixed inset-0 z-40 flex flex-col bg-paper md:hidden"
          >
            <div className="flex flex-1 flex-col justify-center px-6 pt-24">
              {/* Big display-weight nav links, staggered in */}
              <ul className="flex flex-col gap-1">
                {navLinks.map((link, i) => (
                  <motion.li
                    key={link.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 + i * 0.08, duration: 0.5, ease }}
                  >
                    <a
                      href={`#${link.id}`}
                      onClick={() => setMobileOpen(false)}
                      className="block font-display text-ink"
                      style={{
                        fontWeight: 700,
                        fontSize: "clamp(40px, 12vw, 80px)",
                        lineHeight: 1.05,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {link.title}
                    </a>
                  </motion.li>
                ))}
              </ul>

              {/* Resume — unique treatment: pill with orange flag accent
                  + arrow, so it reads as a distinct CTA rather than another
                  generic nav link. */}
              <motion.a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.35 + navLinks.length * 0.08,
                  duration: 0.5,
                  ease,
                }}
                className="mt-10 inline-flex w-fit items-center gap-2 rounded-full border border-flag bg-flag/10 px-5 py-3 font-mono text-xs uppercase tracking-widest text-flag"
              >
                Read the Resume
                <span aria-hidden="true">↗</span>
              </motion.a>
            </div>

            {/* Socials row at the bottom — small mono links. */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: 0.35 + (navLinks.length + 1) * 0.08,
                duration: 0.5,
                ease,
              }}
              className="border-t border-edge px-6 pb-10 pt-6"
            >
              <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted">
                Elsewhere
              </p>
              <ul className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-sm uppercase tracking-widest text-ink">
                {socials.map((social) => (
                  <li key={social.name}>
                    <a
                      href={social.url}
                      onClick={() => setMobileOpen(false)}
                      target={
                        social.url.startsWith("http") ? "_blank" : undefined
                      }
                      rel={
                        social.url.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="inline-flex min-h-[44px] items-center"
                    >
                      {social.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
