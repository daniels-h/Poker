'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatPnl, pnlClass } from '@/lib/format'
import Link from 'next/link'
import type { LeaderboardEntry } from './page'

const topRowStyle = ['bg-yellow-50', 'bg-gray-50', 'bg-orange-50']

function LeaderboardTable({ data }: { data: LeaderboardEntry[] }) {
  if (data.length === 0) return <p className="text-center text-gray-500 py-10">No data for this period.</p>
  return (
    <Card>
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">#</TableHead>
              <TableHead>Player</TableHead>
              <TableHead className="text-right">Sessions</TableHead>
              <TableHead className="text-right">Win Rate</TableHead>
              <TableHead className="text-right">Best Win</TableHead>
              <TableHead className="text-right">Worst Loss</TableHead>
              <TableHead className="text-right">Net P&L</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((entry, i) => (
              <TableRow key={entry.id} className={i < 3 ? topRowStyle[i] : ''}>
                <TableCell className="font-semibold text-gray-500">{i + 1}</TableCell>
                <TableCell>
                  <Link href={`/players/${entry.id}`} className="font-medium text-green-700 hover:underline">
                    {entry.name}
                  </Link>
                </TableCell>
                <TableCell className="text-right text-gray-600">{entry.sessions}</TableCell>
                <TableCell className="text-right text-gray-600">{entry.winRate}%</TableCell>
                <TableCell className="text-right text-green-600 font-medium">
                  {entry.biggestWin > 0 ? formatPnl(entry.biggestWin) : '—'}
                </TableCell>
                <TableCell className="text-right text-red-600 font-medium">
                  {entry.biggestLoss < 0 ? formatPnl(entry.biggestLoss) : '—'}
                </TableCell>
                <TableCell className={`text-right font-semibold ${pnlClass(entry.totalPnl)}`}>
                  {formatPnl(entry.totalPnl)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default function LeaderboardTabs({
  all, year, month,
}: {
  all: LeaderboardEntry[]
  year: LeaderboardEntry[]
  month: LeaderboardEntry[]
}) {
  return (
    <Tabs defaultValue="all">
      <TabsList className="mb-4">
        <TabsTrigger value="all">All Time</TabsTrigger>
        <TabsTrigger value="year">This Year</TabsTrigger>
        <TabsTrigger value="month">This Month</TabsTrigger>
      </TabsList>
      <TabsContent value="all"><LeaderboardTable data={all} /></TabsContent>
      <TabsContent value="year"><LeaderboardTable data={year} /></TabsContent>
      <TabsContent value="month"><LeaderboardTable data={month} /></TabsContent>
    </Tabs>
  )
}
