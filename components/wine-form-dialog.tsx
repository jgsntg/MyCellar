'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { createWine, updateWine, deleteWine } from '@/app/actions/wines'
import type { Wine } from '@/types'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  wine?: Wine | null
}

const EMPTY: Record<string, string> = {
  producer: '', wine: '', vintage: '', type: '', varietal: '', region: '',
  quantity: '1', size: '750 ml', location: '', price: '',
  window_start: '', peak_start: '', peak_end: '', window_end: '', notes: '',
}

export function WineFormDialog({ open, onOpenChange, wine }: Props) {
  const isEdit = !!wine
  const [pending, startTransition] = useTransition()
  const [fields, setFields] = useState<Record<string, string>>(
    wine ? {
      producer: wine.producer ?? '',
      wine: wine.wine ?? '',
      vintage: wine.vintage?.toString() ?? '',
      type: wine.type ?? '',
      varietal: wine.varietal ?? '',
      region: wine.region ?? '',
      quantity: String(wine.quantity ?? 1),
      size: wine.size ?? '750 ml',
      location: wine.location ?? '',
      price: wine.price?.toString() ?? '',
      window_start: wine.window_start?.toString() ?? '',
      peak_start: wine.peak_start?.toString() ?? '',
      peak_end: wine.peak_end?.toString() ?? '',
      window_end: wine.window_end?.toString() ?? '',
      notes: wine.notes ?? '',
    } : EMPTY
  )

  const set = (k: string, v: string) => setFields(f => ({ ...f, [k]: v }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      try {
        if (isEdit && wine) {
          await updateWine(wine.id, fields as any)
          toast.success('Entry updated')
        } else {
          await createWine(fields as any)
          toast.success('Bottle added to the cellar')
        }
        onOpenChange(false)
      } catch (err: any) {
        toast.error(err.message ?? 'Something went wrong')
      }
    })
  }

  const handleDelete = () => {
    if (!wine) return
    if (!confirm('Permanently delete this entry?')) return
    startTransition(async () => {
      try {
        await deleteWine(wine.id)
        toast.success('Entry deleted')
        onOpenChange(false)
      } catch (err: any) {
        toast.error(err.message ?? 'Could not delete')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display font-medium text-2xl text-[var(--burgundy-deep)]">
            {isEdit ? 'Edit Entry' : 'Add a Bottle'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <Field label="Producer / Winery *">
              <Input required value={fields.producer} onChange={e => set('producer', e.target.value)} placeholder="e.g. Château Margaux" />
            </Field>
            <Field label="Wine Name">
              <Input value={fields.wine} onChange={e => set('wine', e.target.value)} placeholder="e.g. Grand Vin (leave blank for estate wine)" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Vintage">
              <Input type="number" value={fields.vintage} onChange={e => set('vintage', e.target.value)} placeholder="2018" min={1900} max={2099} />
            </Field>
            <Field label="Type">
              <Select value={fields.type} onValueChange={v => set('type', v ?? '')}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  {['Red', 'White', 'Rosé', 'Sparkling', 'Dessert', 'Fortified'].map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Varietal / Blend">
              <Input value={fields.varietal} onChange={e => set('varietal', e.target.value)} placeholder="Cabernet Sauvignon" />
            </Field>
            <Field label="Region / Appellation">
              <Input value={fields.region} onChange={e => set('region', e.target.value)} placeholder="Napa Valley" />
            </Field>
            <Field label="Quantity">
              <Input type="number" value={fields.quantity} onChange={e => set('quantity', e.target.value)} min={0} />
            </Field>
            <Field label="Bottle Size">
              <Select value={fields.size} onValueChange={v => set('size', v ?? '750 ml')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['750 ml', '375 ml', '500 ml', '1.5 L (Magnum)', '3 L (Double Magnum)'].map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Cellar Location">
              <Input value={fields.location} onChange={e => set('location', e.target.value)} placeholder="Rack A / Bin 12" />
            </Field>
            <Field label="Purchase Price ($)">
              <Input type="number" value={fields.price} onChange={e => set('price', e.target.value)} min={0} step={0.01} placeholder="0.00" />
            </Field>
          </div>

          <Separator />
          <p className="font-display-sc text-[10px] tracking-[2px] text-[var(--burgundy)]">DRINKING WINDOW (years)</p>
          <div className="grid grid-cols-4 gap-4">
            {[
              { key: 'window_start', label: 'Earliest' },
              { key: 'peak_start', label: 'Peak Start' },
              { key: 'peak_end', label: 'Peak End' },
              { key: 'window_end', label: 'Latest' },
            ].map(({ key, label }) => (
              <Field key={key} label={label}>
                <Input type="number" value={fields[key]} onChange={e => set(key, e.target.value)} placeholder="—" min={1900} max={2099} />
              </Field>
            ))}
          </div>
          <p className="font-display italic text-xs text-muted-foreground">
            Leave blank if unknown. Even just Peak Start and Peak End is useful.
          </p>

          <Field label="Notes">
            <Textarea
              value={fields.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Tasting notes, who gifted it, food pairing ideas…"
              className="font-display italic"
            />
          </Field>

          <DialogFooter className="gap-2">
            {isEdit && (
              <Button type="button" variant="outline" onClick={handleDelete} disabled={pending}
                className="mr-auto text-destructive border-destructive/30 hover:bg-destructive/10">
                Delete
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving…' : 'Save Entry'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="font-display-sc text-[10px] tracking-[2px] text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}
