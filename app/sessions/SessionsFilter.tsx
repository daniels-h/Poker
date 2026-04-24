'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const currentYear = new Date().getFullYear()
const filters = [
  { label: 'All Time', value: '' },
  { label: String(currentYear), value: String(currentYear) },
  { label: String(currentYear - 1), value: String(currentYear - 1) },
  { label: 'Last 30 Days', value: 'last30' },
]

export default function SessionsFilter() {
  const router = useRouter()
  const params = useSearchParams()
  const year = params.get('year') ?? ''

  function setYear(val: string) {
    if (val === 'last30') {
      const from = new Date()
      from.setDate(from.getDate() - 30)
      const y = from.getFullYear()
      const m = String(from.getMonth() + 1).padStart(2, '0')
      router.push(`/sessions?month=${y}-${m}`)
    } else if (val) {
      router.push(`/sessions?year=${val}`)
    } else {
      router.push('/sessions')
    }
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {filters.map(f => {
        const active = f.value === '' ? !year : year === f.value
        return (
          <button
            key={f.value}
            onClick={() => setYear(f.value)}
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
