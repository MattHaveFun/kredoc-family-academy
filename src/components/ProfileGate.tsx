import { useState } from 'react'
import {
  AVATAR_COLORS,
  AVATAR_EMOJI,
  LEARNING_MODE_META,
  MAX_PROFILES,
  useProfiles,
} from '../context/ProfileContext'
import type { LearningMode } from '../data/lessons'

// Full-screen "Who's learning today?" gate shown whenever no profile is
// active — first visit, or after switching profiles from the nav chip.
function ProfileGate() {
  const { profiles, createProfile, selectProfile } = useProfiles()
  const [creating, setCreating] = useState(profiles.length === 0)
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState(AVATAR_EMOJI[0])
  const [color, setColor] = useState(AVATAR_COLORS[0])
  const [mode, setMode] = useState<LearningMode>('gut-check')

  const submit = () => {
    if (!name.trim()) return
    createProfile({ name, emoji, color, learningMode: mode })
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl animate-fade-up">
        <p className="eyebrow text-center">Kredoc Family Academy</p>
        <h1 className="mt-3 text-center font-display text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
          {creating ? 'Set up your profile' : "Who's learning today?"}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-center text-sm leading-relaxed text-slate-400">
          {creating
            ? 'Pick a name, an avatar, and how you like to learn. Everything stays on this device — no accounts, no emails.'
            : 'Your progress, quiz style, and place in the Academy are saved per person.'}
        </p>

        {!creating && (
          <>
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {profiles.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => selectProfile(p.id)}
                  className="panel group animate-fade-up flex flex-col items-center gap-3 px-4 py-6 transition-all duration-300 hover:-translate-y-1 hover:border-slate-400/25"
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <span
                    className="grid h-16 w-16 place-items-center rounded-full text-3xl ring-2 transition-shadow duration-300 group-hover:shadow-[0_0_28px_-4px_var(--ring)]"
                    style={{ backgroundColor: `${p.color}1a`, borderColor: p.color, ['--ring' as string]: p.color, boxShadow: `inset 0 0 0 2px ${p.color}55` }}
                  >
                    {p.emoji}
                  </span>
                  <span className="text-sm font-semibold text-slate-100">{p.name}</span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                    {p.completedLessons.length} lessons done
                  </span>
                </button>
              ))}
              {profiles.length < MAX_PROFILES && (
                <button
                  type="button"
                  onClick={() => setCreating(true)}
                  className="animate-fade-up flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-400/25 px-4 py-6 text-slate-500 transition-all duration-300 hover:-translate-y-1 hover:border-sky-400/40 hover:text-sky-300"
                  style={{ animationDelay: `${profiles.length * 70}ms` }}
                >
                  <span className="grid h-16 w-16 place-items-center rounded-full border border-dashed border-current text-3xl">
                    +
                  </span>
                  <span className="text-sm font-semibold">New profile</span>
                </button>
              )}
            </div>
          </>
        )}

        {creating && (
          <div className="panel mt-10 space-y-7 p-6 sm:p-8">
            <div>
              <label htmlFor="profile-name" className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Name
              </label>
              <input
                id="profile-name"
                type="text"
                value={name}
                maxLength={24}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                placeholder="e.g. Matt, Guest…"
                className="mt-2 w-full rounded-xl border border-slate-400/15 bg-ink-950/70 px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:border-sky-400/50 focus:outline-none focus:ring-2 focus:ring-sky-400/20"
                autoFocus
              />
            </div>

            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Avatar</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {AVATAR_EMOJI.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setEmoji(e)}
                    className={`grid h-10 w-10 place-items-center rounded-lg border text-xl transition-all duration-200 ${
                      emoji === e
                        ? 'border-sky-400/50 bg-sky-400/10 shadow-[0_0_16px_-4px_rgba(56,189,248,0.6)]'
                        : 'border-slate-400/10 hover:border-slate-400/30'
                    }`}
                    aria-pressed={emoji === e}
                  >
                    {e}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                {AVATAR_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`h-8 w-8 rounded-full transition-transform duration-200 ${color === c ? 'scale-110 ring-2 ring-white/70 ring-offset-2 ring-offset-ink-950' : 'opacity-70 hover:opacity-100'}`}
                    style={{ backgroundColor: c }}
                    aria-label={`Accent color ${c}`}
                    aria-pressed={color === c}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                How do you like to learn? <span className="normal-case tracking-normal text-slate-600">(changeable anytime)</span>
              </p>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {(Object.keys(LEARNING_MODE_META) as LearningMode[]).map((m) => {
                  const meta = LEARNING_MODE_META[m]
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMode(m)}
                      className={`rounded-xl border p-3.5 text-left transition-all duration-200 ${
                        mode === m
                          ? 'border-sky-400/40 bg-sky-400/[0.08] shadow-[0_0_20px_-8px_rgba(56,189,248,0.6)]'
                          : 'border-slate-400/10 hover:border-slate-400/25'
                      }`}
                      aria-pressed={mode === m}
                    >
                      <span className="text-lg">{meta.icon}</span>
                      <p className="mt-1 text-sm font-semibold text-slate-100">{meta.label}</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-500">{meta.description}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              {profiles.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setCreating(false)}
                  className="text-xs font-medium text-slate-500 transition-colors hover:text-slate-200"
                >
                  ← Back to profiles
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                onClick={submit}
                disabled={!name.trim()}
                className="rounded-xl bg-sky-400/15 px-6 py-3 font-mono text-sm font-semibold uppercase tracking-wider text-sky-300 ring-1 ring-inset ring-sky-400/40 transition-all duration-200 hover:bg-sky-400/25 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Start learning →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfileGate
