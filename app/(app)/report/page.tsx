import { createClient } from '@/lib/supabase/server'
import { UrgencyCards } from '@/components/urgency-cards'
import type { Wine } from '@/types'

export default async function ReportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: wines } = await supabase
    .from('wines')
    .select('*')
    .eq('user_id', user!.id)
    .gt('quantity', 0)

  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div>
      <div className="flex items-baseline gap-4 mb-6 pb-3 border-b border-border">
        <h2 className="font-display font-medium text-3xl text-[var(--burgundy-deep)]">Drinkability Report</h2>
        <span className="text-[var(--gold)] text-lg">❦</span>
        <span className="font-display italic text-muted-foreground text-sm ml-auto">Generated {dateStr}</span>
      </div>
      <UrgencyCards wines={(wines ?? []) as Wine[]} />
    </div>
  )
}
