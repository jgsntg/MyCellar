import type { LogEntry } from '@/types'

export function ConsumptionLogList({ entries }: { entries: LogEntry[] }) {
  if (!entries.length) {
    return (
      <div className="bg-card border border-dashed border-border rounded-sm p-16 text-center">
        <p className="font-display italic text-muted-foreground text-lg">No bottles have been logged yet.</p>
      </div>
    )
  }

  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="space-y-3">
      {sorted.map(entry => {
        const stars = entry.rating
          ? '★'.repeat(entry.rating) + '☆'.repeat(5 - entry.rating)
          : null
        const dateStr = new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric',
        })

        return (
          <div key={entry.id} className="bg-card border border-border border-l-[3px] border-l-[var(--burgundy)] rounded-sm p-4 md:p-5">
            <div className="flex justify-between items-baseline gap-4 mb-1">
              <h4 className="font-display text-lg text-[var(--burgundy-deep)] font-medium leading-tight">
                {entry.snapshot_producer}
                {entry.snapshot_wine && <em className="italic text-[var(--burgundy)] font-normal"> · {entry.snapshot_wine}</em>}
                {entry.snapshot_vintage && <span className="text-[var(--burgundy)] ml-1">{entry.snapshot_vintage}</span>}
                {entry.value != null && (
                  <span className="font-display italic text-muted-foreground text-sm ml-2">
                    · ${Number(entry.value).toFixed(2)}
                  </span>
                )}
              </h4>
              <span className="font-display-sc text-[10px] tracking-[2px] text-[var(--gold)] flex-shrink-0">
                {dateStr}
              </span>
            </div>
            {stars && <p className="text-[var(--gold)] text-base tracking-widest">{stars}</p>}
            {entry.note && (
              <p className="font-display italic text-muted-foreground text-sm mt-2 leading-relaxed">
                &ldquo;{entry.note}&rdquo;
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
