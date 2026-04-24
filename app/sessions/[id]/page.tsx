import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatDate, formatPeso, formatPnl, pnlClass } from '@/lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const revalidate = 0

export default async function SessionDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const [{ data: session }, { data: { user } }] = await Promise.all([
    supabase.from('sessions').select(`*, session_players(*, player:players(*))`).eq('id', params.id).single(),
    supabase.auth.getUser(),
  ])

  if (!session) notFound()

  const sps = (session.session_players ?? []) as any[]
  const total_buyin = sps.reduce((sum: number, sp: any) => sum + (sp.total_buyin ?? 0), 0)
  const total_cashout = sps.reduce((sum: number, sp: any) => sum + (sp.cashout ?? 0), 0)
  const is_balanced = total_buyin === total_cashout
  const variance = total_cashout - total_buyin

  const rows = sps
    .map((sp: any) => ({ ...sp, net: sp.net ?? ((sp.cashout ?? 0) - sp.total_buyin) }))
    .sort((a: any, b: any) => b.net - a.net)

  return (
    <div className="pt-14 md:pt-0 max-w-3xl">
      <div className="mb-2 flex items-center justify-between">
        <Link href="/" className="text-sm text-green-700 hover:underline">← Sessions</Link>
        {user && (
          <Link href={`/admin/sessions/${session.id}/edit`}>
            <Button variant="outline" size="sm">Edit Session</Button>
          </Link>
        )}
      </div>

      <h1 className="text-2xl font-bold mb-1 text-gray-900">{session.name}</h1>
      <p className="text-gray-500 mb-2">{formatDate(session.date)}</p>
      {session.notes && <p className="text-sm text-gray-500 mb-6">{session.notes}</p>}

      {/* Balance indicator */}
      <div className={`rounded-xl px-6 py-4 mb-8 flex items-center gap-4 ${is_balanced ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
        <span className={`text-xl font-bold ${is_balanced ? 'text-green-600' : 'text-red-600'}`}>
          {is_balanced ? '✓ Balanced' : '✗ Unbalanced'}
        </span>
        {!is_balanced && (
          <span className="text-red-600 text-sm">
            Variance: {formatPnl(variance)}
          </span>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-gray-500 uppercase tracking-wide">Total Pot</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-gray-900">{formatPeso(total_buyin)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-gray-500 uppercase tracking-wide">Total Cash-out</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-gray-900">{formatPeso(total_cashout)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Player results */}
      <Card>
        <CardHeader>
          <CardTitle>Player Results</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player</TableHead>
                <TableHead className="text-right">Bought In</TableHead>
                <TableHead className="text-right">Cashed Out</TableHead>
                <TableHead className="text-right">Net P&L</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((sp: any) => (
                <TableRow key={sp.id}>
                  <TableCell>
                    <Link href={`/players/${sp.player_id}`} className="font-medium text-green-700 hover:underline">
                      {sp.player?.name ?? '—'}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">{formatPeso(sp.total_buyin)}</TableCell>
                  <TableCell className="text-right">{sp.cashout != null ? formatPeso(sp.cashout) : '—'}</TableCell>
                  <TableCell className={`text-right ${pnlClass(sp.net)}`}>{formatPnl(sp.net)}</TableCell>
                </TableRow>
              ))}
              {/* Total row */}
              <TableRow className="border-t-2 border-gray-200 font-semibold bg-gray-50">
                <TableCell>Total</TableCell>
                <TableCell className="text-right">{formatPeso(total_buyin)}</TableCell>
                <TableCell className="text-right">{formatPeso(total_cashout)}</TableCell>
                <TableCell className={`text-right ${pnlClass(variance)}`}>{formatPnl(variance)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
