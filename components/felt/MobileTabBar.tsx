'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { suit: '♠', label: 'Floor', href: '/' },
  { suit: '♣', label: 'Sessions', href: '/sessions' },
  { suit: '♥', label: 'Standings', href: '/leaderboard' },
  { suit: '♦', label: 'Rail', href: '/players' },
]

export default function MobileTabBar() {
  const pathname = usePathname()

  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex"
      style={{
        height: 70,
        background: '#3d2817',
        borderTop: '1px solid #c9a961',
      }}
    >
      {tabs.map(tab => {
        const active = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex-1 flex flex-col items-center justify-center gap-1 transition-colors"
            style={{ color: active ? 'var(--brass)' : 'var(--ivory-dim)' }}
          >
            <span style={{ fontSize: 18 }}>{tab.suit}</span>
            <span className="font-mono uppercase" style={{ fontSize: 9, letterSpacing: '0.15em' }}>{tab.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
