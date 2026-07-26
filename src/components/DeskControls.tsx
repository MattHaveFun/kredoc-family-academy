// Small shared controls for the Order Desk panels. Styled to match the console
// toolbar and OHLC stat strip on the main chart, so the desk reads as part of
// the same instrument rather than a bolted-on widget.

export function Pill({
  active,
  onClick,
  children,
  title,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  title?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`shrink-0 rounded-lg border px-3 py-1.5 font-mono text-[11px] font-semibold tracking-wide transition-all duration-200 ${
        active
          ? 'border-sky-400/40 bg-sky-400/10 text-sky-300 shadow-[0_0_20px_-6px_rgba(56,189,248,0.6)]'
          : 'border-transparent text-slate-500 hover:border-slate-400/15 hover:bg-slate-400/5 hover:text-slate-200'
      }`}
    >
      {children}
    </button>
  )
}

export function Stat({ label, value, tone }: { label: string; value: string; tone?: 'up' | 'down' }) {
  return (
    <div className="bg-ink-900/90 px-3 py-2.5">
      <dt className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-600">{label}</dt>
      <dd
        className={`mt-0.5 font-mono text-xs font-semibold tabular-nums sm:text-sm ${
          tone === 'up' ? 'text-up' : tone === 'down' ? 'text-down' : 'text-slate-200'
        }`}
      >
        {value}
      </dd>
    </div>
  )
}

export function Slider({
  label,
  value,
  min,
  max,
  step,
  suffix,
  prefix = '',
  signed = false,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  suffix: string
  prefix?: string
  /** Offsets read as "vs. today" and need an explicit +; magnitudes like a trail % do not. */
  signed?: boolean
  onChange: (v: number) => void
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-2">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
          {label}
        </span>
        <span className="font-mono text-xs font-semibold tabular-nums text-sky-300">
          {signed && value > 0 ? '+' : ''}
          {prefix}
          {value}
          {suffix}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-400/15 accent-sky-400"
      />
    </label>
  )
}
