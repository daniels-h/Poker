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
      background: 'linear-gradient(180deg, #1a1a18 0%, #252420 100%)',
      borderBottom: '3px solid #b8943e',
      position: 'sticky', top: 0, zIndex: 100,
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '0 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 72,
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <span style={{ fontSize: 32, color: '#b8943e', fontFamily: 'Georgia, serif', lineHeight: 1 }}>♠</span>
          <span style={{
            fontSize: 20,
            fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
            fontWeight: 700, color: '#f5f0e8', letterSpacing: '0.02em',
          }}>
            Poker Open Play
          </span>
        </Link>

        {/* Nav links + Admin button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {navLinks.map(link => {
            const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  background: isActive ? 'rgba(184,148,62,0.15)' : 'transparent',
                  color: isActive ? '#f5f0e8' : '#a09882',
                  fontFamily: 'var(--font-dm-sans), "DM Sans", Helvetica, sans-serif',
                  fontSize: 15, fontWeight: 500,
                  padding: '8px 18px', borderRadius: 6,
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  boxShadow: isActive ? 'inset 0 -2px 0 #b8943e' : 'none',
                  letterSpacing: '0.02em',
                  display: 'inline-block',
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
              border: '1px solid rgba(184,148,62,0.45)',
              background: 'transparent',
              color: '#b8943e',
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
