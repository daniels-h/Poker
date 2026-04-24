import { ReactNode } from 'react'

interface Props {
  eyebrow: string
  title: string
  subtitle?: string
  right?: ReactNode
}

export default function PageHeader({ eyebrow, title, subtitle, right }: Props) {
  return (
    <div className="flex items-start justify-between mb-7 gap-4 flex-wrap">
      <div>
        <div
          className="font-mono uppercase mb-2"
          style={{ fontSize: 10, color: 'var(--brass)', letterSpacing: '0.2em' }}
        >
          {eyebrow}
        </div>
        <h1
          className="font-fraunces text-ivory"
          style={{ fontSize: 48, lineHeight: '52px', letterSpacing: '-0.03em', fontWeight: 400 }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className="font-fraunces italic mt-2.5"
            style={{ fontSize: 16, color: 'var(--brass)', lineHeight: '22px' }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {right && <div className="flex items-center gap-3 pt-6">{right}</div>}
    </div>
  )
}
