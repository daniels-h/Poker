import Link from 'next/link'
import { formatPeso, formatPnl } from '@/lib/format'

interface Props {
  rank: number
  playerId: string
  playerName: string
  totalBuyin: number
  cashout: number
  net: number
  maxAbsNet: number
}

export default function ScoresheetRow({ rank, playerId, playerName, totalBuyin, cashout, net, maxAbsNet }: Props) {
  const barPct = maxAbsNet > 0 ? Math.min(Math.abs(net) / maxAbsNet, 1) * 50 : 0
  const isWin = net >= 0
  const netColor = isWin ? 'var(--win)' : 'var(--loss)'

  return (
    <div
      className="grid items-center"
      style={{
        gridTemplateColumns: '32px 130px 1fr 1fr 100px 80px',
        gap: 16,
        padding: '18px 24px',
        borderBottom: '1px solid rgba(138,115,64,0.2)',
      }}
    >
      {/* Rank */}
      <div className="font-fraunces italic" style={{ fontSize: 16, color: 'var(--brass)' }}>{rank}</div>

      {/* Name */}
      <Link href={`/players/${playerId}`}>
        <div className="font-fraunces" style={{ fontSize: 17, color: 'var(--ivory)' }}>{playerName}</div>
      </Link>

      {/* Buy-in */}
      <div className="font-mono" style={{ fontSize: 13, color: 'var(--ivory-dim)' }}>{formatPeso(totalBuyin)}</div>

      {/* Cash-out */}
      <div className="font-mono" style={{ fontSize: 13, color: 'var(--ivory)' }}>{formatPeso(cashout)}</div>

      {/* Symmetric bar */}
      <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, position: 'relative' }}>
        {/* Center tick */}
        <div style={{ position: 'absolute', top: -2, left: '50%', width: 1, height: 8, background: 'var(--brass)', transform: 'translateX(-50%)' }} />
        {/* Fill */}
        <div style={{
          position: 'absolute',
          top: 0,
          height: '100%',
          background: netColor,
          borderRadius: 2,
          width: `${barPct}%`,
          ...(isWin ? { left: '50%' } : { right: '50%' }),
        }} />
      </div>

      {/* Net */}
      <div className="font-fraunces text-right" style={{ fontSize: 18, color: netColor }}>
        {formatPnl(net)}
      </div>
    </div>
  )
}
