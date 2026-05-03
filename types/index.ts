export type Wine = {
  id: string
  user_id: string
  source_id: string | null
  producer: string
  wine: string | null
  vintage: number | null
  type: string | null
  varietal: string | null
  region: string | null
  country: string | null
  quantity: number
  size: string
  location: string | null
  price: number | null
  window_start: number | null
  peak_start: number | null
  peak_end: number | null
  window_end: number | null
  notes: string | null
  added_at: string
}

export type LogEntry = {
  id: string
  user_id: string
  wine_id: string | null
  date: string
  rating: number | null
  note: string | null
  value: number | null
  snapshot_producer: string
  snapshot_wine: string | null
  snapshot_vintage: number | null
  created_at: string
}

export type UrgencyCode = 'drink-now' | 'peak' | 'approaching' | 'young' | 'past' | 'unknown'

export type Urgency = {
  code: UrgencyCode
  label: string
  order: number
  msg: string
}

export type WineFormData = {
  producer: string
  wine: string
  vintage: string
  type: string
  varietal: string
  region: string
  quantity: string
  size: string
  location: string
  price: string
  window_start: string
  peak_start: string
  peak_end: string
  window_end: string
  notes: string
}

export type ImportedCellarRow = {
  source_id: string | null
  producer: string
  wine: string
  vintage: number | null
  type: string
  varietal: string
  region: string
  country: string
  quantity: number
  size: string
  price: number | null
  window_start: number | null
  window_end: number | null
}

export type ImportedLogRow = {
  date: string
  wine_name: string
  vintage: number | null
  note: string
  value: number | null
}
