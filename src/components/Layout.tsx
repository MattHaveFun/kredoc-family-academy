import { Outlet } from 'react-router-dom'
import NavBar from './NavBar'

function Layout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <NavBar />
      <Outlet />
      <footer className="border-t border-slate-800 py-8 text-center text-xs text-slate-600">
        Kredoc Family Academy — market data shown is illustrative, not live pricing.
      </footer>
    </div>
  )
}

export default Layout
