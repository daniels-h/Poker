export function formatPeso(amount: number): string {
  return '₱' + Math.abs(Math.round(amount)).toLocaleString('en-PH')
}

export function formatPnl(amount: number): string {
  const abs = Math.abs(Math.round(amount))
  if (amount > 0) return '+₱' + abs.toLocaleString('en-PH')
  if (amount < 0) return '−₱' + abs.toLocaleString('en-PH') // U+2212 minus
  return '₱0'
}

export function pnlColor(amount: number): string {
  if (amount > 0) return 'var(--win)'
  if (amount < 0) return 'var(--loss)'
  return 'var(--ivory-dim)'
}

// Keep old name for any remaining usages
export function pnlClass(amount: number): string {
  if (amount > 0) return 'text-win font-semibold'
  if (amount < 0) return 'text-loss font-semibold'
  return 'text-ivory-dim'
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
