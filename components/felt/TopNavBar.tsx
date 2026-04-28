'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Sessions', href: '/sessions' },
  { label: 'Leaderboards', href: '/leaderboard' },
  { label: 'Players', href: '/players' },
]

export default function TopNavBar() {
  const pathname = usePathname()

  return (
    <nav style={{
      background: '#0B1A0F',
      borderBottom: '1px solid rgba(200,169,81,0.18)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '0 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 64,
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <span style={{ fontSize: 26, color: '#C8A951', fontFamily: 'Georgia, serif', lineHeight: 1 }}>♠</span>
          <span style={{
            fontSize: 18,
            fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
            fontWeight: 700, color: '#F0EDE4', letterSpacing: '0.02em',
          }}>
            Poker Open Play
          </span>
        </Link>

        {/* Nav links + Admin */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {navLinks.map(link => {
            const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  color: isActive ? '#C8A951' : '#A3B8A8',
                  fontFamily: 'var(--font-dm-sans), Inter, Helvetica, sans-serif',
                  fontSize: 14, fontWeight: 500,
                  padding: '8px 16px',
                  textDecoration: 'none',
                  borderBottom: isActive ? '2px solid #C8A951' : '2px solid transparent',
                  transition: 'color 0.15s, border-color 0.15s',
                  letterSpacing: '0.02em',
                  display: 'inline-block',
                  lineHeight: '46px',
                }}
              >
                {link.label}
              </Link>
            )
          })}

          <Link
            href="/admin"
            style={{
              marginLeft: 16,
              border: '1px solid rgba(200,169,81,0.5)',
              background: 'transparent',
              color: '#C8A951',
              fontFamily: 'var(--font-dm-sans), Inter, Helvetica, sans-serif',
              fontSize: 12, fontWeight: 600,
              padding: '6px 14px', borderRadius: 6,
              textDecoration: 'none',
              letterSpacing: '0.06em',
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            Admin
          </Link>
        </div>
      </div>
    </nav>
  )
}
