'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { matchLogToWine } from '@/lib/csv-parser'
import type { ImportedLogRow } from '@/types'

async function getUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Not authenticated')
  return { supabase, user }
}

export async function markDrunk(
  wineId: string,
  opts: { date: string; rating?: number | null; note?: string }
) {
  const { supabase, user } = await getUser()

  const { data: wine, error: fetchErr } = await supabase
    .from('wines').select('producer, wine, vintage, quantity').eq('id', wineId).single()
  if (fetchErr || !wine) throw new Error('Wine not found')

  const { error: logErr } = await supabase.from('consumption_log').insert({
    user_id: user.id,
    wine_id: wineId,
    date: opts.date,
    rating: opts.rating ?? null,
    note: opts.note?.trim() || null,
    value: wine.vintage ?? null,
    snapshot_producer: wine.producer,
    snapshot_wine: wine.wine,
    snapshot_vintage: wine.vintage,
  })
  if (logErr) throw new Error(logErr.message)

  const newQty = Math.max(0, (wine.quantity ?? 0) - 1)
  await supabase.from('wines').update({ quantity: newQty }).eq('id', wineId)

  revalidatePath('/', 'layout')
}

export async function bulkImportLog(rows: ImportedLogRow[]) {
  const { supabase, user } = await getUser()

  const { data: existingLog } = await supabase
    .from('consumption_log')
    .select('date, snapshot_producer, snapshot_vintage')
    .eq('user_id', user.id)

  const { data: wines } = await supabase
    .from('wines')
    .select('id, producer, wine, vintage, quantity')
    .eq('user_id', user.id)

  const wineList = wines ?? []

  const logSet = new Set(
    (existingLog ?? []).map(e => `${e.date}|${e.snapshot_producer}|${e.snapshot_vintage ?? ''}`)
  )

  let added = 0
  let matched = 0
  const toInsert = []

  for (const row of rows) {
    const key = `${row.date}|${row.wine_name}|${row.vintage ?? ''}`
    if (logSet.has(key)) continue

    const wineId = matchLogToWine(row.wine_name, row.vintage, wineList)
    const matchedWine = wineId ? wineList.find(w => w.id === wineId) : null

    if (wineId) matched++

    toInsert.push({
      user_id: user.id,
      wine_id: wineId,
      date: row.date,
      rating: null,
      note: row.note || null,
      value: row.value,
      snapshot_producer: matchedWine?.producer ?? row.wine_name,
      snapshot_wine: matchedWine?.wine ?? null,
      snapshot_vintage: row.vintage,
    })
    added++
  }

  if (toInsert.length) {
    const { error } = await supabase.from('consumption_log').insert(toInsert)
    if (error) throw new Error(error.message)
    revalidatePath('/', 'layout')
  }

  return { added, matched }
}
