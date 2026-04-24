import Link from 'next/link'
import { formatPnl } from '@/lib/format'

interface Podium {
  id: string
  name: string
  nickname: string | null
  totalPnl: number
  winRate: number
  streak: string
}

export default function PodiumCard({ top3 }: { top3: Podium[] }) {
  const [first, second, third] = [top3[0], top3[1], top3[2]]

  function Avatar({ player, size, champion }: { player: Podium; size: number; champion?: boolean }) {
    return (
      <Link href={`/players/${player.id}`} className="block text-center">
        <div className="flex flex-col items-center gap-3">
          {champion && (
            <div className="font-fraunces" style={{ fontSize: 24, color: 'var(--brass)' }}>♛</div>
          )}
          <div
            style={{
              width: size,
              height: size,
              borderRadius: '50%',
              background: 'var(--felt-deep)',
              border: `${champion ? 3 : 2}px solid var(--brass)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: champion ? '0 0 40px rgba(201,169,97,0.3)' : 'none',
            }}
          >
            <span className="font-fraunces" style={{ fontSize: champion ? 36 : 28, color: 'var(--brass)', fontWeight: 400 }}>
              {player.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-fraunces text-ivory" style={{ fontSize: champion ? 36 : 24, fontWeight: 400 }}>
              {player.name}
            </div>
            {player.nickname && (
              <div className="font-fraunces italic" style={{ fontSize: 13, color: 'var(--brass)' }}>
                "{player.nickname}"
              </div>
            )}
            <div
              className="font-fraunces mt-1"
              style={{ fontSize: champion ? 42 : 28, color: player.totalPnl >= 0 ? 'var(--win)' : 'var(--loss)', fontWeight: 400 }}
            >
              {formatPnl(player.totalPnl)}
            </div>
            {champion && (
              <div className="font-mono uppercase mt-1" style={{ fontSize: 10, color: 'var(--ivory-dim)', letterSpacing: '0.15em' }}>
                Win Rate {player.winRate}% · {player.streak}
              </div>
            )}
          </div>
        </div>
      </Link>
    )
  }

  return (
    <div
      style={{
        background: 'rgba(0,0,0,0.25)',
        border: '1px solid rgba(138,115,64,0.6)',
        borderRadius: 4,
        padding: '32px 28px',
      }}
    >
      <div className="font-mono uppercase mb-6" style={{ fontSize: 10, color: 'var(--brass)', letterSpacing: '0.2em' }}>
        Hall of Fame
      </div>
      <div
        className="grid items-end"
        style={{ gridTemplateColumns: '1fr 1.2fr 1fr', gap: 24 }}
      >
        {second ? <Avatar player={second} size={80} /> : <div />}
        {first ? <Avatar player={first} size={120} champion /> : <div />}
        {third ? <Avatar player={third} size={80} /> : <div />}
      </div>
    </div>
  )
}
