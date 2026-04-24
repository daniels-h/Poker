'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Player { id: string; name: string; nickname: string | null }

const fieldStyle = {
  width: '100%',
  background: 'rgba(0,0,0,0.35)',
  border: '1px solid rgba(138,115,64,0.5)',
  borderRadius: 2,
  padding: '9px 12px',
  color: 'var(--ivory)',
  fontFamily: 'var(--font-mono)',
  fontSize: 13,
  outline: 'none',
}

const labelStyle = {
  display: 'block',
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  color: 'var(--brass)',
  letterSpacing: '0.15em',
  textTransform: 'uppercase' as const,
  marginBottom: 6,
}

const card = {
  background: 'rgba(0,0,0,0.25)',
  border: '1px solid rgba(138,115,64,0.6)',
  borderRadius: 4,
  padding: '24px 28px',
  marginBottom: 20,
}

export default function NewSessionForm({ players }: { players: Player[] }) {
  const [name, setName] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = useState('')
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set())
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  function togglePlayer(id: string) {
    setSelectedPlayers(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Session name is required.'); return }
    setError(''); setLoading(true)
    const supabase = createClient()

    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({ name: name.trim(), date, notes: notes.trim() || null })
      .select().single()

    if (sessionError) { setError(sessionError.message); setLoading(false); return }

    if (selectedPlayers.size > 0) {
      const rows = Array.from(selectedPlayers).map(player_id => ({
        session_id: session.id, player_id, total_buyin: 0, cashout: 0,
      }))
      const { error: spError } = await supabase.from('session_players').insert(rows)
      if (spError) { setError(spError.message); setLoading(false); return }
    }

    router.push(`/admin/sessions/${session.id}/edit`)
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div style={{ background: 'rgba(214,96,88,0.15)', border: '1px solid rgba(214,96,88,0.4)', borderRadius: 2, padding: '10px 14px', marginBottom: 16, color: 'var(--loss)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
          {error}
        </div>
      )}

      <div style={card}>
        <div className="font-mono uppercase mb-4" style={{ fontSize: 10, color: 'var(--brass)', letterSpacing: '0.2em' }}>Session Details</div>
        <div className="space-y-4">
          <div>
            <label style={labelStyle}>Session Name</label>
            <input style={fieldStyle} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Friday Night" required />
          </div>
          <div>
            <label style={labelStyle}>Date</label>
            <input type="date" style={fieldStyle} value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          <div>
            <label style={labelStyle}>Notes (optional)</label>
            <textarea
              style={{ ...fieldStyle, resize: 'none' }}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Stakes, format, venue…"
              rows={3}
            />
          </div>
        </div>
      </div>

      <div style={card}>
        <div className="font-mono uppercase mb-4" style={{ fontSize: 10, color: 'var(--brass)', letterSpacing: '0.2em' }}>Select Players</div>
        {players.length === 0 && (
          <p className="font-fraunces italic" style={{ color: 'var(--ivory-dim)', fontSize: 14 }}>No players in roster yet.</p>
        )}
        <div className="space-y-2">
          {players.map(p => (
            <label key={p.id} className="flex items-center gap-3 cursor-pointer py-1">
              <input
                type="checkbox"
                checked={selectedPlayers.has(p.id)}
                onChange={() => togglePlayer(p.id)}
                style={{ accentColor: 'var(--brass)', width: 16, height: 16 }}
              />
              <span className="font-fraunces text-ivory" style={{ fontSize: 15 }}>{p.name}</span>
              {p.nickname && <span className="font-fraunces italic" style={{ fontSize: 12, color: 'var(--brass)' }}>"{p.nickname}"</span>}
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          background: 'var(--brass)', color: 'var(--ink)', border: 'none', borderRadius: 2,
          padding: '10px 24px', fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600,
          letterSpacing: '0.15em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? 'Creating…' : 'Create Session'}
      </button>
    </form>
  )
}
