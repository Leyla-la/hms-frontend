import React from 'react'
import { Paper, Group, Stack, Text, Badge, Box, ThemeIcon } from '@mantine/core'
import { IconCalendarCheck } from '@tabler/icons-react'

const UpcomingAppointments: React.FC<{ appointments?: any[]; palette?: any }> = ({ appointments, palette }) => {
  const displayList = Array.isArray(appointments) ? appointments : []

  const P = palette || {
    teal: { tint: '#f0fdfa', accent: '#0d9488', text: '#134e4a' },
    sky: { tint: '#f0f9ff', text: '#0c4a6e', grad: 'linear-gradient(135deg,#bae6fd,#7dd3fc)' },
    slate: { tint: '#f8fafc', text: '#1e293b', grad: 'linear-gradient(135deg,#e2e8f0,#cbd5e1)' }
  }

  return (
    <Paper withBorder style={{ display: 'flex', flexDirection: 'column', borderRadius: 14, padding: 18, minHeight: 290, maxHeight: 290, height: '100%', borderColor: P.teal.accent + '40', borderLeftWidth: 3 }}>
      <Group justify="space-between" mb={12} align="center">
        <Stack gap={1}>
          <Text fw={700} size="sm" c="dark.8">Today's appointments</Text>
          <Text size="xs" c="dimmed">{new Date().toLocaleDateString('en-US', { weekday: 'long', day: '2-digit', month: '2-digit' })}</Text>
        </Stack>
        <Badge color="teal" variant="light" size="sm" radius="sm">{displayList.length} appts</Badge>
      </Group>

      <Box style={{ flex: 1, overflowY: 'auto', paddingRight: 4, minHeight: 200, maxHeight: 200 }}>
        <Stack gap={7}>
          {displayList.length === 0 ? (
            <Stack align="center" justify="center" gap={6} style={{ flex: 1, padding: '60px 0', background: P.slate.tint, borderRadius: 12, border: '1px dashed #94a3b8' }}>
              <ThemeIcon size={32} radius="xl" variant="light" color="slate">
                <IconCalendarCheck size={16} />
              </ThemeIcon>
              <Box style={{ textAlign: 'center' }}>
                <Text fw={700} size="xs" c="slate.9">Schedule Clear</Text>
                <Text size="xs" c="dimmed">No more appointments for today</Text>
              </Box>
            </Stack>
          ) : displayList.map(u => {
            const done = u.status === 'completed' || u.status === 'confirmed'
            return (
              <Group key={u.id} justify="space-between" wrap="nowrap"
                style={{ padding: '7px 10px', borderRadius: 9, background: done ? P.sky.tint : P.slate.tint }}>
                <Group gap={8} wrap="nowrap">
                  <Box style={{ background: done ? P.sky.grad : P.slate.grad, borderRadius: 7, padding: '3px 8px', flexShrink: 0 }}>
                    <Group gap={3} wrap="nowrap" align="center">
                      <Text size="xs" fw={700} style={{ color: done ? P.sky.text : P.slate.text }}>{u.time}</Text>
                    </Group>
                  </Box>
                  <Stack gap={1}>
                    <Text size="xs" fw={600} c="dark.8">{u.patient}</Text>
                    <Text size="xs" c="dimmed">{u.doctor} · {u.dept}</Text>
                  </Stack>
                </Group>
                <Box style={{ flexShrink: 0 }}>
                  {done ? '✓' : '•'}
                </Box>
              </Group>
            )
          })}
        </Stack>
      </Box>
    </Paper>
  )
}

export default UpcomingAppointments
