import { createClient } from '@/lib/supabase/server'
import LeaderboardClientWrapper from '@/components/felt/LeaderboardClientWrapper'

export const revalidate = 0

export default async function LeaderboardPage() {
  const supabase = createClient()

  const { data } = await supabase
    .from('session_players')
    .select(`total_buyin, cashout, net, player_id, player:players(id, name, nickname)`)

  const map = new Map<string, { name: string; nickname: string | null; nets: number[] }>()
  for (const row of data ?? []) {
    const p = row.player as any
    const net = row.net ?? ((row.cashout ?? 0) - row.total_buyin)
    if (!map.has(row.player_id)) map.set(row.player_id, { name: p?.name ?? '?', nickname: p?.nickname ?? null, nets: [] })
    map.get(row.player_id)!.nets.push(net)
  }

  const rows = Array.from(map.entries())
    .map(([id, { name, nickname, nets }]) => ({
      id,
      name,
      nickname,
      sessions: nets.length,
      winRate: nets.length > 0 ? Math.round((nets.filter(n => n > 0).length / nets.length) * 100) : 0,
      totalPnl: nets.reduce((a, b) => a + b, 0),
    }))
    .sort((a, b) => b.totalPnl - a.totalPnl)

  return (
    <div className="page-wrap">
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 40px' }}>
        {/* Section header */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{
            fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
            fontSize: 32, fontWeight: 700, color: '#f5f0e8', margin: 0,
          }}>Leaderboards</h2>
          <p style={{
            fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif',
            fontSize: 15, color: '#706b5f', marginTop: 6,
          }}>Season rankings across all sessions</p>
          <div style={{
            width: 60, height: 3, background: '#b8943e', borderRadius: 2, marginTop: 12,
          }} />
        </div>

        <LeaderboardClientWrapper rows={rows} />
      </div>

      {/* Footer */}
      <footer style={{
        background: '#1a1a18', borderTop: '2px solid #b8943e',
        padding: '32px 40px', textAlign: 'center',
        fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif',
        color: '#706b5f', fontSize: 13, marginTop: 48,
      }}>
        <span style={{ color: '#b8943e', marginRight: 8 }}>♠♥♦♣</span>
        Poker Open Play © 2026 — All rights reserved
      </footer>
    </div>
  )
}
