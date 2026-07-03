import { useEffect, useState } from 'react'
import { LEARNING_MODE_META, useProfiles } from '../context/ProfileContext'
import type { LearningMode, Lesson } from '../data/lessons'

interface LearningModeCheckProps {
  lesson: Lesson
}

// The "check yourself" block at the end of each lesson, rendered in the
// learner's preferred mode (switchable via the gear without leaving the
// page). No scores, no pressure — answers are tracked, not graded.
function LearningModeCheck({ lesson }: LearningModeCheckProps) {
  const { activeProfile, setLearningMode, recordQuizAnswer } = useProfiles()
  const mode: LearningMode = activeProfile?.learningMode ?? 'gut-check'
  const [choice, setChoice] = useState<number | null>(null)
  const [showModePicker, setShowModePicker] = useState(false)

  // Fresh question when the lesson or mode changes.
  useEffect(() => {
    setChoice(null)
  }, [lesson.id, mode])

  const meta = LEARNING_MODE_META[mode]

  const answer = (index: number, correctIndex: number) => {
    if (choice !== null) return
    setChoice(index)
    recordQuizAnswer({
      lessonId: lesson.id,
      mode,
      choiceIndex: index,
      correct: index === correctIndex,
      answeredAt: Date.now(),
    })
  }

  const renderChoices = (prompt: string, options: string[], correctIndex: number, explanation: string) => (
    <>
      <p className="text-sm font-medium leading-relaxed text-slate-200">{prompt}</p>
      <div className="mt-3 space-y-2">
        {options.map((option, i) => {
          const picked = choice === i
          const revealed = choice !== null
          const isCorrect = i === correctIndex
          return (
            <button
              key={i}
              type="button"
              onClick={() => answer(i, correctIndex)}
              disabled={revealed}
              className={`w-full rounded-xl border px-4 py-3 text-left text-sm leading-snug transition-all duration-200 ${
                revealed
                  ? isCorrect
                    ? 'border-up/40 bg-up/10 text-slate-100'
                    : picked
                      ? 'border-down/40 bg-down/10 text-slate-300'
                      : 'border-slate-400/10 text-slate-500 opacity-60'
                  : 'border-slate-400/15 text-slate-300 hover:border-sky-400/40 hover:bg-sky-400/[0.06]'
              }`}
            >
              {revealed && isCorrect && <span className="mr-1.5">✓</span>}
              {revealed && picked && !isCorrect && <span className="mr-1.5">✗</span>}
              {option}
            </button>
          )
        })}
      </div>
      {choice !== null && (
        <div className="animate-fade-in mt-4 rounded-xl border border-sky-400/15 bg-sky-400/[0.05] p-4">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-300">
            {choice === correctIndex ? 'Nailed it' : 'The honest answer'}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-300">{explanation}</p>
        </div>
      )}
    </>
  )

  return (
    <div className="rounded-2xl border border-slate-400/15 bg-ink-950/50 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-300">
          {meta.icon} {meta.label}
        </p>
        <button
          type="button"
          onClick={() => setShowModePicker((s) => !s)}
          className="grid h-8 w-8 place-items-center rounded-lg border border-slate-400/15 text-sm text-slate-400 transition-colors hover:border-slate-400/35 hover:text-slate-100"
          aria-label="Change learning mode"
          title="Change learning mode"
        >
          ⚙
        </button>
      </div>

      {showModePicker && (
        <div className="animate-fade-in mt-3 flex flex-wrap gap-2">
          {(Object.keys(LEARNING_MODE_META) as LearningMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setLearningMode(m)
                setShowModePicker(false)
              }}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                m === mode
                  ? 'border-sky-400/40 bg-sky-400/10 text-sky-300'
                  : 'border-slate-400/15 text-slate-400 hover:border-slate-400/35 hover:text-slate-100'
              }`}
            >
              {LEARNING_MODE_META[m].icon} {LEARNING_MODE_META[m].label}
            </button>
          ))}
        </div>
      )}

      <div className="mt-4">
        {mode === 'gut-check' &&
          renderChoices(
            lesson.gutCheck.prompt,
            lesson.gutCheck.options,
            lesson.gutCheck.answerIndex,
            lesson.gutCheck.explanation,
          )}
        {mode === 'real-scenario' &&
          renderChoices(
            lesson.realScenario.prompt,
            lesson.realScenario.options,
            lesson.realScenario.answerIndex,
            lesson.realScenario.explanation,
          )}
        {mode === 'myth-vs-reality' && (
          <>
            <p className="border-l-2 border-amber-400/50 pl-3 text-sm font-medium italic leading-relaxed text-slate-200">
              “{lesson.mythVsReality.statement}”
            </p>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-600">
              Someone says this with total confidence. Is it true?
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {['True', 'False'].map((label, i) => {
                // The statement is true when it is NOT a myth.
                const correctIndex = lesson.mythVsReality.isMyth ? 1 : 0
                const picked = choice === i
                const revealed = choice !== null
                const isCorrect = i === correctIndex
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => answer(i, correctIndex)}
                    disabled={revealed}
                    className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                      revealed
                        ? isCorrect
                          ? 'border-up/40 bg-up/10 text-slate-100'
                          : picked
                            ? 'border-down/40 bg-down/10 text-slate-300'
                            : 'border-slate-400/10 text-slate-500 opacity-60'
                        : 'border-slate-400/15 text-slate-300 hover:border-sky-400/40 hover:bg-sky-400/[0.06]'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
            {choice !== null && (
              <div className="animate-fade-in mt-4 rounded-xl border border-sky-400/15 bg-sky-400/[0.05] p-4">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-300">
                  {lesson.mythVsReality.isMyth ? 'Myth' : 'Reality'}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
                  {lesson.mythVsReality.explanation}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default LearningModeCheck
