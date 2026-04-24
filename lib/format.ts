export function formatPeso(amount: number): string {
  return '₱' + Math.abs(amount).toLocaleString('en-PH', { maximumFractionDigits: 0 })
}

export function formatPnl(amount: number): string {
  if (amount > 0) return '+₱' + amount.toLocaleString('en-PH', { maximumFractionDigits: 0 })
  if (amount < 0) return '−₱' + Math.abs(amount).toLocaleString('en-PH', { maximumFractionDigits: 0 })
  return '₱0'
}

export function pnlClass(amount: number): string {
  if (amount > 0) return 'text-green-500 font-semibold'
  if (amount < 0) return 'text-red-500 font-semibold'
  return 'text-gray-400'
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
