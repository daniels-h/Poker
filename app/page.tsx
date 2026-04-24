import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/felt/PageHeader'
import StatTile from '@/components/felt/StatTile'
import BrassDivider from '@/components/felt/BrassDivider'
import PodiumCard from '@/components/felt/PodiumCard'
import { formatPeso } from '@/lib/format'
import { computeStreak, computeHeroVillain } from '@/lib/stats'
import Link from 'next/link'

export const revalidate = 0

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: sessions } = await supabase
    .from('sessions')
    .select(`*, session_players(total_buyin, cashout, net, player_id, player:players(id, name))`)
    .order('date', { ascending: false })

  const allSessions = sessions ?? []

  // Summary stats
  const totalSessions = allSessions.length
  const totalVolume = allSessions.reduce((sum: number, s: any) =>
    sum + (s.session_players ?? []).reduce((s2: number, sp: any) => s2 + (sp.total_buyin ?? 0), 0), 0)
  const biggestPot = Math.max(0, ...allSessions.map((s: any) =>
    (s.session_players ?? []).reduce((sum: number, sp: any) => sum + (sp.total_buyin ?? 0), 0)))

  // Active players count
  const { data: players } = await supabase.from('players').select('id, name, nickname').eq('active', true)
  const activeCount = (players ?? []).length

  // All-time leaderboard for podium
  const { data: allSps } = await supabase
    .from('session_players')
    .select('player_id, net, player:players(id, name, nickname)')

  const pMap = new Map<string, { id: string; name: string; nickname: string | null; nets: number[] }>()
  for (const sp of allSps ?? []) {
    const p = sp.player as any
    if (!p) continue
    if (!pMap.has(sp.player_id)) pMap.set(sp.player_id, { id: p.id, name: p.name, nickname: p.nickname, nets: [] })
    pMap.get(sp.player_id)!.nets.push(sp.net ?? 0)
  }
  const leaderboard = Array.from(pMap.values())
    .map(p => ({
      ...p,
      totalPnl: p.nets.reduce((a, b) => a + b, 0),
      winRate: p.nets.length > 0 ? Math.round((p.nets.filter(n => n > 0).length / p.nets.length) * 100) : 0,
      streak: computeStreak(p.nets),
    }))
    .sort((a, b) => b.totalPnl - a.totalPnl)

  const top3 = leaderboard.slice(0, 3)

  // Last session hero/villain
  const lastSession = allSessions[0]
  const lastSps = (lastSession?.session_players ?? []).map((sp: any) => ({
    player_id: sp.player_id,
    name: sp.player?.name ?? '?',
    net: sp.net ?? 0,
  }))
  const { hero, villain } = computeHeroVillain(lastSps)

  return (
    <div className="max-w-5xl">
      <PageHeader
        eyebrow="Good evening"
        title="The Floor"
        subtitle="Who's up, who's down, who's buying the next round."
        right={user ? (
          <Link
            href="/sessions/new"
            className="font-mono uppercase transition-colors"
            style={{
              fontSize: 11,
              letterSpacing: '0.15em',
              background: 'var(--brass)',
              color: 'var(--ink)',
              padding: '8px 16px',
              borderRadius: 2,
            }}
          >
            + Log a Session
          </Link>
        ) : undefined}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatTile label="Sessions" value={String(totalSessions)} />
        <StatTile label="All-Time Volume" value={formatPeso(totalVolume)} />
        <StatTile label="Biggest Pot" value={formatPeso(biggestPot)} />
        <StatTile label="Active Rail" value={String(activeCount)} />
      </div>

      <BrassDivider />

      {/* Hall of Fame */}
      {top3.length >= 1 && (
        <>
          <PodiumCard top3={top3} />
          <BrassDivider />
        </>
      )}

      {/* Last session recap */}
      {lastSession && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(138,115,64,0.6)', borderRadius: 4, padding: '24px 28px' }}>
            <div className="font-mono uppercase mb-3" style={{ fontSize: 10, color: 'var(--brass)', letterSpacing: '0.2em' }}>Last Session</div>
            <div className="font-fraunces text-ivory mb-4" style={{ fontSize: 22 }}>{lastSession.name}</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="font-mono uppercase mb-1" style={{ fontSize: 10, color: 'var(--win)', letterSpacing: '0.15em' }}>Hero</div>
                <div className="font-fraunces" style={{ fontSize: 18, color: 'var(--win)' }}>{hero ?? '—'}</div>
              </div>
              <div>
                <div className="font-mono uppercase mb-1" style={{ fontSize: 10, color: 'var(--loss)', letterSpacing: '0.15em' }}>Villain</div>
                <div className="font-fraunces" style={{ fontSize: 18, color: 'var(--loss)' }}>{villain ?? '—'}</div>
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(138,115,64,0.6)', borderRadius: 4, padding: '24px 28px' }}>
            <div className="font-mono uppercase mb-3" style={{ fontSize: 10, color: 'var(--brass)', letterSpacing: '0.2em' }}>Streaks & Form</div>
            <div className="space-y-2">
              {leaderboard.slice(0, 5).map(p => (
                <div key={p.id} className="flex items-center justify-between">
                  <div className="font-fraunces text-ivory" style={{ fontSize: 15 }}>{p.name}</div>
                  <div className="font-mono" style={{ fontSize: 11, color: p.streak.startsWith('W') ? 'var(--win)' : 'var(--loss)' }}>
                    {p.streak}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
