import type { Wine, Urgency } from '@/types'

function num(v: number | null | undefined): number | null {
  if (v == null) return null
  return Number.isFinite(v) ? v : null
}

export function getUrgency(wine: Wine): Urgency {
  const year = new Date().getFullYear()
  const ws = num(wine.window_start)
  const ps = num(wine.peak_start)
  const pe = num(wine.peak_end)
  const we = num(wine.window_end)

  if (ws == null && ps == null && pe == null && we == null) {
    return { code: 'unknown', label: 'No window', order: 6, msg: 'No drinking window set' }
  }

  const earliest = ws ?? ps
  const latest = we ?? pe
  const peakStart = ps ?? ws
  const peakEnd = pe ?? we

  if (latest != null && year > latest) {
    const yrs = year - latest
    return { code: 'past', label: 'Past prime', order: 5, msg: `Past optimal by ${yrs} year${yrs === 1 ? '' : 's'}` }
  }

  if (latest != null && year >= latest - 1) {
    const left = latest - year + 1
    return { code: 'drink-now', label: 'Drink now', order: 1, msg: `Closing window — only ${left} year${left === 1 ? '' : 's'} left` }
  }

  if (peakEnd != null && year > peakEnd) {
    return { code: 'drink-now', label: 'Drink now', order: 1, msg: `Past peak; drink before ${latest ?? peakEnd + 2}` }
  }

  if (peakStart != null && peakEnd != null && year >= peakStart && year <= peakEnd) {
    return { code: 'peak', label: 'In peak', order: 2, msg: `In peak window through ${peakEnd}` }
  }

  if (peakStart != null && year >= peakStart - 2 && year < peakStart) {
    const yrs = peakStart - year
    return { code: 'approaching', label: 'Approaching', order: 3, msg: `Peak begins in ${yrs} year${yrs === 1 ? '' : 's'}` }
  }

  if (earliest != null && year >= earliest && (peakStart == null || year < peakStart)) {
    return { code: 'approaching', label: 'Approaching', order: 3, msg: 'Drinkable; not yet at peak' }
  }

  if (earliest != null && year < earliest) {
    return { code: 'young', label: 'Cellar it', order: 4, msg: `Earliest drink date: ${earliest}` }
  }

  return { code: 'unknown', label: 'No window', order: 6, msg: 'Insufficient window data' }
}

export const URGENCY_TITLES: Record<string, string> = {
  'drink-now': 'DRINK NOW',
  'peak': 'IN PEAK WINDOW',
  'approaching': 'APPROACHING PEAK',
  'young': 'STILL YOUNG',
  'past': 'PAST PRIME',
  'unknown': 'NO WINDOW SET',
}

export const URGENCY_DESCS: Record<string, string> = {
  'drink-now': "Don't let these slip away",
  'peak': 'Open with intention',
  'approaching': 'Patience rewarded soon',
  'young': 'Let them rest',
  'past': 'Possibly fading',
  'unknown': 'Window not recorded',
}

export function bucketize(wines: Wine[]): Record<string, { wine: Wine; urgency: Urgency }[]> {
  const b: Record<string, { wine: Wine; urgency: Urgency }[]> = {
    'drink-now': [], 'peak': [], 'approaching': [], 'young': [], 'past': [], 'unknown': [],
  }
  for (const w of wines) {
    const u = getUrgency(w)
    b[u.code].push({ wine: w, urgency: u })
  }
  for (const k of Object.keys(b)) {
    b[k].sort((a, z) => (a.wine.vintage ?? 0) - (z.wine.vintage ?? 0))
  }
  return b
}
