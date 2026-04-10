import React from 'react'
import { Paper, Stack, Text, Box } from '@mantine/core'
import { Chart } from 'primereact/chart'

// Local palette & helpers (kept here to avoid changing other files)
const P = {
  green: { accent: '#16a34a', tint: '#f0fdf4', text: '#14532d' },
  sky: { accent: '#0284c7', tint: '#f0f9ff', text: '#0c4a6e' },
  purple: { accent: '#7c3aed', tint: '#faf5ff', text: '#4c1d95' },
} as const
const base = (h?: keyof typeof P, extra?: React.CSSProperties): React.CSSProperties => ({
  display: 'flex', flexDirection: 'column', borderRadius: 14, padding: 18,
  borderColor: h ? (P[h].accent + '40') : '#e2e8f0', borderLeftWidth: h ? 3 : 1, ...extra,
})

const InventoryHealth: React.FC<{ health?: any }> = ({ health }) => {
  const active = health?.active || 0
  const expired = health?.expired || 0
  const sold = health?.soldOut || 0

  const data = {
    labels: ['Active', 'Expired', 'Sold Out'],
    datasets: [{ data: [active, expired, sold], backgroundColor: [P.green.accent, P.sky.accent, P.purple.accent], borderWidth: 0 }],
  }
  const opts = {
    responsive: true, maintainAspectRatio: false, cutout: '68%',
    plugins: {
      legend: { position: 'bottom' as const, labels: { color: '#64748b', boxWidth: 10, padding: 12, font: { size: 11 } } },
    },
  }
  return (
    <Paper withBorder style={base('green', { minHeight: 290, maxHeight: 290, height: '100%' })}>
      <Stack gap={1} mb={12}>
        <Text fw={700} size="sm" c="dark.8">Inventory Health</Text>
        <Text size="xs" c="dimmed">Batch status breakdown</Text>
      </Stack>
      <Box style={{ height: 200 }}>
        <Chart type="doughnut" data={data} options={opts} style={{ height: '100%' }} />
      </Box>
    </Paper>
  )
}

export default InventoryHealth
