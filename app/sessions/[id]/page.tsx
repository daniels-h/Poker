import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatDate, formatPeso, formatPnl, pnlColor } from '@/lib/format'
import PageHeader from '@/components/felt/PageHeader'
import StatTile from '@/components/felt/StatTile'
import BrassDivider from '@/components/felt/BrassDivider'
import ScoresheetRow from '@/components/felt/ScoresheetRow'
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

  const maxAbsNet = Math.max(...rows.map((r: any) => Math.abs(r.net)), 1)

  // Find session number (rank by date)
  const { count } = await supabase
    .from('sessions')
    .select('id', { count: 'exact', head: true })
    .lte('date', session.date)

  return (
    <div className="max-w-4xl">
      <div className="mb-4">
        <Link href="/sessions" className="font-mono uppercase" style={{ fontSize: 10, color: 'var(--brass)', letterSpacing: '0.15em' }}>
          ← The Book
        </Link>
      </div>

      <PageHeader
        eyebrow={`Session № ${String(count ?? 1).padStart(2, '0')}`}
        title={formatDate(session.date)}
        subtitle={session.name + (session.notes ? ` · ${session.notes}` : '')}
        right={user ? (
          <Link
            href={`/admin/sessions/${session.id}/edit`}
            className="font-mono uppercase transition-colors"
            style={{ fontSize: 11, letterSpacing: '0.15em', border: '1px solid rgba(201,169,97,0.6)', color: 'var(--brass)', padding: '7px 14px', borderRadius: 2 }}
          >
            Edit
          </Link>
        ) : undefined}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatTile label="Players" value={String(rows.length)} />
        <StatTile label="Pot Total" value={formatPeso(total_buyin)} />
        <StatTile label="Cash-Out Total" value={formatPeso(total_cashout)} />
        <StatTile
          label="Balance"
          value={is_balanced ? 'Settled' : `Off by ${formatPeso(Math.abs(variance))}`}
          accent={is_balanced ? 'var(--win)' : 'var(--loss)'}
        />
      </div>

      <BrassDivider my={20} />

      {/* Scoresheet */}
      <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(138,115,64,0.6)', borderRadius: 4, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(138,115,64,0.4)' }}>
          <div className="font-mono uppercase mb-1" style={{ fontSize: 10, color: 'var(--brass)', letterSpacing: '0.2em' }}>
            Buy-in · Cash-out · Net
          </div>
          <div className="font-fraunces text-ivory" style={{ fontSize: 24 }}>The Scoresheet</div>
        </div>

        {/* Column headers */}
        <div
          className="grid font-mono uppercase"
          style={{
            gridTemplateColumns: '32px 130px 1fr 1fr 100px 80px',
            gap: 16,
            padding: '10px 24px',
            fontSize: 10,
            color: 'var(--brass)',
            letterSpacing: '0.15em',
            borderBottom: '1px solid rgba(138,115,64,0.3)',
          }}
        >
          <div>#</div><div>Player</div><div>Buy-in</div><div>Cash-out</div><div>Bar</div><div className="text-right">Net</div>
        </div>

        {rows.map((sp: any, i: number) => (
          <ScoresheetRow
            key={sp.id}
            rank={i + 1}
            playerId={sp.player_id}
            playerName={sp.player?.name ?? '—'}
            totalBuyin={sp.total_buyin}
            cashout={sp.cashout ?? 0}
            net={sp.net}
            maxAbsNet={maxAbsNet}
          />
        ))}

        {/* Total row */}
        <div
          className="grid items-center"
          style={{
            gridTemplateColumns: '32px 130px 1fr 1fr 100px 80px',
            gap: 16,
            padding: '18px 24px',
            borderTop: '1px solid var(--brass)',
            background: 'rgba(201,169,97,0.05)',
          }}
        >
          <div />
          <div className="font-fraunces italic text-ivory-dim" style={{ fontSize: 14 }}>Totals</div>
          <div className="font-mono" style={{ fontSize: 13, color: 'var(--ivory-dim)' }}>{formatPeso(total_buyin)}</div>
          <div className="font-mono" style={{ fontSize: 13, color: 'var(--ivory)' }}>{formatPeso(total_cashout)}</div>
          <div />
          <div className="font-fraunces text-right" style={{ fontSize: 18, color: pnlColor(variance) }}>{formatPnl(variance)}</div>
        </div>
      </div>
    </div>
  )
}
