export default function StatusPill({ balanced }: { balanced: boolean }) {
  const color = balanced ? 'var(--win)' : 'var(--loss)'
  const label = balanced ? 'Settled' : 'Open'
  return (
    <span
      className="font-mono uppercase whitespace-nowrap"
      style={{
        fontSize: 10,
        letterSpacing: '0.12em',
        color,
      }}
    >
      [{label}]
    </span>
  )
}
