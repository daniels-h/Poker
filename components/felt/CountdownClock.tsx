'use client'

import { useEffect, useState } from 'react'

interface TimeLeft {
  days: number
  hours: number
  mins: number
}

function getTimeLeft(target: Date): TimeLeft | null {
  const diff = target.getTime() - Date.now()
  if (diff <= 0) return null
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    mins: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
  }
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export default function CountdownClock({ targetDateStr }: { targetDateStr: string | null }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)
  const [mounted, setMounted] = useState(false)
  const [displayDate, setDisplayDate] = useState('')

  useEffect(() => {
    setMounted(true)
    if (!targetDateStr) return

    const target = new Date(targetDateStr)
    if (isNaN(target.getTime())) return

    setDisplayDate(target.toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric',
    }))

    const update = () => setTimeLeft(getTimeLeft(target))
    update()
    const id = setInterval(update, 30000)
    return () => clearInterval(id)
  }, [targetDateStr])

  if (!mounted || !targetDateStr || !timeLeft) {
    return (
      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        <div style={{
          fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
          fontSize: 32, fontWeight: 700, color: '#C8A951',
        }}>TBD</div>
        <div style={{
          fontFamily: 'var(--font-dm-sans), Inter, sans-serif',
          fontSize: 13, color: '#7A9A82', marginTop: 8,
        }}>No upcoming session scheduled</div>
      </div>
    )
  }

  const units = [
    { val: timeLeft.days, label: 'DAYS' },
    { val: timeLeft.hours, label: 'HRS' },
    { val: timeLeft.mins, label: 'MINS' },
  ]

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 2 }}>
        {units.map(({ val, label }, i) => (
          <>
            {i > 0 && (
              <span key={`sep-${i}`} style={{
                fontFamily: 'var(--font-playfair), serif',
                fontSize: 44, fontWeight: 700, color: 'rgba(200,169,81,0.5)',
                lineHeight: 1, paddingTop: 4, margin: '0 4px',
              }}>:</span>
            )}
            <div key={label}>
              <div style={{
                fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
                fontSize: 52, fontWeight: 700, color: '#C8A951', lineHeight: 1,
              }}>{pad(val)}</div>
              <div style={{
                fontFamily: 'var(--font-dm-sans), Inter, sans-serif',
                fontSize: 10, color: '#7A9A82',
                letterSpacing: '0.14em', marginTop: 6,
              }}>{label}</div>
            </div>
          </>
        ))}
      </div>
      {displayDate && (
        <div style={{
          fontFamily: 'var(--font-dm-sans), Inter, sans-serif',
          fontSize: 13, color: '#A3B8A8', marginTop: 16,
        }}>
          Upcoming game on {displayDate}
        </div>
      )}
    </div>
  )
}
