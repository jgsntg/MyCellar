import { createClient } from '@/lib/supabase/server'
import { DashboardStats } from '@/components/dashboard-stats'
import { UrgencyCards } from '@/components/urgency-cards'
import type { Wine, LogEntry } from '@/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: wines }, { data: log }] = await Promise.all([
    supabase.from('wines').select('*').eq('user_id', user!.id).order('added_at', { ascending: false }),
    supabase.from('consumption_log').select('*').eq('user_id', user!.id),
  ])

  const wineList = (wines ?? []) as Wine[]
  const logList = (log ?? []) as LogEntry[]

  return (
    <div>
      <DashboardStats wines={wineList} log={logList} />

      <div className="flex items-baseline gap-4 mb-5 pb-3 border-b border-border">
        <h2 className="font-display font-medium text-3xl text-[var(--burgundy-deep)]">At a Glance</h2>
        <span className="text-[var(--gold)] text-lg">❦</span>
        <span className="font-display italic text-muted-foreground text-sm ml-auto">
          {wineList.filter(w => (w.quantity ?? 0) > 0).reduce((s, w) => s + (w.quantity ?? 0), 0)} bottles across {wineList.filter(w => (w.quantity ?? 0) > 0).length} entries
        </span>
      </div>

      <UrgencyCards wines={wineList} compact />
    </div>
  )
}
