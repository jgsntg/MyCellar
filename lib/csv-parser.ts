import type { ImportedCellarRow, ImportedLogRow } from '@/types'

export function parseCSV(text: string): Record<string, string>[] {
  const lines: string[][] = []
  let cur = '', row: string[] = [], inQ = false, i = 0
  text = text.replace(/^﻿/, '')

  while (i < text.length) {
    const c = text[i]
    if (inQ) {
      if (c === '"' && text[i + 1] === '"') { cur += '"'; i += 2; continue }
      if (c === '"') { inQ = false; i++; continue }
      cur += c; i++; continue
    }
    if (c === '"') { inQ = true; i++; continue }
    if (c === ',') { row.push(cur); cur = ''; i++; continue }
    if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(cur); lines.push(row); row = []; cur = ''; i++; continue
    }
    cur += c; i++
  }
  if (cur.length || row.length) { row.push(cur); lines.push(row) }
  if (!lines.length) return []

  const headers = lines[0].map(h => h.trim())
  return lines.slice(1)
    .filter(r => r.length && r.some(c => c.trim() !== ''))
    .map(r => {
      const obj: Record<string, string> = {}
      headers.forEach((h, idx) => { obj[h] = r[idx] != null ? String(r[idx]).trim() : '' })
      return obj
    })
}

export function detectFileType(row: Record<string, string>): 'cellar' | 'consumed' | 'unknown' {
  const keys = Object.keys(row)
  if (keys.includes('Consumed') && keys.includes('Wine')) return 'consumed'
  if (keys.includes('Producer') && (keys.includes('Quantity') || keys.includes('TotalQuantity'))) return 'cellar'
  if (keys.includes('Producer') && keys.includes('Wine')) return 'cellar'
  return 'unknown'
}

function get(row: Record<string, string>, keys: string[]): string {
  for (const k of keys) if (row[k] != null && row[k].trim() !== '') return row[k].trim()
  return ''
}

function toNum(s: string): number | null {
  if (!s) return null
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

function normalizeSize(s: string): string {
  const t = s.toLowerCase().replace(/\s+/g, '')
  if (t === '750ml' || t === '750') return '750 ml'
  if (t === '375ml') return '375 ml'
  if (t === '500ml') return '500 ml'
  if (t === '1.5l' || t === '1500ml') return '1.5 L (Magnum)'
  if (t === '3l' || t === '3000ml') return '3 L (Double Magnum)'
  return s || '750 ml'
}

export function parseCellarRows(rows: Record<string, string>[]): ImportedCellarRow[] {
  return rows.flatMap(r => {
    const producer = get(r, ['Producer', 'producer', 'Winery'])
    if (!producer) return []

    const color = get(r, ['Color', 'Type'])
    let type = ''
    if (/^(red|white|ros[eé]|sparkling|dessert|fortified)$/i.test(color)) {
      type = color.charAt(0).toUpperCase() + color.slice(1).toLowerCase()
      if (type.toLowerCase() === 'rose') type = 'Rosé'
    } else {
      type = color
    }

    const priceStr = get(r, ['Price'])
    const valueStr = get(r, ['Value'])
    const price = toNum(priceStr) || toNum(valueStr)

    const wsRaw = get(r, ['BeginConsume', 'Begin', 'EarliestConsume'])
    const weRaw = get(r, ['EndConsume', 'End', 'LatestConsume'])
    const wsNum = toNum(wsRaw)
    const weNum = toNum(weRaw)

    return [{
      source_id: get(r, ['iWine']) || null,
      producer,
      wine: get(r, ['Wine', 'wine', 'Designation']),
      vintage: toNum(get(r, ['Vintage', 'vintage'])),
      type,
      varietal: get(r, ['Varietal', 'Variety', 'MasterVarietal']),
      region: get(r, ['Region', 'Subregion']) || get(r, ['Locale']) || get(r, ['Country']),
      country: get(r, ['Country']),
      quantity: toNum(get(r, ['Quantity', 'TotalQuantity', 'Bottles'])) ?? 1,
      size: normalizeSize(get(r, ['Size', 'Bottle Size'])),
      price: price ?? null,
      window_start: wsNum && wsNum < 9000 ? wsNum : null,
      window_end: weNum && weNum < 9000 ? weNum : null,
    }]
  })
}

function parseConsumedDate(s: string): string | null {
  const m = s.match(/^(\d{1,2})[/\-](\d{1,2})[/\-](\d{2,4})$/)
  if (m) {
    let [, mo, da, yr] = m
    if (yr.length === 2) yr = '20' + yr
    return `${yr}-${mo.padStart(2, '0')}-${da.padStart(2, '0')}`
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  const d = new Date(s)
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10)
  return null
}

export function parseConsumedRows(rows: Record<string, string>[]): ImportedLogRow[] {
  return rows.flatMap(r => {
    const dateStr = r['Consumed']?.trim()
    const wineName = r['Wine']?.trim()
    if (!dateStr || !wineName) return []
    const date = parseConsumedDate(dateStr)
    if (!date) return []
    return [{
      date,
      wine_name: wineName,
      vintage: toNum(r['Vintage']?.trim() ?? ''),
      note: r['ConsumptionNote']?.trim() ?? '',
      value: toNum(r['Value']?.trim() ?? ''),
    }]
  })
}

function normalizeWineName(s: string): string {
  return String(s || '').toLowerCase().replace(/['']/g, "'").replace(/[,.]/g, ' ').replace(/\s+/g, ' ').trim()
}

function levenshteinClose(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 4) return false
  const m = a.length, n = b.length
  const dp: number[] = Array(n + 1).fill(0).map((_, i) => i)
  for (let i = 1; i <= m; i++) {
    let prev = i - 1
    dp[0] = i
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j]
      dp[j] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, dp[j], dp[j - 1])
      prev = tmp
      if (dp[j] > 3 && j === n) return false
    }
  }
  return dp[n] <= 3
}

export function matchLogToWine(
  wineName: string,
  vintage: number | null,
  wines: Array<{ id: string; producer: string; wine: string | null; vintage: number | null; quantity: number }>
): string | null {
  const target = normalizeWineName(wineName)
  for (const w of wines) {
    if ((w.quantity ?? 0) <= 0) continue
    const wv = w.vintage ?? null
    if (vintage && wv && wv !== vintage) continue
    if (vintage && !wv) continue
    if (!vintage && wv) continue
    const producer = normalizeWineName(w.producer)
    const wineField = normalizeWineName(w.wine ?? '')
    let candidate: string
    if (wineField.startsWith(producer + ' ') || wineField === producer) {
      candidate = wineField
    } else if (wineField) {
      candidate = `${producer} ${wineField}`
    } else {
      candidate = producer
    }
    if (candidate === target || levenshteinClose(candidate, target)) return w.id
  }
  return null
}
