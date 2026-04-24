import type { Metadata } from 'next'
import { Fraunces, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import FeltSidebar from '@/components/felt/FeltSidebar'
import MobileTabBar from '@/components/felt/MobileTabBar'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  weight: ['300', '400', '500', '600', '700', '900'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700', '800'],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'The Club',
  description: 'est. since we got bored',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="felt-glow felt-texture min-h-screen" style={{ backgroundColor: 'var(--felt)' }}>
        <div className="flex min-h-screen">
          {/* Desktop sidebar */}
          <FeltSidebar />
          {/* Main content */}
          <main className="flex-1 md:ml-[220px] pb-20 md:pb-0 px-6 md:px-12 py-8 md:py-10 min-h-screen">
            {children}
          </main>
        </div>
        {/* Mobile tab bar */}
        <MobileTabBar />
      </body>
    </html>
  )
}
