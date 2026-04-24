'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const links = [
  { href: '/admin/sessions', label: 'Sessions' },
  { href: '/admin/sessions/new', label: '+ New Session' },
  { href: '/admin/players', label: 'Players' },
]

export default function AdminNav() {
  const router = useRouter()
  const pathname = usePathname()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin')
    router.refresh()
  }

  return (
    <div
      className="flex items-center justify-between mb-8 pb-4 flex-wrap gap-3"
      style={{ borderBottom: '1px solid rgba(138,115,64,0.4)' }}
    >
      <div className="flex gap-5">
        {links.map(l => {
          const active = pathname === l.href
          return (
            <Link
              key={l.href}
              href={l.href}
              className="font-mono uppercase transition-colors"
              style={{
                fontSize: 11,
                letterSpacing: '0.15em',
                color: active ? 'var(--brass)' : 'var(--ivory-dim)',
                textDecoration: active ? 'underline' : 'none',
              }}
            >
              {l.label}
            </Link>
          )
        })}
      </div>
      <button
        onClick={handleLogout}
        style={{
          background: 'transparent',
          border: '1px solid rgba(138,115,64,0.5)',
          borderRadius: 2,
          padding: '6px 14px',
          color: 'var(--ivory-dim)',
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          cursor: 'pointer',
        }}
      >
        Sign out
      </button>
    </div>
  )
}
