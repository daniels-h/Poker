import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import SessionEditForm from './SessionEditForm'
import Link from 'next/link'

export const revalidate = 0

export default async function SessionEditPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const [{ data: session }, { data: players }, { data: sessionPlayers }] = await Promise.all([
    supabase.from('sessions').select('*').eq('id', params.id).single(),
    supabase.from('players').select('id, name, nickname').eq('active', true).order('name'),
    supabase.from('session_players').select('*, player:players(id, name, nickname)').eq('session_id', params.id),
  ])

  if (!session) notFound()

  return (
    <div className="pt-14 md:pt-0 max-w-2xl">
      <div className="mb-4">
        <Link href="/admin/sessions" className="text-sm text-green-700 hover:underline">← Sessions</Link>
      </div>
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Edit Session</h1>
      <SessionEditForm
        session={session}
        players={players ?? []}
        sessionPlayers={(sessionPlayers ?? []) as any}
      />
    </div>
  )
}
