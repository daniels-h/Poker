import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import AppShell from '@/components/felt/AppShell'

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '600', '700', '800'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Poker Open Play',
  description: 'Where the cards fall and legends are made',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfairDisplay.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen" style={{ backgroundColor: '#1a1a18' }}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
