import { cn } from '@/lib/utils'
import { getUrgency } from '@/lib/drinkability'
import type { Wine } from '@/types'

const CLASS_MAP: Record<string, string> = {
  'drink-now': 'urgency-drink-now',
  'peak': 'urgency-peak',
  'approaching': 'urgency-approaching',
  'young': 'urgency-young',
  'past': 'urgency-past',
  'unknown': 'urgency-unknown',
}

export function UrgencyBadge({ wine }: { wine: Wine }) {
  const u = getUrgency(wine)
  return (
    <span
      className={cn(
        'inline-block px-2.5 py-0.5 rounded-full font-display-sc text-[10px] tracking-[1.5px] border whitespace-nowrap',
        CLASS_MAP[u.code]
      )}
    >
      {u.label}
    </span>
  )
}

export function UrgencyMsg({ wine }: { wine: Wine }) {
  const u = getUrgency(wine)
  return (
    <span className="font-display italic text-muted-foreground text-[12px]">{u.msg}</span>
  )
}
