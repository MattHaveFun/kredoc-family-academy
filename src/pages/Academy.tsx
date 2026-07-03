import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { ACADEMY_SECTIONS } from '../data/academyContent'

function Academy() {
  const location = useLocation()

  useEffect(() => {
    if (!location.hash) return
    const el = document.getElementById(location.hash.slice(1))
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [location.hash])

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-sky-500">The Academy</p>
      <h1 className="mt-1 text-2xl font-bold text-slate-50 sm:text-3xl">
        Every dashboard concept, explained like you're smart and busy
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-slate-400">
        No jargon left unexplained. Each section below breaks down a concept from the dashboard — what it
        is, why it matters, and just enough personality to make it stick.
      </p>

      <div className="mt-10 space-y-10">
        {ACADEMY_SECTIONS.map((section) => (
          <article
            key={section.id}
            id={section.id}
            className="scroll-mt-24 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-lg"
          >
            <span className="inline-block rounded-full bg-sky-500/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-sky-400">
              {section.tag}
            </span>
            <h2 className="mt-3 text-xl font-bold text-slate-50">{section.title}</h2>
            <p className="mt-1 text-sm font-medium italic text-slate-500">{section.tldr}</p>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-300">
              {section.body.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default Academy
