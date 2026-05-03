import { createClient } from '@/lib/supabase/server'
import { WineTable } from '@/components/wine-table'
import type { Wine } from '@/types'

export default async function CellarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: wines } = await supabase
    .from('wines')
    .select('*')
    .eq('user_id', user!.id)
    .order('producer', { ascending: true })

  return (
    <div>
      <div className="flex items-baseline gap-4 mb-6 pb-3 border-b border-border">
        <h2 className="font-display font-medium text-3xl text-[var(--burgundy-deep)]">The Cellar</h2>
        <span className="text-[var(--gold)] text-lg">❦</span>
      </div>
      <WineTable wines={(wines ?? []) as Wine[]} />
    </div>
  )
}
