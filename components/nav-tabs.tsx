'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

type NavTab = {
  href: string
  label: string
  count?: number
}

export function NavTabs({ tabs }: { tabs: NavTab[] }) {
  const pathname = usePathname()

  return (
    <nav className="flex px-6 md:px-10 gap-1 bg-background border-b border-border overflow-x-auto">
      {tabs.map(tab => {
        const active = pathname === tab.href || (tab.href !== '/dashboard' && pathname.startsWith(tab.href))
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'relative flex items-center gap-1.5 px-4 py-3.5 font-display-sc text-[11px] tracking-[2px] whitespace-nowrap transition-colors',
              active
                ? 'text-[var(--burgundy-deep)]'
                : 'text-muted-foreground hover:text-[var(--burgundy)]'
            )}
          >
            {tab.label}
            {tab.count != null && (
              <span className="inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full text-[10px] font-body bg-[var(--burgundy)] text-[var(--cream)] leading-none">
                {tab.count}
              </span>
            )}
            {active && (
              <span className="absolute bottom-[-1px] left-3 right-3 h-[2px] bg-[var(--burgundy)]" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
