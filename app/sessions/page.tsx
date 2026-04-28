import { createClient } from '@/lib/supabase/server'
import SessionAccordion from '@/components/felt/SessionAccordion'
import Link from 'next/link'

export const revalidate = 0

export default async function SessionsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: sessions } = await supabase
    .from('sessions')
    .select(`*, session_players(total_buyin, cashout, net, player_id, player:players(id, name))`)
    .order('date', { ascending: false })

  const enriched = (sessions ?? []).map((s: any) => {
    const sps: any[] = s.session_players ?? []
    const results = [...sps]
      .sort((a, b) => (b.net ?? 0) - (a.net ?? 0))
      .map((sp: any) => ({
        player_id: sp.player_id,
        name: sp.player?.name ?? '?',
        net: sp.net ?? 0,
      }))
    const total_pot = Math.round(sps.reduce((sum: number, sp: any) => sum + (sp.total_buyin ?? 0), 0))
    return {
      id: s.id,
      date: s.date,
      name: s.name,
      notes: s.notes ?? null,
      player_count: sps.length,
      total_pot,
      results,
    }
  })

  return (
    <div className="page-wrap">
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 40px' }}>
        <div style={{ marginBottom: 32, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{
              fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
              fontSize: 32, fontWeight: 700, color: '#C9A84C', margin: 0,
            }}>Sessions</h2>
            <p style={{
              fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif',
              fontSize: 15, color: '#9CA3AF', marginTop: 6,
            }}>Full history of all club sessions</p>
            <div style={{ width: 60, height: 2, background: '#C9A84C', borderRadius: 2, marginTop: 12 }} />
          </div>
          {user && (
            <Link
              href="/admin/sessions/new"
              style={{
                fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif',
                fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase',
                background: '#C9A84C', color: '#111611',
                padding: '9px 18px', fontWeight: 700, textDecoration: 'none',
                borderRadius: 6,
              }}
            >
              + Log Session
            </Link>
          )}
        </div>

        <SessionAccordion sessions={enriched} />
      </div>

      <footer style={{
        background: '#111611', borderTop: '1px solid rgba(201,168,76,0.2)',
        padding: '32px 40px', textAlign: 'center',
        fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif',
        color: '#6B7280', fontSize: 13, marginTop: 48,
      }}>
        <span style={{ color: '#C9A84C', marginRight: 8, opacity: 0.5 }}>♠♥♦♣</span>
        Poker Open Play © 2026 — All rights reserved
      </footer>
    </div>
  )
}
