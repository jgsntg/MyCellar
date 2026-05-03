import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LoginButton } from './login-button'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  const { error } = await searchParams

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Brand */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full border border-[var(--burgundy)] grid place-items-center font-display italic text-4xl font-semibold text-[var(--burgundy)] bg-card shadow-inner mx-auto">
            C
          </div>
          <h1 className="font-display font-medium text-5xl text-[var(--burgundy-deep)] leading-none tracking-tight">
            The <em className="italic text-[var(--burgundy)] font-normal">Cellar</em>
          </h1>
          <p className="font-display italic text-muted-foreground text-base">
            A personal ledger of bottles, vintages &amp; their proper hour
          </p>
        </div>

        {/* Card */}
        <div className="relative bg-card border border-border rounded-sm p-8 shadow-md overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[var(--burgundy-deep)] via-[var(--burgundy)] to-[var(--gold)]" />

          <div className="space-y-4">
            <p className="font-display-sc text-[10px] tracking-[3px] text-[var(--gold)] text-center">
              SIGN IN TO YOUR COLLECTION
            </p>

            {error && (
              <p className="text-sm text-destructive text-center font-display italic">
                Authentication failed. Please try again.
              </p>
            )}

            <LoginButton />
          </div>
        </div>

        <p className="font-display italic text-muted-foreground text-xs text-center">
          Your cellar is private. Nothing leaves your account.
        </p>
      </div>
    </div>
  )
}
