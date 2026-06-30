import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from "framer-motion";

import { navLinks, socials } from "../constants";
import { useLenis } from "../utils/lenis";
import ColorPicker from "./ColorPicker";
import OverlayTopo from "./canvas/OverlayTopo";

// Curve depth (in normalized objectBoundingBox units) of the overlay's curved
// sweep edge — same quadratic-bow idea as the Preloader curtain.
const SWEEP_SAG = 0.12;

// Smooth-scroll an in-page anchor. The lookup is wrapped in rAF to give React
// a chance to paint before scrolling (matters when the target section was JUST
// mounted via navigation from another route).
function scrollToAnchor(id) {
  requestAnimationFrame(() => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

/**
 * Sticky top navigation (V2). The bar holds the enlarged "Adnaan Dasoo" logo, a
 * quirky "Say Hi" contact pill, and a boxed burger trigger. The burger opens a
 * full-page overlay (all viewports): a 50/50 split of mouse-parallax image
 * columns (left) and the nav links + socials (right).
 *
 * The burger/contact/overlay visuals (box fill, wrap→X swap, swipe reveal,
 * letter-roll) live as namespaced `.nv-*` CSS in index.css; this component owns
 * the open/close state and wires the links to the real router/scroll handlers.
 */
export default function Navbar({ onReplayPreloader }) {
  const [menuOpen, setMenuOpen] = useState(false);
  // `closing` keeps the burger's X→dashes swap + overlay swipe-up running for a
  // beat after menuOpen flips false (mirrors the prototype's is-closing class).
  const [closing, setClosing] = useState(false);
  // `scrolled` flips true once the page leaves the top — shrinks the logo/buttons
  // 10%.
  const [scrolled, setScrolled] = useState(false);
  // `darkBg` flips true only once the scroll-driven backdrop blend has crossed
  // into the dark theme palette (read from the live --bg var that
  // TopographicField writes each frame). It — NOT mere scroll — is what swaps
  // the burger to a white box with black border + lines, so the box keeps its
  // black border over the light hero and only flips white over the theme color.
  const [darkBg, setDarkBg] = useState(false);
  const closeTimer = useRef(null);
  const colARef = useRef(null);
  const colBRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const lenis = useLenis();
  const isHome = location.pathname === "/";

  // Curved sweep for the overlay open/close — the same mechanism as the
  // Preloader: one normalized motion value (0 = hidden, 1 = fully covering)
  // drives an SVG clip-path whose bottom edge is a quadratic bow. The straight
  // sides sit at `sweep` (0→1); the curve's midpoint dips below by `sag`, which
  // peaks mid-sweep and eases to 0 at both ends — so the edge LEVELS OUT (flat)
  // when fully open or fully closed, exactly like the Preloader curtain.
  // ctrlY = baseY + 2·sag puts the quadratic midpoint a `sag` below the sides.
  const sweep = useMotionValue(0);
  const ctrlY = useTransform(sweep, (p) => p + 8 * SWEEP_SAG * p * (1 - p));
  const sweepPath = useMotionTemplate`M0 0 H1 V${sweep} Q0.5 ${ctrlY} 0 ${sweep} Z`;

  function openMenu() {
    clearTimeout(closeTimer.current);
    setClosing(false);
    setMenuOpen(true);
  }
  function closeMenu() {
    setMenuOpen(false);
    setClosing(true);
    closeTimer.current = setTimeout(() => setClosing(false), 700);
  }
  function toggleMenu() {
    if (menuOpen) closeMenu();
    else openMenu();
  }

  // Smart back-to-top for the AD. logo. On home → scroll to top; on any other
  // route → replay the preloader (reads as a fresh load) and navigate to "/".
  function handleLogoClick(e) {
    e.preventDefault();
    closeMenu();
    if (isHome) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (onReplayPreloader) onReplayPreloader();
    navigate("/");
  }

  // navAnchor links always end up at home's #id section.
  function handleNavAnchorClick(e, link) {
    e.preventDefault();
    closeMenu();
    if (isHome) {
      scrollToAnchor(link.id);
      return;
    }
    if (link.triggersPreloader && onReplayPreloader) onReplayPreloader();
    navigate("/", { state: { scrollTo: link.id } });
  }

  // hybrid: on home scroll to the anchor; off-home route to a page.
  function handleHybridClick(e, link) {
    e.preventDefault();
    closeMenu();
    if (isHome) scrollToAnchor(link.id);
    else navigate(link.to);
  }

  // route links always navigate to a router path.
  function handleRouteClick(e, link) {
    e.preventDefault();
    closeMenu();
    navigate(link.to);
  }

  // anchor links smooth-scroll to #id on the current page (Contact renders on
  // every route, so the anchor always exists).
  function handleAnchorClick(e, link) {
    e.preventDefault();
    closeMenu();
    scrollToAnchor(link.id);
  }

  // Single dispatcher used by the overlay nav list.
  function handleLinkClick(e, link) {
    if (link.kind === "home") return handleLogoClick(e);
    if (link.kind === "navAnchor") return handleNavAnchorClick(e, link);
    if (link.kind === "hybrid") return handleHybridClick(e, link);
    if (link.kind === "route") return handleRouteClick(e, link);
    return handleAnchorClick(e, link);
  }

  // What the link's href points to for middle-click / open-in-new-tab.
  function linkHref(link) {
    if (link.kind === "home") return "/";
    if (link.kind === "hybrid") return isHome ? `#${link.id}` : link.to;
    if (link.kind === "navAnchor") return isHome ? `#${link.id}` : `/`;
    if (link.kind === "route") return link.to;
    return `#${link.id}`;
  }

  // The active nav link (gets the lime squiggle) tracks the current route.
  function isActive(link) {
    if (link.kind === "home") return isHome;
    if (link.kind === "route") return location.pathname === link.to;
    return false;
  }

  // The "Say Hi" pill scrolls to the contact section (present on every route).
  function handleContactClick(e) {
    e.preventDefault();
    closeMenu();
    scrollToAnchor("contact");
  }

  // Lock scroll while the overlay is open. The body overflow:hidden covers
  // native scroll (e.g. prefers-reduced-motion, where Lenis never inits);
  // lenis.stop() is what actually halts the smooth-scroll layer, which ignores
  // overflow:hidden and would otherwise keep scrolling the page behind.
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lenis?.stop();
    return () => {
      document.body.style.overflow = prev;
      lenis?.start();
    };
  }, [menuOpen, lenis]);

  // Close on Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  // Vertical mouse parallax for the two image columns while the menu is open.
  useEffect(() => {
    if (!menuOpen) return;
    const colA = colARef.current;
    const colB = colBRef.current;
    let pY = 0;
    let aY = 0;
    let bY = 0;
    let raf = 0;
    const onMove = (e) => {
      pY = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("mousemove", onMove);
    const loop = () => {
      aY += (pY * -46 - aY) * 0.06;
      bY += (pY * 46 - bY) * 0.06;
      if (colA) colA.style.transform = `translateY(${aY}px)`;
      if (colB) colB.style.transform = `translateY(${bY}px)`;
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [menuOpen]);

  // Clear any pending close timer on unmount.
  useEffect(() => () => clearTimeout(closeTimer.current), []);

  // Drive the curved sweep: down to cover on open, up to reveal on close.
  useEffect(() => {
    const controls = animate(sweep, menuOpen ? 1 : 0, {
      duration: menuOpen ? 0.6 : 0.5,
      ease: [0.65, 0, 0.35, 1],
    });
    return () => controls.stop();
  }, [menuOpen, sweep]);

  // `scrolled` is a simple off-the-top flag (button/logo shrink). It only
  // changes with scroll position, so the native scroll event (driven by Lenis)
  // is sufficient.
  useEffect(() => {
    const onScroll = () => {
      setScrolled((window.scrollY || window.pageYOffset || 0) > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // `darkBg` reads the live --bg blend luminance so the burger's white-box
  // treatment only kicks in over the dark theme palette. --bg is rewritten by
  // TopographicField every frame and ALSO flips independently of scroll: at
  // startup the backdrop registry is briefly empty, during which the field
  // writes the DARK palette, then flips to light once the sections register —
  // with no scroll event to catch it. Reading on scroll alone left the burger
  // stuck in its borderless mount-time state until the user scrolled. So poll
  // --bg on rAF and update only when the threshold is crossed.
  useEffect(() => {
    const root = document.documentElement;
    const luminance = (str) => {
      const m = /(\d+(?:\.\d+)?)\D+(\d+(?:\.\d+)?)\D+(\d+(?:\.\d+)?)/.exec(str || "");
      if (!m) return 1;
      return (0.299 * +m[1] + 0.587 * +m[2] + 0.114 * +m[3]) / 255;
    };
    let raf = 0;
    let last = null;
    const tick = () => {
      const dark = luminance(getComputedStyle(root).getPropertyValue("--bg")) < 0.5;
      if (dark !== last) {
        last = dark;
        setDarkBg(dark);
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, []);

  const SAY_HI = ["S", "a", "y", " ", "H", "i"];

  return (
    <>
      <nav className="fixed left-0 right-0 top-0 z-50 bg-transparent">
        <div className="flex w-full items-center justify-between p-4 text-ink sm:p-8">
          <a
            href="/"
            aria-label="Home — Adnaan Dasoo"
            className="transition-opacity hover:opacity-70"
            style={{
              fontFamily: "'Clash Display', system-ui, sans-serif",
              fontWeight: 600,
              // Scroll-blended ink normally; white while the menu overlay is open
              // (the logo stays put in the top-left over the dark green overlay).
              color: menuOpen ? "#FFFFFF" : undefined,
              fontSize: "34px",
              lineHeight: 1.02,
              letterSpacing: "0.02em",
              textTransform: "uppercase",
              transformOrigin: "left center",
              transform: !menuOpen && scrolled ? "scale(0.9)" : "scale(1)",
              transition: "transform .3s ease, color .3s ease",
            }}
            onClick={handleLogoClick}
          >
            Adnaan
            <br />
            Dasoo
          </a>

          <div
            className="flex items-center gap-3"
            style={{
              transformOrigin: "right center",
              transform: scrolled ? "scale(0.9)" : "scale(1)",
              transition: "transform .3s ease",
            }}
          >

            {/* Quirky contact pill — per-letter vertical swap + waving hand on hover. */}
            <a
              className="nv-contact"
              href="#contact"
              onClick={handleContactClick}
              aria-label="Say Hi — contact"
            >
              <span className="nv-cttext" aria-hidden="true">
                {SAY_HI.map((ch, i) =>
                  ch === " " ? (
                    <span key={i} className="nv-ltr nv-space">
                      &nbsp;
                    </span>
                  ) : (
                    <span key={i} className="nv-ltr" style={{ "--i": String(i) }}>
                      <span className="nv-roll">
                        <span>{ch}</span>
                        <span>{ch}</span>
                      </span>
                    </span>
                  ),
                )}
              </span>
              <span className="nv-wave">👋</span>
            </a>

            {/* Boxed burger — lime fill on hover, wrap→X swap on click. */}
            <button
              type="button"
              onClick={toggleMenu}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className={`nv-burger${menuOpen ? " is-open" : ""}${closing ? " is-closing" : ""}${darkBg ? " is-dark" : ""}`}
            >
              <span className="sr-only">Menu</span>
              <span className="nv-fill" aria-hidden="true" />
              <span className="nv-bl nv-bl1" aria-hidden="true">
                <span className="nv-bln" />
              </span>
              <span className="nv-bl nv-bl2" aria-hidden="true">
                <span className="nv-bln" />
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Animated clip-path that gives the overlay its curved sweep (open/close).
          objectBoundingBox units → the 0..1 path scales to the full-viewport
          overlay and is responsive; the motion.path's `d` morphs each frame. */}
      <svg aria-hidden="true" width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <clipPath id="nvSweepClip" clipPathUnits="objectBoundingBox">
            <motion.path d={sweepPath} />
          </clipPath>
        </defs>
      </svg>

      {/* Full-page overlay (z-40, under the bar's z-50 so the burger stays clickable). */}
      <div
        className={`nv-overlay${menuOpen ? " open" : closing ? " close" : ""}`}
        aria-hidden={!menuOpen}
        style={{ clipPath: "url(#nvSweepClip)", WebkitClipPath: "url(#nvSweepClip)" }}
      >
        <OverlayTopo active={menuOpen || closing} />
        <div className="nv-ovinner">
          {/* No wordmark here — the top-left shows the persistent Navbar logo
              (white while open) instead. */}
          <div className="nv-ovmain">
            {/* left — parallax image columns (placeholders until real work imagery) */}
            <div className="nv-ovimgs">
              <div className="nv-imgcol nv-imgcol-lower" ref={colARef}>
                <div className="nv-tile nv-el">
                  <span>Work 01</span>
                </div>
                <div className="nv-tile nv-el">
                  <span>Work 03</span>
                </div>
              </div>
              <div className="nv-imgcol" ref={colBRef}>
                <div className="nv-tile nv-el">
                  <span>Work 02</span>
                </div>
                <div className="nv-tile nv-el">
                  <span>Work 04</span>
                </div>
              </div>
            </div>

            {/* right — nav links + socials */}
            <div className="nv-ovside">
              <nav className="nv-ovnav">
                {navLinks.map((link) => {
                  const active = isActive(link);
                  return (
                    <a
                      key={link.id ?? link.to ?? link.title}
                      href={linkHref(link)}
                      onClick={(e) => handleLinkClick(e, link)}
                      className={`nv-nlink nv-el${active ? " active" : ""}`}
                    >
                      {link.title}
                      {active && (
                        <svg
                          className="nv-squig"
                          viewBox="0 0 60 12"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M2 7 Q12 1 22 7 T42 7 T58 6"
                            stroke="var(--lime)"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                        </svg>
                      )}
                    </a>
                  );
                })}
              </nav>

              <div className="nv-ovsocials nv-el">
                {socials.map((s) => (
                  <a
                    key={s.name}
                    href={s.url}
                    onClick={closeMenu}
                    target={s.url.startsWith("http") ? "_blank" : undefined}
                    rel={s.url.startsWith("http") ? "noopener noreferrer" : undefined}
                  >
                    {s.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Color-mode picker — bottom-left of the overlay. */}
        <ColorPicker />
      </div>
    </>
  );
}
