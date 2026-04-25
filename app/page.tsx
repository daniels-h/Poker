import { createClient } from '@/lib/supabase/server'
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
      {/* Page header */}
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <div className="label-caps mb-3">The Floor</div>
          <h1
            className="font-fraunces text-ivory"
            style={{ fontSize: 52, lineHeight: 1, letterSpacing: '-0.03em', fontWeight: 700 }}
          >
            The Club
          </h1>
          <p
            className="font-inter mt-2.5"
            style={{ fontSize: 13.5, color: 'var(--ivory-dim)', lineHeight: 1.5 }}
          >
            Who's up, who's down, who's buying the next round.
          </p>
        </div>
        {user && (
          <Link
            href="/admin/sessions/new"
            className="font-mono uppercase transition-colors duration-100"
            style={{
              fontSize: 10,
              letterSpacing: '0.18em',
              background: 'var(--brass)',
              color: 'var(--ink)',
              padding: '9px 18px',
              fontWeight: 600,
            }}
          >
            + Log Session
          </Link>
        )}
      </div>

      {/* Stat rail — ruled columns, no floating cards */}
      <div
        className="stat-rail mb-10"
        style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}
      >
        <div className="stat-rail-cell">
          <div className="label-caps mb-2">Sessions</div>
          <div className="font-mono" style={{ fontSize: 30, fontWeight: 500, color: 'var(--ivory)', lineHeight: 1 }}>
            {totalSessions}
          </div>
        </div>
        <div className="stat-rail-cell">
          <div className="label-caps mb-2">All-Time Volume</div>
          <div className="font-mono" style={{ fontSize: 30, fontWeight: 500, color: 'var(--ivory)', lineHeight: 1 }}>
            {formatPeso(totalVolume)}
          </div>
        </div>
        <div className="stat-rail-cell">
          <div className="label-caps mb-2">Biggest Pot</div>
          <div className="font-mono" style={{ fontSize: 30, fontWeight: 500, color: 'var(--ivory)', lineHeight: 1 }}>
            {formatPeso(biggestPot)}
          </div>
        </div>
        <div className="stat-rail-cell">
          <div className="label-caps mb-2">Active Rail</div>
          <div className="font-mono" style={{ fontSize: 30, fontWeight: 500, color: 'var(--ivory)', lineHeight: 1 }}>
            {activeCount}
          </div>
        </div>
      </div>

      {/* Hall of Fame */}
      {top3.length >= 1 && (
        <div className="mb-10">
          <PodiumCard top3={top3} />
        </div>
      )}

      {/* Last session + streaks */}
      {lastSession && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0" style={{ border: '1px solid rgba(201,169,97,0.18)', boxShadow: 'inset 0 1px 0 rgba(201,169,97,0.18)' }}>
          {/* Last session */}
          <div
            style={{
              padding: '24px 28px',
              borderRight: '1px solid rgba(201,169,97,0.15)',
            }}
          >
            <div className="label-caps mb-4">Last Session</div>
            <div
              className="font-fraunces text-ivory mb-5"
              style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em' }}
            >
              {lastSession.name}
            </div>
            <div style={{ borderTop: '1px solid rgba(201,169,97,0.15)', paddingTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div className="label-caps mb-1.5" style={{ color: 'var(--win)' }}>Hero</div>
                <div className="font-fraunces" style={{ fontSize: 17, color: 'var(--win)', fontWeight: 500 }}>
                  {hero ?? '—'}
                </div>
              </div>
              <div>
                <div className="label-caps mb-1.5" style={{ color: 'var(--loss)' }}>Villain</div>
                <div className="font-fraunces" style={{ fontSize: 17, color: 'var(--loss)', fontWeight: 500 }}>
                  {villain ?? '—'}
                </div>
              </div>
            </div>
          </div>

          {/* Streaks */}
          <div style={{ padding: '24px 28px' }}>
            <div className="label-caps mb-4">Streaks &amp; Form</div>
            <div>
              {leaderboard.slice(0, 5).map((p, i) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between"
                  style={{
                    paddingTop: i === 0 ? 0 : 10,
                    paddingBottom: 10,
                    borderBottom: i < 4 ? '1px solid rgba(201,169,97,0.1)' : 'none',
                  }}
                >
                  <div className="font-fraunces text-ivory" style={{ fontSize: 14 }}>{p.name}</div>
                  <div
                    className="font-mono"
                    style={{ fontSize: 10.5, letterSpacing: '0.1em', color: p.streak.startsWith('W') ? 'var(--win)' : 'var(--loss)' }}
                  >
                    [{p.streak}]
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
