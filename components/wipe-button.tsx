'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

export function WipeButton() {
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const handleWipe = () => {
    if (!confirm('Delete every wine and log entry from your account? There is no undo.')) return
    if (!confirm('Truly? This cannot be reversed.')) return

    startTransition(async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        await Promise.all([
          supabase.from('consumption_log').delete().eq('user_id', user.id),
          supabase.from('wines').delete().eq('user_id', user.id),
        ])
        toast.error('All data erased')
        router.refresh()
      } catch (err: any) {
        toast.error(err.message ?? 'Could not wipe data')
      }
    })
  }

  return (
    <Button
      variant="outline"
      onClick={handleWipe}
      disabled={pending}
      className="text-destructive border-destructive/30 hover:bg-destructive/10"
    >
      {pending ? 'Erasing…' : 'Erase All Data'}
    </Button>
  )
}
