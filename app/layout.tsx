import type { Metadata } from 'next'
import { Cormorant_Garamond, Cormorant_SC, Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-body' })

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
})

const cormorantSC = Cormorant_SC({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display-sc',
})

export const metadata: Metadata = {
  title: 'The Cellar — Personal Wine Ledger',
  description: 'A personal ledger of bottles, vintages & their proper hour',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable} ${cormorantSC.variable}`}>
      <body className="min-h-screen antialiased">
        {children}
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  )
}
