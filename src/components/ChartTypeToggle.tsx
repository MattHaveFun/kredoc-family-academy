export type ChartType = 'line' | 'candlestick'

interface ChartTypeToggleProps {
  value: ChartType
  onChange: (type: ChartType) => void
  /** Opens the "Line vs. Candlestick" concept drawer when set. */
  onLearnMore?: () => void
}

function ChartTypeToggle({ value, onChange, onLearnMore }: ChartTypeToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="inline-flex rounded-lg border border-slate-400/10 bg-ink-950/60 p-1 shadow-[inset_0_1px_0_rgba(148,163,184,0.05)]">
        {(['line', 'candlestick'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onChange(t)}
            className={`rounded-md px-3 py-1 font-mono text-xs font-semibold transition-all duration-200 ${
              value === t
                ? 'bg-sky-400/15 text-sky-300 shadow-[0_0_14px_-4px_rgba(56,189,248,0.6)]'
                : 'text-slate-500 hover:text-slate-200'
            }`}
          >
            {t === 'line' ? 'Line' : 'Candles'}
          </button>
        ))}
      </div>
      {onLearnMore && (
        <button
          type="button"
          onClick={onLearnMore}
          className="group/info relative grid h-6 w-6 shrink-0 place-items-center rounded-full border border-slate-400/15 text-[11px] font-semibold text-slate-500 transition-colors hover:border-sky-400/40 hover:text-sky-300"
          aria-label="What's the difference between line and candlestick charts?"
        >
          i
          <span className="pointer-events-none absolute right-0 top-full z-20 mt-1.5 w-52 rounded-lg border border-slate-400/15 bg-ink-950/95 px-3 py-2 text-left text-[11px] font-normal normal-case leading-snug tracking-normal text-sky-200/90 opacity-0 shadow-xl backdrop-blur transition-opacity duration-200 group-hover/info:opacity-100">
            Line vs. Candles — which view fits what you're checking. Click to learn more.
          </span>
        </button>
      )}
    </div>
  )
}

export default ChartTypeToggle
