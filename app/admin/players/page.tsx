import { createClient } from '@/lib/supabase/server'
import PlayersManager from './PlayersManager'

export const revalidate = 0

export default async function AdminPlayersPage() {
  const supabase = createClient()
  const { data: players } = await supabase
    .from('players')
    .select('*')
    .order('name')

  return (
    <div className="pt-14 md:pt-0 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Manage Players</h1>
      <PlayersManager players={players ?? []} />
    </div>
  )
}
