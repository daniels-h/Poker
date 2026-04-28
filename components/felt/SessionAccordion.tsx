'use client'

import { useState } from 'react'

interface SessionPlayer {
  player_id: string
  name: string
  net: number
}

interface Session {
  id: string
  date: string
  name: string
  notes: string | null
  player_count: number
  avg_buyin: number
  results: SessionPlayer[]
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

function formatDay(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long' })
}

const GOLD = '#C8A951'
const CARD_BG = '#122416'
const CARD_BORDER = 'rgba(200,169,81,0.18)'
const DARK_BORDER = '#1E3A24'
const TEXT_PRIMARY = '#F0EDE4'
const TEXT_MUTED = '#A3B8A8'
const TEXT_DIM = '#4A6A52'

export default function SessionAccordion({ sessions }: { sessions: Session[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)

  if (sessions.length === 0) {
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {sessions.map(s => (
        <div key={s.id} style={{
          background: CARD_BG, borderRadius: 10,
          border: `1px solid ${CARD_BORDER}`,
          overflow: 'hidden',
        }}>
          {/* Summary row */}
          <div
            onClick={() => setExpanded(expanded === s.id ? null : s.id)}
            style={{
              display: 'grid',
              gridTemplateColumns: '1.5fr 1fr 0.8fr 0.8fr 0.6fr 36px',
              alignItems: 'center', padding: '18px 24px', cursor: 'pointer',
              background: expanded === s.id ? 'rgba(200,169,81,0.05)' : 'transparent',
              transition: 'background 0.15s',
            }}
          >
            <div>
              <div style={{
                fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
                fontSize: 16, fontWeight: 700, color: TEXT_PRIMARY,
              }}>
                {formatDate(s.date)}
              </div>
              <div style={{
                fontFamily: 'var(--font-dm-sans), Inter, sans-serif',
                fontSize: 13, color: TEXT_DIM, marginTop: 2,
              }}>
                {formatDay(s.date)} · {s.name}
              </div>
            </div>
            <MetaCell label="Buy-in" value={s.avg_buyin > 0 ? `₱${s.avg_buyin.toLocaleString()}` : '—'} />
            <MetaCell label="Notes" value={s.notes ?? '—'} />
            <MetaCell label="Players" value={String(s.player_count)} />
            <MetaCell label="Results" value={`${s.results.filter(r => r.net > 0).length}W / ${s.results.filter(r => r.net < 0).length}L`} />
            <div style={{
              color: GOLD, fontSize: 16, textAlign: 'right',
              transition: 'transform 0.2s',
              transform: expanded === s.id ? 'rotate(180deg)' : 'rotate(0)',
            }}>▾</div>
          </div>

          {/* Expanded results */}
          {expanded === s.id && (
            <div style={{
              borderTop: `1px solid ${GOLD}`,
              padding: '18px 24px',
              background: 'rgba(0,0,0,0.2)',
            }}>
              <div style={{
                fontFamily: 'var(--font-dm-sans), Inter, sans-serif',
                fontSize: 11, color: TEXT_MUTED, textTransform: 'uppercase',
                letterSpacing: '0.1em', marginBottom: 12,
              }}>
                Player Results
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: 8,
              }}>
                {s.results.map((r, i) => (
                  <div key={r.player_id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 14px', borderRadius: 8,
                    background: r.net > 0
                      ? 'rgba(34,197,94,0.08)'
                      : r.net < 0
                        ? 'rgba(239,68,68,0.08)'
                        : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${r.net > 0 ? 'rgba(34,197,94,0.15)' : r.net < 0 ? 'rgba(239,68,68,0.12)' : DARK_BORDER}`,
                    fontFamily: 'var(--font-dm-sans), Inter, sans-serif',
                    fontSize: 14, color: TEXT_PRIMARY,
                  }}>
                    <span>{i === 0 && '🏆 '}{r.name}</span>
                    <span style={{
                      fontWeight: 700,
                      color: r.net > 0 ? '#22C55E' : r.net < 0 ? '#EF4444' : TEXT_DIM,
                    }}>
                      {r.net > 0 ? `+₱${r.net.toLocaleString()}` : r.net < 0 ? `−₱${Math.abs(r.net).toLocaleString()}` : 'Even'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ fontFamily: 'var(--font-dm-sans), Inter, sans-serif', fontSize: 14, color: TEXT_PRIMARY }}>
      <span style={{
        display: 'block', fontSize: 11, color: '#7A9A82',
        textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2,
      }}>{label}</span>
      {value}
    </div>
  )
}
