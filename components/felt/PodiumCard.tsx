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

  function Plaque({ player, rank }: { player: Podium; rank: number }) {
    const isChampion = rank === 1
    const pnlColor = player.totalPnl >= 0 ? 'var(--win)' : 'var(--loss)'
    const rankLabels = ['—', '1ST', '2ND', '3RD']

    return (
      <Link href={`/players/${player.id}`} className="block group">
        <div
          style={{
            padding: isChampion ? '24px 20px' : '16px 20px',
            borderTop: isChampion ? '2px solid var(--brass)' : '1px solid rgba(201,169,97,0.25)',
            borderLeft: '1px solid rgba(201,169,97,0.12)',
            borderRight: '1px solid rgba(201,169,97,0.12)',
            borderBottom: '1px solid rgba(201,169,97,0.12)',
            background: isChampion ? 'rgba(201,169,97,0.06)' : 'transparent',
            transition: 'background 120ms',
          }}
        >
          <div className="label-caps mb-3" style={{ color: isChampion ? 'var(--brass)' : 'var(--brass-dim)' }}>
            {rankLabels[rank]}
          </div>

          {/* Initial plaque */}
          <div
            style={{
              width: isChampion ? 52 : 40,
              height: isChampion ? 52 : 40,
              background: 'var(--felt-deep)',
              border: `1px solid ${isChampion ? 'var(--brass)' : 'rgba(201,169,97,0.3)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}
          >
            <span
              className="font-fraunces"
              style={{ fontSize: isChampion ? 28 : 20, color: 'var(--brass)', fontWeight: 600 }}
            >
              {player.name.charAt(0).toUpperCase()}
            </span>
          </div>

          <div
            className="font-fraunces text-ivory"
            style={{ fontSize: isChampion ? 22 : 16, fontWeight: isChampion ? 600 : 400, lineHeight: 1.1, marginBottom: 4 }}
          >
            {player.name}
          </div>
          {player.nickname && (
            <div className="font-fraunces italic" style={{ fontSize: 11, color: 'var(--brass)', marginBottom: 6 }}>
              "{player.nickname}"
            </div>
          )}
          <div
            className="font-mono"
            style={{ fontSize: isChampion ? 26 : 18, color: pnlColor, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}
          >
            {formatPnl(player.totalPnl)}
          </div>
          {isChampion && (
            <div className="label-caps mt-2" style={{ color: 'var(--ivory-dim)' }}>
              {player.winRate}% wins · {player.streak}
            </div>
          )}
        </div>
      </Link>
    )
  }

  return (
    <div>
      <div className="label-caps mb-4">Hall of Fame</div>
      <div
        className="grid items-end"
        style={{ gridTemplateColumns: '1fr 1.15fr 1fr', gap: 0 }}
      >
        {second ? <Plaque player={second} rank={2} /> : <div />}
        {first ? <Plaque player={first} rank={1} /> : <div />}
        {third ? <Plaque player={third} rank={3} /> : <div />}
      </div>
    </div>
  )
}
