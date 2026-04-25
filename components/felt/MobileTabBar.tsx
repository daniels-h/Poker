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
        height: 66,
        background: 'linear-gradient(180deg, #2a1208 0%, #160904 100%)',
        borderTop: '1px solid rgba(201,169,97,0.25)',
      }}
    >
      {tabs.map(tab => {
        const active = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex-1 flex flex-col items-center justify-center gap-1 transition-colors duration-100 relative"
            style={{ color: active ? 'var(--brass)' : 'var(--ivory-dim)' }}
          >
            {active && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '20%',
                  right: '20%',
                  height: 2,
                  background: 'var(--brass)',
                }}
              />
            )}
            <span style={{ fontSize: 20, opacity: active ? 1 : 0.5 }}>{tab.suit}</span>
            <span className="font-mono uppercase" style={{ fontSize: 8.5, letterSpacing: '0.18em' }}>{tab.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
