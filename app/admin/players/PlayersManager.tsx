'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Player { id: string; name: string; nickname: string | null; active: boolean }

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
      .select()
      .single()
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
      ? { ...p, name: editName.trim(), nickname: editNickname.trim() || null }
      : p
    ))
    setEditingId(null)
  }

  async function toggleActive(player: Player) {
    const { error } = await supabase
      .from('players')
      .update({ active: !player.active })
      .eq('id', player.id)
    if (error) { setError(error.message); return }
    setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, active: !p.active } : p))
  }

  const active = players.filter(p => p.active)
  const archived = players.filter(p => !p.active)

  return (
    <div className="space-y-6">
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      {/* Add player */}
      <Card>
        <CardHeader><CardTitle className="text-base">Add New Player</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Full name" />
            </div>
            <div className="space-y-1">
              <Label>Nickname (optional)</Label>
              <Input value={newNickname} onChange={e => setNewNickname(e.target.value)} placeholder="e.g. The Shark" />
            </div>
          </div>
          <Button onClick={addPlayer} style={{ backgroundColor: '#16a34a' }} disabled={adding || !newName.trim()}>
            {adding ? 'Adding…' : 'Add Player'}
          </Button>
        </CardContent>
      </Card>

      {/* Active players */}
      <Card>
        <CardHeader><CardTitle className="text-base">Active Players ({active.length})</CardTitle></CardHeader>
        <CardContent className="space-y-2 pb-4">
          {active.length === 0 && <p className="text-sm text-gray-500">No active players.</p>}
          {active.map(player => (
            <div key={player.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
              {editingId === player.id ? (
                <>
                  <Input value={editName} onChange={e => setEditName(e.target.value)} className="h-8 text-sm flex-1" />
                  <Input value={editNickname} onChange={e => setEditNickname(e.target.value)} placeholder="Nickname" className="h-8 text-sm w-32" />
                  <Button size="sm" className="h-8 text-xs" style={{ backgroundColor: '#16a34a' }} onClick={() => saveEdit(player.id)}>Save</Button>
                  <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setEditingId(null)}>Cancel</Button>
                </>
              ) : (
                <>
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">{player.name}</span>
                    {player.nickname && <span className="ml-2 text-xs text-gray-400">"{player.nickname}"</span>}
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => startEdit(player)}>Edit</Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs text-gray-500" onClick={() => toggleActive(player)}>Archive</Button>
                </>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Archived players */}
      {archived.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base text-gray-500">Archived ({archived.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2 pb-4">
            {archived.map(player => (
              <div key={player.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                <div className="flex-1">
                  <span className="text-gray-500">{player.name}</span>
                  {player.nickname && <span className="ml-2 text-xs text-gray-400">"{player.nickname}"</span>}
                  <Badge variant="outline" className="ml-2 text-xs text-gray-400">Archived</Badge>
                </div>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => toggleActive(player)}>Unarchive</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
