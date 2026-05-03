import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { NavTabs } from '@/components/nav-tabs'

async function getNavCounts() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { cellar: 0, log: 0 }

  const [{ count: cellar }, { count: log }] = await Promise.all([
    supabase.from('wines').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gt('quantity', 0),
    supabase.from('consumption_log').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
  ])
  return { cellar: cellar ?? 0, log: log ?? 0 }
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const counts = await getNavCounts()

  const tabs = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/cellar', label: 'The Cellar', count: counts.cellar },
    { href: '/report', label: 'Drinkability Report' },
    { href: '/log', label: 'Consumption Log', count: counts.log },
    { href: '/data', label: 'Data & Import' },
    { href: '/notes', label: 'Notes' },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <NavTabs tabs={tabs} />
      <main className="flex-1 px-6 md:px-10 py-8 max-w-[1400px] mx-auto w-full">
        {children}
      </main>
    </div>
  )
}
