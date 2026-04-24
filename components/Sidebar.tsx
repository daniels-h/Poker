'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Sessions' },
  { href: '/leaderboard', label: 'Leaderboard' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3" style={{ backgroundColor: '#0f1a12' }}>
        <span className="text-white font-bold text-lg">♠ Poker Club</span>
        <button onClick={() => setOpen(!open)} className="text-white text-2xl">☰</button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="w-56 h-full flex flex-col py-6 px-4" style={{ backgroundColor: '#0f1a12' }}>
            <span className="text-white font-bold text-xl mb-8">♠ Poker Club</span>
            <nav className="flex flex-col gap-1 flex-1">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    pathname === item.href
                      ? 'bg-green-700 text-white'
                      : 'text-green-100 hover:bg-green-900'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <Link href="/admin" onClick={() => setOpen(false)} className="px-3 py-2 rounded-md text-sm font-medium text-green-300 hover:bg-green-900 mt-4">
              Admin
            </Link>
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setOpen(false)} />
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-56 py-8 px-4" style={{ backgroundColor: '#0f1a12' }}>
        <span className="text-white font-bold text-xl mb-10">♠ Poker Club</span>
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'bg-green-700 text-white'
                  : 'text-green-100 hover:bg-green-900'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link href="/admin" className="px-3 py-2 rounded-md text-sm font-medium text-green-300 hover:bg-green-900">
          Admin
        </Link>
      </aside>
    </>
  )
}
