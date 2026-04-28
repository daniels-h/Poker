import { createClient } from '@/lib/supabase/server'
import { computeStreak } from '@/lib/stats'
import { formatPnl, formatDate } from '@/lib/format'
import Link from 'next/link'
import CountdownClock from '@/components/felt/CountdownClock'

export const revalidate = 0

const GOLD = '#C8A951'
const CARD_BG = '#122416'
const CARD_BORDER = 'rgba(200,169,81,0.2)'
const DARK_BORDER = '#1E3A24'
const TEXT_PRIMARY = '#F0EDE4'
const TEXT_MUTED = '#A3B8A8'
const TEXT_DIM = '#7A9A82'

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

  const top3 = leaderboard.slice(0, 3)

  const lastSession = allSessions[0]
  const lastSps = (lastSession?.session_players ?? []) as any[]
  const lastSorted = [...lastSps].sort((a, b) => (b.net ?? 0) - (a.net ?? 0))
  const totalPot = lastSps.reduce((sum: number, sp: any) => sum + (sp.total_buyin ?? 0), 0)

  const avgSessionsPerPlayer = leaderboard.length > 0
    ? Math.round(leaderboard.reduce((a, b) => a + b.sessions, 0) / leaderboard.length)
    : 0

  const nextSessionDateStr = process.env.NEXT_PUBLIC_NEXT_SESSION_DATE ?? null

  const statCards = [
    { icon: '♠', value: String(totalSessions), label: 'Sessions Played' },
    { icon: '♣', value: String(activeCount), label: 'Active Players' },
    { icon: '♦', value: `₱${Math.round(totalVolume / 1000 * 10) / 10}K`, label: 'Total Pot Volume' },
    { icon: '♥', value: String(avgSessionsPerPlayer), label: 'Avg Sessions / Player' },
  ]

  const podiumMedals = [
    { color: '#C0C0C0', label: '2ND', height: 56 },
    { color: '#C8A951', label: '1ST', height: 80 },
    { color: '#CD7F32', label: '3RD', height: 40 },
  ]
  const podiumOrder = top3.length >= 3
    ? [top3[1], top3[0], top3[2]]
    : top3.length === 2
      ? [top3[1], top3[0]]
      : top3

  return (
    <div className="page-wrap-dark">
      {/* Hero */}
      <div style={{
        position: 'relative', textAlign: 'center',
        padding: '88px 40px 64px',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            fontSize: 16, color: GOLD, letterSpacing: '0.6em',
            fontFamily: 'Georgia, serif', marginBottom: 24, opacity: 0.5,
          }}>♠ ♥ ♦ ♣</div>
          <h1 style={{
            fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
            fontSize: 60, fontWeight: 700, color: TEXT_PRIMARY,
            margin: 0, letterSpacing: '0.02em',
          }}>
            Poker Open Play
          </h1>
          <p style={{
            fontFamily: 'var(--font-dm-sans), Inter, sans-serif',
            fontSize: 17, color: GOLD, marginTop: 14, fontStyle: 'italic', letterSpacing: '0.04em',
          }}>
            Where the cards fall and legends are made
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, margin: '28px 0 20px' }}>
            <span style={{ display: 'block', width: 72, height: 1, background: `rgba(200,169,81,0.35)` }} />
            <span style={{ color: GOLD, fontSize: 14, fontFamily: 'Georgia, serif' }}>♠</span>
            <span style={{ display: 'block', width: 72, height: 1, background: `rgba(200,169,81,0.35)` }} />
          </div>
          <p style={{
            fontFamily: 'var(--font-dm-sans), Inter, sans-serif',
            fontSize: 15, color: TEXT_MUTED, maxWidth: 460, margin: '0 auto', lineHeight: 1.75,
          }}>
            A private club for serious players. Track your sessions, climb the leaderboard, and prove your edge.
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 40px 48px' }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {statCards.map(({ icon, value, label }) => (
            <div key={label} style={{
              background: CARD_BG, border: `1px solid ${CARD_BORDER}`,
              borderRadius: 12, padding: '18px 22px',
              display: 'flex', alignItems: 'center', gap: 16,
              flex: '1 1 200px',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'rgba(200,169,81,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, color: GOLD, flexShrink: 0,
              }}>
                {icon}
              </div>
              <div>
                <div style={{
                  fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
                  fontSize: 28, fontWeight: 700, color: GOLD, lineHeight: 1,
                }}>{value}</div>
                <div style={{
                  fontFamily: 'var(--font-dm-sans), Inter, sans-serif',
                  fontSize: 11, color: TEXT_MUTED, marginTop: 5,
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                }}>{label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Three info panels */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 40px 64px' }}>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>

          {/* Panel 1: Countdown */}
          <div style={{
            flex: '1 1 280px', background: CARD_BG,
            border: `1px solid ${CARD_BORDER}`,
            borderRadius: 12, padding: '28px 28px 32px', overflow: 'hidden',
          }}>
            <div style={{
              fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
              fontSize: 13, fontWeight: 600, color: GOLD,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              marginBottom: 28,
            }}>Next Session</div>
            <CountdownClock targetDateStr={nextSessionDateStr} />
          </div>

          {/* Panel 2: Last Session */}
          <div style={{
            flex: '1 1 280px', background: CARD_BG,
            border: `1px solid ${CARD_BORDER}`,
            borderRadius: 12, padding: '28px 28px 32px',
          }}>
            <div style={{
              fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
              fontSize: 13, fontWeight: 600, color: GOLD,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              marginBottom: 24,
            }}>Last Session</div>

            {lastSession ? (
              <>
                <div style={{
                  fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
                  fontSize: 22, fontWeight: 700, color: TEXT_PRIMARY,
                }}>{formatDate(lastSession.date)}</div>
                <div style={{
                  fontFamily: 'var(--font-dm-sans), Inter, sans-serif',
                  fontSize: 13, color: TEXT_DIM, marginTop: 4, marginBottom: 20,
                }}>{lastSps.length} players · {lastSession.name}</div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {lastSorted.slice(0, 2).map((sp: any, i: number) => (
                    <div key={sp.player_id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 14px', borderRadius: 8,
                      background: i === 0 ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${i === 0 ? 'rgba(34,197,94,0.15)' : DARK_BORDER}`,
                    }}>
                      <span style={{
                        fontFamily: 'var(--font-dm-sans), Inter, sans-serif',
                        fontSize: 14, color: TEXT_PRIMARY,
                      }}>
                        {i === 0 ? '🏆 ' : ''}{sp.player?.name ?? '?'}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-dm-sans), Inter, sans-serif',
                        fontWeight: 700, fontSize: 14,
                        color: (sp.net ?? 0) >= 0 ? '#22C55E' : '#EF4444',
                      }}>
                        {formatPnl(sp.net ?? 0)}
                      </span>
                    </div>
                  ))}
                  {totalPot > 0 && (
                    <div style={{
                      fontFamily: 'var(--font-dm-sans), Inter, sans-serif',
                      fontSize: 13, color: TEXT_DIM, paddingTop: 8,
                    }}>
                      Total pot: <span style={{ color: TEXT_MUTED, fontWeight: 600 }}>₱{totalPot.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div style={{
                fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
                fontSize: 18, fontWeight: 600, color: TEXT_DIM, fontStyle: 'italic',
              }}>No sessions yet</div>
            )}

            <Link href="/sessions" style={{
              display: 'inline-block', marginTop: 20,
              fontFamily: 'var(--font-dm-sans), Inter, sans-serif',
              fontSize: 13, fontWeight: 600, color: GOLD, textDecoration: 'none',
              letterSpacing: '0.02em',
            }}>
              View all sessions →
            </Link>
          </div>

          {/* Panel 3: Season Leaders podium */}
          <div style={{
            flex: '1 1 280px', background: CARD_BG,
            border: `1px solid ${CARD_BORDER}`,
            borderRadius: 12, padding: '28px 28px 32px',
          }}>
            <div style={{
              fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
              fontSize: 13, fontWeight: 600, color: GOLD,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              marginBottom: 24,
            }}>Season Leaders</div>

            {top3.length > 0 ? (
              <>
                {/* Podium */}
                <div style={{
                  display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                  gap: 12, marginBottom: 20,
                }}>
                  {podiumOrder.map((player, i) => {
                    const actualRank = leaderboard.indexOf(player)
                    const medal = podiumMedals[top3.length >= 3 ? i : (top3.length === 2 ? [0, 1][i] : 1)]
                    return (
                      <div key={player.id} style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{
                          fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
                          fontSize: actualRank === 0 ? 15 : 13,
                          fontWeight: 700, color: TEXT_PRIMARY,
                          marginBottom: 4,
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>{player.name}</div>
                        <div style={{
                          fontFamily: 'var(--font-dm-sans), Inter, sans-serif',
                          fontSize: 12, color: actualRank === 0 ? '#22C55E' : TEXT_DIM,
                          marginBottom: 8, fontWeight: actualRank === 0 ? 600 : 400,
                        }}>{formatPnl(player.totalPnl)}</div>
                        <div style={{
                          height: medal.height,
                          background: actualRank === 0
                            ? 'linear-gradient(180deg, #C8A951 0%, #9A7830 100%)'
                            : actualRank === 1
                              ? 'linear-gradient(180deg, #C0C0C0 0%, #909090 100%)'
                              : 'linear-gradient(180deg, #CD7F32 0%, #9A5A20 100%)',
                          borderRadius: '6px 6px 0 0',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'var(--font-playfair), serif',
                          fontSize: actualRank === 0 ? 24 : 18, fontWeight: 700,
                          color: '#0B1A0F',
                        }}>
                          {actualRank + 1}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* 1st place details */}
                {top3[0] && (
                  <div style={{
                    fontFamily: 'var(--font-dm-sans), Inter, sans-serif',
                    fontSize: 13, color: TEXT_DIM, textAlign: 'center',
                  }}>
                    Sessions: <span style={{ color: TEXT_MUTED }}>{top3[0].sessions}</span>
                    {' · '}
                    Win Rate: <span style={{ color: TEXT_MUTED }}>{top3[0].winRate}%</span>
                  </div>
                )}
              </>
            ) : (
              <div style={{
                fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
                fontSize: 18, fontWeight: 600, color: TEXT_DIM, fontStyle: 'italic',
              }}>No data yet</div>
            )}

            <Link href="/leaderboard" style={{
              display: 'inline-block', marginTop: 20,
              fontFamily: 'var(--font-dm-sans), Inter, sans-serif',
              fontSize: 13, fontWeight: 600, color: GOLD, textDecoration: 'none',
            }}>
              Full leaderboard →
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        borderTop: `1px solid ${DARK_BORDER}`,
        padding: '28px 40px', textAlign: 'center',
        fontFamily: 'var(--font-dm-sans), Inter, sans-serif',
        color: TEXT_DIM, fontSize: 13,
      }}>
        <span style={{ color: GOLD, marginRight: 8, opacity: 0.6 }}>♠♥♦♣</span>
        Poker Open Play © 2026 — All rights reserved
      </footer>
    </div>
  )
}
