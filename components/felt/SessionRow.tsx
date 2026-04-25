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
    <Link href={`/sessions/${id}`} className="block transition-colors duration-100">
      <div
        className="grid items-center"
        style={{
          gridTemplateColumns: '52px 1fr 140px 180px auto',
          padding: '18px 24px',
          borderBottom: '1px solid rgba(201,169,97,0.1)',
          gap: 20,
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(201,169,97,0.03)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
      >
        {/* Index */}
        <div
          className="font-fraunces"
          style={{ fontSize: 22, color: 'var(--brass-dim)', lineHeight: 1, fontWeight: 600, opacity: 0.6 }}
        >
          {String(index).padStart(2, '0')}
        </div>

        {/* Date & meta */}
        <div>
          <div className="font-fraunces text-ivory" style={{ fontSize: 16, fontWeight: 500 }}>{formatDate(date)}</div>
          <div className="font-inter mt-0.5" style={{ fontSize: 11.5, color: 'var(--ivory-dim)' }}>
            {name}{notes ? ` · ${notes}` : ''} · {playerCount} players
          </div>
        </div>

        {/* Pot */}
        <div>
          <div className="label-caps mb-1">Pot</div>
          <div className="font-mono text-ivory" style={{ fontSize: 15, fontWeight: 500 }}>{formatPeso(totalBuyin)}</div>
        </div>

        {/* Hero / Villain */}
        <div>
          <div className="label-caps mb-1">Hero · Villain</div>
          <div className="font-inter" style={{ fontSize: 13 }}>
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
