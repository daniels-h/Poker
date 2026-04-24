import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatDate, formatPeso, formatPnl, pnlClass } from '@/lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Link from 'next/link'
import PnlChart from './PnlChart'

export const revalidate = 0

export default async function PlayerProfilePage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: player } = await supabase
    .from('players')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!player) notFound()

  const { data: sessionPlayers } = await supabase
    .from('session_players')
    .select(`*, session:sessions(id, name, date)`)
    .eq('player_id', params.id)

  const rows = (sessionPlayers ?? [])
    .map((sp: any) => ({
      ...sp,
      net: sp.net ?? ((sp.cashout ?? 0) - sp.total_buyin),
      date: sp.session?.date,
    }))
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const nets = rows.map((r: any) => r.net)
  const totalPnl = nets.reduce((a: number, b: number) => a + b, 0)
  const totalBuyin = rows.reduce((sum: number, r: any) => sum + r.total_buyin, 0)
  const wins = nets.filter((n: number) => n > 0).length
  const winRate = rows.length > 0 ? Math.round((wins / rows.length) * 100) : 0
  const biggestWin = nets.length > 0 ? Math.max(...nets) : 0
  const biggestLoss = nets.length > 0 ? Math.min(...nets) : 0

  // Cumulative P&L for chart
  let cumulative = 0
  const chartData = rows.map((row: any) => {
    cumulative += row.net
    return { date: formatDate(row.date), cumulative }
  })

  return (
    <div className="pt-14 md:pt-0 max-w-3xl">
      <div className="mb-2">
        <Link href="/leaderboard" className="text-sm text-green-700 hover:underline">← Leaderboard</Link>
      </div>
      <h1 className="text-2xl font-bold mb-1 text-gray-900">{player.name}</h1>
      {player.nickname && <p className="text-gray-500 mb-6">"{player.nickname}"</p>}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-gray-500 uppercase tracking-wide">Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">{rows.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-gray-500 uppercase tracking-wide">Net P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${pnlClass(totalPnl)}`}>{formatPnl(totalPnl)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-gray-500 uppercase tracking-wide">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">{winRate}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-gray-500 uppercase tracking-wide">Total Buy-in</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">{formatPeso(totalBuyin)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-gray-500 uppercase tracking-wide">Biggest Win</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{biggestWin > 0 ? formatPnl(biggestWin) : '—'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-gray-500 uppercase tracking-wide">Biggest Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-500">{biggestLoss < 0 ? formatPnl(biggestLoss) : '—'}</p>
          </CardContent>
        </Card>
      </div>

      {chartData.length > 1 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-sm">Cumulative P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <PnlChart data={chartData} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Session History</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Session</TableHead>
                <TableHead className="text-right">Bought In</TableHead>
                <TableHead className="text-right">Cashed Out</TableHead>
                <TableHead className="text-right">Net</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...rows].reverse().map((row: any) => (
                <TableRow key={row.id}>
                  <TableCell className="text-gray-500 whitespace-nowrap">{formatDate(row.date)}</TableCell>
                  <TableCell>
                    <Link href={`/sessions/${row.session?.id}`} className="text-green-700 hover:underline">
                      {row.session?.name ?? '—'}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">{formatPeso(row.total_buyin)}</TableCell>
                  <TableCell className="text-right">{row.cashout != null ? formatPeso(row.cashout) : '—'}</TableCell>
                  <TableCell className={`text-right ${pnlClass(row.net)}`}>{formatPnl(row.net)}</TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-8">No sessions yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
