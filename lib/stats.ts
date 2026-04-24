export function computeStreak(nets: number[]): string {
  if (nets.length === 0) return 'W0'
  const sorted = [...nets].reverse()
  const first = sorted[0]
  const isWin = first > 0
  let count = 0
  for (const n of sorted) {
    if (isWin ? n > 0 : n <= 0) count++
    else break
  }
  return `${isWin ? 'W' : 'L'}${count}`
}

export function computeHeroVillain(sps: { player_id: string; name: string; net: number }[]) {
  if (sps.length === 0) return { hero: null, villain: null }
  const sorted = [...sps].sort((a, b) => b.net - a.net)
  return {
    hero: sorted[0]?.name ?? null,
    villain: sorted[sorted.length - 1]?.name ?? null,
  }
}

export interface H2HRecord {
  opponentId: string
  opponentName: string
  wins: number
  losses: number
  netTaken: number
}

export function computeH2H(
  allSps: { session_id: string; player_id: string; player_name: string; net: number }[],
  targetPlayerId: string
): H2HRecord[] {
  // Group by session
  const sessions = new Map<string, typeof allSps>()
  for (const sp of allSps) {
    if (!sessions.has(sp.session_id)) sessions.set(sp.session_id, [])
    sessions.get(sp.session_id)!.push(sp)
  }

  const h2h = new Map<string, H2HRecord>()

  for (const sessionId of Array.from(sessions.keys())) {
    const players = sessions.get(sessionId)!
    const target = players.find((p: any) => p.player_id === targetPlayerId)
    if (!target) continue
    const others = players.filter((p: any) => p.player_id !== targetPlayerId)
    for (const opp of others) {
      if (!h2h.has(opp.player_id)) {
        h2h.set(opp.player_id, { opponentId: opp.player_id, opponentName: opp.player_name, wins: 0, losses: 0, netTaken: 0 })
      }
      const record = h2h.get(opp.player_id)!
      if (target.net > opp.net) record.wins++
      else record.losses++
      record.netTaken += target.net - opp.net
    }
  }

  return Array.from(h2h.values()).sort((a, b) => b.netTaken - a.netTaken)
}
