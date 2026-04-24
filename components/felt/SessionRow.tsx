import Link from 'next/link'
import StatusPill from './StatusPill'
import { formatPeso, formatDate } from '@/lib/format'

interface Props {
  index: number
  id: string
  name: string
  date: string
  notes: string | null
  playerCount: number
  totalBuyin: number
  isBalanced: boolean
  hero: string | null
  villain: string | null
}

export default function SessionRow({ index, id, name, date, notes, playerCount, totalBuyin, isBalanced, hero, villain }: Props) {
  return (
    <Link href={`/sessions/${id}`} className="block transition-colors" style={{ transitionDuration: '180ms' }}>
      <div
        className="grid gap-6 items-center hover:bg-white/[0.02]"
        style={{
          gridTemplateColumns: '60px 1fr 1fr 1fr auto',
          padding: '20px 28px',
          borderLeft: '3px solid #c9a961',
          borderBottom: '1px solid rgba(138,115,64,0.4)',
          gap: 24,
        }}
      >
        {/* Index */}
        <div
          className="font-fraunces italic"
          style={{ fontSize: 42, color: 'var(--brass)', lineHeight: 1, fontWeight: 400 }}
        >
          {String(index).padStart(2, '0')}
        </div>

        {/* Date & meta */}
        <div>
          <div className="font-fraunces text-ivory" style={{ fontSize: 18 }}>{formatDate(date)}</div>
          <div className="font-fraunces italic mt-1" style={{ fontSize: 12, color: 'var(--ivory-dim)' }}>
            {name}{notes ? ` · ${notes}` : ''} · {playerCount} players
          </div>
        </div>

        {/* Pot */}
        <div>
          <div className="font-mono uppercase mb-1" style={{ fontSize: 10, color: 'var(--brass)', letterSpacing: '0.15em' }}>Pot Total</div>
          <div className="font-fraunces text-ivory" style={{ fontSize: 22 }}>{formatPeso(totalBuyin)}</div>
        </div>

        {/* Hero / Villain */}
        <div>
          <div className="font-mono uppercase mb-1" style={{ fontSize: 10, color: 'var(--brass)', letterSpacing: '0.15em' }}>Hero · Villain</div>
          <div className="font-inter" style={{ fontSize: 14 }}>
            {hero ? <span style={{ color: 'var(--win)' }}>{hero}</span> : <span style={{ color: 'var(--ivory-dim)' }}>—</span>}
            <span style={{ color: 'var(--ivory-dim)' }}> vs </span>
            {villain ? <span style={{ color: 'var(--loss)' }}>{villain}</span> : <span style={{ color: 'var(--ivory-dim)' }}>—</span>}
          </div>
        </div>

        {/* Status */}
        <StatusPill balanced={isBalanced} />
      </div>
    </Link>
  )
}
