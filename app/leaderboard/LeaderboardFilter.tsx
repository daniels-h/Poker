'use client'

import { useRouter } from 'next/navigation'

const filters = [
  { label: 'All Time', value: 'all' },
  { label: 'This Year', value: 'year' },
  { label: 'This Month', value: 'month' },
]

export default function LeaderboardFilter({ current }: { current: string }) {
  const router = useRouter()
  return (
    <div className="flex gap-2">
      {filters.map(f => {
        const active = current === f.value
        return (
          <button
            key={f.value}
            onClick={() => router.push(`/leaderboard?period=${f.value}`)}
            className="font-mono uppercase transition-colors"
            style={{
              fontSize: 11,
              letterSpacing: '0.15em',
              padding: '5px 12px',
              borderRadius: 2,
              border: '1px solid rgba(138,115,64,0.5)',
              background: active ? 'var(--brass)' : 'transparent',
              color: active ? 'var(--ink)' : 'var(--ivory-dim)',
              cursor: 'pointer',
            }}
          >
            {f.label}
          </button>
        )
      })}
    </div>
  )
}
