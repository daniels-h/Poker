import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatDate, formatPeso, formatPnl, pnlColor } from '@/lib/format'
import StatTile from '@/components/felt/StatTile'
import BrassDivider from '@/components/felt/BrassDivider'
import PlayerProfileHero from '@/components/felt/PlayerProfileHero'
import SparkChart from '@/components/felt/SparkChart'
import H2HRow from '@/components/felt/H2HRow'
import { computeStreak, computeH2H } from '@/lib/stats'
import Link from 'next/link'

export const revalidate = 0

export default async function PlayerProfilePage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: player } = await supabase.from('players').select('*').eq('id', params.id).single()
  if (!player) notFound()

  // Get this player's sessions
  const { data: sessionPlayers } = await supabase
    .from('session_players')
    .select(`*, session:sessions(id, name, date)`)
    .eq('player_id', params.id)

  const rows = (sessionPlayers ?? [])
    .map((sp: any) => ({ ...sp, net: sp.net ?? ((sp.cashout ?? 0) - sp.total_buyin), date: sp.session?.date }))
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const nets = rows.map((r: any) => r.net)
  const totalPnl = nets.reduce((a: number, b: number) => a + b, 0)
  const wins = nets.filter((n: number) => n > 0).length
  const winRate = rows.length > 0 ? Math.round((wins / rows.length) * 100) : 0
  const biggestWin = nets.length > 0 ? Math.max(...nets) : 0
  const worstLoss = nets.length > 0 ? Math.min(...nets) : 0
  const streak = computeStreak(nets)

  // Rank
  const { data: allSps } = await supabase.from('session_players').select('player_id, net')
  const rankMap = new Map<string, number>()
  for (const sp of allSps ?? []) {
    rankMap.set(sp.player_id, (rankMap.get(sp.player_id) ?? 0) + (sp.net ?? 0))
  }
  const sorted = Array.from(rankMap.entries()).sort((a, b) => b[1] - a[1])
  const rank = sorted.findIndex(([id]) => id === params.id) + 1 || sorted.length + 1

  // H2H data
  const { data: h2hRaw } = await supabase
    .from('session_players')
    .select(`session_id, player_id, net, player:players(id, name)`)

  const h2hFlat = (h2hRaw ?? []).map((sp: any) => ({
    session_id: sp.session_id,
    player_id: sp.player_id,
    player_name: sp.player?.name ?? '?',
    net: sp.net ?? 0,
  }))

  const h2hRecords = computeH2H(h2hFlat, params.id).slice(0, 5)

  // Last 10 nets for spark chart
  const last10 = nets.slice(-10)

  return (
    <div className="max-w-4xl">
      <div className="mb-4">
        <Link href="/players" className="font-mono uppercase" style={{ fontSize: 10, color: 'var(--brass)', letterSpacing: '0.15em' }}>
          ← The Rail
        </Link>
      </div>

      <PlayerProfileHero
        name={player.name}
        nickname={player.nickname}
        rank={rank}
        totalPnl={totalPnl}
        sessions={rows.length}
        streak={streak}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
        <StatTile label="Sessions" value={String(rows.length)} />
        <StatTile label="Win Rate" value={`${winRate}%`} accent="var(--win)" />
        <StatTile label="Best Win" value={biggestWin > 0 ? formatPnl(biggestWin) : '—'} accent="var(--win)" />
        <StatTile label="Worst Loss" value={worstLoss < 0 ? formatPnl(worstLoss) : '—'} accent="var(--loss)" />
      </div>

      {last10.length >= 2 && (
        <>
          <SparkChart nets={last10} />
          <BrassDivider />
        </>
      )}

      {/* Session history */}
      <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(138,115,64,0.6)', borderRadius: 4, overflow: 'hidden', marginBottom: 32 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(138,115,64,0.4)' }}>
          <div className="font-mono uppercase mb-1" style={{ fontSize: 10, color: 'var(--brass)', letterSpacing: '0.2em' }}>History</div>
          <div className="font-fraunces text-ivory" style={{ fontSize: 22 }}>Session Log</div>
        </div>
        {[...rows].reverse().map((row: any) => (
          <div
            key={row.id}
            className="grid items-center"
            style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: 16, padding: '16px 24px', borderBottom: '1px solid rgba(138,115,64,0.15)' }}
          >
            <div className="font-fraunces text-ivory-dim" style={{ fontSize: 14 }}>{formatDate(row.date)}</div>
            <div>
              <Link href={`/sessions/${row.session?.id}`} className="font-fraunces text-ivory hover:text-brass transition-colors" style={{ fontSize: 15 }}>
                {row.session?.name ?? '—'}
              </Link>
            </div>
            <div className="font-mono" style={{ fontSize: 13, color: 'var(--ivory-dim)' }}>{formatPeso(row.total_buyin)}</div>
            <div className="font-mono" style={{ fontSize: 13, color: 'var(--ivory)' }}>{formatPeso(row.cashout ?? 0)}</div>
            <div className="font-fraunces text-right" style={{ fontSize: 16, color: pnlColor(row.net) }}>{formatPnl(row.net)}</div>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="font-fraunces italic text-center py-10" style={{ color: 'var(--ivory-dim)', fontSize: 14 }}>
            No sessions yet. The books are open.
          </p>
        )}
      </div>

      {/* H2H */}
      {h2hRecords.length > 0 && (
        <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(138,115,64,0.6)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(138,115,64,0.4)' }}>
            <div className="font-mono uppercase mb-1" style={{ fontSize: 10, color: 'var(--brass)', letterSpacing: '0.2em' }}>
              Head to Head · Favorite Victims
            </div>
          </div>
          <div style={{ padding: '8px 24px' }}>
            {h2hRecords.map(r => (
              <H2HRow
                key={r.opponentId}
                opponentId={r.opponentId}
                opponentName={r.opponentName}
                wins={r.wins}
                losses={r.losses}
                netTaken={r.netTaken}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
