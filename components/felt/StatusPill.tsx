export default function StatusPill({ balanced }: { balanced: boolean }) {
  const color = balanced ? 'var(--win)' : 'var(--loss)'
  const label = balanced ? 'Settled' : 'Unbalanced'
  return (
    <span
      className="font-mono uppercase whitespace-nowrap"
      style={{
        fontSize: 10,
        letterSpacing: '0.15em',
        color,
        border: `1px solid ${balanced ? 'rgba(95,184,120,0.6)' : 'rgba(214,96,88,0.6)'}`,
        borderRadius: 2,
        padding: '3px 8px',
      }}
    >
      {label}
    </span>
  )
}
