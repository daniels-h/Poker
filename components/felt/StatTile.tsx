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
        background: 'rgba(0,0,0,0.25)',
        border: '1px solid rgba(138,115,64,0.6)',
        borderRadius: 4,
        padding: '20px 24px',
      }}
    >
      <CornerMarks />
      <div
        className="font-mono uppercase mb-2.5"
        style={{ fontSize: 10, color: 'var(--brass)', letterSpacing: '0.15em' }}
      >
        {label}
      </div>
      <div
        className="font-fraunces"
        style={{
          fontSize: 36,
          lineHeight: 1,
          letterSpacing: '-0.02em',
          color: accent ?? 'var(--ivory)',
          fontWeight: 400,
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          className="font-fraunces italic mt-2"
          style={{ fontSize: 12, color: 'var(--ivory-dim)' }}
        >
          {sub}
        </div>
      )}
    </div>
  )
}
