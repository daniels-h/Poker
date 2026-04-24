import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDate, formatPeso } from '@/lib/format'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const revalidate = 0

export default async function AdminSessionsPage() {
  const supabase = createClient()
  const { data: sessions } = await supabase
    .from('sessions')
    .select(`*, session_players(total_buyin, cashout)`)
    .order('date', { ascending: false })

  const enriched = (sessions ?? []).map((s: any) => {
    const sps = s.session_players ?? []
    const total_buyin = sps.reduce((sum: number, sp: any) => sum + (sp.total_buyin ?? 0), 0)
    const total_cashout = sps.reduce((sum: number, sp: any) => sum + (sp.cashout ?? 0), 0)
    return { ...s, total_buyin, is_balanced: total_buyin === total_cashout, player_count: sps.length }
  })

  return (
    <div className="pt-14 md:pt-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sessions</h1>
        <Link href="/admin/sessions/new">
          <Button style={{ backgroundColor: '#16a34a' }}>+ New Session</Button>
        </Link>
      </div>

      <div className="space-y-3">
        {enriched.map(session => (
          <Card key={session.id}>
            <CardContent className="flex items-center justify-between py-4 px-6">
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-gray-900">{session.name}</span>
                <span className="text-sm text-gray-500">{formatDate(session.date)}</span>
                <span className="text-sm text-gray-400">{session.player_count} players · {formatPeso(session.total_buyin)}</span>
              </div>
              <div className="flex items-center gap-3">
                {session.is_balanced ? (
                  <Badge className="bg-green-100 text-green-700 border-green-200">Balanced ✓</Badge>
                ) : (
                  <Badge variant="destructive">Unbalanced</Badge>
                )}
                <Link href={`/admin/sessions/${session.id}/edit`}>
                  <Button variant="outline" size="sm">Edit</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
        {enriched.length === 0 && (
          <p className="text-center text-gray-500 py-16">No sessions yet. <Link href="/admin/sessions/new" className="text-green-700 underline">Create one.</Link></p>
        )}
      </div>
    </div>
  )
}
