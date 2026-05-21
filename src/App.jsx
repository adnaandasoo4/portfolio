import { useCallback, useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import { BuzzwordMarquee, Contact, CustomCursor, Experience, Hero, Manifesto, Navbar, Preloader, Process, ScrollToTop, SelectedWork, Tech } from './components';
import AllWorks from './components/AllWorks';
import ProjectDetail from './components/ProjectDetail';
import { ThemeProvider } from './utils/theme';
import { LenisProvider, useLenis } from './utils/lenis';
import { setupGsap } from './utils/gsap';

function GsapBootstrap() {
  const lenis = useLenis();
  useEffect(() => {
    if (!lenis) return;
    const cleanup = setupGsap(lenis);
    return cleanup;
  }, [lenis]);
  return null;
}

/**
 * Snaps scroll position back to 0 on every route change. React Router
 * doesn't do this by default — without it, navigating from a scrolled
 * home page to /works/portfolio-v2 lands the visitor mid-page because
 * the document scroll position carries over.
 *
 * Uses Lenis's scrollTo when available so the smooth-scroll layer's
 * internal target is reset in sync with the document; window.scrollTo
 * alone does not update Lenis's virtual position and the next wheel
 * event would snap back to the old offset. Falls back to native scroll
 * for users on `prefers-reduced-motion` (Lenis never initializes for
 * them — see lenis.jsx).
 *
 * Skipped when the navigation carries a `scrollTo` state — that case is
 * handled by Home's effect, which scrolls to a specific section anchor
 * instead of the top.
 */
function ScrollOnRouteChange() {
  const location = useLocation();
  const lenis = useLenis();
  useEffect(() => {
    if (location.state?.scrollTo) return;
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.state, lenis]);
  return null;
}

/**
 * Home — the main portfolio page, mounted at `/`. Composed of the same
 * vertical stack of sections that lived directly inside App before the
 * router landed. The Hero's `ready` flag still comes from App-level state
 * driven by the Preloader, so the entrance animation timing is unchanged.
 *
 * Honors a `scrollTo` value passed via `location.state` so that nav-bar
 * anchor links from non-home routes (which call `navigate('/', {state:
 * {scrollTo: 'experience'}})`) land at the right section instead of the
 * top. Two rAFs let the section layout settle before we measure and
 * scroll — without them, lazy/Suspense children below the fold can
 * misreport their position.
 */
function Home({ ready }) {
  const location = useLocation();
  useEffect(() => {
    const target = location.state?.scrollTo;
    if (!target) return;
    // Consume the scrollTo before the scroll fires. `history.replaceState`
    // clears it from the browser-level history entry without touching React
    // Router's in-memory location (so ScrollOnRouteChange doesn't see a
    // state change and race us back to 0). On the next reload, useLocation
    // hydrates state from the now-null history.state and this effect skips.
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", location.pathname + location.search);
    }
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.getElementById(target);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }, [location.pathname, location.search, location.state]);

  return (
    <>
      <Hero ready={ready} />
      <Manifesto />
      <Process />
      <Experience />
      <BuzzwordMarquee />
      <Tech />
      <SelectedWork />
      <Contact />
    </>
  );
}

const App = () => {
  // Flips true the moment the Preloader starts its reveal animation.
  // Passed down to the Hero so its enter animations fire as the
  // preloader peels away rather than playing invisibly behind it.
  const [pageReady, setPageReady] = useState(false);
  // Increments on every preloader replay. Passed as Preloader's `key`,
  // so a bump causes React to unmount the running preloader and remount
  // a fresh one from its initial phase — same behavior as a hard reload
  // without the actual reload.
  const [preloaderRunId, setPreloaderRunId] = useState(0);
  // Stable handler so Preloader's effect doesn't tear down on
  // App re-renders (it lists onReady in its dep array).
  const handlePreloaderReady = useCallback(() => setPageReady(true), []);
  // Triggered by the navbar's "experience" link when clicked from a
  // non-home route. Resetting pageReady first means Hero (which is
  // about to be remounted by the route change to /) starts at its
  // initial state and animates in alongside the preloader's reveal.
  const replayPreloader = useCallback(() => {
    setPageReady(false);
    setPreloaderRunId((id) => id + 1);
  }, []);

  return (
    <ThemeProvider>
      <LenisProvider>
        <GsapBootstrap />
        {/* Navbar, ScrollToTop, CustomCursor, and Preloader sit OUTSIDE
            Routes so they render on every page (Home, ProjectDetail, any
            future routes) without remounting on navigation. */}
        <div className='relative z-0'>
          <Navbar onReplayPreloader={replayPreloader} />
          <ScrollOnRouteChange />
          <Routes>
            <Route path='/' element={<Home ready={pageReady} />} />
            <Route path='/works' element={<AllWorks />} />
            <Route path='/works/:slug' element={<ProjectDetail />} />
          </Routes>
        </div>
        <ScrollToTop />
        <CustomCursor />
        <Preloader key={preloaderRunId} onReady={handlePreloaderReady} />
      </LenisProvider>
    </ThemeProvider>
  )
}

export default App
