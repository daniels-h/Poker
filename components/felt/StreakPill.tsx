export default function StreakPill({ streak }: { streak: string }) {
  const isWin = streak.startsWith('W')
  const color = isWin ? 'var(--win)' : 'var(--loss)'
  return (
    <span
      className="font-mono uppercase"
      style={{
        fontSize: 11,
        color,
        background: isWin ? 'rgba(95,184,120,0.2)' : 'rgba(214,96,88,0.2)',
        border: `1px solid ${isWin ? 'rgba(95,184,120,0.4)' : 'rgba(214,96,88,0.4)'}`,
        borderRadius: 2,
        padding: '2px 7px',
      }}
    >
      {streak}
    </span>
  )
}
