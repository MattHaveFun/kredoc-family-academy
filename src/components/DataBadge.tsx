import { describeStatus, type DataStatus } from '../data/twelveDataService'

interface DataBadgeProps {
  status: DataStatus
  fetchedAt: number | null
  /** compact renders just the dot + short label for tight spots */
  compact?: boolean
}

const STYLES: Record<DataStatus, { className: string; dot: string; pulse: boolean }> = {
  live: { className: 'border-up/30 bg-up/10 text-up', dot: 'bg-up', pulse: true },
  cached: { className: 'border-sky-400/25 bg-sky-400/10 text-sky-300', dot: 'bg-sky-400', pulse: false },
  loading: { className: 'border-slate-400/20 bg-slate-400/5 text-slate-500', dot: 'bg-slate-500', pulse: false },
  unavailable: {
    className: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
    dot: 'bg-amber-400',
    pulse: false,
  },
}

// The site's honesty label: every market number carries LIVE, CACHED · Xm
// ago, or DATA UNAVAILABLE — never a fake feed dressed up as real.
function DataBadge({ status, fetchedAt, compact = false }: DataBadgeProps) {
  const style = STYLES[status]
  const label = describeStatus(status, fetchedAt)

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-mono font-semibold uppercase tracking-wider ${style.className} ${
        compact ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]'
      }`}
      title={`Data status: ${label}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        {style.pulse && (
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${style.dot}`} />
        )}
        <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${style.dot}`} />
      </span>
      {compact ? label.replace('DATA ', '') : label}
    </span>
  )
}

export default DataBadge
