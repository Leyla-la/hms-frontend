import React from 'react'

const Spark: React.FC<{ data: number[]; stroke?: string }> = ({ data, stroke = 'rgba(0,0,0,.25)' }) => {
  const W = 64, H = 26
  const max = Math.max(...data), min = Math.min(...data), rng = Math.max(1, max - min)
  const pts = data.map((v, i) =>
    `${(i / (data.length - 1)) * W},${H - ((v - min) / rng) * (H - 4) - 2}`
  ).join(' L ')
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', flexShrink: 0 }}>
      <path d={`M${pts}`} fill="none" stroke={stroke} strokeWidth={2}
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default Spark
