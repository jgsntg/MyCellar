import type { Wine, Urgency } from '@/types'
import { bucketize, URGENCY_TITLES, URGENCY_DESCS } from '@/lib/drinkability'

const ORDER = ['drink-now', 'peak', 'approaching', 'young', 'past'] as const

export function UrgencyCards({ wines, compact = false }: { wines: Wine[]; compact?: boolean }) {
  const active = wines.filter(w => (w.quantity ?? 0) > 0)
  const buckets = bucketize(active)

  const cards = ORDER.filter(code => !compact || buckets[code].length > 0)

  if (!cards.length) {
    return (
      <div className="bg-card border border-dashed border-border rounded-sm p-16 text-center">
        <p className="font-display italic text-muted-foreground text-lg">
          Your cellar awaits its first bottle.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
      {cards.map(code => {
        const items = buckets[code]
        const limit = compact ? 5 : 999
        const shown = items.slice(0, limit)
        const extra = items.length - shown.length
        return (
          <div key={code} className="bg-card border border-border rounded-sm p-4 shadow-sm">
            <h3 className={`font-display-sc text-[11px] tracking-[2px] pb-2 mb-3 border-b border-dashed border-border urgency-header-${code}`}>
              {URGENCY_TITLES[code]}
            </h3>
            <p className="font-display text-5xl text-[var(--burgundy-deep)] leading-none mb-1">
              {items.length}
            </p>
            <p className="font-display italic text-[13px] text-muted-foreground mb-3">
              {URGENCY_DESCS[code]}
            </p>
            {shown.length > 0 && (
              <ul className="space-y-0 max-h-52 overflow-y-auto">
                {shown.map(({ wine, urgency }: { wine: Wine; urgency: Urgency }) => (
                  <li key={wine.id} className="flex justify-between gap-2 py-1.5 border-b border-dotted border-border last:border-0 text-[13px]">
                    <span className="font-display font-medium truncate">{wine.producer}</span>
                    <span className="font-display italic text-muted-foreground flex-shrink-0">
                      {wine.vintage ?? '—'}
                    </span>
                  </li>
                ))}
                {extra > 0 && (
                  <li className="py-1.5 font-display italic text-muted-foreground text-xs">
                    + {extra} more
                  </li>
                )}
              </ul>
            )}
          </div>
        )
      })}
    </div>
  )
}
