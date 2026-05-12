import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Contact, Experience, Hero, Manifesto, Navbar, SelectedWork, Tech } from './components';
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
          <div className='relative z-0'>
            <Navbar />
            <Hero />
            <Manifesto />
            <SelectedWork />
            <Experience />
            <Tech />
            <Contact />
          </div>
        </BrowserRouter>
      </LenisProvider>
    </ThemeProvider>
  )
}

export default App
