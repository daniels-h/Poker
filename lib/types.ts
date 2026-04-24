export interface Player {
  id: string
  name: string
  nickname: string | null
  active: boolean
  created_at: string
}

export interface Session {
  id: string
  name: string
  date: string
  notes: string | null
  created_at: string
}

export interface SessionPlayer {
  id: string
  session_id: string
  player_id: string
  total_buyin: number
  cashout: number | null
  net: number | null
  created_at: string
}

export interface SessionPlayerWithPlayer extends SessionPlayer {
  player: Player
}
