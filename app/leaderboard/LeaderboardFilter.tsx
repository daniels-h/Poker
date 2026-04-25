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
    <div className="flex gap-0" style={{ borderBottom: '1px solid rgba(201,169,97,0.2)' }}>
      {filters.map(f => {
        const active = current === f.value
        return (
          <button
            key={f.value}
            onClick={() => router.push(`/leaderboard?period=${f.value}`)}
            className="font-mono uppercase transition-colors duration-100"
            style={{
              fontSize: 10,
              letterSpacing: '0.18em',
              padding: '6px 14px',
              background: 'transparent',
              color: active ? 'var(--brass)' : 'var(--ivory-dim)',
              cursor: 'pointer',
              border: 'none',
              borderBottom: active ? '2px solid var(--brass)' : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {f.label}
          </button>
        )
      })}
    </div>
  )
}
