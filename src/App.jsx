import { BrowserRouter } from 'react-router-dom';
import { About, Contact, Experience, Hero, Navbar, Tech, Works, StarsCanvas } from './components';
import { ThemeProvider } from './utils/theme';
import { LenisProvider } from './utils/lenis';

const App = () => {
  return (
    <ThemeProvider>
      <LenisProvider>
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
