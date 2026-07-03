import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// HashRouter (not BrowserRouter): GitHub Pages serves this app from two
// different paths depending on deployment stage — /kredoc-family-academy/
// today, and kredoc.me/ once the custom domain is live — with no server-side
// rewrites available. Hash-based routing works identically under both
// without a basename or a 404.html redirect hack.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
)
