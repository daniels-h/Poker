import { createClient } from '@/lib/supabase/server'
import { computeStreak } from '@/lib/stats'
import { formatPnl, formatDate } from '@/lib/format'
import Link from 'next/link'

export const revalidate = 0

export default async function DashboardPage() {
  const supabase = createClient()

  const { data: sessions } = await supabase
    .from('sessions')
    .select(`*, session_players(total_buyin, cashout, net, player_id, player:players(id, name))`)
    .order('date', { ascending: false })

  const allSessions = sessions ?? []

  const totalSessions = allSessions.length
  const totalVolume = allSessions.reduce((sum: number, s: any) =>
    sum + (s.session_players ?? []).reduce((s2: number, sp: any) => s2 + (sp.total_buyin ?? 0), 0), 0)

  const { data: players } = await supabase.from('players').select('id, name, nickname').eq('active', true)
  const activeCount = (players ?? []).length

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
      sessions: p.nets.length,
      streak: computeStreak(p.nets),
    }))
    .sort((a, b) => b.totalPnl - a.totalPnl)

  const seasonLeader = leaderboard[0] ?? null

  const lastSession = allSessions[0]
  const lastSps = (lastSession?.session_players ?? []) as any[]
  const lastSorted = [...lastSps].sort((a, b) => (b.net ?? 0) - (a.net ?? 0))
  const lastWinner = lastSorted[0]

  const nextSession = allSessions.find((s: any) => new Date(s.date) > new Date()) ?? null

  return (
    <div className="page-wrap-dark">
      {/* Hero */}
      <div style={{
        position: 'relative', textAlign: 'center',
        padding: '100px 40px 60px',
        background: 'radial-gradient(ellipse at center, #2a4a2a 0%, #1a2e1a 40%, #1a1a18 100%)',
        overflow: 'hidden',
      }}>
        {/* Felt overlay */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.08, pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='1' cy='1' r='0.5'/%3E%3Ccircle cx='4' cy='4' r='0.5'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            fontSize: 18, color: '#b8943e', letterSpacing: '0.5em',
            fontFamily: 'Georgia, serif', marginBottom: 20, opacity: 0.6,
          }}>♠ ♥ ♦ ♣</div>
          <h1 style={{
            fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
            fontSize: 64, fontWeight: 700, color: '#f5f0e8',
            margin: 0, letterSpacing: '0.02em',
            textShadow: '0 2px 30px rgba(0,0,0,0.5)',
          }}>
            Poker Open Play
          </h1>
          <p style={{
            fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif',
            fontSize: 18, color: '#b8943e', marginTop: 12, fontStyle: 'italic', letterSpacing: '0.05em',
          }}>
            Where the cards fall and legends are made
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, margin: '24px 0' }}>
            <span style={{ display: 'block', width: 80, height: 1, background: 'rgba(184,148,62,0.4)' }} />
            <span style={{ color: '#b8943e', fontSize: 16, fontFamily: 'Georgia, serif' }}>♠</span>
            <span style={{ display: 'block', width: 80, height: 1, background: 'rgba(184,148,62,0.4)' }} />
          </div>
          <p style={{
            fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif',
            fontSize: 16, color: '#a09882', maxWidth: 500, margin: '0 auto', lineHeight: 1.7,
          }}>
            A private club for serious players. Track your sessions, climb the leaderboard, and prove your edge.
          </p>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '40px 0' }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '0 40px',
          display: 'flex', gap: 20, flexWrap: 'wrap',
        }}>
          {[
            { icon: '♠', value: String(totalSessions), label: 'Sessions Played' },
            { icon: '♣', value: String(activeCount), label: 'Active Players' },
            { icon: '♦', value: `₱${Math.round(totalVolume / 1000 * 10) / 10}K`, label: 'Total Pot Volume' },
            { icon: '♥', value: leaderboard.length > 0 ? String(Math.round(leaderboard.reduce((a, b) => a + b.sessions, 0) / Math.max(leaderboard.length, 1))) : '0', label: 'Avg Sessions / Player' },
          ].map(({ icon, value, label }) => (
            <div key={label} style={{
              background: 'rgba(26,26,24,0.6)', border: '1px solid rgba(184,148,62,0.3)',
              borderRadius: 12, padding: '28px 24px', textAlign: 'center',
              backdropFilter: 'blur(8px)', flex: '1 1 200px',
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
              <div style={{
                fontSize: 36, fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
                fontWeight: 700, color: '#b8943e', marginBottom: 4,
              }}>{value}</div>
              <div style={{
                fontSize: 13, color: '#a09882',
                fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif',
                textTransform: 'uppercase', letterSpacing: '0.1em',
              }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Info cards */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 40px' }}>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          {/* Next Session */}
          <div style={{
            flex: '1 1 300px', background: '#252420', borderRadius: 12,
            border: '1px solid rgba(184,148,62,0.25)', overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}>
            <div style={{
              background: '#1a1a18', color: '#b8943e', padding: '14px 24px',
              fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
              fontSize: 15, fontWeight: 600, letterSpacing: '0.05em',
              textTransform: 'uppercase', borderBottom: '2px solid #b8943e',
            }}>
              Next Session
            </div>
            <div style={{ padding: '24px' }}>
              {nextSession ? (
                <>
                  <div style={{
                    fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
                    fontSize: 22, fontWeight: 700, color: '#f5f0e8',
                  }}>{formatDate(nextSession.date)}</div>
                  <div style={{
                    fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif',
                    fontSize: 14, color: '#706b5f', marginTop: 4,
                  }}>{nextSession.name}</div>
                </>
              ) : (
                <>
                  <div style={{
                    fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
                    fontSize: 22, fontWeight: 700, color: '#f5f0e8',
                  }}>TBD</div>
                  <div style={{
                    fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif',
                    fontSize: 14, color: '#706b5f', marginTop: 4,
                  }}>No upcoming session scheduled</div>
                </>
              )}
              <Link href="/sessions" style={{
                display: 'inline-block', marginTop: 16,
                padding: '6px 14px', borderRadius: 20,
                background: 'rgba(184,148,62,0.12)', color: '#b8943e',
                fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif',
                fontSize: 13, fontWeight: 600, textDecoration: 'none',
              }}>
                View Sessions →
              </Link>
            </div>
          </div>

          {/* Last Session */}
          <div style={{
            flex: '1 1 300px', background: '#252420', borderRadius: 12,
            border: '1px solid rgba(184,148,62,0.25)', overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}>
            <div style={{
              background: '#1a1a18', color: '#b8943e', padding: '14px 24px',
              fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
              fontSize: 15, fontWeight: 600, letterSpacing: '0.05em',
              textTransform: 'uppercase', borderBottom: '2px solid #b8943e',
            }}>
              Last Session
            </div>
            <div style={{ padding: '24px' }}>
              {lastSession ? (
                <>
                  <div style={{
                    fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
                    fontSize: 22, fontWeight: 700, color: '#f5f0e8',
                  }}>{formatDate(lastSession.date)}</div>
                  <div style={{
                    fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif',
                    fontSize: 14, color: '#706b5f', marginTop: 4,
                  }}>
                    {lastSps.length} players · {lastSession.name}
                  </div>
                  {lastWinner && (
                    <div style={{ marginTop: 16 }}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between', padding: '8px 0',
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                        fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif',
                        fontSize: 14, color: '#d4cfc2',
                      }}>
                        <span>🏆 Top Winner</span>
                        <span style={{ color: '#4a7c59' }}>
                          {lastWinner.player?.name} ({formatPnl(lastWinner.net)})
                        </span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div style={{
                  fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
                  fontSize: 22, fontWeight: 700, color: '#706b5f', fontStyle: 'italic',
                }}>No sessions yet</div>
              )}
            </div>
          </div>

          {/* Season Leader */}
          <div style={{
            flex: '1 1 300px', background: '#252420', borderRadius: 12,
            border: '1px solid rgba(184,148,62,0.25)', overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}>
            <div style={{
              background: '#1a1a18', color: '#b8943e', padding: '14px 24px',
              fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
              fontSize: 15, fontWeight: 600, letterSpacing: '0.05em',
              textTransform: 'uppercase', borderBottom: '2px solid #b8943e',
            }}>
              Season Leader
            </div>
            <div style={{ padding: '24px' }}>
              {seasonLeader ? (
                <>
                  <div style={{ fontSize: 48, marginBottom: 8 }}>♠</div>
                  <div style={{
                    fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
                    fontSize: 22, fontWeight: 700, color: '#f5f0e8',
                  }}>{seasonLeader.name}</div>
                  <div style={{
                    fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif',
                    fontSize: 14, color: '#706b5f', marginTop: 4,
                  }}>
                    {formatPnl(seasonLeader.totalPnl)} · {seasonLeader.winRate}% win rate
                  </div>
                  <div style={{
                    display: 'inline-block', marginTop: 16, padding: '6px 14px', borderRadius: 20,
                    background: 'rgba(184,148,62,0.15)', color: '#b8943e',
                    fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif',
                    fontSize: 13, fontWeight: 600,
                  }}>
                    {seasonLeader.sessions} sessions
                  </div>
                </>
              ) : (
                <div style={{
                  fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
                  fontSize: 22, fontWeight: 700, color: '#706b5f', fontStyle: 'italic',
                }}>No data yet</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        background: '#1a1a18', borderTop: '2px solid #b8943e',
        padding: '32px 40px', textAlign: 'center',
        fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif',
        color: '#706b5f', fontSize: 13,
      }}>
        <span style={{ color: '#b8943e', marginRight: 8 }}>♠♥♦♣</span>
        Poker Open Play © 2026 — All rights reserved
      </footer>
    </div>
  )
}
