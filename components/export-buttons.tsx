'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import type { Wine } from '@/types'

export function ExportButtons() {
  const [pending, startTransition] = useTransition()

  const handleExport = () => {
    startTransition(async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data: wines } = await supabase
          .from('wines').select('*').eq('user_id', user.id)

        const headers = ['Producer','Wine','Vintage','Type','Varietal','Region','Quantity','Size','Location','Price','BeginConsume','PeakStart','PeakEnd','EndConsume','Notes']
        const rows = ((wines ?? []) as Wine[]).map(w => [
          w.producer, w.wine, w.vintage, w.type, w.varietal, w.region,
          w.quantity, w.size, w.location, w.price,
          w.window_start, w.peak_start, w.peak_end, w.window_end, w.notes,
        ])
        const csv = [headers, ...rows].map(r => r.map(cell => {
          if (cell == null) return ''
          const s = String(cell)
          return /[,"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
        }).join(',')).join('\n')

        downloadBlob(new Blob([csv], { type: 'text/csv' }), `cellar-${stamp()}.csv`)
        toast.success('CSV downloaded')
      } catch (err: any) {
        toast.error(err.message ?? 'Export failed')
      }
    })
  }

  return (
    <Button variant="outline" onClick={handleExport} disabled={pending}>
      {pending ? 'Exporting…' : 'Export as CSV'}
    </Button>
  )
}

function downloadBlob(blob: Blob, name: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  document.body.appendChild(a)
  a.click()
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove() }, 100)
}

function stamp() {
  return new Date().toISOString().slice(0, 10)
}
