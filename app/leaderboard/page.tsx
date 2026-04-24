import { createClient } from '@/lib/supabase/server'
import LeaderboardTabs from './LeaderboardTabs'

export const revalidate = 0

export interface LeaderboardEntry {
  id: string
  name: string
  sessions: number
  totalPnl: number
  winRate: number
  biggestWin: number
  biggestLoss: number
}

async function getLeaderboard(period: 'all' | 'year' | 'month'): Promise<LeaderboardEntry[]> {
  const supabase = createClient()
  const now = new Date()
  let fromDate: string | null = null
  if (period === 'year') fromDate = `${now.getFullYear()}-01-01`
  if (period === 'month') {
    fromDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  }

  let query = supabase
    .from('session_players')
    .select(`total_buyin, cashout, net, player_id, player:players(id, name), session:sessions(date)`)

  if (fromDate) query = query.gte('session.date', fromDate)

  const { data } = await query

  const map = new Map<string, { name: string; nets: number[] }>()
  for (const row of data ?? []) {
    if (!row.session) continue
    const pid = row.player_id
    const player = row.player as any
    const net = row.net ?? ((row.cashout ?? 0) - row.total_buyin)
    if (!map.has(pid)) map.set(pid, { name: player?.name ?? '?', nets: [] })
    map.get(pid)!.nets.push(net)
  }

  return Array.from(map.entries())
    .map(([id, { name, nets }]) => ({
      id,
      name,
      sessions: nets.length,
      totalPnl: nets.reduce((a, b) => a + b, 0),
      winRate: Math.round((nets.filter(n => n > 0).length / nets.length) * 100),
      biggestWin: Math.max(0, ...nets),
      biggestLoss: Math.min(0, ...nets),
    }))
    .sort((a, b) => b.totalPnl - a.totalPnl)
}

export default async function LeaderboardPage() {
  const [all, year, month] = await Promise.all([
    getLeaderboard('all'),
    getLeaderboard('year'),
    getLeaderboard('month'),
  ])

  return (
    <div className="pt-14 md:pt-0 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Leaderboard</h1>
      <LeaderboardTabs all={all} year={year} month={month} />
    </div>
  )
}
