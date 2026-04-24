'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Player { id: string; name: string; nickname: string | null; active: boolean }

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

const btnPrimary = {
  background: 'var(--brass)',
  color: 'var(--ink)',
  border: 'none',
  borderRadius: 2,
  padding: '8px 16px',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.15em',
  textTransform: 'uppercase' as const,
  cursor: 'pointer',
}

const btnOutline = {
  background: 'transparent',
  color: 'var(--ivory)',
  border: '1px solid rgba(138,115,64,0.5)',
  borderRadius: 2,
  padding: '5px 12px',
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
  cursor: 'pointer',
}

const card = {
  background: 'rgba(0,0,0,0.25)',
  border: '1px solid rgba(138,115,64,0.6)',
  borderRadius: 4,
  padding: '24px 28px',
  marginBottom: 20,
}

export default function PlayersManager({ players: initialPlayers }: { players: Player[] }) {
  const [players, setPlayers] = useState<Player[]>(initialPlayers)
  const [newName, setNewName] = useState('')
  const [newNickname, setNewNickname] = useState('')
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editNickname, setEditNickname] = useState('')
  const [error, setError] = useState('')
  const supabase = createClient()

  async function addPlayer() {
    if (!newName.trim()) return
    setAdding(true); setError('')
    const { data, error } = await supabase
      .from('players')
      .insert({ name: newName.trim(), nickname: newNickname.trim() || null, active: true })
      .select().single()
    if (error) { setError(error.message); setAdding(false); return }
    setPlayers(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    setNewName(''); setNewNickname('')
    setAdding(false)
  }

  function startEdit(player: Player) {
    setEditingId(player.id)
    setEditName(player.name)
    setEditNickname(player.nickname ?? '')
  }

  async function saveEdit(id: string) {
    const { error } = await supabase
      .from('players')
      .update({ name: editName.trim(), nickname: editNickname.trim() || null })
      .eq('id', id)
    if (error) { setError(error.message); return }
    setPlayers(prev => prev.map(p => p.id === id
      ? { ...p, name: editName.trim(), nickname: editNickname.trim() || null } : p))
    setEditingId(null)
  }

  async function toggleActive(player: Player) {
    const { error } = await supabase.from('players').update({ active: !player.active }).eq('id', player.id)
    if (error) { setError(error.message); return }
    setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, active: !p.active } : p))
  }

  const active = players.filter(p => p.active)
  const archived = players.filter(p => !p.active)

  return (
    <div>
      {error && (
        <div style={{ background: 'rgba(214,96,88,0.15)', border: '1px solid rgba(214,96,88,0.4)', borderRadius: 2, padding: '10px 14px', marginBottom: 16, color: 'var(--loss)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
          {error}
        </div>
      )}

      {/* Add player */}
      <div style={card}>
        <div className="font-mono uppercase mb-4" style={{ fontSize: 10, color: 'var(--brass)', letterSpacing: '0.2em' }}>Add New Player</div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label style={labelStyle}>Name</label>
            <input style={fieldStyle} value={newName} onChange={e => setNewName(e.target.value)} placeholder="Full name" />
          </div>
          <div>
            <label style={labelStyle}>Nickname (optional)</label>
            <input style={fieldStyle} value={newNickname} onChange={e => setNewNickname(e.target.value)} placeholder="e.g. The Shark" />
          </div>
        </div>
        <button style={btnPrimary} onClick={addPlayer} disabled={adding || !newName.trim()}>
          {adding ? 'Adding…' : 'Add Player'}
        </button>
      </div>

      {/* Active players */}
      <div style={card}>
        <div className="font-mono uppercase mb-4" style={{ fontSize: 10, color: 'var(--brass)', letterSpacing: '0.2em' }}>
          Active Players ({active.length})
        </div>
        {active.length === 0 && (
          <p className="font-fraunces italic" style={{ color: 'var(--ivory-dim)', fontSize: 14 }}>No active players.</p>
        )}
        <div className="space-y-3">
          {active.map(player => (
            <div key={player.id} className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid rgba(138,115,64,0.15)' }}>
              {editingId === player.id ? (
                <>
                  <input value={editName} onChange={e => setEditName(e.target.value)} style={{ ...fieldStyle, flex: 1 }} />
                  <input value={editNickname} onChange={e => setEditNickname(e.target.value)} placeholder="Nickname" style={{ ...fieldStyle, width: 140 }} />
                  <button style={btnPrimary} onClick={() => saveEdit(player.id)}>Save</button>
                  <button style={btnOutline} onClick={() => setEditingId(null)}>Cancel</button>
                </>
              ) : (
                <>
                  <div style={{ flex: 1 }}>
                    <span className="font-fraunces text-ivory" style={{ fontSize: 16 }}>{player.name}</span>
                    {player.nickname && <span className="font-fraunces italic ml-2" style={{ fontSize: 12, color: 'var(--brass)' }}>"{player.nickname}"</span>}
                  </div>
                  <button style={btnOutline} onClick={() => startEdit(player)}>Edit</button>
                  <button style={{ ...btnOutline, color: 'var(--ivory-dim)' }} onClick={() => toggleActive(player)}>Archive</button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Archived */}
      {archived.length > 0 && (
        <div style={card}>
          <div className="font-mono uppercase mb-4" style={{ fontSize: 10, color: 'var(--ivory-dim)', letterSpacing: '0.2em' }}>
            Archived ({archived.length})
          </div>
          <div className="space-y-3">
            {archived.map(player => (
              <div key={player.id} className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid rgba(138,115,64,0.1)' }}>
                <div style={{ flex: 1 }}>
                  <span className="font-fraunces" style={{ fontSize: 16, color: 'var(--ivory-dim)' }}>{player.name}</span>
                  {player.nickname && <span className="font-fraunces italic ml-2" style={{ fontSize: 12, color: 'var(--brass-dim)' }}>"{player.nickname}"</span>}
                </div>
                <button style={btnOutline} onClick={() => toggleActive(player)}>Unarchive</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
