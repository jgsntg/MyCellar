'use client'

import { useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { parseCSV, detectFileType, parseCellarRows, parseConsumedRows } from '@/lib/csv-parser'
import { bulkImportCellar } from '@/app/actions/wines'
import { bulkImportLog } from '@/app/actions/log'

type Summary = {
  files: Array<{ name: string; kind: string; count: number; matched?: number; error?: string }>
  totalCellar: number
  totalLog: number
}

export function ImportCsv() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [pending, startTransition] = useTransition()
  const [summary, setSummary] = useState<Summary | null>(null)

  const handleFiles = (files: FileList | null) => {
    if (!files?.length) return
    startTransition(async () => {
      const result: Summary = { files: [], totalCellar: 0, totalLog: 0 }
      for (const file of Array.from(files)) {
        try {
          const text = await readAsText(file)
          const rows = parseCSV(text)
          if (!rows.length) { result.files.push({ name: file.name, kind: 'empty', count: 0 }); continue }
          const kind = detectFileType(rows[0])
          if (kind === 'cellar') {
            const parsed = parseCellarRows(rows)
            const res = await bulkImportCellar(parsed)
            result.totalCellar += res.added
            result.files.push({ name: file.name, kind: 'cellar', count: res.added })
          } else if (kind === 'consumed') {
            const parsed = parseConsumedRows(rows)
            const res = await bulkImportLog(parsed)
            result.totalLog += res.added
            result.files.push({ name: file.name, kind: 'consumed', count: res.added, matched: res.matched })
          } else {
            const parsed = parseCellarRows(rows)
            const res = await bulkImportCellar(parsed)
            result.totalCellar += res.added
            result.files.push({ name: file.name, kind: 'unknown (treated as cellar)', count: res.added })
          }
        } catch (err: any) {
          result.files.push({ name: file.name, kind: 'error', count: 0, error: err.message })
        }
      }
      setSummary(result)
      const parts = []
      if (result.totalCellar) parts.push(`${result.totalCellar} bottle${result.totalCellar === 1 ? '' : 's'} added`)
      if (result.totalLog) parts.push(`${result.totalLog} log entr${result.totalLog === 1 ? 'y' : 'ies'} added`)
      if (parts.length) toast.success(parts.join(' · '))
      else toast.info('Nothing new to import')
      if (inputRef.current) inputRef.current.value = ''
    })
  }

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        multiple
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />
      <Button
        onClick={() => inputRef.current?.click()}
        disabled={pending}
        className="bg-[var(--gold)] hover:bg-[var(--gold)] hover:brightness-95 text-[var(--ink)] border-none"
      >
        {pending ? 'Importing…' : 'Choose CSV File(s)'}
      </Button>

      {summary && summary.files.length > 0 && (
        <div className="bg-[var(--gold)/8] border border-[var(--gold)/30] rounded-sm p-4 space-y-1">
          <p className="font-display-sc text-[11px] tracking-[2px] text-[var(--burgundy)] mb-2">IMPORT SUMMARY</p>
          {summary.files.map((f, i) => (
            <p key={i} className="font-display text-sm">
              {f.kind === 'error' ? (
                <span className="text-destructive">{f.name} — error: {f.error}</span>
              ) : f.kind === 'consumed' ? (
                <span>{f.name} — <em>consumption log</em>: {f.count} entries ({f.matched} matched to cellar)</span>
              ) : f.kind === 'empty' ? (
                <span className="text-muted-foreground">{f.name} — empty</span>
              ) : (
                <span>{f.name} — <em>{f.kind}</em>: {f.count} bottles</span>
              )}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

function readAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = ev => {
      const buf = new Uint8Array(ev.target!.result as ArrayBuffer)
      let text: string
      if (buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) {
        text = new TextDecoder('utf-8').decode(buf.slice(3))
      } else {
        const utf8 = new TextDecoder('utf-8', { fatal: false }).decode(buf)
        text = utf8.includes('�') ? new TextDecoder('windows-1252').decode(buf) : utf8
      }
      resolve(text)
    }
    reader.onerror = () => reject(new Error('Could not read ' + file.name))
    reader.readAsArrayBuffer(file)
  })
}
