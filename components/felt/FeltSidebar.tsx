'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { suit: '♠', label: 'The Floor', href: '/' },
  { suit: '♣', label: 'Sessions', href: '/sessions' },
  { suit: '♥', label: 'Leaderboard', href: '/leaderboard' },
  { suit: '♦', label: 'Players', href: '/players' },
]

export default function FeltSidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="hidden md:flex flex-col fixed left-0 top-0 h-full w-[220px] z-40"
      style={{
        background: 'linear-gradient(180deg, #2a1208 0%, #160904 60%, #0e0603 100%)',
        borderRight: '1px solid rgba(201,169,97,0.15)',
      }}
    >
      {/* Top brass rule */}
      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent 0%, rgba(201,169,97,0.7) 40%, rgba(201,169,97,0.7) 60%, transparent 100%)' }} />

      {/* Header */}
      <div className="px-6 pt-8 pb-6" style={{ borderBottom: '1px solid rgba(201,169,97,0.12)' }}>
        <div
          className="font-fraunces text-ivory"
          style={{ fontSize: 20, lineHeight: 1.2, letterSpacing: '-0.02em', fontWeight: 600 }}
        >
          The Club
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 px-3 pt-6 flex-1">
        {navItems.map(item => {
          const active = item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 transition-colors duration-100"
              style={{
                borderLeft: active ? '2px solid var(--brass)' : '2px solid transparent',
                background: 'transparent',
                color: active ? 'var(--brass)' : 'var(--ivory-dim)',
                fontFamily: 'var(--font-inter)',
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                letterSpacing: active ? '0.01em' : '0',
              }}
            >
              <span style={{ fontSize: 14, opacity: active ? 1 : 0.6 }}>{item.suit}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 pb-6 pt-4" style={{ borderTop: '1px solid rgba(201,169,97,0.1)' }}>
        <div className="label-caps mb-2">Admin</div>
        <Link
          href="/admin"
          className="font-inter transition-colors"
          style={{ fontSize: 12, color: 'var(--ivory-dim)', letterSpacing: '0.02em' }}
        >
          Manage →
        </Link>
      </div>
    </aside>
  )
}
