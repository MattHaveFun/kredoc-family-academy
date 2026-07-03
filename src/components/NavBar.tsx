import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const LINKS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/academy', label: 'Academy', end: false },
  { to: '/about', label: 'About', end: false },
]

function NavBar() {
  const [open, setOpen] = useState(false)

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
      isActive ? 'bg-slate-800 text-sky-300' : 'text-slate-400 hover:text-slate-100'
    }`

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <NavLink to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-sky-500/10 font-mono text-sm font-bold text-sky-400">
            K
          </span>
          <span className="text-sm font-semibold tracking-wide text-slate-100">
            Kredoc <span className="text-slate-500">Family Academy</span>
          </span>
        </NavLink>

        <nav className="hidden items-center gap-1 sm:flex">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="rounded-md border border-slate-800 p-2 text-slate-300 sm:hidden"
          aria-label="Toggle navigation"
          aria-expanded={open}
        >
          <span className="block h-0.5 w-5 bg-current" />
          <span className="mt-1 block h-0.5 w-5 bg-current" />
          <span className="mt-1 block h-0.5 w-5 bg-current" />
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-slate-800 px-4 py-3 sm:hidden">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClass} onClick={() => setOpen(false)}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}

export default NavBar
