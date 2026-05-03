import { createClient } from '@/lib/supabase/server'
import { ConsumptionLogList } from '@/components/consumption-log-list'
import type { LogEntry } from '@/types'

export default async function LogPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: log } = await supabase
    .from('consumption_log')
    .select('*')
    .eq('user_id', user!.id)
    .order('date', { ascending: false })

  const entries = (log ?? []) as LogEntry[]

  return (
    <div>
      <div className="flex items-baseline gap-4 mb-6 pb-3 border-b border-border">
        <h2 className="font-display font-medium text-3xl text-[var(--burgundy-deep)]">Consumption Log</h2>
        <span className="text-[var(--gold)] text-lg">❦</span>
        {entries.length > 0 && (
          <span className="font-display italic text-muted-foreground text-sm ml-auto">
            {entries.length} bottle{entries.length === 1 ? '' : 's'} consumed
          </span>
        )}
      </div>
      <ConsumptionLogList entries={entries} />
    </div>
  )
}
