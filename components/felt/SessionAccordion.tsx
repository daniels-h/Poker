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

export default function SessionAccordion({ sessions }: { sessions: Session[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)

  if (sessions.length === 0) {
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {sessions.map(s => (
        <div key={s.id} style={{
          background: '#252420', borderRadius: 12,
          border: '1px solid rgba(184,148,62,0.2)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
          overflow: 'hidden',
        }}>
          {/* Summary row */}
          <div
            onClick={() => setExpanded(expanded === s.id ? null : s.id)}
            style={{
              display: 'grid',
              gridTemplateColumns: '1.5fr 1fr 0.8fr 0.8fr 0.6fr 40px',
              alignItems: 'center', padding: '20px 28px', cursor: 'pointer',
              transition: 'background 0.15s',
              background: expanded === s.id ? 'rgba(184,148,62,0.06)' : 'transparent',
            }}
          >
            <div>
              <div style={{
                fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
                fontSize: 17, fontWeight: 700, color: '#f5f0e8',
              }}>
                {formatDate(s.date)}
              </div>
              <div style={{
                fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif',
                fontSize: 13, color: '#706b5f', marginTop: 2,
              }}>
                {formatDay(s.date)} · {s.name}
              </div>
            </div>
            <MetaCell label="Buy-in" value={s.avg_buyin > 0 ? `₱${s.avg_buyin.toLocaleString()}` : '—'} />
            <MetaCell label="Notes" value={s.notes ?? '—'} />
            <MetaCell label="Players" value={String(s.player_count)} />
            <MetaCell label="Results" value={`${s.results.filter(r => r.net > 0).length}W / ${s.results.filter(r => r.net < 0).length}L`} />
            <div style={{
              color: '#b8943e', fontSize: 18, textAlign: 'right',
              transition: 'transform 0.2s',
              transform: expanded === s.id ? 'rotate(180deg)' : 'rotate(0)',
            }}>▾</div>
          </div>

          {/* Expanded results */}
          {expanded === s.id && (
            <div style={{ borderTop: '2px solid #b8943e', padding: '20px 28px', background: '#1e1c18' }}>
              <div style={{
                fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif',
                fontSize: 12, color: '#a09882', textTransform: 'uppercase',
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
                    padding: '10px 16px', borderRadius: 8,
                    background: r.net > 0
                      ? 'rgba(74,124,89,0.15)'
                      : r.net < 0
                        ? 'rgba(180,60,60,0.12)'
                        : 'rgba(255,255,255,0.05)',
                    fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif',
                    fontSize: 14, color: '#d4cfc2',
                  }}>
                    <span>
                      {i === 0 && '🏆 '}{r.name}
                    </span>
                    <span style={{
                      fontWeight: 700,
                      fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
                      color: r.net > 0 ? '#4a7c59' : r.net < 0 ? '#b44040' : '#706b5f',
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
    <div style={{ fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif', fontSize: 14, color: '#d4cfc2' }}>
      <span style={{
        display: 'block', fontSize: 11, color: '#a09882',
        textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2,
      }}>{label}</span>
      {value}
    </div>
  )
}
