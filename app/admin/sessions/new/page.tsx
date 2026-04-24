import { createClient } from '@/lib/supabase/server'
import NewSessionForm from './NewSessionForm'

export default async function NewSessionPage() {
  const supabase = createClient()
  const { data: players } = await supabase
    .from('players')
    .select('id, name, nickname')
    .eq('active', true)
    .order('name')

  return (
    <div className="pt-14 md:pt-0 max-w-lg">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">New Session</h1>
      <NewSessionForm players={players ?? []} />
    </div>
  )
}
