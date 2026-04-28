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
      background: 'linear-gradient(180deg, #111611 0%, #141A14 100%)',
      borderBottom: '1px solid rgba(201,168,76,0.25)',
      position: 'sticky', top: 0, zIndex: 100,
      boxShadow: '0 2px 16px rgba(0,0,0,0.6)',
    }}>
      <div style={{
        maxWidth: '100%', padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 72,
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <span style={{ fontSize: 28, color: '#C9A84C', fontFamily: 'Georgia, serif', lineHeight: 1 }}>♠</span>
          <span style={{
            fontSize: 20,
            fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
            fontWeight: 700, color: '#C9A84C', letterSpacing: '0.02em',
          }}>
            Poker Open Play
          </span>
        </Link>

        {/* Nav links + Admin */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {navLinks.map(link => {
            const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  background: 'transparent',
                  color: isActive ? '#C9A84C' : '#9CA3AF',
                  fontFamily: 'var(--font-dm-sans), "DM Sans", Helvetica, sans-serif',
                  fontSize: 15, fontWeight: 500,
                  padding: '8px 18px',
                  borderRadius: 6,
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                  boxShadow: isActive ? 'inset 0 -2px 0 #C9A84C' : 'none',
                  letterSpacing: '0.02em',
                  display: 'inline-block',
                  lineHeight: '56px',
                }}
              >
                {link.label}
              </Link>
            )
          })}

          <Link
            href="/admin"
            style={{
              marginLeft: 12,
              border: '1px solid rgba(201,168,76,0.5)',
              background: 'transparent',
              color: '#C9A84C',
              fontFamily: 'var(--font-dm-sans), "DM Sans", Helvetica, sans-serif',
              fontSize: 13, fontWeight: 600,
              padding: '7px 16px', borderRadius: 6,
              textDecoration: 'none',
              transition: 'all 0.2s',
              letterSpacing: '0.05em',
            }}
          >
            Admin
          </Link>
        </div>
      </div>
    </nav>
  )
}
