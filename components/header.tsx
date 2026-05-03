import { createClient } from '@/lib/supabase/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SignOutMenuItem } from './sign-out-button'

export async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const initials = (user?.user_metadata?.full_name as string | undefined)
    ?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() ?? 'C'
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
  const displayName = (user?.user_metadata?.full_name as string | undefined) ?? 'Collector'

  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <header
      className="border-b border-border px-6 md:px-10 py-5 flex items-end justify-between gap-6"
      style={{ background: 'linear-gradient(to bottom, oklch(0.937 0.032 78 / 0.6), var(--background))' }}
    >
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-full border border-[var(--burgundy)] grid place-items-center font-display italic text-2xl font-semibold text-[var(--burgundy)] bg-card shadow-inner flex-shrink-0">
          C
        </div>
        <div>
          <h1 className="font-display font-medium text-3xl md:text-4xl text-[var(--burgundy-deep)] leading-none tracking-tight">
            The <em className="italic text-[var(--burgundy)] font-normal">Cellar</em>
          </h1>
          <p className="font-display italic text-sm text-muted-foreground mt-1">
            A personal ledger of bottles, vintages &amp; their proper hour
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="font-display-sc text-[10px] tracking-[2.5px] text-[var(--gold)]">PRIVATE COLLECTION</p>
          <p className="font-display italic text-base text-muted-foreground mt-1">{dateStr}</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-transparent border-0 p-0 cursor-pointer">
            <Avatar className="w-9 h-9">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback className="bg-[var(--burgundy)] text-[var(--cream)] text-sm font-display">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <SignOutMenuItem />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
