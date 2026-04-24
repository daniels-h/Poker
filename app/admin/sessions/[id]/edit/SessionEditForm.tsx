'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatPeso } from '@/lib/format'

interface Player { id: string; name: string; nickname: string | null }
interface SessionPlayer {
  id: string; player_id: string; total_buyin: number; cashout: number | null; player: Player
}
interface Session { id: string; name: string; date: string; notes: string | null }

function fmt(n: number) {
  return n.toLocaleString('en-PH', { maximumFractionDigits: 0 })
}

function parseAmt(s: string): number {
  return parseInt(s.replace(/,/g, ''), 10) || 0
}

export default function SessionEditForm({
  session,
  players,
  sessionPlayers: initialSPs,
}: {
  session: Session
  players: Player[]
  sessionPlayers: SessionPlayer[]
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

  const existingPlayerIds = new Set(sps.map(sp => sp.player_id))
  const availablePlayers = players.filter(p => !existingPlayerIds.has(p.id))

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
      .insert({ session_id: session.id, player_id: addPlayerId, total_buyin: 0, cashout: null })
      .select('*, player:players(*)')
      .single()
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
      .from('sessions')
      .update({ name, date, notes: notes.trim() || null })
      .eq('id', session.id)
    if (sessionError) { setError(sessionError.message); setSaving(false); return }

    for (const sp of sps) {
      const { error: spError } = await supabase
        .from('session_players')
        .update({ total_buyin: sp.total_buyin, cashout: sp.cashout })
        .eq('id', sp.id)
      if (spError) { setError(spError.message); setSaving(false); return }
    }
    setSaving(false)
    setSuccess(true)
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

  return (
    <div className="space-y-6">
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      {success && <Alert className="border-green-200 bg-green-50 text-green-800"><AlertDescription>Saved successfully.</AlertDescription></Alert>}

      {/* Session info */}
      <Card>
        <CardHeader><CardTitle className="text-base">Session Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Notes</Label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Balance indicator */}
      <div className={`rounded-xl px-5 py-3 flex items-center gap-4 ${isBalanced ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
        <span className={`font-bold ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
          {isBalanced ? '✓ Balanced' : '✗ Unbalanced'}
        </span>
        <span className="text-sm text-gray-600">Pot: {formatPeso(totalBuyin)} · Cash-out: {formatPeso(totalCashout)}</span>
        {!isBalanced && (
          <span className={`text-sm font-medium ${variance > 0 ? 'text-green-600' : 'text-red-600'}`}>
            Variance: {variance > 0 ? '+' : '−'}₱{fmt(Math.abs(variance))}
          </span>
        )}
      </div>

      {/* Player rows */}
      <Card>
        <CardHeader><CardTitle className="text-base">Players</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {sps.map(sp => (
            <div key={sp.id} className="border border-gray-100 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{sp.player?.name ?? '—'}</span>
                <button onClick={() => removePlayer(sp.id)} className="text-xs text-red-500 hover:underline">Remove</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Total Buy-in</Label>
                  <Input
                    value={fmt(sp.total_buyin)}
                    onChange={e => updateSp(sp.id, 'total_buyin', e.target.value)}
                    className="text-right"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Cash-out</Label>
                  <Input
                    value={sp.cashout != null ? fmt(sp.cashout) : ''}
                    onChange={e => updateSp(sp.id, 'cashout', e.target.value)}
                    placeholder="—"
                    className="text-right"
                  />
                </div>
              </div>
              {/* Rebuy */}
              <div className="flex gap-2 items-center">
                <Input
                  value={rebuyAmounts[sp.id] ?? ''}
                  onChange={e => setRebuyAmounts(prev => ({ ...prev, [sp.id]: e.target.value }))}
                  placeholder="Rebuy amount"
                  className="text-right text-sm h-8"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applyRebuy(sp.id)}
                  className="whitespace-nowrap h-8 text-xs"
                >
                  + Rebuy
                </Button>
              </div>
            </div>
          ))}

          {/* Add player */}
          {availablePlayers.length > 0 && (
            <div className="flex gap-2 pt-2">
              <select
                value={addPlayerId}
                onChange={e => setAddPlayerId(e.target.value)}
                className="flex-1 text-sm border border-input rounded-md px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Add player…</option>
                {availablePlayers.map(p => (
                  <option key={p.id} value={p.id}>{p.name}{p.nickname ? ` (${p.nickname})` : ''}</option>
                ))}
              </select>
              <Button variant="outline" onClick={addPlayer} disabled={!addPlayerId}>Add</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button onClick={handleSave} style={{ backgroundColor: '#16a34a' }} disabled={saving}>
          {saving ? 'Saving…' : 'Save Changes'}
        </Button>
        <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
          {deleting ? 'Deleting…' : 'Delete Session'}
        </Button>
      </div>
    </div>
  )
}
