'use client'

import { useState } from 'react'

export interface LeaderboardEntry {
  id: string
  name: string
  nickname: string | null
  sessions: number
  winRate: number
  totalPnl: number
}

const GOLD = '#C8A951'
const CARD_BG = '#122416'
const CARD_BORDER = 'rgba(200,169,81,0.18)'
const DARK_BORDER = '#1E3A24'
const TEXT_PRIMARY = '#F0EDE4'
const TEXT_MUTED = '#A3B8A8'
const TEXT_DIM = '#7A9A82'

function formatPnl(amount: number): string {
  const abs = Math.abs(Math.round(amount))
  if (amount > 0) return `+₱${abs.toLocaleString()}`
  if (amount < 0) return `−₱${abs.toLocaleString()}`
  return '₱0'
}

export default function LeaderboardClientWrapper({ rows }: { rows: LeaderboardEntry[] }) {
  const [sortBy, setSortBy] = useState<'profit' | 'winRate'>('profit')

  const sorted = [...rows].sort((a, b) =>
    sortBy === 'profit' ? b.totalPnl - a.totalPnl : b.winRate - a.winRate
  )

  const maxAbs = Math.max(...rows.map(r => Math.abs(r.totalPnl)), 1)

  if (rows.length === 0) {
    return (
      <p style={{
        textAlign: 'center', padding: '64px 0',
        fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
        fontStyle: 'italic', fontSize: 16, color: TEXT_DIM,
      }}>
        No sessions yet. The books are open.
      </p>
    )
  }

  const podium = sorted.slice(0, Math.min(3, sorted.length))
  const podiumOrder = podium.length >= 3
    ? [podium[1], podium[0], podium[2]]
    : podium.length === 2
      ? [podium[1], podium[0]]
      : [podium[0]]

  const podiumHeights = [140, 180, 110]
  const podiumColors = [
    'linear-gradient(180deg, #C0C0C0 0%, #909090 100%)',
    'linear-gradient(180deg, #C8A951 0%, #9A7830 100%)',
    'linear-gradient(180deg, #CD7F32 0%, #9A5A20 100%)',
  ]

  return (
    <>
      {/* Sort toggle */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 36,
        background: 'rgba(0,0,0,0.25)', border: `1px solid ${DARK_BORDER}`,
        borderRadius: 8, padding: 4, width: 'fit-content',
      }}>
        {([['profit', 'Total Profit'], ['winRate', 'Win Rate']] as const).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setSortBy(k)}
            style={{
              padding: '9px 22px', borderRadius: 6, border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-dm-sans), Inter, sans-serif',
              fontSize: 13, fontWeight: 600,
              background: sortBy === k ? GOLD : 'transparent',
              color: sortBy === k ? '#0B1A0F' : TEXT_MUTED,
              transition: 'all 0.2s',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Podium */}
      {podium.length >= 1 && (
        <div style={{
          display: 'flex', gap: 20, marginBottom: 48,
          justifyContent: 'center', alignItems: 'flex-end',
        }}>
          {podiumOrder.map((p, i) => {
            const isFirst = podium.length >= 3 ? i === 1 : (podium.length === 2 ? i === 1 : true)
            const height = podium.length >= 3 ? podiumHeights[i] : (podium.length === 2 ? [140, 180][i] : 180)
            const bgColor = podium.length >= 3 ? podiumColors[i] : (podium.length === 2 ? [podiumColors[0], podiumColors[1]][i] : podiumColors[1])
            const rank = sorted.indexOf(p) + 1
            return (
              <div key={p.id} style={{ textAlign: 'center', width: 200 }}>
                <div style={{
                  fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
                  fontSize: isFirst ? 20 : 16, fontWeight: 700, color: TEXT_PRIMARY, marginBottom: 4,
                }}>{p.name}</div>
                <div style={{
                  fontFamily: 'var(--font-dm-sans), Inter, sans-serif',
                  fontSize: 13, color: TEXT_DIM, marginBottom: 12,
                }}>
                  {sortBy === 'profit' ? formatPnl(p.totalPnl) : `${p.winRate}% win rate`}
                </div>
                <div style={{
                  height,
                  background: bgColor,
                  borderRadius: '8px 8px 0 0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  paddingTop: 16,
                  fontFamily: 'var(--font-playfair), serif',
                  fontSize: isFirst ? 32 : 24, fontWeight: 700,
                  color: '#0B1A0F',
                  alignSelf: 'flex-start',
                }}>
                  {rank}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Full table */}
      <div style={{
        background: CARD_BG, borderRadius: 12,
        border: `1px solid ${CARD_BORDER}`,
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '60px 1.5fr 1fr 1fr 1fr',
          padding: '14px 28px', background: 'rgba(0,0,0,0.2)',
          fontFamily: 'var(--font-dm-sans), Inter, sans-serif',
          fontSize: 11, color: TEXT_MUTED,
          textTransform: 'uppercase', letterSpacing: '0.1em',
          borderBottom: `1px solid ${DARK_BORDER}`,
        }}>
          <span>#</span>
          <span>Player</span>
          <span>Sessions</span>
          <span>Total Profit</span>
          <span>Win Rate</span>
        </div>

        {sorted.map((p, i) => (
          <div key={p.id} style={{
            display: 'grid', gridTemplateColumns: '60px 1.5fr 1fr 1fr 1fr',
            padding: '16px 28px', alignItems: 'center',
            borderBottom: i < sorted.length - 1 ? `1px solid ${DARK_BORDER}` : 'none',
            background: i < 3 ? 'rgba(200,169,81,0.04)' : 'transparent',
            fontFamily: 'var(--font-dm-sans), Inter, sans-serif', fontSize: 15,
          }}>
            <span style={{
              fontFamily: 'var(--font-playfair), serif',
              fontWeight: 700, color: i < 3 ? GOLD : TEXT_MUTED, fontSize: 18,
            }}>{i + 1}</span>

            <div>
              <div style={{ fontWeight: 600, color: TEXT_PRIMARY }}>{p.name}</div>
              {p.nickname && (
                <div style={{ fontSize: 12, color: GOLD, fontStyle: 'italic' }}>
                  "{p.nickname}"
                </div>
              )}
            </div>

            <span style={{ color: TEXT_DIM }}>{p.sessions}</span>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                fontWeight: 700,
                color: p.totalPnl >= 0 ? '#22C55E' : '#EF4444',
              }}>
                {formatPnl(p.totalPnl)}
              </span>
              <div style={{
                flex: 1, height: 4, background: DARK_BORDER, borderRadius: 2,
                overflow: 'hidden', maxWidth: 80,
              }}>
                <div style={{
                  height: '100%', borderRadius: 2,
                  width: `${(Math.abs(p.totalPnl) / maxAbs) * 100}%`,
                  background: p.totalPnl >= 0 ? '#22C55E' : '#EF4444',
                  opacity: 0.6,
                }} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: TEXT_PRIMARY, fontWeight: 600 }}>{p.winRate}%</span>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: `conic-gradient(${GOLD} ${p.winRate * 3.6}deg, ${DARK_BORDER} ${p.winRate * 3.6}deg)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: i < 3 ? '#0F1F12' : CARD_BG,
                }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
