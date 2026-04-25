'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSidebar } from './SidebarContext'

const navItems = [
  { suit: '♠', label: 'The Floor', href: '/' },
  { suit: '♣', label: 'Sessions', href: '/sessions' },
  { suit: '♥', label: 'Leaderboard', href: '/leaderboard' },
  { suit: '♦', label: 'Players', href: '/players' },
]

export default function FeltSidebar() {
  const pathname = usePathname()
  const { collapsed, toggle } = useSidebar()

  return (
    <aside
      className="hidden md:flex flex-col fixed left-0 top-0 h-full z-40 transition-all duration-200"
      style={{
        width: collapsed ? 56 : 220,
        background: 'linear-gradient(180deg, #2a1208 0%, #160904 60%, #0e0603 100%)',
        borderRight: '1px solid rgba(201,169,97,0.15)',
        overflow: 'hidden',
      }}
    >
      {/* Top brass rule */}
      <div style={{ height: 1, flexShrink: 0, background: 'linear-gradient(90deg, transparent 0%, rgba(201,169,97,0.7) 40%, rgba(201,169,97,0.7) 60%, transparent 100%)' }} />

      {/* Header */}
      <div
        className="pt-6 pb-5 flex items-center justify-between"
        style={{
          borderBottom: '1px solid rgba(201,169,97,0.12)',
          paddingLeft: collapsed ? 16 : 24,
          paddingRight: collapsed ? 16 : 16,
          minHeight: 64,
          flexShrink: 0,
        }}
      >
        {!collapsed && (
          <div
            className="font-fraunces text-ivory"
            style={{ fontSize: 20, lineHeight: 1.2, letterSpacing: '-0.02em', fontWeight: 600, whiteSpace: 'nowrap' }}
          >
            The Club
          </div>
        )}
        <button
          onClick={toggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="transition-colors duration-100"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--brass-dim)',
            fontSize: 16,
            lineHeight: 1,
            padding: 4,
            marginLeft: collapsed ? 0 : 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 pt-5 flex-1" style={{ paddingLeft: collapsed ? 8 : 12, paddingRight: collapsed ? 8 : 12 }}>
        {navItems.map(item => {
          const active = item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className="flex items-center transition-colors duration-100"
              style={{
                gap: collapsed ? 0 : 12,
                padding: collapsed ? '10px 8px' : '10px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderLeft: active ? '2px solid var(--brass)' : '2px solid transparent',
                background: 'transparent',
                color: active ? 'var(--brass)' : 'var(--ivory-dim)',
                fontFamily: 'var(--font-inter)',
                fontSize: 13,
                fontWeight: active ? 600 : 400,
              }}
            >
              <span style={{ fontSize: collapsed ? 18 : 14, opacity: active ? 1 : 0.6, flexShrink: 0 }}>
                {item.suit}
              </span>
              {!collapsed && item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div
        style={{
          borderTop: '1px solid rgba(201,169,97,0.1)',
          padding: collapsed ? '16px 8px' : '16px 24px',
          flexShrink: 0,
          textAlign: collapsed ? 'center' : 'left',
        }}
      >
        {collapsed ? (
          <Link
            href="/admin"
            title="Admin"
            style={{ fontSize: 14, color: 'var(--ivory-dim)', opacity: 0.5 }}
          >
            ⚙
          </Link>
        ) : (
          <>
            <div className="label-caps mb-2">Admin</div>
            <Link
              href="/admin"
              className="font-inter transition-colors"
              style={{ fontSize: 12, color: 'var(--ivory-dim)', letterSpacing: '0.02em' }}
            >
              Manage →
            </Link>
          </>
        )}
      </div>
    </aside>
  )
}
