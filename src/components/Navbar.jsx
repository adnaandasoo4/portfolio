import { useState } from "react";
import { navLinks } from "../constants";
import ThemeToggle from "./ThemeToggle";

/**
 * Sticky top navigation. Holds the logo (text mark), anchor links to sections,
 * and the theme toggle. Background uses a translucent `bg-paper` with backdrop
 * blur so the nav stays readable when content scrolls beneath it. Mobile
 * collapses the link list into a stacked menu under a tap-to-open chevron.
 */
export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 backdrop-blur-md">
      <div
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 text-ink sm:px-16"
        style={{ background: "rgb(from var(--bg) r g b / 0.8)" }}
      >
        <a
          href="#"
          aria-label="Home"
          className="text-base tracking-wider transition-opacity hover:opacity-70"
          style={{ fontFamily: "Azonix, Cabinet Grotesk, system-ui, sans-serif" }}
          onClick={(e) => {
            e.preventDefault();
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
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-edge text-ink md:hidden"
          >
            <span className="sr-only">Menu</span>
            <span aria-hidden="true" className="text-xs">
              {mobileOpen ? "×" : "≡"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="md:hidden"
          style={{ background: "rgb(from var(--bg) r g b / 0.95)" }}
        >
          <ul className="mx-auto max-w-7xl px-6 pb-6 pt-2 font-mono text-xs uppercase tracking-widest text-ink">
            {navLinks.map((link) => (
              <li key={link.id} className="py-2">
                <a
                  href={`#${link.id}`}
                  onClick={() => setMobileOpen(false)}
                  className="block transition-opacity hover:opacity-60"
                >
                  {link.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
