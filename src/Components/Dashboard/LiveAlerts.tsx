import React from 'react'
import { Paper, Group, Stack, Text, Badge, ThemeIcon, Box } from '@mantine/core'
import { IconPackage, IconAlertTriangle, IconCircleCheckFilled } from '@tabler/icons-react'

const LiveAlerts: React.FC<{ alerts: any[]; palette?: any }> = ({ alerts, palette }) => {
  const P = palette || { purple: { tint: '#faf5ff' }, sky: { tint: '#f0f9ff' }, green: { tint: '#f0fdf4' } }

  const displayAlerts = alerts || []

  return (
    <Paper withBorder style={{ display: 'flex', flexDirection: 'column', borderRadius: 14, padding: 18, minHeight: 290, maxHeight: 290, height: '100%', borderColor: '#e2e8f0', borderLeftWidth: 1 }}>
      <Group justify="space-between" mb={12} align="center">
        <Stack gap={1}>
          <Text fw={700} size="sm" c="dark.8">Live Alerts</Text>
          <Text size="xs" c="dimmed">Operational attention</Text>
        </Stack>
        <ThemeIcon size={26} radius="xl" variant="light" color="violet">
          <IconAlertTriangle size={12} />
        </ThemeIcon>
      </Group>

      <Box style={{ flex: 1, overflowY: 'auto', paddingRight: 4, minHeight: 200, maxHeight: 200 }}>
        <Stack gap={7}>
          {alerts.length === 0 ? (
            <Stack align="center" justify="center" gap={6} style={{ flex: 1, padding: '60px 0', background: '#f0fdf4', borderRadius: 12, border: '1px dashed #22c55e' }}>
              <ThemeIcon size={32} radius="xl" variant="light" color="green">
                <IconCircleCheckFilled size={16} />
              </ThemeIcon>
              <Box style={{ textAlign: 'center' }}>
                <Text fw={700} size="xs" c="green.9">All Systems Stable</Text>
                <Text size="xs" c="dimmed">0 active operational alerts</Text>
              </Box>
            </Stack>
          ) : (alerts || []).map((it, idx) => (
            <Group key={idx} justify="space-between" wrap="nowrap"
              style={{ padding: '7px 10px', borderRadius: 9, background: ['EXPIRED', 'SOLD OUT'].includes(it.type.toUpperCase()) ? '#fff5f5' : '#fffaf0' }}>
              <Group gap={8} wrap="nowrap">
                <ThemeIcon size={28} radius="md" variant="light" color={['EXPIRED', 'SOLD OUT'].includes(it.type.toUpperCase()) ? 'red' : 'orange'}>
                  {['EXPIRED', 'SOLD OUT'].includes(it.type.toUpperCase()) ? <IconAlertTriangle size={13} /> : <IconPackage size={13} />}
                </ThemeIcon>
                <Stack gap={0}>
                  <Text fw={700} size="xs" c={['EXPIRED', 'SOLD OUT'].includes(it.type.toUpperCase()) ? 'red' : 'orange'}>
                    {it.type}
                  </Text>
                  <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 }}>
                    {it.message}
                  </Text>
                </Stack>
              </Group>
              <Badge color={it.type === 'EXPIRED' ? 'red' : 'orange'} variant="light" size="sm">NEW</Badge>
            </Group>
          ))}
        </Stack>
      </Box>
    </Paper>
  )
}

export default LiveAlerts
