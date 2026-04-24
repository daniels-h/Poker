'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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
    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 flex-wrap gap-3">
      <div className="flex gap-4">
        {links.map(l => (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              'text-sm font-medium hover:underline',
              pathname === l.href ? 'text-green-800 underline' : 'text-green-700'
            )}
          >
            {l.label}
          </Link>
        ))}
      </div>
      <Button variant="outline" size="sm" onClick={handleLogout}>Sign out</Button>
    </div>
  )
}
