'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 5 }, (_, i) => currentYear - i)
const months = [
  { value: '01', label: 'January' }, { value: '02', label: 'February' },
  { value: '03', label: 'March' }, { value: '04', label: 'April' },
  { value: '05', label: 'May' }, { value: '06', label: 'June' },
  { value: '07', label: 'July' }, { value: '08', label: 'August' },
  { value: '09', label: 'September' }, { value: '10', label: 'October' },
  { value: '11', label: 'November' }, { value: '12', label: 'December' },
]

export default function SessionFilters() {
  const router = useRouter()
  const params = useSearchParams()
  const year = params.get('year') ?? ''
  const month = params.get('month') ?? ''

  function setFilter(key: string, value: string) {
    const p = new URLSearchParams(params.toString())
    if (value) p.set(key, value)
    else p.delete(key)
    if (key === 'year') p.delete('month')
    router.push(`/?${p.toString()}`)
  }

  function clearFilters() {
    router.push('/')
  }

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <select
        value={year}
        onChange={e => setFilter('year', e.target.value)}
        className="text-sm border border-gray-200 rounded-md px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        <option value="">All years</option>
        {years.map(y => <option key={y} value={y}>{y}</option>)}
      </select>

      {year && (
        <select
          value={month ? `${year}-${month.split('-')[1]}` : ''}
          onChange={e => setFilter('month', e.target.value)}
          className="text-sm border border-gray-200 rounded-md px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">All months</option>
          {months.map(m => (
            <option key={m.value} value={`${year}-${m.value}`}>{m.label}</option>
          ))}
        </select>
      )}

      {(year || month) && (
        <button
          onClick={clearFilters}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Clear
        </button>
      )}
    </div>
  )
}
