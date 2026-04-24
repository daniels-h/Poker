import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/felt/PageHeader'
import StatTile from '@/components/felt/StatTile'
import BrassDivider from '@/components/felt/BrassDivider'
import SessionRow from '@/components/felt/SessionRow'
import { formatPeso } from '@/lib/format'
import { computeHeroVillain } from '@/lib/stats'
import Link from 'next/link'
import SessionsFilter from './SessionsFilter'

export const revalidate = 0

export default async function SessionsPage({ searchParams }: { searchParams: { year?: string; month?: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let query = supabase
    .from('sessions')
    .select(`*, session_players(total_buyin, cashout, net, player_id, player:players(id, name))`)
    .order('date', { ascending: false })

  if (searchParams.year) {
    query = query.gte('date', `${searchParams.year}-01-01`).lte('date', `${searchParams.year}-12-31`)
  }
  if (searchParams.month) {
    const [y, m] = searchParams.month.split('-')
    const lastDay = new Date(Number(y), Number(m), 0).getDate()
    query = query.gte('date', `${y}-${m}-01`).lte('date', `${y}-${m}-${lastDay}`)
  }

  const { data: sessions } = await query

  const { data: allData } = await supabase
    .from('sessions')
    .select('session_players(total_buyin, player_id)')

  const totalSessions = (allData ?? []).length
  const totalVolume = (allData ?? []).reduce((sum: number, s: any) =>
    sum + (s.session_players ?? []).reduce((s2: number, sp: any) => s2 + (sp.total_buyin ?? 0), 0), 0)
  const activeRail = new Set((allData ?? []).flatMap((s: any) =>
    (s.session_players ?? []).map((sp: any) => sp.player_id))).size

  const enriched = (sessions ?? []).map((s: any, i: number) => {
    const sps = s.session_players ?? []
    const total_buyin = sps.reduce((sum: number, sp: any) => sum + (sp.total_buyin ?? 0), 0)
    const total_cashout = sps.reduce((sum: number, sp: any) => sum + (sp.cashout ?? 0), 0)
    const flatSps = sps.map((sp: any) => ({ player_id: sp.player_id, name: sp.player?.name ?? '?', net: sp.net ?? 0 }))
    const { hero, villain } = computeHeroVillain(flatSps)
    return { ...s, total_buyin, is_balanced: total_buyin === total_cashout, player_count: sps.length, hero, villain, index: totalSessions - i }
  })

  return (
    <div className="max-w-5xl">
      <PageHeader
        eyebrow="The Book"
        title="Sessions"
        subtitle="Every hand we've logged since we started keeping score."
        right={user ? (
          <Link
            href="/sessions/new"
            className="font-mono uppercase transition-colors"
            style={{ fontSize: 11, letterSpacing: '0.15em', background: 'var(--brass)', color: 'var(--ink)', padding: '8px 16px', borderRadius: 2 }}
          >
            + Log a Session
          </Link>
        ) : undefined}
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatTile label="Total Sessions" value={String(totalSessions)} />
        <StatTile label="All-Time Volume" value={formatPeso(totalVolume)} />
        <StatTile label="Active Rail" value={String(activeRail)} />
      </div>

      <BrassDivider my={20} />

      <SessionsFilter />

      <div className="mt-4" style={{ border: '1px solid rgba(138,115,64,0.4)', borderRadius: 4, overflow: 'hidden' }}>
        {enriched.length === 0 ? (
          <p className="font-fraunces italic text-center py-16" style={{ color: 'var(--ivory-dim)', fontSize: 16 }}>
            No sessions yet. The books are open.
          </p>
        ) : (
          enriched.map((s: any) => (
            <SessionRow
              key={s.id}
              index={s.index}
              id={s.id}
              name={s.name}
              date={s.date}
              notes={s.notes}
              playerCount={s.player_count}
              totalBuyin={s.total_buyin}
              isBalanced={s.is_balanced}
              hero={s.hero}
              villain={s.villain}
            />
          ))
        )}
      </div>
    </div>
  )
}
