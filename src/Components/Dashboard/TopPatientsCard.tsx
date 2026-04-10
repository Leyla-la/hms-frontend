import React from 'react'
import { Paper, Group, Stack, Text, Avatar, Button, Box } from '@mantine/core'

const AVT_HUE: any[] = ['green', 'teal', 'sky', 'indigo', 'purple']

const TopPatientsCard: React.FC<{ patients?: any[]; vnd?: (n: number) => string; palette?: any }> = ({ patients, vnd, palette }) => {
  const list = patients && patients.length ? patients : [
    { id: 't1', name: 'Nguyễn Văn An', phone: '0912 345 678', visits: 5, revenue: 12500000 },
    { id: 't2', name: 'Trần Thị Bích', phone: '0977 111 222', visits: 4, revenue: 9800000 },
    { id: 't3', name: 'Lê Minh Cường', phone: '0904 222 333', visits: 6, revenue: 8700000 },
  ]
  const P = palette || {
    green: { grad: 'linear-gradient(135deg,#bbf7d0,#86efac)', tint: '#f0fdf4', text: '#14532d', accent: '#16a34a' },
    teal: { grad: 'linear-gradient(135deg,#99f6e4,#5eead4)', tint: '#f0fdfa', text: '#134e4a', accent: '#0d9488' },
    indigo: { grad: 'linear-gradient(135deg,#c7d2fe,#a5b4fc)', tint: '#eef2ff', text: '#312e81', accent: '#4338ca' },
    purple: { grad: 'linear-gradient(135deg,#e9d5ff,#d8b4fe)', tint: '#faf5ff', text: '#4c1d95', accent: '#7c3aed' },
    sky: { grad: 'linear-gradient(135deg,#bae6fd,#7dd3fc)', tint: '#f0f9ff', text: '#0c4a6e', accent: '#0284c7' },
    slate: { grad: 'linear-gradient(135deg,#e2e8f0,#cbd5e1)', tint: '#f8fafc', text: '#475569', accent: '#64748b' }
  }
  const fmt = vnd || ((n: number) => n.toLocaleString('vi-VN') + ' ₫')

  return (
    <Paper withBorder style={{ display: 'flex', flexDirection: 'column', borderRadius: 14, padding: 18, minHeight: 290, maxHeight: 290, height: '100%', borderColor: P.indigo ? P.indigo.accent + '40' : '#e2e8f0', borderLeftWidth: 3 }}>
      <Group justify="space-between" mb={12} align="center">
        <Stack gap={1}>
          <Text fw={700} size="sm" c="dark.8">Top patients</Text>
          <Text size="xs" c="dimmed">Ranked by revenue</Text>
        </Stack>
        <Button variant="subtle" size="xs" color="indigo" px={8}>View all</Button>
      </Group>
      <Box style={{ flex: 1, overflowY: 'auto', paddingRight: 4, maxHeight: 200 }}>
        <Stack gap={7}>
          {list.map((p, i) => {
            const hue = AVT_HUE[i % AVT_HUE.length]
            return (
              <Group key={p.id || i} justify="space-between" wrap="nowrap"
                style={{ padding: '7px 10px', borderRadius: 9, background: P[hue]?.tint ?? '#f8fafc' }}>
                <Group gap={8} wrap="nowrap">
                  <Avatar radius="xl" size={30} style={{ background: P[hue]?.grad, fontSize: 11, fontWeight: 700, color: P[hue]?.text }}>
                    {p.name?.split(' ').pop()?.[0] ?? 'P'}
                  </Avatar>
                  <Stack gap={1}>
                    <Text size="xs" fw={600} c="dark.8">{p.name || 'Unknown'}</Text>
                    <Text size="xs" c="dimmed">{p.contact || 'No contact'}</Text>
                  </Stack>
                </Group>
                <Stack gap={1} align="flex-end">
                  <Text size="xs" fw={800} style={{ color: P[hue]?.accent }}>{fmt(p.totalSpent || p.revenue || 0)}</Text>
                  <Text size="xs" c="dimmed">Top Buyer</Text>
                </Stack>
              </Group>
            )
          })}
        </Stack>
      </Box>
    </Paper>
  )
}

export default TopPatientsCard
