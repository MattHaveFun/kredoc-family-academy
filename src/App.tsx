import { lazy, Suspense, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import About from './pages/About'
import NotFound from './pages/NotFound'
import Profile from './pages/Profile'
import DailyBrief from './pages/DailyBrief'

// Academy pages are lazy-loaded to keep the initial dashboard bundle lean —
// the knowledge map in particular pulls in d3-force.
const AcademyHome = lazy(() => import('./pages/AcademyHome'))
const Lesson = lazy(() => import('./pages/Lesson'))
const KnowledgeMap = lazy(() => import('./pages/KnowledgeMap'))

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-slate-600">Loading…</p>
    </div>
  )
}

// On phones the Daily Brief is the default entry point (once per session);
// the full dashboard stays one tap away via "Full Dashboard" in the nav.
function HomeGate() {
  const [redirectToBrief] = useState(() => {
    const isMobile = window.matchMedia('(max-width: 767px)').matches
    if (isMobile && !sessionStorage.getItem('kredoc.entered')) {
      sessionStorage.setItem('kredoc.entered', '1')
      return true
    }
    return false
  })
  return redirectToBrief ? <Navigate to="/brief" replace /> : <Dashboard />
}

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomeGate />} />
          <Route path="/brief" element={<DailyBrief />} />
          <Route path="/academy" element={<AcademyHome />} />
          <Route path="/academy/lesson/:lessonId" element={<Lesson />} />
          <Route path="/academy/map" element={<KnowledgeMap />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
