import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDate, formatPeso } from '@/lib/format'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import SessionFilters from '@/components/SessionFilters'

export const revalidate = 0

export default async function SessionsPage({
  searchParams,
}: {
  searchParams: { month?: string; year?: string }
}) {
  const supabase = createClient()

  let query = supabase
    .from('sessions')
    .select(`*, session_players(total_buyin, cashout, player_id)`)
    .order('date', { ascending: false })

  if (searchParams.year) {
    query = query
      .gte('date', `${searchParams.year}-01-01`)
      .lte('date', `${searchParams.year}-12-31`)
  }
  if (searchParams.month) {
    const [y, m] = searchParams.month.split('-')
    const lastDay = new Date(Number(y), Number(m), 0).getDate()
    query = query
      .gte('date', `${y}-${m}-01`)
      .lte('date', `${y}-${m}-${lastDay}`)
  }

  const { data: sessions } = await query

  const enriched = (sessions ?? []).map((s: any) => {
    const sps = s.session_players ?? []
    const total_buyin = sps.reduce((sum: number, sp: any) => sum + (sp.total_buyin ?? 0), 0)
    const total_cashout = sps.reduce((sum: number, sp: any) => sum + (sp.cashout ?? 0), 0)
    const is_balanced = total_buyin === total_cashout
    return { ...s, total_buyin, total_cashout, is_balanced, player_count: sps.length }
  })

  // Stats from all sessions (unfiltered)
  const { data: allSessions } = await supabase
    .from('sessions')
    .select(`session_players(total_buyin, player_id)`)

  const totalSessions = (allSessions ?? []).length
  const totalVolume = (allSessions ?? []).reduce((sum: number, s: any) =>
    sum + (s.session_players ?? []).reduce((s2: number, sp: any) => s2 + (sp.total_buyin ?? 0), 0), 0)
  const uniquePlayers = new Set(
    (allSessions ?? []).flatMap((s: any) => (s.session_players ?? []).map((sp: any) => sp.player_id))
  ).size

  return (
    <div className="pt-14 md:pt-0">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Sessions</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">{totalSessions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-gray-500 font-medium uppercase tracking-wide">All-Time Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">{formatPeso(totalVolume)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-gray-500 font-medium uppercase tracking-wide">Active Members</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">{uniquePlayers}</p>
          </CardContent>
        </Card>
      </div>

      <SessionFilters />

      <div className="space-y-3 mt-4">
        {enriched.map(session => (
          <Link key={session.id} href={`/sessions/${session.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center justify-between py-4 px-6">
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-gray-900">{session.name}</span>
                  <span className="text-sm text-gray-500">{formatDate(session.date)}</span>
                  <span className="text-sm text-gray-400">{session.player_count} players</span>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-medium text-gray-700">{formatPeso(session.total_buyin)}</span>
                  {session.is_balanced ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200">Balanced ✓</Badge>
                  ) : (
                    <Badge variant="destructive">Unbalanced</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {enriched.length === 0 && (
          <p className="text-center text-gray-500 py-16">No sessions found.</p>
        )}
      </div>
    </div>
  )
}
