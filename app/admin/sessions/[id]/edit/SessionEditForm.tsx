'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatPeso } from '@/lib/format'

interface Player { id: string; name: string; nickname: string | null }
interface SessionPlayer { id: string; player_id: string; total_buyin: number; cashout: number | null; player: Player }
interface Session { id: string; name: string; date: string; notes: string | null }

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
  textAlign: 'right' as const,
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

function fmt(n: number) { return n.toLocaleString('en-PH', { maximumFractionDigits: 0 }) }
function parseAmt(s: string): number { return parseInt(s.replace(/,/g, ''), 10) || 0 }

export default function SessionEditForm({
  session, players, sessionPlayers: initialSPs,
}: {
  session: Session; players: Player[]; sessionPlayers: SessionPlayer[]
}) {
  const router = useRouter()
  const supabase = createClient()

  const [name, setName] = useState(session.name)
  const [date, setDate] = useState(session.date)
  const [notes, setNotes] = useState(session.notes ?? '')
  const [sps, setSps] = useState<SessionPlayer[]>(initialSPs)
  const [rebuyAmounts, setRebuyAmounts] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [addPlayerId, setAddPlayerId] = useState('')

  const existingIds = new Set(sps.map(sp => sp.player_id))
  const availablePlayers = players.filter(p => !existingIds.has(p.id))

  const totalBuyin = sps.reduce((s, sp) => s + sp.total_buyin, 0)
  const totalCashout = sps.reduce((s, sp) => s + (sp.cashout ?? 0), 0)
  const isBalanced = totalBuyin === totalCashout
  const variance = totalCashout - totalBuyin

  function updateSp(id: string, field: 'total_buyin' | 'cashout', val: string) {
    setSps(prev => prev.map(sp => sp.id === id ? { ...sp, [field]: parseAmt(val) } : sp))
  }

  function applyRebuy(spId: string) {
    const amount = parseAmt(rebuyAmounts[spId] ?? '')
    if (!amount) return
    setSps(prev => prev.map(sp => sp.id === spId ? { ...sp, total_buyin: sp.total_buyin + amount } : sp))
    setRebuyAmounts(prev => ({ ...prev, [spId]: '' }))
  }

  async function addPlayer() {
    if (!addPlayerId) return
    const player = players.find(p => p.id === addPlayerId)
    if (!player) return
    const { data, error } = await supabase
      .from('session_players')
      .insert({ session_id: session.id, player_id: addPlayerId, total_buyin: 0, cashout: 0 })
      .select('*, player:players(*)').single()
    if (error) { setError(error.message); return }
    setSps(prev => [...prev, data as SessionPlayer])
    setAddPlayerId('')
  }

  async function removePlayer(spId: string) {
    const { error } = await supabase.from('session_players').delete().eq('id', spId)
    if (error) { setError(error.message); return }
    setSps(prev => prev.filter(sp => sp.id !== spId))
  }

  async function handleSave() {
    setSaving(true); setError(''); setSuccess(false)
    const { error: sessionError } = await supabase
      .from('sessions').update({ name, date, notes: notes.trim() || null }).eq('id', session.id)
    if (sessionError) { setError(sessionError.message); setSaving(false); return }

    for (const sp of sps) {
      const { error: spError } = await supabase
        .from('session_players').update({ total_buyin: sp.total_buyin, cashout: sp.cashout }).eq('id', sp.id)
      if (spError) { setError(spError.message); setSaving(false); return }
    }
    setSaving(false); setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  async function handleDelete() {
    if (!confirm('Delete this session? This cannot be undone.')) return
    setDeleting(true)
    await supabase.from('session_players').delete().eq('session_id', session.id)
    const { error } = await supabase.from('sessions').delete().eq('id', session.id)
    if (error) { setError(error.message); setDeleting(false); return }
    router.push('/admin/sessions')
  }

  const selectStyle = {
    flex: 1,
    background: 'rgba(0,0,0,0.35)',
    border: '1px solid rgba(138,115,64,0.5)',
    borderRadius: 2,
    padding: '9px 12px',
    color: 'var(--ivory)',
    fontFamily: 'var(--font-mono)',
    fontSize: 13,
    outline: 'none',
  }

  return (
    <div>
      {error && (
        <div style={{ background: 'rgba(214,96,88,0.15)', border: '1px solid rgba(214,96,88,0.4)', borderRadius: 2, padding: '10px 14px', marginBottom: 16, color: 'var(--loss)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ background: 'rgba(95,184,120,0.15)', border: '1px solid rgba(95,184,120,0.4)', borderRadius: 2, padding: '10px 14px', marginBottom: 16, color: 'var(--win)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
          Saved successfully.
        </div>
      )}

      {/* Session details */}
      <div style={card}>
        <div className="font-mono uppercase mb-4" style={{ fontSize: 10, color: 'var(--brass)', letterSpacing: '0.2em' }}>Session Details</div>
        <div className="space-y-4">
          <div>
            <label style={labelStyle}>Name</label>
            <input style={{ ...fieldStyle, textAlign: 'left' }} value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Date</label>
            <input type="date" style={{ ...fieldStyle, textAlign: 'left' }} value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Notes</label>
            <textarea style={{ ...fieldStyle, textAlign: 'left', resize: 'none' }} value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
          </div>
        </div>
      </div>

      {/* Balance indicator */}
      <div style={{
        borderRadius: 4, padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16,
        background: isBalanced ? 'rgba(95,184,120,0.1)' : 'rgba(214,96,88,0.1)',
        border: `1px solid ${isBalanced ? 'rgba(95,184,120,0.4)' : 'rgba(214,96,88,0.4)'}`,
      }}>
        <span className="font-fraunces" style={{ fontSize: 18, color: isBalanced ? 'var(--win)' : 'var(--loss)', fontWeight: 400 }}>
          {isBalanced ? '✓ Balanced' : '✗ Unbalanced'}
        </span>
        <span className="font-mono" style={{ fontSize: 12, color: 'var(--ivory-dim)' }}>
          Pot: {formatPeso(totalBuyin)} · Cash-out: {formatPeso(totalCashout)}
        </span>
        {!isBalanced && (
          <span className="font-mono" style={{ fontSize: 12, color: 'var(--loss)' }}>
            Off by ₱{Math.abs(variance).toLocaleString()}
          </span>
        )}
      </div>

      {/* Players */}
      <div style={card}>
        <div className="font-mono uppercase mb-4" style={{ fontSize: 10, color: 'var(--brass)', letterSpacing: '0.2em' }}>Players</div>
        <div className="space-y-4">
          {sps.map(sp => (
            <div key={sp.id} style={{ border: '1px solid rgba(138,115,64,0.2)', borderRadius: 4, padding: '16px' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-fraunces text-ivory" style={{ fontSize: 16 }}>{sp.player?.name ?? '—'}</span>
                <button
                  onClick={() => removePlayer(sp.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--loss)', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', cursor: 'pointer', textTransform: 'uppercase' }}
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label style={labelStyle}>Total Buy-in</label>
                  <input style={fieldStyle} value={fmt(sp.total_buyin)} onChange={e => updateSp(sp.id, 'total_buyin', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Cash-out</label>
                  <input style={fieldStyle} value={sp.cashout != null ? fmt(sp.cashout) : ''} onChange={e => updateSp(sp.id, 'cashout', e.target.value)} placeholder="0" />
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  style={{ ...fieldStyle, flex: 1, fontSize: 12 }}
                  value={rebuyAmounts[sp.id] ?? ''}
                  onChange={e => setRebuyAmounts(prev => ({ ...prev, [sp.id]: e.target.value }))}
                  placeholder="Rebuy amount"
                />
                <button
                  onClick={() => applyRebuy(sp.id)}
                  style={{ background: 'transparent', border: '1px solid rgba(138,115,64,0.5)', borderRadius: 2, padding: '7px 14px', color: 'var(--brass)', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  + Rebuy
                </button>
              </div>
            </div>
          ))}

          {availablePlayers.length > 0 && (
            <div className="flex gap-2 pt-2">
              <select value={addPlayerId} onChange={e => setAddPlayerId(e.target.value)} style={selectStyle}>
                <option value="">Add player…</option>
                {availablePlayers.map(p => (
                  <option key={p.id} value={p.id}>{p.name}{p.nickname ? ` (${p.nickname})` : ''}</option>
                ))}
              </select>
              <button
                onClick={addPlayer}
                disabled={!addPlayerId}
                style={{ background: 'var(--brass)', color: 'var(--ink)', border: 'none', borderRadius: 2, padding: '9px 16px', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: addPlayerId ? 'pointer' : 'not-allowed', opacity: addPlayerId ? 1 : 0.5 }}
              >
                Add
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ background: 'var(--brass)', color: 'var(--ink)', border: 'none', borderRadius: 2, padding: '10px 24px', fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          style={{ background: 'rgba(214,96,88,0.15)', color: 'var(--loss)', border: '1px solid rgba(214,96,88,0.4)', borderRadius: 2, padding: '10px 24px', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: deleting ? 'not-allowed' : 'pointer' }}
        >
          {deleting ? 'Deleting…' : 'Delete Session'}
        </button>
      </div>
    </div>
  )
}
