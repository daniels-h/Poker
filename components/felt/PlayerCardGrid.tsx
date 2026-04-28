'use client'

import { useState } from 'react'

export interface PlayerCardData {
  id: string
  name: string
  nickname: string | null
  sessions: number
  totalPnl: number
  winRate: number
  streak: string
  history: number[]
}

const GOLD = '#C9A84C'
const CARD_BG = 'rgba(20,25,20,0.75)'
const CARD_BORDER = 'rgba(201,168,76,0.15)'
const TEXT_WHITE = '#E5E7EB'
const TEXT_GRAY = '#9CA3AF'
const TEXT_DIM = '#6B7280'

function formatPnl(amount: number): string {
  const abs = Math.abs(Math.round(amount))
  if (amount > 0) return `+₱${abs.toLocaleString()}`
  if (amount < 0) return `−₱${abs.toLocaleString()}`
  return '₱0'
}

function MiniChart({ data }: { data: number[] }) {
  if (data.length < 2) return null
  const max = Math.max(...data.map(Math.abs), 1)
  const h = 48, w = 120
  const mid = h / 2
  const step = w / (data.length - 1)
  const points = data.map((v, i) => `${i * step},${mid - (v / max) * (mid - 4)}`).join(' ')

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <line x1="0" y1={mid} x2={w} y2={mid} stroke="rgba(201,168,76,0.2)" strokeWidth="1" />
      <polyline points={points} fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => (
        <circle key={i} cx={i * step} cy={mid - (v / max) * (mid - 4)} r="3"
          fill={v >= 0 ? '#4a7c59' : '#b44040'} />
      ))}
    </svg>
  )
}

export default function PlayerCardGrid({ players }: { players: PlayerCardData[] }) {
  const [selected, setSelected] = useState<string | null>(null)

  if (players.length === 0) {
    return (
      <p style={{
        textAlign: 'center', padding: '64px 0',
        fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
        fontStyle: 'italic', fontSize: 16, color: TEXT_DIM,
      }}>
        No players yet. The books are open.
      </p>
    )
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
      gap: 20,
    }}>
      {players.map(p => {
        const isSelected = selected === p.id
        const isWinStreak = p.streak.startsWith('W')

        return (
          <div
            key={p.id}
            onClick={() => setSelected(isSelected ? null : p.id)}
            style={{
              background: CARD_BG, borderRadius: 12,
              border: isSelected
                ? `1px solid rgba(201,168,76,0.5)`
                : `1px solid ${CARD_BORDER}`,
              backdropFilter: 'blur(8px)',
              overflow: 'hidden', cursor: 'pointer',
              transition: 'border-color 0.2s',
            }}
          >
            {/* Card top */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px' }}>
              {/* Avatar */}
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'rgba(0,0,0,0.3)',
                border: `1px solid rgba(201,168,76,0.3)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
                fontSize: 22, fontWeight: 700, color: GOLD, flexShrink: 0,
              }}>
                {p.name.charAt(0).toUpperCase()}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
                  fontSize: 18, fontWeight: 700, color: TEXT_WHITE,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{p.name}</div>
                {p.nickname && (
                  <div style={{
                    fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif',
                    fontSize: 13, color: GOLD, fontStyle: 'italic',
                  }}>
                    "{p.nickname}"
                  </div>
                )}
              </div>

              <div style={{
                padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif',
                background: isWinStreak ? 'rgba(74,124,89,0.12)' : 'rgba(180,64,64,0.08)',
                color: isWinStreak ? '#4a7c59' : '#b44040',
              }}>
                {p.streak}
              </div>
            </div>

            {/* Stats row */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(0,0,0,0.2)',
            }}>
              {([
                ['Sessions', String(p.sessions), false],
                ['Profit', formatPnl(p.totalPnl), true],
                ['Win Rate', `${p.winRate}%`, false],
              ] as [string, string, boolean][]).map(([label, val, isProfit], j) => (
                <div key={j} style={{
                  padding: '14px 16px', textAlign: 'center',
                  borderRight: j < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif',
                    fontSize: 11, color: TEXT_GRAY,
                    textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4,
                  }}>{label}</div>
                  <div style={{
                    fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
                    fontSize: 16, fontWeight: 700,
                    color: isProfit
                      ? (p.totalPnl >= 0 ? '#4a7c59' : '#b44040')
                      : TEXT_WHITE,
                  }}>{val}</div>
                </div>
              ))}
            </div>

            {/* Expanded section */}
            {isSelected && p.history.length > 0 && (
              <div style={{
                borderTop: `1px solid rgba(201,168,76,0.25)`,
                padding: '20px 24px',
                background: 'rgba(0,0,0,0.2)',
              }}>
                <div style={{
                  fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif',
                  fontSize: 12, color: TEXT_GRAY, textTransform: 'uppercase',
                  letterSpacing: '0.1em', marginBottom: 12,
                }}>
                  Recent Sessions
                </div>
                <MiniChart data={p.history} />
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
                  {p.history.map((v, j) => (
                    <div key={j} style={{
                      padding: '4px 10px', borderRadius: 6, fontSize: 13,
                      fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif',
                      fontWeight: 600,
                      background: v >= 0 ? 'rgba(74,124,89,0.1)' : 'rgba(180,64,64,0.08)',
                      color: v >= 0 ? '#4a7c59' : '#b44040',
                    }}>
                      {v >= 0 ? '+' : ''}₱{Math.abs(v).toLocaleString()}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
