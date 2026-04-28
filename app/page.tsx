import { createClient } from '@/lib/supabase/server'
import { computeStreak } from '@/lib/stats'
import { formatPnl, formatDate } from '@/lib/format'
import Link from 'next/link'

export const revalidate = 0

const GOLD = '#C9A84C'
const CARD_BG = 'rgba(20,25,20,0.75)'
const CARD_BORDER = 'rgba(201,168,76,0.15)'
const TEXT_WHITE = '#E5E7EB'
const TEXT_GRAY = '#9CA3AF'
const TEXT_DIM = '#6B7280'

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

      {/* ── Hero ── */}
      <div style={{
        position: 'relative',
        textAlign: 'center',
        padding: '100px 40px 72px',
        background: 'radial-gradient(ellipse at 50% -10%, #1A2A1A 0%, #0F170F 60%)',
        overflow: 'hidden',
      }}>

        {/* Felt texture overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          opacity: 0.07,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1' cy='1' r='0.4' fill='%23ffffff' fill-opacity='1'/%3E%3C/svg%3E")`,
        }} />

        {/* Sweeping arc lines */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: [
            'radial-gradient(ellipse 900px 900px at 50% 130%, transparent 67%, rgba(255,255,255,0.07) 68%, transparent 69.5%)',
            'radial-gradient(ellipse 680px 680px at 50% 130%, transparent 67%, rgba(255,255,255,0.06) 68%, transparent 69.5%)',
            'radial-gradient(ellipse 1140px 1140px at 50% 130%, transparent 67%, rgba(255,255,255,0.05) 68%, transparent 69.5%)',
            'radial-gradient(ellipse 1380px 500px at 20% 110%, transparent 67%, rgba(255,255,255,0.04) 68%, transparent 69.5%)',
          ].join(', '),
        }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1 }}>

          {/* 3 decorative suits above title */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
            marginBottom: 28,
          }}>
            {['♠', '♥', '♦'].map(s => (
              <span key={s} style={{
                fontSize: 13, color: GOLD, opacity: 0.55,
                fontFamily: 'Georgia, serif',
              }}>{s}</span>
            ))}
          </div>

          {/* Title — gold */}
          <h1 style={{
            fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
            fontSize: 66, fontWeight: 700, color: GOLD,
            margin: 0, letterSpacing: '0.02em',
            textShadow: '0 2px 40px rgba(201,168,76,0.2)',
          }}>
            Poker Open Play
          </h1>

          {/* Tagline — gold italic */}
          <p style={{
            fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
            fontSize: 18, color: GOLD, marginTop: 16,
            fontStyle: 'italic', letterSpacing: '0.04em', opacity: 0.85,
          }}>
            Where the cards fall and legends are made
          </p>

          {/* Diamond divider */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 14, margin: '28px 0 24px',
          }}>
            <span style={{ display: 'block', width: 80, height: 1, background: `rgba(201,168,76,0.35)` }} />
            <span style={{ color: GOLD, fontSize: 13, fontFamily: 'Georgia, serif', opacity: 0.7 }}>♦</span>
            <span style={{ display: 'block', width: 80, height: 1, background: `rgba(201,168,76,0.35)` }} />
          </div>

          {/* Body text — neutral gray */}
          <p style={{
            fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif',
            fontSize: 16, color: TEXT_GRAY,
            maxWidth: 480, margin: '0 auto', lineHeight: 1.75,
          }}>
            A private club for serious players. Track your sessions, climb the leaderboard, and prove your edge.
          </p>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ background: 'rgba(0,0,0,0.25)', padding: '44px 0' }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '0 40px',
          display: 'flex', gap: 20, flexWrap: 'wrap',
        }}>
          {[
            { icon: '♠', value: String(totalSessions), label: 'Sessions Played' },
            { icon: '♣', value: String(activeCount), label: 'Active Players' },
            { icon: '♦', value: `₱${Math.round(totalVolume / 1000 * 10) / 10}K`, label: 'Total Pot Volume' },
            {
              icon: '♥',
              value: leaderboard.length > 0
                ? String(Math.round(leaderboard.reduce((a, b) => a + b.sessions, 0) / Math.max(leaderboard.length, 1)))
                : '0',
              label: 'Avg Sessions / Player',
            },
          ].map(({ icon, value, label }) => (
            <div key={label} style={{
              background: CARD_BG,
              border: `1px solid ${CARD_BORDER}`,
              borderRadius: 12, padding: '28px 24px', textAlign: 'center',
              backdropFilter: 'blur(8px)', flex: '1 1 200px',
            }}>
              {/* Suit icon — muted white */}
              <div style={{
                fontSize: 24, marginBottom: 10,
                color: 'rgba(255,255,255,0.35)',
                fontFamily: 'Georgia, serif',
              }}>{icon}</div>
              <div style={{
                fontSize: 36,
                fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
                fontWeight: 700, color: GOLD, marginBottom: 6,
              }}>{value}</div>
              <div style={{
                fontSize: 11, color: TEXT_GRAY,
                fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif',
                textTransform: 'uppercase', letterSpacing: '0.12em',
              }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Info cards ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 40px' }}>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>

          {/* Next Session */}
          <div style={{
            flex: '1 1 300px', background: CARD_BG, borderRadius: 12,
            border: `1px solid ${CARD_BORDER}`, overflow: 'hidden',
          }}>
            <div style={{
              background: 'rgba(0,0,0,0.3)', color: GOLD, padding: '14px 24px',
              fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
              fontSize: 13, fontWeight: 600, letterSpacing: '0.08em',
              textTransform: 'uppercase', borderBottom: `1px solid ${CARD_BORDER}`,
            }}>
              Next Session
            </div>
            <div style={{ padding: '24px' }}>
              {nextSession ? (
                <>
                  <div style={{
                    fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
                    fontSize: 22, fontWeight: 700, color: TEXT_WHITE,
                  }}>{formatDate(nextSession.date)}</div>
                  <div style={{
                    fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif',
                    fontSize: 14, color: TEXT_GRAY, marginTop: 4,
                  }}>{nextSession.name}</div>
                </>
              ) : (
                <>
                  <div style={{
                    fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
                    fontSize: 22, fontWeight: 700, color: TEXT_WHITE,
                  }}>TBD</div>
                  <div style={{
                    fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif',
                    fontSize: 14, color: TEXT_GRAY, marginTop: 4,
                  }}>No upcoming session scheduled</div>
                </>
              )}
              <Link href="/sessions" style={{
                display: 'inline-block', marginTop: 18,
                padding: '6px 14px', borderRadius: 20,
                background: 'rgba(201,168,76,0.1)', color: GOLD,
                fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif',
                fontSize: 13, fontWeight: 600, textDecoration: 'none',
                border: `1px solid rgba(201,168,76,0.2)`,
              }}>
                View Sessions →
              </Link>
            </div>
          </div>

          {/* Last Session */}
          <div style={{
            flex: '1 1 300px', background: CARD_BG, borderRadius: 12,
            border: `1px solid ${CARD_BORDER}`, overflow: 'hidden',
          }}>
            <div style={{
              background: 'rgba(0,0,0,0.3)', color: GOLD, padding: '14px 24px',
              fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
              fontSize: 13, fontWeight: 600, letterSpacing: '0.08em',
              textTransform: 'uppercase', borderBottom: `1px solid ${CARD_BORDER}`,
            }}>
              Last Session
            </div>
            <div style={{ padding: '24px' }}>
              {lastSession ? (
                <>
                  <div style={{
                    fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
                    fontSize: 22, fontWeight: 700, color: TEXT_WHITE,
                  }}>{formatDate(lastSession.date)}</div>
                  <div style={{
                    fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif',
                    fontSize: 14, color: TEXT_GRAY, marginTop: 4,
                  }}>
                    {lastSps.length} players · {lastSession.name}
                  </div>
                  {lastWinner && (
                    <div style={{ marginTop: 18 }}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between', padding: '8px 0',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif',
                        fontSize: 14, color: TEXT_GRAY,
                      }}>
                        <span>🏆 Top Winner</span>
                        <span style={{ color: '#4a7c59', fontWeight: 600 }}>
                          {lastWinner.player?.name} ({formatPnl(lastWinner.net)})
                        </span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div style={{
                  fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
                  fontSize: 22, fontWeight: 700, color: TEXT_DIM, fontStyle: 'italic',
                }}>No sessions yet</div>
              )}
            </div>
          </div>

          {/* Season Leader */}
          <div style={{
            flex: '1 1 300px', background: CARD_BG, borderRadius: 12,
            border: `1px solid ${CARD_BORDER}`, overflow: 'hidden',
          }}>
            <div style={{
              background: 'rgba(0,0,0,0.3)', color: GOLD, padding: '14px 24px',
              fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
              fontSize: 13, fontWeight: 600, letterSpacing: '0.08em',
              textTransform: 'uppercase', borderBottom: `1px solid ${CARD_BORDER}`,
            }}>
              Season Leader
            </div>
            <div style={{ padding: '24px' }}>
              {seasonLeader ? (
                <>
                  <div style={{ fontSize: 44, marginBottom: 10, color: GOLD, fontFamily: 'Georgia, serif' }}>♠</div>
                  <div style={{
                    fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
                    fontSize: 22, fontWeight: 700, color: TEXT_WHITE,
                  }}>{seasonLeader.name}</div>
                  <div style={{
                    fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif',
                    fontSize: 14, color: TEXT_GRAY, marginTop: 4,
                  }}>
                    {formatPnl(seasonLeader.totalPnl)} · {seasonLeader.winRate}% win rate
                  </div>
                  <div style={{
                    display: 'inline-block', marginTop: 14, padding: '5px 12px', borderRadius: 20,
                    background: 'rgba(201,168,76,0.1)', color: GOLD,
                    fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif',
                    fontSize: 13, fontWeight: 600,
                    border: `1px solid rgba(201,168,76,0.2)`,
                  }}>
                    {seasonLeader.sessions} sessions
                  </div>
                </>
              ) : (
                <div style={{
                  fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
                  fontSize: 22, fontWeight: 700, color: TEXT_DIM, fontStyle: 'italic',
                }}>No data yet</div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer style={{
        background: '#111611', borderTop: '1px solid rgba(201,168,76,0.2)',
        padding: '32px 40px', textAlign: 'center',
        fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif',
        color: TEXT_DIM, fontSize: 13,
      }}>
        <span style={{ color: GOLD, marginRight: 8, opacity: 0.5 }}>♠♥♦♣</span>
        Poker Open Play © 2026 — All rights reserved
      </footer>
    </div>
  )
}
