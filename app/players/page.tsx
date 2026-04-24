import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/felt/PageHeader'
import Link from 'next/link'

export const revalidate = 0

export default async function PlayersPage() {
  const supabase = createClient()
  const { data: players } = await supabase.from('players').select('*').eq('active', true).order('name')
  const { data: allSps } = await supabase.from('session_players').select('player_id, net')

  const netMap = new Map<string, number>()
  for (const sp of allSps ?? []) {
    netMap.set(sp.player_id, (netMap.get(sp.player_id) ?? 0) + (sp.net ?? 0))
  }

  return (
    <div className="max-w-3xl">
      <PageHeader eyebrow="The Rail" title="Players" subtitle="The regulars. The grinders. The fish." />

      <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(138,115,64,0.6)', borderRadius: 4, overflow: 'hidden' }}>
        {/* Header */}
        <div
          className="grid font-mono uppercase"
          style={{
            gridTemplateColumns: '48px 1fr 1fr 1fr',
            gap: 16,
            padding: '12px 24px',
            borderBottom: '1px solid rgba(138,115,64,0.6)',
            fontSize: 10,
            color: 'var(--brass)',
            letterSpacing: '0.15em',
          }}
        >
          <div>#</div>
          <div>Player</div>
          <div className="text-right">Nickname</div>
          <div className="text-right">All-Time Net</div>
        </div>

        {(players ?? []).map((player: any, i: number) => {
          const net = netMap.get(player.id) ?? 0
          const netCol = net >= 0 ? 'var(--win)' : 'var(--loss)'
          return (
            <Link key={player.id} href={`/players/${player.id}`} className="block">
              <div
                className="grid items-center hover:bg-white/[0.02] transition-colors"
                style={{
                  gridTemplateColumns: '48px 1fr 1fr 1fr',
                  gap: 16,
                  padding: '18px 24px',
                  borderBottom: i < (players ?? []).length - 1 ? '1px solid rgba(138,115,64,0.15)' : 'none',
                }}
              >
                <div className="font-fraunces italic" style={{ fontSize: 22, color: 'var(--brass)' }}>{i + 1}</div>
                <div className="flex items-center gap-3">
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: 'var(--felt-deep)',
                      border: '1px solid var(--brass-dim)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <span className="font-fraunces" style={{ fontSize: 16, color: 'var(--brass)' }}>
                      {player.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-fraunces text-ivory" style={{ fontSize: 17 }}>{player.name}</span>
                </div>
                <div className="font-fraunces italic text-right" style={{ fontSize: 13, color: 'var(--brass)' }}>
                  {player.nickname ? `"${player.nickname}"` : '—'}
                </div>
                <div className="font-fraunces text-right" style={{ fontSize: 20, color: netCol }}>
                  {net > 0 ? `+₱${net.toLocaleString()}` : net < 0 ? `−₱${Math.abs(net).toLocaleString()}` : '₱0'}
                </div>
              </div>
            </Link>
          )
        })}

        {(!players || players.length === 0) && (
          <p className="font-fraunces italic text-center py-16" style={{ color: 'var(--ivory-dim)', fontSize: 16 }}>
            No players yet. The books are open.
          </p>
        )}
      </div>
    </div>
  )
}
