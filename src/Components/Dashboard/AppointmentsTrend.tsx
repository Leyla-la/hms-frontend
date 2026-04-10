import React, { useMemo, useState } from 'react'
import { Paper, Group, Stack, Text, Button, Box } from '@mantine/core'
import { Chart } from 'primereact/chart'

// Local palette & helpers (kept here to avoid changing other files)
const P = {
  sky: { accent: '#0284c7', tint: '#f0f9ff', text: '#0c4a6e' },
} as const
const base = (h?: keyof typeof P, extra?: React.CSSProperties): React.CSSProperties => ({
  display: 'flex', flexDirection: 'column', borderRadius: 14, padding: 18,
  borderColor: h ? (P[h].accent + '40') : '#e2e8f0', borderLeftWidth: h ? 3 : 1, ...extra,
})

const WEEK_DATA = [120, 150, 90, 180, 200, 150, 210]
const QUARTER_DATA = [3600, 4120, 4800, 5100]
const YEAR_DATA = [820, 932, 901, 934, 1290, 1330, 1320, 1500, 1620, 980, 1100, 1250]

const AppointmentsTrend: React.FC = () => {
  const [f, setF] = useState<'week' | 'quarter' | 'year'>('week')
  const chartData = useMemo(() => {
    const cfg = {
      week: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], data: WEEK_DATA },
      quarter: { labels: ['Q1', 'Q2', 'Q3', 'Q4'], data: QUARTER_DATA },
      year: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], data: YEAR_DATA },
    }[f]
    return {
      labels: cfg.labels,
      datasets: [{
        label: 'Appointments', data: cfg.data,
        fill: true, tension: 0.42,
        borderColor: P.sky.accent,
        backgroundColor: P.sky.accent + '18',
        pointBackgroundColor: P.sky.accent,
        pointRadius: 4, pointHoverRadius: 6,
      }],
    }
  }, [f])

  const opts = useMemo(() => ({
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { mode: 'index' as const, intersect: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 } } },
      y: { grid: { color: '#f1f5f9' }, border: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 } } },
    },
  }), [])

  return (
    <Paper withBorder style={base('sky', { height: '100%', minHeight: 290, maxHeight: 290 })}>
      <Group justify="space-between" mb={12} wrap="nowrap" align="center">
        <Stack gap={1}>
          <Text fw={700} size="sm" c="dark.8">Appointments Trend</Text>
          <Text size="xs" c="dimmed">Patient visit frequency</Text>
        </Stack>
        <Group gap={4}>
          {(['week', 'quarter', 'year'] as const).map(v => (
            <Button key={v} size="xs" radius="xl" px={10}
              variant={f === v ? 'filled' : 'subtle'} color="cyan"
              style={{ height: 24, fontSize: 11, textTransform: 'capitalize' }}
              onClick={() => setF(v)}
            >{v.charAt(0).toUpperCase() + v.slice(1)}</Button>
          ))}
        </Group>
      </Group>
      <Box style={{ height: 200 }}>
        <Chart type="line" data={chartData} options={opts} style={{ height: '100%', width: '100%' }} />
      </Box>
    </Paper>
  )
}

export default AppointmentsTrend
