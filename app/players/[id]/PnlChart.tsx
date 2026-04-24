'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

interface Props {
  data: { date: string; cumulative: number }[]
}

export default function PnlChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
        <YAxis
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={v => `₱${v.toLocaleString()}`}
        />
        <Tooltip
          formatter={(v) => [`₱${Number(v).toLocaleString()}`, 'Cumulative P&L']}
        />
        <ReferenceLine y={0} stroke="#d1d5db" />
        <Line
          type="monotone"
          dataKey="cumulative"
          stroke="#16a34a"
          strokeWidth={2}
          dot={{ r: 3, fill: '#16a34a' }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
