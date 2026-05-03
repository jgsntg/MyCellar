'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { UrgencyBadge, UrgencyMsg } from '@/components/urgency-badge'
import { WineFormDialog } from '@/components/wine-form-dialog'
import { DrinkDialog } from '@/components/drink-dialog'
import { getUrgency } from '@/lib/drinkability'
import type { Wine } from '@/types'
import { cn } from '@/lib/utils'

type SortKey = 'producer' | 'vintage' | 'type' | 'region' | 'quantity' | 'urgency'
type Filter = { search: string; urgency: string; type: string; status: string }

const INITIAL_FILTER: Filter = { search: '', urgency: '', type: '', status: 'active' }

export function WineTable({ wines }: { wines: Wine[] }) {
  const [filter, setFilter] = useState<Filter>(INITIAL_FILTER)
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'urgency', dir: 'asc' })
  const [editWine, setEditWine] = useState<Wine | null>(null)
  const [drinkWine, setDrinkWine] = useState<Wine | null>(null)
  const [addOpen, setAddOpen] = useState(false)

  const setF = (k: keyof Filter, v: string) => setFilter(f => ({ ...f, [k]: v }))

  const handleSort = (key: SortKey) => {
    setSort(s => s.key === key ? { ...s, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' })
  }

  const rows = useMemo(() => {
    let r = wines.slice()

    if (filter.status === 'active') r = r.filter(w => (w.quantity ?? 0) > 0)
    else if (filter.status === 'consumed') r = r.filter(w => (w.quantity ?? 0) === 0)

    if (filter.search) {
      const q = filter.search.toLowerCase()
      r = r.filter(w =>
        `${w.producer} ${w.wine ?? ''} ${w.varietal ?? ''} ${w.region ?? ''} ${w.type ?? ''} ${w.notes ?? ''}`.toLowerCase().includes(q)
      )
    }
    if (filter.type) r = r.filter(w => w.type === filter.type)
    if (filter.urgency) r = r.filter(w => getUrgency(w).code === filter.urgency)

    const withUrgency = r.map(w => ({ wine: w, urgency: getUrgency(w) }))
    withUrgency.sort((a, b) => {
      let av: string | number, bv: string | number
      switch (sort.key) {
        case 'producer': av = a.wine.producer.toLowerCase(); bv = b.wine.producer.toLowerCase(); break
        case 'vintage': av = a.wine.vintage ?? 0; bv = b.wine.vintage ?? 0; break
        case 'quantity': av = a.wine.quantity ?? 0; bv = b.wine.quantity ?? 0; break
        case 'type': av = a.wine.type ?? ''; bv = b.wine.type ?? ''; break
        case 'region': av = (a.wine.region ?? '').toLowerCase(); bv = (b.wine.region ?? '').toLowerCase(); break
        default: av = a.urgency.order; bv = b.urgency.order
      }
      if (av < bv) return sort.dir === 'asc' ? -1 : 1
      if (av > bv) return sort.dir === 'asc' ? 1 : -1
      return 0
    })
    return withUrgency
  }, [wines, filter, sort])

  const arrow = (key: SortKey) => sort.key === key ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''

  const SortTh = ({ sortKey, children }: { sortKey: SortKey; children: React.ReactNode }) => (
    <TableHead
      onClick={() => handleSort(sortKey)}
      className="cursor-pointer select-none font-display-sc text-[10px] tracking-[2px] text-card-foreground whitespace-nowrap hover:opacity-80"
    >
      {children}<span className="text-[var(--gold-bright)]">{arrow(sortKey)}</span>
    </TableHead>
  )

  return (
    <>
      <div className="flex flex-wrap gap-3 mb-5">
        <Input
          placeholder="Search producer, wine, region, varietal…"
          value={filter.search}
          onChange={e => setF('search', e.target.value)}
          className="min-w-[260px] flex-1"
        />
        <Select value={filter.urgency || '__all__'} onValueChange={v => setF('urgency', !v || v === '__all__' ? '' : v)}>
          <SelectTrigger className="w-44"><SelectValue placeholder="All drinkability" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All drinkability</SelectItem>
            <SelectItem value="drink-now">Drink now</SelectItem>
            <SelectItem value="peak">In peak window</SelectItem>
            <SelectItem value="approaching">Approaching peak</SelectItem>
            <SelectItem value="young">Needs more time</SelectItem>
            <SelectItem value="past">Past prime</SelectItem>
            <SelectItem value="unknown">No window set</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filter.type || '__all__'} onValueChange={v => setF('type', !v || v === '__all__' ? '' : v)}>
          <SelectTrigger className="w-36"><SelectValue placeholder="All types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All types</SelectItem>
            {['Red', 'White', 'Rosé', 'Sparkling', 'Dessert', 'Fortified'].map(t => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filter.status} onValueChange={v => setF('status', v ?? 'active')}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="active">In cellar</SelectItem>
            <SelectItem value="all">All (incl. consumed)</SelectItem>
            <SelectItem value="consumed">Consumed only</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setAddOpen(true)} className="ml-auto">＋ Add a Bottle</Button>
      </div>

      {rows.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-sm p-16 text-center">
          <p className="font-display italic text-muted-foreground text-lg">
            {wines.length === 0 ? 'Your cellar awaits its first bottle.' : 'No wines match these filters.'}
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-sm overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-[var(--burgundy-deep)] hover:bg-[var(--burgundy-deep)]">
                <SortTh sortKey="producer">PRODUCER / WINE</SortTh>
                <SortTh sortKey="vintage">VINTAGE</SortTh>
                <SortTh sortKey="type">TYPE</SortTh>
                <SortTh sortKey="region">REGION</SortTh>
                <SortTh sortKey="quantity">QTY</SortTh>
                <SortTh sortKey="urgency">DRINKABILITY</SortTh>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(({ wine }) => (
                <TableRow
                  key={wine.id}
                  className={cn('cursor-pointer', (wine.quantity ?? 0) === 0 && 'opacity-50 italic')}
                  onClick={() => setEditWine(wine)}
                >
                  <TableCell>
                    <p className="font-display font-semibold text-[var(--burgundy-deep)] text-[15px]">
                      {wine.producer}
                    </p>
                    {wine.wine && (
                      <p className="font-display italic text-foreground text-[14px]">{wine.wine}</p>
                    )}
                    {wine.varietal && (
                      <p className="font-display italic text-muted-foreground text-[12px]">{wine.varietal}</p>
                    )}
                  </TableCell>
                  <TableCell className="font-display text-[17px] text-[var(--burgundy)] font-medium">
                    {wine.vintage ?? '—'}
                  </TableCell>
                  <TableCell className="text-sm">{wine.type ?? '—'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                    {wine.region ?? '—'}
                  </TableCell>
                  <TableCell className="font-display text-xl text-center text-[var(--burgundy-deep)]">
                    {wine.quantity ?? 0}
                  </TableCell>
                  <TableCell>
                    <UrgencyBadge wine={wine} />
                    <div className="mt-1"><UrgencyMsg wine={wine} /></div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <WineFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
      />
      <WineFormDialog
        open={!!editWine}
        onOpenChange={open => !open && setEditWine(null)}
        wine={editWine}
      />
      <DrinkDialog
        open={!!drinkWine}
        onOpenChange={open => !open && setDrinkWine(null)}
        wine={drinkWine}
      />
    </>
  )
}
