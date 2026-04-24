import Link from 'next/link'
import { formatPnl } from '@/lib/format'

interface Props {
  opponentId: string
  opponentName: string
  wins: number
  losses: number
  netTaken: number
}

export default function H2HRow({ opponentId, opponentName, wins, losses, netTaken }: Props) {
  const record = `${wins}W – ${losses}L`
  const netColor = netTaken >= 0 ? 'var(--win)' : 'var(--loss)'

  return (
    <div
      className="grid items-center"
      style={{
        gridTemplateColumns: '180px 100px 1fr 120px',
        gap: 16,
        padding: '12px 0',
        borderBottom: '1px solid rgba(138,115,64,0.2)',
      }}
    >
      <Link href={`/players/${opponentId}`}>
        <div className="font-fraunces" style={{ fontSize: 18, color: 'var(--ivory)' }}>
          vs. {opponentName}
        </div>
      </Link>
      <div className="font-mono" style={{ fontSize: 13, color: 'var(--brass)' }}>{record}</div>
      <div className="font-fraunces italic" style={{ fontSize: 13, color: 'var(--ivory-dim)' }}>
        "{wins > losses ? 'Their favorite table' : 'A tough matchup'}"
      </div>
      <div className="font-fraunces text-right" style={{ fontSize: 20, color: netColor, fontWeight: 400 }}>
        {formatPnl(netTaken)}
      </div>
    </div>
  )
}
