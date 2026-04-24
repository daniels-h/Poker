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
        background: 'linear-gradient(180deg, #3d2817 0%, #2a1a0e 100%)',
        borderRight: '1px solid rgba(201,169,97,0.2)',
      }}
    >
      {/* Top brass rule */}
      <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #c9a961 50%, transparent)' }} />

      {/* Header */}
      <div className="px-6 pt-7 pb-5" style={{ borderBottom: '1px solid rgba(138,115,64,0.4)' }}>
        <div className="font-fraunces text-ivory" style={{ fontSize: 22, lineHeight: 1.2 }}>The Club</div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 px-3 pt-5 flex-1">
        {navItems.map(item => {
          const active = item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 transition-colors duration-180"
              style={{
                borderLeft: active ? '2px solid #c9a961' : '2px solid transparent',
                background: active ? 'rgba(201,169,97,0.08)' : 'transparent',
                color: active ? 'var(--brass)' : 'var(--ivory-dim)',
                fontFamily: 'var(--font-inter)',
                fontSize: 14,
                fontWeight: active ? 600 : 400,
                borderRadius: '0 2px 2px 0',
              }}
            >
              <span style={{ fontSize: 12 }}>{item.suit}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 pb-6 pt-4" style={{ borderTop: '1px solid rgba(138,115,64,0.3)' }}>
        <div className="font-mono uppercase tracking-widest mb-1" style={{ fontSize: 10, color: 'var(--brass)', letterSpacing: '0.2em' }}>
          Admin
        </div>
        <Link
          href="/admin"
          className="font-fraunces italic transition-colors"
          style={{ fontSize: 13, color: 'var(--ivory-dim)' }}
        >
          The Floor
        </Link>
      </div>
    </aside>
  )
}
