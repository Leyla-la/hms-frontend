import React from 'react'
import { Paper, Group, Stack, Text, Badge, ThemeIcon, Box } from '@mantine/core'
import { IconMedicineSyrup, IconCircleCheckFilled } from '@tabler/icons-react'

const LowStockCard: React.FC<{ medicines: any[]; palette?: any }> = ({ medicines, palette }) => {
  const P = palette || {
    teal: { tint: '#f0fdfa', accent: '#0d9488', text: '#134e4a' },
    purple: { tint: '#faf5ff' }
  }

  return (
    <Paper withBorder style={{ 
      display: 'flex', flexDirection: 'column', borderRadius: 14, padding: 18, 
      minHeight: 290, maxHeight: 290, height: '100%', 
      borderColor: P.teal.accent + '40', borderLeftWidth: 3,
      overflow: 'hidden' 
    }}>
      <Group justify="space-between" mb={12} align="center">
        <Stack gap={1}>
          <Text fw={700} size="sm" c="dark.8">Low Stock</Text>
          <Text size="xs" c="dimmed">Items needing restock</Text>
        </Stack>
        <Badge color="teal" variant="light" size="sm" radius="sm">{medicines.length} items</Badge>
      </Group>

      <Box style={{ flex: 1, overflowY: 'auto', paddingRight: 4, maxHeight: 185 }}>
        <Stack gap={7}>
          {medicines.length === 0 ? (
            <Stack align="center" justify="center" gap={6} style={{ flex: 1, padding: '40px 0', background: P.teal.tint, borderRadius: 12, border: '1px dashed #4ade80' }}>
              <ThemeIcon size={32} radius="xl" variant="light" color="teal">
                <IconCircleCheckFilled size={16} />
              </ThemeIcon>
              <Box style={{ textAlign: 'center' }}>
                <Text fw={700} size="xs" c="teal.9">Inventory Healthy</Text>
                <Text size="xs" c="dimmed">0 items below threshold</Text>
              </Box>
            </Stack>
          ) : medicines.map((m: any) => {
            const qty = Number(m.quantity ?? m.stock ?? 0)
            const crit = qty <= 20
            return (
              <Group key={m.id || String(m.medicineName)} justify="space-between" wrap="nowrap"
                style={{ padding: '7px 10px', borderRadius: 9, background: crit ? P.purple.tint : P.teal.tint }}>
                <Group gap={8} wrap="nowrap" style={{ flex: 1, overflow: 'hidden' }}>
                  <ThemeIcon size={28} radius="md" variant="light" color={crit ? 'violet' : 'teal'}>
                    <IconMedicineSyrup size={13} />
                  </ThemeIcon>
                  <Stack gap={1} style={{ overflow: 'hidden' }}>
                    <Text size="xs" fw={600} c="dark.8" truncate>{m.medicineName || m.name}</Text>
                    <Text size="xs" c="dimmed" truncate>{m.manufacturer || m.batchNo || '—'}</Text>
                  </Stack>
                </Group>
                <Badge color={crit ? 'violet' : 'teal'} variant={crit ? 'filled' : 'light'} size="sm">{qty}</Badge>
              </Group>
            )
          })}
        </Stack>
      </Box>
    </Paper>
  )
}

export default LowStockCard
