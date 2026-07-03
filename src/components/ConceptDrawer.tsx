import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { CHART_CONCEPTS } from '../data/concepts'
import { LESSON_BY_ID } from '../data/lessons'

interface ConceptDrawerProps {
  conceptId: string | null
  onClose: () => void
}

// The click-to-learn slide-out: 420px right-side drawer that turns any chart
// element into a full mini-lesson without breaking the chart layout.
function ConceptDrawer({ conceptId, onClose }: ConceptDrawerProps) {
  // Keep the last concept mounted during the slide-out animation.
  const [rendered, setRendered] = useState(conceptId)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (conceptId) {
      setRendered(conceptId)
      setCopied(false)
    }
  }, [conceptId])

  useEffect(() => {
    if (!conceptId) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [conceptId, onClose])

  const concept = rendered ? CHART_CONCEPTS[rendered] : null
  const open = conceptId !== null

  const copyPrompt = async () => {
    if (!concept) return
    try {
      await navigator.clipboard.writeText(concept.aiPrompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable — the prompt is still selectable text
    }
  }

  // Portaled to <body>: ancestor panels carry a persistent transform from
  // their entrance animation, which would otherwise re-anchor (and clip)
  // this fixed-position drawer.
  return createPortal(
    <>
      {/* scrim */}
      <div
        className={`fixed inset-0 z-40 bg-ink-950/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-[420px] flex-col border-l border-slate-400/15 bg-ink-900/95 shadow-2xl backdrop-blur-xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={concept ? `Learn about ${concept.name}` : 'Concept details'}
      >
        {concept && (
          <>
            <div className="flex items-start justify-between gap-4 border-b border-slate-400/10 px-6 py-5">
              <div>
                <p className="eyebrow">Chart concept</p>
                <h2 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-slate-50">
                  {concept.name}
                </h2>
                <p className="mt-2 border-l-2 border-sky-400/50 pl-3 text-sm italic text-sky-200/70">
                  {concept.tagline}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-slate-400/15 text-slate-400 transition-colors hover:border-slate-400/35 hover:text-slate-100"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
              <div className="space-y-4 text-[15px] leading-relaxed text-slate-300">
                {concept.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              <div className="rounded-xl border border-amber-400/15 bg-amber-400/[0.05] p-4">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-300">
                  Real world example
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{concept.scenario}</p>
              </div>

              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  This connects to
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {concept.connects.map((lessonId) => {
                    const lesson = LESSON_BY_ID[lessonId]
                    if (!lesson) return null
                    return (
                      <Link
                        key={lessonId}
                        to={`/academy/lesson/${lessonId}`}
                        onClick={onClose}
                        className="rounded-full border border-sky-400/20 bg-sky-400/[0.07] px-3 py-1 text-xs font-medium text-sky-300 transition-colors hover:bg-sky-400/15"
                      >
                        {lesson.title}
                      </Link>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-xl border border-slate-400/10 bg-ink-950/60 p-4">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Go deeper — ask Claude
                </p>
                <p className="mt-2 text-sm italic leading-relaxed text-slate-400">
                  “{concept.aiPrompt}”
                </p>
                <button
                  type="button"
                  onClick={copyPrompt}
                  className="mt-3 rounded-lg border border-slate-400/20 px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-300 transition-colors hover:border-sky-400/40 hover:text-sky-300"
                >
                  {copied ? '✓ Copied' : 'Copy prompt'}
                </button>
              </div>
            </div>

            <div className="border-t border-slate-400/10 px-6 py-4">
              <Link
                to={`/academy/lesson/${concept.connects[0]}`}
                onClick={onClose}
                className="inline-flex items-center gap-1.5 font-mono text-sm font-semibold text-up transition-colors hover:text-emerald-300"
              >
                Read the full lesson →
              </Link>
            </div>
          </>
        )}
      </aside>
    </>,
    document.body,
  )
}

export default ConceptDrawer
