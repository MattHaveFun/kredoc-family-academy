import { useState } from 'react'
import { Link } from 'react-router-dom'

interface InfoDisclosureProps {
  what: string
  why: string
  academyAnchor: string
}

function InfoDisclosure({ what, why, academyAnchor }: InfoDisclosureProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="mt-3 border-t border-slate-800 pt-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-xs font-medium uppercase tracking-wide text-slate-500 hover:text-slate-300"
        aria-expanded={open}
      >
        <span>What is this? Why should I care?</span>
        <span className="text-slate-600">{open ? '−' : '+'}</span>
      </button>

      {open && (
        <div className="mt-3 space-y-3 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-400">What is this?</p>
            <p className="mt-1 text-slate-300">{what}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-400">Why should I care?</p>
            <p className="mt-1 text-slate-300">{why}</p>
          </div>
          <Link
            to={`/academy#${academyAnchor}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
          >
            Learn more in the Academy →
          </Link>
        </div>
      )}
    </div>
  )
}

export default InfoDisclosure
