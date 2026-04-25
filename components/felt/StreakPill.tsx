export default function StreakPill({ streak }: { streak: string }) {
  const isWin = streak.startsWith('W')
  const color = isWin ? 'var(--win)' : 'var(--loss)'
  return (
    <span
      className="font-mono uppercase"
      style={{
        fontSize: 10.5,
        color,
        letterSpacing: '0.1em',
      }}
    >
      [{streak}]
    </span>
  )
}
