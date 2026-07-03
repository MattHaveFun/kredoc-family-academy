import { upcomingEvents } from '../data/economicCalendar'

function formatEventDate(iso: string): { day: string; month: string } {
  const d = new Date(`${iso}T12:00:00`)
  return {
    day: String(d.getDate()).padStart(2, '0'),
    month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
  }
}

// The next five known market-moving events, from the manually maintained
// static calendar (src/data/economicCalendar.ts).
function EconomicCalendarPanel() {
  const events = upcomingEvents(5)

  return (
    <div className="panel flex h-full flex-col p-5">
      <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
        Coming up
      </h3>
      <p className="mt-1 text-[11px] text-slate-600">
        Scheduled events with a history of moving markets.
      </p>

      <ul className="mt-4 flex-1 space-y-2.5">
        {events.length === 0 && (
          <li className="text-xs text-slate-500">
            The event calendar needs a refresh — new dates land with the next site update.
          </li>
        )}
        {events.map((event, i) => {
          const { day, month } = formatEventDate(event.date)
          return (
            <li
              key={`${event.date}-${event.name}`}
              className="animate-fade-up flex gap-3 rounded-xl border border-slate-400/10 bg-ink-950/40 p-3"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg border border-sky-400/20 bg-sky-400/[0.06]">
                <span className="font-mono text-sm font-bold leading-none text-sky-300">{day}</span>
                <span className="mt-0.5 font-mono text-[8px] uppercase tracking-wider text-slate-500">
                  {month}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold leading-snug text-slate-200">{event.name}</p>
                <p className="mt-1 text-[11px] leading-snug text-slate-500">{event.why}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default EconomicCalendarPanel
