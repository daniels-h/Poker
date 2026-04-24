'use client'

interface Props {
  nets: number[]
}

export default function SparkChart({ nets }: Props) {
  if (nets.length < 2) return null

  // Cumulative P&L
  const cumulative: number[] = []
  let sum = 0
  for (const n of nets) {
    sum += n
    cumulative.push(sum)
  }

  const maxAbs = Math.max(...cumulative.map(Math.abs), 1)
  const n = cumulative.length

  // Map to SVG coords: x 0–100, y 0–100 (0 = top)
  const pts = cumulative.map((v, i) => ({
    x: (i / (n - 1)) * 100,
    y: 50 - (v / maxAbs) * 45,
  }))

  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaD = `${pathD} L ${pts[pts.length - 1].x} 100 L 0 100 Z`

  return (
    <div
      style={{
        position: 'relative',
        background: 'rgba(0,0,0,0.25)',
        border: '1px solid rgba(138,115,64,0.6)',
        borderRadius: 4,
        padding: '20px 24px',
      }}
    >
      <div className="font-mono uppercase mb-4" style={{ fontSize: 10, color: 'var(--brass)', letterSpacing: '0.2em' }}>
        The Climb · Last {nets.length} Sessions
      </div>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ width: '100%', height: 180, display: 'block' }}
      >
        <defs>
          <linearGradient id="spark-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c9a961" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#c9a961" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Zero line */}
        <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
        {/* Area */}
        <path d={areaD} fill="url(#spark-grad)" />
        {/* Line */}
        <path d={pathD} fill="none" stroke="#c9a961" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
        {/* Dots */}
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="0.8" fill="#f4ecd8" vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
    </div>
  )
}
