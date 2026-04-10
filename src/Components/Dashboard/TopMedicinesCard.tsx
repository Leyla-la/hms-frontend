import React from 'react'
import { Paper, Group, Stack, Text, Badge, ThemeIcon, Box } from '@mantine/core'
import { IconMedicineSyrup, IconTrendingUp } from '@tabler/icons-react'

const TopMedicinesCard: React.FC<{ medicines: any[]; palette?: any }> = ({ medicines, palette }) => {
  const P = palette || {
    sky: { tint: '#f0f9ff', accent: '#0284c7', text: '#0c4a6e' },
    indigo: { tint: '#eef2ff' }
  }

  return (
    <Paper withBorder style={{ display: 'flex', flexDirection: 'column', borderRadius: 14, padding: 18, minHeight: 290, maxHeight: 290, height: '100%', borderColor: P.sky.accent + '40', borderLeftWidth: 3 }}>
      <Group justify="space-between" mb={12} align="center">
        <Stack gap={1}>
          <Text fw={700} size="sm" c="dark.8">Top Medicines</Text>
          <Text size="xs" c="dimmed">Best sellers this month</Text>
        </Stack>
        <ThemeIcon size={26} radius="xl" variant="light" color="blue">
          <IconTrendingUp size={14} />
        </ThemeIcon>
      </Group>

      <Box style={{ flex: 1, overflowY: 'auto', paddingRight: 4, minHeight: 200, maxHeight: 200 }}>
        <Stack gap={7}>
          {medicines.length === 0 ? (
            <Stack align="center" justify="center" gap={6} style={{ flex: 1, padding: '60px 0', background: P.sky.tint, borderRadius: 12, border: '1px dashed #7dd3fc' }}>
              <ThemeIcon size={32} radius="xl" variant="light" color="blue">
                <IconMedicineSyrup size={16} />
              </ThemeIcon>
              <Box style={{ textAlign: 'center' }}>
                <Text fw={700} size="xs" c="blue.9">No Sales Data</Text>
                <Text size="xs" c="dimmed">Waiting for sales transactions</Text>
              </Box>
            </Stack>
          ) : medicines.map((m: any, idx: number) => {
            return (
              <Group key={m.id || idx} justify="space-between" wrap="nowrap"
                style={{ padding: '7px 10px', borderRadius: 9, background: P.sky.tint }}>
                <Group gap={8} wrap="nowrap">
                  <ThemeIcon size={28} radius="md" variant="light" color="blue">
                    <IconMedicineSyrup size={13} />
                  </ThemeIcon>
                  <Stack gap={1}>
                    <Text size="xs" fw={600} c="dark.8">{m.name}</Text>
                    <Text size="xs" c="dimmed">{m.totalSold || 0} units sold</Text>
                  </Stack>
                </Group>
                <Badge color="blue" variant="outline" size="sm">#{idx + 1}</Badge>
              </Group>
            )
          })}
        </Stack>
      </Box>
    </Paper>
  )
}

export default TopMedicinesCard
