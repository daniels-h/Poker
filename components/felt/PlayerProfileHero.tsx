import { formatPnl } from '@/lib/format'

const rankTitles = ['CHAMPION', 'RUNNER-UP', 'BRONZE', 'CONTENDER', 'THE RAIL']

interface Props {
  name: string
  nickname: string | null
  rank: number
  totalPnl: number
  sessions: number
  streak: string
}

export default function PlayerProfileHero({ name, nickname, rank, totalPnl, sessions, streak }: Props) {
  const rankTitle = rank <= 5 ? rankTitles[rank - 1] : 'THE RAIL'
  const pnlColor = totalPnl >= 0 ? 'var(--win)' : 'var(--loss)'
  const streakIsWin = streak.startsWith('W')

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '160px 1fr auto',
        gap: 32,
        paddingBottom: 32,
        borderBottom: '1px solid rgba(138,115,64,0.6)',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: 'var(--felt-deep)',
          border: '2px solid var(--brass)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <span className="font-fraunces" style={{ fontSize: 72, color: 'var(--brass)', fontWeight: 400, lineHeight: 1 }}>
          {name.charAt(0).toUpperCase()}
        </span>
      </div>

      {/* Info */}
      <div>
        <div className="font-mono uppercase mb-2" style={{ fontSize: 10, color: 'var(--brass)', letterSpacing: '0.2em' }}>
          RANK № {String(rank).padStart(2, '0')} · {rankTitle}
        </div>
        <h1 className="font-fraunces text-ivory" style={{ fontSize: 64, fontWeight: 400, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
          {name}
        </h1>
        {nickname && (
          <div className="font-fraunces italic mt-2" style={{ fontSize: 20, color: 'var(--brass)' }}>
            "{nickname}"
          </div>
        )}
        <div className="font-fraunces italic mt-2" style={{ fontSize: 13, color: 'var(--ivory-dim)' }}>
          {sessions} sessions played
        </div>
      </div>

      {/* Net P&L */}
      <div className="text-right">
        <div className="font-mono uppercase mb-2" style={{ fontSize: 10, color: 'var(--brass)', letterSpacing: '0.15em' }}>
          All-Time Net
        </div>
        <div className="font-fraunces" style={{ fontSize: 56, color: pnlColor, fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1 }}>
          {formatPnl(totalPnl)}
        </div>
        <div
          className="font-mono uppercase mt-2"
          style={{ fontSize: 10, color: streakIsWin ? 'var(--win)' : 'var(--loss)', letterSpacing: '0.15em' }}
        >
          ON A {streak} HEATER
        </div>
      </div>
    </div>
  )
}
