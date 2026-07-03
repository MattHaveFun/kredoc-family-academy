import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ACADEMY_SECTIONS } from '../data/academyContent'

function Academy() {
  const location = useLocation()
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    if (!location.hash) return
    const el = document.getElementById(location.hash.slice(1))
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [location.hash])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
            break
          }
        }
      },
      { rootMargin: '-15% 0px -70% 0px' },
    )
    for (const section of ACADEMY_SECTIONS) {
      const el = document.getElementById(section.id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [])

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header className="max-w-3xl animate-fade-up">
        <p className="eyebrow">The Academy</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
          Every dashboard concept, explained like you're smart and busy
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
          No jargon left unexplained. Each section below breaks down a concept from the dashboard —
          what it is, why it matters, and just enough personality to make it stick.
        </p>
      </header>

      <div className="mt-12 flex gap-12">
        <nav
          className="sticky top-24 hidden w-56 shrink-0 animate-fade-up self-start lg:block"
          style={{ animationDelay: '100ms' }}
          aria-label="Academy contents"
        >
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-600">
            Contents
          </p>
          <ul className="mt-4 space-y-0.5 border-l border-slate-400/10">
            {ACADEMY_SECTIONS.map((section, i) => (
              <li key={section.id}>
                <Link
                  to={`/academy#${section.id}`}
                  className={`-ml-px flex items-baseline gap-2.5 border-l-2 py-1.5 pl-4 text-xs transition-all duration-200 ${
                    activeId === section.id
                      ? 'border-sky-400 font-semibold text-sky-300'
                      : 'border-transparent text-slate-500 hover:border-slate-400/40 hover:text-slate-200'
                  }`}
                >
                  <span className="font-mono text-[10px] tabular-nums text-slate-600">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {section.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 flex-1 space-y-8">
          {ACADEMY_SECTIONS.map((section, i) => (
            <article
              key={section.id}
              id={section.id}
              className="panel animate-fade-up scroll-mt-28 p-6 sm:p-8"
              style={{ animationDelay: `${Math.min(i, 4) * 80}ms` }}
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs tabular-nums text-slate-600">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="h-px w-6 bg-slate-400/20" />
                <span className="inline-flex items-center rounded-full border border-sky-400/20 bg-sky-400/[0.07] px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-sky-300">
                  {section.tag}
                </span>
              </div>
              <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-slate-50">
                {section.title}
              </h2>
              <p className="mt-3 border-l-2 border-sky-400/50 pl-3.5 text-sm font-medium italic text-sky-200/70">
                {section.tldr}
              </p>
              <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-slate-300">
                {section.body.map((paragraph, j) => (
                  <p key={j}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Academy
