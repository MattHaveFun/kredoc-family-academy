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
    <div className="mt-4 rounded-xl border border-slate-400/10 bg-ink-950/50">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3.5 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 transition-colors hover:text-sky-300"
        aria-expanded={open}
      >
        <span>What is this · Why should I care</span>
        <span
          className={`text-sm leading-none text-slate-600 transition-transform duration-200 ${
            open ? 'rotate-45' : ''
          }`}
        >
          +
        </span>
      </button>

      {open && (
        <div className="animate-fade-in space-y-4 border-t border-slate-400/10 px-3.5 py-4 text-sm">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-400">
              What is this
            </p>
            <p className="mt-1.5 leading-relaxed text-slate-300">{what}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-400">
              Why should I care
            </p>
            <p className="mt-1.5 leading-relaxed text-slate-300">{why}</p>
          </div>
          <Link
            to={`/academy#${academyAnchor}`}
            className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-up transition-colors hover:text-emerald-300"
          >
            Learn more in the Academy
            <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        </div>
      )}
    </div>
  )
}

export default InfoDisclosure
