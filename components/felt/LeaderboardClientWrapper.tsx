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
        fontStyle: 'italic', fontSize: 16, color: '#706b5f',
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

  const podiumMedals = ['🥈', '🥇', '🥉']
  const podiumHeights = [140, 180, 110]

  return (
    <>
      {/* Sort toggle */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 32,
        background: '#2a2924', borderRadius: 8, padding: 4, width: 'fit-content',
      }}>
        {([['profit', 'Total Profit'], ['winRate', 'Win Rate']] as const).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setSortBy(k)}
            style={{
              padding: '10px 24px', borderRadius: 6, border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif',
              fontSize: 14, fontWeight: 600,
              background: sortBy === k ? '#b8943e' : 'transparent',
              color: sortBy === k ? '#1a1a18' : '#a09882',
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
          display: 'flex', gap: 20, marginBottom: 40,
          justifyContent: 'center', alignItems: 'flex-end',
        }}>
          {podiumOrder.map((p, i) => {
            const isFirst = podium.length >= 3 ? i === 1 : (podium.length === 2 ? i === 1 : true)
            const height = podium.length >= 3 ? podiumHeights[i] : (podium.length === 2 ? [140, 180][i] : 180)
            const medal = podium.length >= 3 ? podiumMedals[i] : (podium.length === 2 ? ['🥈', '🥇'][i] : '🥇')
            const rank = sorted.indexOf(p) + 1
            return (
              <div key={p.id} style={{ textAlign: 'center', width: 220 }}>
                <div style={{ fontSize: isFirst ? 48 : 36, marginBottom: 8 }}>{medal}</div>
                <div style={{
                  fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
                  fontSize: isFirst ? 22 : 18, fontWeight: 700, color: '#f5f0e8', marginBottom: 4,
                }}>{p.name}</div>
                <div style={{
                  fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif',
                  fontSize: 14, color: '#706b5f', marginBottom: 12,
                }}>
                  {sortBy === 'profit' ? formatPnl(p.totalPnl) : `${p.winRate}% win rate`}
                </div>
                <div style={{
                  height,
                  background: isFirst
                    ? 'linear-gradient(180deg, #b8943e 0%, #8a6d2a 100%)'
                    : 'linear-gradient(180deg, #d4cfc2 0%, #aba595 100%)',
                  borderRadius: '8px 8px 0 0',
                  display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
                  paddingTop: 16,
                  fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
                  fontSize: 32, fontWeight: 700,
                  color: isFirst ? '#1a1a18' : '#fff',
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
        background: '#252420', borderRadius: 12,
        border: '1px solid rgba(184,148,62,0.2)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.3)', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '60px 1.5fr 1fr 1fr 1fr',
          padding: '14px 28px', background: '#1a1a18',
          fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif',
          fontSize: 12, color: '#a09882',
          textTransform: 'uppercase', letterSpacing: '0.1em',
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
            borderBottom: i < sorted.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            background: i < 3 ? 'rgba(184,148,62,0.06)' : 'transparent',
            fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif', fontSize: 15,
          }}>
            <span style={{
              fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
              fontWeight: 700, color: i < 3 ? '#b8943e' : '#a09882', fontSize: 18,
            }}>{i + 1}</span>

            <div>
              <div style={{ fontWeight: 600, color: '#f5f0e8' }}>{p.name}</div>
              {p.nickname && (
                <div style={{ fontSize: 12, color: '#b8943e', fontStyle: 'italic' }}>
                  "{p.nickname}"
                </div>
              )}
            </div>

            <span style={{ color: '#706b5f' }}>{p.sessions}</span>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                fontWeight: 700,
                fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
                color: p.totalPnl >= 0 ? '#4a7c59' : '#b44040',
              }}>
                {formatPnl(p.totalPnl)}
              </span>
              <div style={{
                flex: 1, height: 6, background: '#3a3830', borderRadius: 3,
                overflow: 'hidden', maxWidth: 100,
              }}>
                <div style={{
                  height: '100%', borderRadius: 3,
                  width: `${(Math.abs(p.totalPnl) / maxAbs) * 100}%`,
                  background: p.totalPnl >= 0
                    ? 'linear-gradient(90deg, #4a7c59, #6aa57a)'
                    : 'linear-gradient(90deg, #b44040, #d46a6a)',
                }} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#f5f0e8', fontWeight: 600 }}>{p.winRate}%</span>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: `conic-gradient(#b8943e ${p.winRate * 3.6}deg, #3a3830 ${p.winRate * 3.6}deg)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: i < 3 ? '#2a2924' : '#252420',
                }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
