import { useCallback, useEffect, useState } from 'react';
import { BuzzwordMarquee, Contact, CustomCursor, Experience, Hero, Manifesto, Navbar, Preloader, ScrollToTop, SelectedWork, Tech } from './components';
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

const App = () => {
  // Flips true the moment the Preloader starts its reveal animation.
  // Passed down to the Hero so its enter animations fire as the
  // preloader peels away rather than playing invisibly behind it.
  const [pageReady, setPageReady] = useState(false);
  // Stable handler so Preloader's effect doesn't tear down on
  // App re-renders (it lists onReady in its dep array).
  const handlePreloaderReady = useCallback(() => setPageReady(true), []);

  return (
    <ThemeProvider>
      <LenisProvider>
        <GsapBootstrap />
        <div className='relative z-0'>
          <Navbar />
          <Hero ready={pageReady} />
          <Manifesto />
          <Experience />
          <BuzzwordMarquee />
          <Tech />
          <SelectedWork />
          <Contact />
        </div>
        <ScrollToTop />
        <CustomCursor />
        <Preloader onReady={handlePreloaderReady} />
      </LenisProvider>
    </ThemeProvider>
  )
}

export default App
