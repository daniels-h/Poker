'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Player { id: string; name: string; nickname: string | null }

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
    setError('')
    setLoading(true)
    const supabase = createClient()

    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({ name: name.trim(), date, notes: notes.trim() || null })
      .select()
      .single()

    if (sessionError) { setError(sessionError.message); setLoading(false); return }

    if (selectedPlayers.size > 0) {
      const rows = Array.from(selectedPlayers).map(player_id => ({
        session_id: session.id,
        player_id,
        total_buyin: 0,
        cashout: null,
      }))
      const { error: spError } = await supabase.from('session_players').insert(rows)
      if (spError) { setError(spError.message); setLoading(false); return }
    }

    router.push(`/admin/sessions/${session.id}/edit`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Session Name</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Friday Night" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="notes">Notes (optional)</Label>
            <textarea
              id="notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Stakes, format, venue…"
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-sm font-medium text-gray-700 mb-3">Select Players</h2>
        <Card>
          <CardContent className="pt-4 pb-2">
            {players.length === 0 && (
              <p className="text-sm text-gray-500 py-2">No players in roster yet.</p>
            )}
            <div className="space-y-2">
              {players.map(p => (
                <label key={p.id} className="flex items-center gap-3 cursor-pointer py-1">
                  <input
                    type="checkbox"
                    checked={selectedPlayers.has(p.id)}
                    onChange={() => togglePlayer(p.id)}
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-900">{p.name}</span>
                  {p.nickname && <span className="text-xs text-gray-400">"{p.nickname}"</span>}
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Button type="submit" style={{ backgroundColor: '#16a34a' }} disabled={loading}>
        {loading ? 'Creating…' : 'Create Session'}
      </Button>
    </form>
  )
}
