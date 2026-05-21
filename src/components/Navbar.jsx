import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";

import { navLinks, socials } from "../constants";
import ThemeToggle from "./ThemeToggle";

const ease = [0.65, 0, 0.35, 1];

// Smooth-scroll an in-page anchor. Looks up by id and calls scrollIntoView;
// the lookup is wrapped in a microtask to give React a chance to paint
// before scrolling (matters when the target section was JUST mounted via
// navigation from another route).
function scrollToAnchor(id) {
  requestAnimationFrame(() => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

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
export default function Navbar({ onReplayPreloader }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";

  // Smart back-to-top for the AD. logo.
  //   On home → smooth-scroll to the top in place.
  //   On any other route → replay the preloader (so it reads as a fresh
  //   page load, not an SPA hop) and navigate to "/". The App-level
  //   ScrollOnRouteChange helper resets scroll position to 0 on the
  //   pathname change so we always land at the very top.
  function handleLogoClick(e) {
    e.preventDefault();
    setMobileOpen(false);
    if (isHome) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (onReplayPreloader) onReplayPreloader();
    navigate("/");
  }

  // navAnchor links ("experience") always end up at home's #id section.
  // On home: just scroll. On other routes: optionally replay the
  // preloader (so the navigation feels like a fresh page load), then
  // navigate to "/" with scrollTo state — Home reads that on mount and
  // scrolls the section into view while the preloader covers the screen.
  function handleNavAnchorClick(e, link) {
    e.preventDefault();
    setMobileOpen(false);
    if (isHome) {
      scrollToAnchor(link.id);
      return;
    }
    if (link.triggersPreloader && onReplayPreloader) {
      onReplayPreloader();
    }
    navigate("/", { state: { scrollTo: link.id } });
  }

  // hybrid links behave differently depending on where the user
  // already is. On home: scroll to the section anchor. Off-home: route
  // to a different page. Currently unused (works was hybrid; now a
  // straight route) — kept here for future links that need it.
  function handleHybridClick(e, link) {
    e.preventDefault();
    setMobileOpen(false);
    if (isHome) {
      scrollToAnchor(link.id);
    } else {
      navigate(link.to);
    }
  }

  // route links ("works") always navigate to a router path, regardless
  // of where the user already is. The router decides whether that's a
  // remount (different route) or a no-op (same route).
  function handleRouteClick(e, link) {
    e.preventDefault();
    setMobileOpen(false);
    navigate(link.to);
  }

  // anchor links ("contact") always smooth-scroll to #id on the current
  // page. The Contact component is rendered at the bottom of every
  // route, so the anchor always exists — no navigation needed.
  function handleAnchorClick(e, link) {
    e.preventDefault();
    setMobileOpen(false);
    scrollToAnchor(link.id);
  }

  // Single click dispatcher used by both the desktop nav list and the
  // mobile overlay list so behavior stays in lockstep across the two.
  function handleLinkClick(e, link) {
    if (link.kind === "navAnchor") return handleNavAnchorClick(e, link);
    if (link.kind === "hybrid") return handleHybridClick(e, link);
    if (link.kind === "route") return handleRouteClick(e, link);
    return handleAnchorClick(e, link);
  }

  // What the link's `href` should point to so middle-click / "open in new
  // tab" land somewhere sensible (and the URL preview the browser shows
  // on hover reads correctly).
  function linkHref(link) {
    if (link.kind === "hybrid") return isHome ? `#${link.id}` : link.to;
    if (link.kind === "navAnchor") return isHome ? `#${link.id}` : `/`;
    if (link.kind === "route") return link.to;
    return `#${link.id}`;
  }

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
      <nav
        className="fixed left-0 right-0 top-0 z-50 backdrop-blur-md"
        style={{ background: "rgb(from var(--bg) r g b / 0.8)" }}
      >
        {/* Inner rail matches every other section (max-w-[1800px] + same
            px-6 sm:px-16) so the logo and theme toggle align with Hero,
            Manifesto, Experience, Tech, and Contact on wide displays. */}
        <div className="mx-auto flex w-full max-w-[1800px] items-center justify-between px-6 py-5 text-ink sm:px-16">
          <a
            href="/"
            aria-label="Home"
            className="text-base tracking-wider transition-opacity hover:opacity-70"
            style={{ fontFamily: "Azonix, Clash Display, system-ui, sans-serif" }}
            onClick={handleLogoClick}
          >
            AD.
          </a>

          {/* Desktop nav */}
          <ul className="hidden gap-8 font-mono text-sm uppercase tracking-widest md:flex">
            {navLinks.map((link) => (
              <li key={link.id ?? link.to}>
                <a
                  href={linkHref(link)}
                  onClick={(e) => handleLinkClick(e, link)}
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
              {/* Big display-weight nav links, staggered in. Uses the
                  same handleLinkClick dispatcher as the desktop nav so
                  the three link kinds behave identically in both surfaces. */}
              <ul className="flex flex-col gap-1">
                {navLinks.map((link, i) => {
                  const labelStyle = {
                    fontWeight: 700,
                    fontSize: "clamp(40px, 12vw, 80px)",
                    lineHeight: 1.05,
                    letterSpacing: "-0.01em",
                  };
                  return (
                    <motion.li
                      key={link.id ?? link.to}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 + i * 0.08, duration: 0.5, ease }}
                    >
                      <a
                        href={linkHref(link)}
                        onClick={(e) => handleLinkClick(e, link)}
                        className="block font-display text-ink"
                        style={labelStyle}
                      >
                        {link.title}
                      </a>
                    </motion.li>
                  );
                })}
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
