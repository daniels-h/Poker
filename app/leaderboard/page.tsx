import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/felt/PageHeader'
import LeaderboardTable from '@/components/felt/LeaderboardTable'
import LeaderboardFilter from './LeaderboardFilter'
import { computeStreak } from '@/lib/stats'
import type { LeaderboardRow } from '@/components/felt/LeaderboardTable'

export const revalidate = 0

async function getLeaderboard(period: 'all' | 'year' | 'month'): Promise<LeaderboardRow[]> {
  const supabase = createClient()
  const now = new Date()
  let fromDate: string | null = null
  if (period === 'year') fromDate = `${now.getFullYear()}-01-01`
  if (period === 'month') fromDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

  let query = supabase
    .from('session_players')
    .select(`total_buyin, cashout, net, player_id, player:players(id, name, nickname), session:sessions(date)`)

  if (fromDate) query = query.gte('session.date', fromDate)

  const { data } = await query

  const map = new Map<string, { name: string; nickname: string | null; nets: number[] }>()
  for (const row of data ?? []) {
    if (!row.session) continue
    const p = row.player as any
    const net = row.net ?? ((row.cashout ?? 0) - row.total_buyin)
    if (!map.has(row.player_id)) map.set(row.player_id, { name: p?.name ?? '?', nickname: p?.nickname ?? null, nets: [] })
    map.get(row.player_id)!.nets.push(net)
  }

  return Array.from(map.entries())
    .map(([id, { name, nickname, nets }]) => ({
      id,
      name,
      nickname,
      sessions: nets.length,
      winRate: nets.length > 0 ? Math.round((nets.filter(n => n > 0).length / nets.length) * 100) : 0,
      bestWin: Math.max(0, ...nets),
      worstLoss: Math.min(0, ...nets),
      streak: computeStreak(nets),
      totalPnl: nets.reduce((a, b) => a + b, 0),
    }))
    .sort((a, b) => b.totalPnl - a.totalPnl)
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: { period?: string }
}) {
  const period = (searchParams.period as 'all' | 'year' | 'month') ?? 'all'
  const rows = await getLeaderboard(period)

  return (
    <div className="max-w-5xl">
      <PageHeader
        eyebrow="The Standings"
        title="Leaderboard"
        subtitle="Where you sit at the table, in the long run."
        right={<LeaderboardFilter current={period} />}
      />
      <LeaderboardTable rows={rows} />
    </div>
  )
}
