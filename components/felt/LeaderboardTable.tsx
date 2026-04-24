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
    <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(138,115,64,0.6)', borderRadius: 4 }}>
      {/* Header */}
      <div
        className="grid font-mono uppercase"
        style={{
          gridTemplateColumns: COLS,
          gap: 16,
          padding: '14px 24px',
          borderBottom: '1px solid rgba(138,115,64,0.6)',
          fontSize: 10,
          color: 'var(--brass)',
          letterSpacing: '0.15em',
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
        const rankColor = isTop3 ? 'var(--brass)' : 'var(--ivory-dim)'
        const netColor = row.totalPnl >= 0 ? 'var(--win)' : 'var(--loss)'

        return (
          <div
            key={row.id}
            className="grid items-center transition-colors"
            style={{
              gridTemplateColumns: COLS,
              gap: 16,
              padding: '18px 24px',
              borderBottom: i < rows.length - 1 ? '1px solid rgba(138,115,64,0.15)' : 'none',
              background: isTop3
                ? 'linear-gradient(90deg, rgba(201,169,97,0.1) 0%, transparent 40%)'
                : 'transparent',
            }}
          >
            {/* Rank */}
            <div className="font-fraunces italic" style={{ fontSize: 28, color: rankColor, fontWeight: 400, lineHeight: 1 }}>
              {i + 1}
            </div>

            {/* Player */}
            <div className="flex items-center gap-3">
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: 'var(--felt-deep)',
                  border: `1px solid ${isTop3 ? 'var(--brass)' : 'var(--brass-dim)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <span className="font-fraunces" style={{ fontSize: 16, color: 'var(--brass)', fontWeight: 400 }}>
                  {initial(row.name)}
                </span>
              </div>
              <div>
                <Link href={`/players/${row.id}`}>
                  <div className="font-fraunces text-ivory hover:text-brass transition-colors" style={{ fontSize: 17 }}>
                    {row.name}
                  </div>
                </Link>
                {row.nickname && (
                  <div className="font-fraunces italic" style={{ fontSize: 12, color: 'var(--brass)' }}>
                    "{row.nickname}"
                  </div>
                )}
              </div>
            </div>

            {/* Sessions */}
            <div className="font-mono text-right" style={{ fontSize: 13, color: 'var(--ivory-dim)' }}>{row.sessions}</div>

            {/* Win % */}
            <div className="font-mono text-right" style={{ fontSize: 13, color: 'var(--ivory-dim)' }}>{row.winRate}%</div>

            {/* Best */}
            <div className="font-mono text-right" style={{ fontSize: 13, color: 'var(--win)' }}>
              {row.bestWin > 0 ? formatPnl(row.bestWin) : '—'}
            </div>

            {/* Worst */}
            <div className="font-mono text-right" style={{ fontSize: 13, color: 'var(--loss)' }}>
              {row.worstLoss < 0 ? formatPnl(row.worstLoss) : '—'}
            </div>

            {/* Form */}
            <div className="flex justify-end">
              <StreakPill streak={row.streak} />
            </div>

            {/* Net P&L */}
            <div className="font-fraunces text-right" style={{ fontSize: 22, color: netColor, fontWeight: 400 }}>
              {formatPnl(row.totalPnl)}
            </div>
          </div>
        )
      })}
    </div>
  )
}
