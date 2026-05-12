import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { About, Contact, Experience, Hero, Navbar, Tech, Works, StarsCanvas } from './components';
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
  return (
    <ThemeProvider>
      <LenisProvider>
        <GsapBootstrap />
        <BrowserRouter>
          <div className='relative z-0 bg-test'>
            <div>
              <Navbar />
              <Hero />
            </div>
            <About />
            <Experience />
            <Tech />
            <Works />
            <div className='relative z-0'>
              <Contact />
              <StarsCanvas />
            </div>
          </div>
        </BrowserRouter>
      </LenisProvider>
    </ThemeProvider>
  )
}

export default App
