import Link from 'next/link'
import { formatPnl } from '@/lib/format'
import StreakPill from './StreakPill'

export interface LeaderboardRow {
  id: string
  name: string
  nickname: string | null
  sessions: number
  winRate: number
  bestWin: number
  worstLoss: number
  streak: string
  totalPnl: number
}

const COLS = '50px 2fr 1fr 1fr 1fr 1fr 90px 1.2fr'

function initial(name: string) {
  return name.charAt(0).toUpperCase()
}

export default function LeaderboardTable({ rows }: { rows: LeaderboardRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="font-fraunces italic text-center py-16" style={{ color: 'var(--ivory-dim)', fontSize: 16 }}>
        No sessions yet. The books are open.
      </p>
    )
  }

  return (
    <div style={{ background: 'rgba(0,0,0,0.22)', border: '1px solid rgba(201,169,97,0.18)', boxShadow: 'inset 0 1px 0 rgba(201,169,97,0.18)' }}>
      {/* Header */}
      <div
        className="grid font-mono uppercase"
        style={{
          gridTemplateColumns: COLS,
          gap: 16,
          padding: '12px 24px',
          borderBottom: '1px solid rgba(201,169,97,0.3)',
          fontSize: 9.5,
          color: 'var(--brass)',
          letterSpacing: '0.18em',
        }}
      >
        <div>#</div>
        <div>Player</div>
        <div className="text-right">Sessions</div>
        <div className="text-right">Win %</div>
        <div className="text-right">Best</div>
        <div className="text-right">Worst</div>
        <div className="text-right">Form</div>
        <div className="text-right">Net P&L</div>
      </div>

      {/* Rows */}
      {rows.map((row, i) => {
        const isTop3 = i < 3
        const netColor = row.totalPnl >= 0 ? 'var(--win)' : 'var(--loss)'

        return (
          <div
            key={row.id}
            className="grid items-center transition-colors duration-100"
            style={{
              gridTemplateColumns: COLS,
              gap: 16,
              padding: '16px 24px',
              borderBottom: i < rows.length - 1 ? '1px solid rgba(201,169,97,0.1)' : 'none',
              position: 'relative',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(201,169,97,0.04)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
          >
            {/* Rank watermark */}
            <div
              className="font-fraunces"
              style={{
                fontSize: 18,
                color: isTop3 ? 'var(--brass)' : 'var(--ivory-dim)',
                fontWeight: 600,
                lineHeight: 1,
                opacity: isTop3 ? 0.9 : 0.4,
              }}
            >
              {i + 1}
            </div>

            {/* Player */}
            <div className="flex items-center gap-3">
              <div
                style={{
                  width: 34,
                  height: 34,
                  background: 'var(--felt-deep)',
                  border: `1px solid ${isTop3 ? 'rgba(201,169,97,0.6)' : 'rgba(201,169,97,0.2)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <span className="font-fraunces" style={{ fontSize: 14, color: 'var(--brass)', fontWeight: 600 }}>
                  {initial(row.name)}
                </span>
              </div>
              <div>
                <Link href={`/players/${row.id}`}>
                  <div
                    className="font-fraunces text-ivory transition-colors duration-100"
                    style={{ fontSize: 15, fontWeight: isTop3 ? 600 : 400 }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.color = 'var(--brass)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.color = 'var(--ivory)' }}
                  >
                    {row.name}
                  </div>
                </Link>
                {row.nickname && (
                  <div className="font-fraunces italic" style={{ fontSize: 11, color: 'var(--brass-dim)' }}>
                    "{row.nickname}"
                  </div>
                )}
              </div>
            </div>

            {/* Sessions */}
            <div className="font-mono text-right" style={{ fontSize: 12.5, color: 'var(--ivory-dim)' }}>{row.sessions}</div>

            {/* Win % */}
            <div className="font-mono text-right" style={{ fontSize: 12.5, color: 'var(--ivory-dim)' }}>{row.winRate}%</div>

            {/* Best */}
            <div className="font-mono text-right" style={{ fontSize: 12.5, color: 'var(--win)' }}>
              {row.bestWin > 0 ? formatPnl(row.bestWin) : '—'}
            </div>

            {/* Worst */}
            <div className="font-mono text-right" style={{ fontSize: 12.5, color: 'var(--loss)' }}>
              {row.worstLoss < 0 ? formatPnl(row.worstLoss) : '—'}
            </div>

            {/* Form */}
            <div className="flex justify-end">
              <StreakPill streak={row.streak} />
            </div>

            {/* Net P&L */}
            <div className="font-mono text-right" style={{ fontSize: 18, color: netColor, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
              {formatPnl(row.totalPnl)}
            </div>
          </div>
        )
      })}
    </div>
  )
}
