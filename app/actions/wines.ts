'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { WineFormData, ImportedCellarRow } from '@/types'

async function getUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Not authenticated')
  return { supabase, user }
}

function parseFormData(data: WineFormData) {
  const toNum = (s: string) => { const n = Number(s); return s.trim() !== '' && Number.isFinite(n) ? n : null }
  return {
    producer: data.producer.trim(),
    wine: data.wine.trim() || null,
    vintage: toNum(data.vintage),
    type: data.type || null,
    varietal: data.varietal.trim() || null,
    region: data.region.trim() || null,
    quantity: toNum(data.quantity) ?? 1,
    size: data.size || '750 ml',
    location: data.location.trim() || null,
    price: toNum(data.price),
    window_start: toNum(data.window_start),
    peak_start: toNum(data.peak_start),
    peak_end: toNum(data.peak_end),
    window_end: toNum(data.window_end),
    notes: data.notes.trim() || null,
  }
}

export async function createWine(data: WineFormData) {
  const { supabase, user } = await getUser()
  const parsed = parseFormData(data)
  const { error } = await supabase.from('wines').insert({ ...parsed, user_id: user.id })
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}

export async function updateWine(id: string, data: WineFormData) {
  const { supabase } = await getUser()
  const parsed = parseFormData(data)
  const { error } = await supabase.from('wines').update(parsed).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}

export async function deleteWine(id: string) {
  const { supabase } = await getUser()
  const { error } = await supabase.from('wines').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}

export async function decrementWine(id: string) {
  const { supabase } = await getUser()
  const { data: wine, error: fetchErr } = await supabase
    .from('wines').select('quantity').eq('id', id).single()
  if (fetchErr || !wine) throw new Error('Wine not found')
  const newQty = Math.max(0, (wine.quantity ?? 0) - 1)
  const { error } = await supabase.from('wines').update({ quantity: newQty }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}

export async function bulkImportCellar(rows: ImportedCellarRow[]) {
  const { supabase, user } = await getUser()

  const { data: existing } = await supabase
    .from('wines').select('source_id').eq('user_id', user.id).not('source_id', 'is', null)
  const existingIds = new Set((existing ?? []).map(r => r.source_id))

  const toInsert = rows
    .filter(r => !r.source_id || !existingIds.has(r.source_id))
    .map(r => ({ ...r, user_id: user.id }))

  if (!toInsert.length) return { added: 0, skipped: rows.length }

  const { error } = await supabase.from('wines').insert(toInsert)
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
  return { added: toInsert.length, skipped: rows.length - toInsert.length }
}
