import { createClient } from '@/lib/supabase/server'
import PlayerCardGrid from '@/components/felt/PlayerCardGrid'
import { computeStreak } from '@/lib/stats'

export const revalidate = 0

export default async function PlayersPage() {
  const supabase = createClient()

  const { data: players } = await supabase
    .from('players')
    .select('*')
    .eq('active', true)
    .order('name')

  const { data: allSps } = await supabase
    .from('session_players')
    .select('player_id, net, session:sessions(date)')

  const histMap = new Map<string, { net: number; date: string }[]>()
  for (const sp of allSps ?? []) {
    const date = (sp.session as any)?.date ?? ''
    if (!histMap.has(sp.player_id)) histMap.set(sp.player_id, [])
    histMap.get(sp.player_id)!.push({ net: sp.net ?? 0, date })
  }
  Array.from(histMap.values()).forEach(hist => {
    hist.sort((a, b) => a.date.localeCompare(b.date))
  })

  const playerCards = (players ?? []).map((player: any) => {
    const hist = histMap.get(player.id) ?? []
    const nets = hist.map(h => h.net)
    const totalPnl = nets.reduce((a, b) => a + b, 0)
    const winRate = nets.length > 0
      ? Math.round((nets.filter(n => n > 0).length / nets.length) * 100)
      : 0
    return {
      id: player.id,
      name: player.name,
      nickname: player.nickname ?? null,
      sessions: nets.length,
      totalPnl,
      winRate,
      streak: computeStreak(nets),
      history: nets.slice(-8),
    }
  }).sort((a, b) => b.totalPnl - a.totalPnl)

  return (
    <div className="page-wrap">
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 40px' }}>
        <div style={{ marginBottom: 36 }}>
          <h2 style={{
            fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
            fontSize: 32, fontWeight: 700, color: '#F0EDE4', margin: 0,
          }}>Players</h2>
          <p style={{
            fontFamily: 'var(--font-dm-sans), Inter, sans-serif',
            fontSize: 15, color: '#7A9A82', marginTop: 6,
          }}>Club roster and individual stats</p>
          <div style={{ width: 48, height: 2, background: '#C8A951', borderRadius: 2, marginTop: 14 }} />
        </div>

        <PlayerCardGrid players={playerCards} />
      </div>

      <footer style={{
        borderTop: '1px solid #1E3A24',
        padding: '28px 40px', textAlign: 'center',
        fontFamily: 'var(--font-dm-sans), Inter, sans-serif',
        color: '#4A6A52', fontSize: 13, marginTop: 48,
      }}>
        <span style={{ color: '#C8A951', marginRight: 8, opacity: 0.6 }}>♠♥♦♣</span>
        Poker Open Play © 2026 — All rights reserved
      </footer>
    </div>
  )
}
