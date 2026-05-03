'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { markDrunk } from '@/app/actions/log'
import type { Wine } from '@/types'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  wine: Wine | null
}

export function DrinkDialog({ open, onOpenChange, wine }: Props) {
  const [pending, startTransition] = useTransition()
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [rating, setRating] = useState<string>('')
  const [note, setNote] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!wine) return
    startTransition(async () => {
      try {
        await markDrunk(wine.id, {
          date,
          rating: rating ? Number(rating) : null,
          note,
        })
        toast.success('Bottle logged. À votre santé.', { icon: '🍷' })
        onOpenChange(false)
        setRating('')
        setNote('')
      } catch (err: any) {
        toast.error(err.message ?? 'Could not log bottle')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display font-medium text-2xl text-[var(--burgundy-deep)]">
            Mark a Bottle Drunk
          </DialogTitle>
        </DialogHeader>
        {wine && (
          <p className="font-display italic text-muted-foreground text-sm -mt-2">
            Logging: <strong className="font-medium not-italic text-foreground">
              {wine.producer}{wine.wine ? ` · ${wine.wine}` : ''} {wine.vintage ?? ''}
            </strong>
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="font-display-sc text-[10px] tracking-[2px] text-muted-foreground">Date Consumed</Label>
              <Input type="date" required value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="font-display-sc text-[10px] tracking-[2px] text-muted-foreground">Rating (1–5)</Label>
              <Select value={rating} onValueChange={(v) => setRating(v ?? '')}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">★★★★★ Sublime</SelectItem>
                  <SelectItem value="4">★★★★ Very good</SelectItem>
                  <SelectItem value="3">★★★ Solid</SelectItem>
                  <SelectItem value="2">★★ Disappointing</SelectItem>
                  <SelectItem value="1">★ Flawed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="font-display-sc text-[10px] tracking-[2px] text-muted-foreground">Tasting Note</Label>
            <Textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="How was it? Food pairing? Who shared it?"
              className="font-display italic"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>Cancel</Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Logging…' : 'Log Bottle'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
