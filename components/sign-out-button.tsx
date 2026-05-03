'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'

export function SignOutMenuItem() {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <DropdownMenuItem
      onClick={handleSignOut}
      className="cursor-pointer text-destructive"
    >
      Sign out
    </DropdownMenuItem>
  )
}
