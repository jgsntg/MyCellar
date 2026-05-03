import type { Wine, LogEntry } from '@/types'
import { bucketize } from '@/lib/drinkability'

type Stat = { label: string; value: string; sub: string }

export function DashboardStats({ wines, log }: { wines: Wine[]; log: LogEntry[] }) {
  const active = wines.filter(w => (w.quantity ?? 0) > 0)
  const totalBottles = active.reduce((s, w) => s + (w.quantity ?? 0), 0)
  const totalValue = active.reduce((s, w) => s + (w.price ?? 0) * (w.quantity ?? 0), 0)
  const buckets = bucketize(active)
  const drinkNow = buckets['drink-now'].length
  const past = buckets['past'].length
  const oldest = active.reduce((acc: Wine | null, w) => (w.vintage && (!acc || w.vintage < (acc.vintage ?? 9999))) ? w : acc, null)
  const youngest = active.reduce((acc: Wine | null, w) => (w.vintage && (!acc || w.vintage > (acc.vintage ?? 0))) ? w : acc, null)

  const stats: Stat[] = [
    { label: 'Bottles Held', value: String(totalBottles), sub: `across ${active.length} unique entr${active.length === 1 ? 'y' : 'ies'}` },
    { label: 'Estimated Value', value: `$${totalValue.toFixed(0)}`, sub: 'at recorded purchase prices' },
    { label: 'Drink Now', value: String(drinkNow), sub: drinkNow ? 'closing or past peak' : 'nothing urgent' },
    { label: 'Past Prime', value: String(past), sub: past ? 'consider drinking soon' : 'no losses' },
    { label: 'Consumed', value: String(log.length), sub: 'bottles in the log' },
    { label: 'Oldest Vintage', value: oldest?.vintage ? String(oldest.vintage) : '—', sub: oldest ? truncate(oldest.producer, 24) : '' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {stats.map((s, i) => (
        <div
          key={i}
          className="relative bg-card border border-border rounded-sm p-5 shadow-sm overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-[var(--burgundy)]" />
          <p className="font-display-sc text-[10px] tracking-[2px] text-muted-foreground">{s.label}</p>
          <p className={`font-display text-4xl font-medium leading-none mt-2.5 ${i === 2 ? 'text-[var(--rust)]' : i === 3 ? 'text-muted-foreground' : 'text-[var(--burgundy-deep)]'}`}>
            {s.value}
          </p>
          <p className="font-display italic text-[13px] text-muted-foreground mt-1.5">{s.sub}</p>
        </div>
      ))}
    </div>
  )
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s
}
