import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// Tell the browser not to restore scroll position on reload. Default 'auto'
// behavior was landing visitors mid-page (e.g. on the Experience section)
// after a refresh, sometimes firing AFTER our own scrollTo(0) on mount and
// overriding it. We own scroll positioning explicitly via ScrollOnRouteChange
// in App.jsx, so 'manual' avoids the race.
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual'
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
