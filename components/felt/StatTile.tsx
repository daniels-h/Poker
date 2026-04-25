import { ReactNode } from 'react'

interface Props {
  label: string
  value: string | ReactNode
  sub?: string
  accent?: string
}

const CORNER = 8

function CornerMarks() {
  const marks = [
    { top: 1, left: 1 },
    { top: 1, right: 1 },
    { bottom: 1, left: 1 },
    { bottom: 1, right: 1 },
  ]
  return (
    <>
      {marks.map((pos, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: CORNER,
            height: CORNER,
            ...pos,
            borderColor: 'var(--brass)',
            borderStyle: 'solid',
            borderTopWidth: pos.bottom !== undefined ? 0 : 1,
            borderBottomWidth: pos.top !== undefined ? 0 : 1,
            borderLeftWidth: pos.right !== undefined ? 0 : 1,
            borderRightWidth: pos.left !== undefined ? 0 : 1,
          }}
        />
      ))}
    </>
  )
}

export default function StatTile({ label, value, sub, accent }: Props) {
  return (
    <div
      style={{
        position: 'relative',
        background: 'rgba(0,0,0,0.28)',
        border: '1px solid rgba(201,169,97,0.18)',
        boxShadow: 'inset 0 1px 0 rgba(201,169,97,0.2)',
        padding: '18px 22px 16px',
      }}
    >
      <CornerMarks />
      <div
        className="label-caps mb-3"
      >
        {label}
      </div>
      <div
        className="font-mono"
        style={{
          fontSize: 32,
          lineHeight: 1,
          letterSpacing: '-0.02em',
          color: accent ?? 'var(--ivory)',
          fontWeight: 500,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          className="font-inter italic mt-2"
          style={{ fontSize: 11.5, color: 'var(--ivory-dim)' }}
        >
          {sub}
        </div>
      )}
    </div>
  )
}
