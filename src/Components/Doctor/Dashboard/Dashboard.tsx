import React, { useEffect, useState } from 'react'
import {
  Avatar, Badge, Box, Button, Grid, Group,
  Paper, ScrollArea, SimpleGrid, Stack, Text, ThemeIcon,
} from '@mantine/core'
import {
  IconCalendarStats, IconClipboardText, IconUserCheck,
  IconAlertCircle, IconClock, IconCircleCheckFilled, IconCircleDotFilled,
  IconChevronRight, IconPill, IconArrowUpRight, IconStethoscope,
  IconCalendarDue, IconNotes, IconPhone, IconDroplet, IconAlertTriangle,
  IconHeartbeat,
} from '@tabler/icons-react'
import { Chart } from 'primereact/chart'

import { useNavigate } from 'react-router-dom'

// AppointmentService calls are used inside DashboardService fallbacks
import * as DashboardService from '../../../Service/DashboardService.tsx'
import { useSelector } from 'react-redux'
import KpiCard from '../../Dashboard/KpiCard.tsx'
import StatusBadge from '../../Dashboard/StatusBadge.tsx'
import { bloodGroupMap } from '../../../Data/DropdownData.tsx'

// ─── utils ────────────────────────────────────────────────────────────────────
const fmtTime = (dt: string) => new Date(dt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
const fmtDate = (dt: string) => new Date(dt).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })
const fmtAge = (dob: string) => {
  const age = Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 864e5))
  return `${age} yrs`
}

// ─── CLINICAL PALETTE — blue/teal/slate base, no warm tones ──────────────────
const C = {
  azure: { grad: 'linear-gradient(135deg,#bfdbfe,#93c5fd)', accent: '#1d4ed8', tint: '#eff6ff', text: '#1e3a5f' },
  cyan: { grad: 'linear-gradient(135deg,#a5f3fc,#67e8f9)', accent: '#0891b2', tint: '#ecfeff', text: '#164e63' },
  teal: { grad: 'linear-gradient(135deg,#99f6e4,#5eead4)', accent: '#0d9488', tint: '#f0fdfa', text: '#134e4a' },
  slate: { grad: 'linear-gradient(135deg,#e2e8f0,#cbd5e1)', accent: '#475569', tint: '#f8fafc', text: '#1e293b' },
  violet: { grad: 'linear-gradient(135deg,#ddd6fe,#c4b5fd)', accent: '#6d28d9', tint: '#f5f3ff', text: '#2e1065' },
  emerald: { grad: 'linear-gradient(135deg,#a7f3d0,#6ee7b7)', accent: '#059669', tint: '#ecfdf5', text: '#064e3b' },
} as const
type Hue = keyof typeof C

const G_GAP = 14
const CP = 18
const CR = 14

const base = (h?: Hue, extra?: React.CSSProperties): React.CSSProperties => ({
  display: 'flex', flexDirection: 'column',
  borderRadius: CR, padding: CP,
  borderColor: h ? C[h].accent + '40' : '#e2e8f0',
  borderLeftWidth: h ? 3 : 1,
  ...extra,
})

// Data will come from DashboardService.getDoctorDashboard

const WEEKLY_DATA = [8, 12, 7, 14, 11, 6, 9]
const WEEKLY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// Using shared `KpiCard` and `StatusBadge` from src/Components/Dashboard

const KPI_DEFS = [
  { id: 'total', label: 'Today', sub: 'Total appointments', hue: 'azure' as Hue, icon: <IconCalendarStats size={17} />, spark: [5, 8, 6, 10, 9, 11, 7], delta: '7 appts', val: '7' },
  { id: 'sched', label: 'Waiting', sub: 'Scheduled', hue: 'cyan' as Hue, icon: <IconClock size={17} />, spark: [3, 5, 4, 7, 6, 8, 5], delta: '5 appts', val: '5' },
  { id: 'done', label: 'Completed', sub: 'Completed', hue: 'emerald' as Hue, icon: <IconUserCheck size={17} />, spark: [1, 2, 1, 3, 2, 3, 2], delta: '2 appts', val: '2' },
  { id: 'followup', label: 'Follow-up', sub: 'Needs follow-up', hue: 'violet' as Hue, icon: <IconCalendarDue size={17} />, spark: [2, 3, 1, 4, 2, 3, 4], delta: '4 appts', val: '4' },
]

// ─── Next Patient Hero Card ───────────────────────────────────────────────────
const NextPatientCard: React.FC<{ next?: any, navigate: any }> = ({ next, navigate }) => {
  const p = next || null

  const parseAllergies = (allergies: any) => {
    if (!allergies) return 'None';
    if (Array.isArray(allergies)) return allergies.length > 0 ? allergies.join(', ') : 'None';
    if (typeof allergies === 'string') {
      try {
        const parsed = JSON.parse(allergies);
        if (Array.isArray(parsed)) return parsed.length > 0 ? parsed.join(', ') : 'None';
      } catch (e) {
        // Not valid JSON string, fallback to manual cleaning
      }
      const clean = allergies.replace(/[\[\]"]/g, '').split(',').map(s => s.trim()).filter(Boolean);
      return clean.length > 0 ? clean.join(', ') : 'None';
    }
    return 'None';
  }


  return (
    <Paper withBorder style={base('azure', { height: '100%' })}>
      {/* header */}
      <Group justify="space-between" mb={14} align="center">
        <Stack gap={1}>
          <Text fw={700} size="sm" c="dark.8">Next patient</Text>
          <Group gap={5} align="center">
            <IconClock size={11} color={C.azure.accent} />
            <Text size="xs" fw={700} style={{ color: C.azure.accent }}>
              {p?.appointmentTime ?? '—'}
            </Text>
          </Group>
        </Stack>
        <Badge color="blue" variant="filled" size="sm" radius="sm">Upcoming</Badge>
      </Group>

      {p == null ? (
        /* ── empty state ── */
        <Stack align="center" justify="center" gap={8} style={{ flex: 1, paddingTop: 32, paddingBottom: 32 }}>
          <ThemeIcon size={48} radius="xl" variant="light" color="blue">
            <IconCalendarStats size={22} />
          </ThemeIcon>
          <Text size="sm" c="dimmed" ta="center">No upcoming patient</Text>
          <Text size="xs" c="dimmed" ta="center">Your queue is clear for now</Text>
        </Stack>
      ) : (
        <>
          {/* patient identity */}
          <Group gap={12} mb={14} wrap="nowrap" align="flex-start">
            <Avatar radius="xl" size={52}
              style={{ background: C.azure.grad, color: C.azure.text, fontWeight: 800, fontSize: 20, flexShrink: 0 }}>
              {p.name?.split(' ').pop()?.[0] ?? '?'}
            </Avatar>
            <Stack gap={3}>
              <Text fw={800} size="md" c="dark.9">{p.name || 'Unknown'}</Text>
              <Group gap={10} wrap="nowrap">
                <Group gap={4}><IconPhone size={11} color="#94a3b8" /><Text size="xs" c="dimmed">{p?.patientPhone || p?.phone || 'No phone'}</Text></Group>
              </Group>
            </Stack>
          </Group>

          {/* reason */}
          <Box style={{ background: C.azure.tint, borderRadius: 9, padding: '9px 12px', marginBottom: 12 }}>
            <Text size="xs" fw={600} c="dark.5" mb={2}>Reason for visit</Text>
            <Text size="xs" c="dark.8">{p?.reason || '—'}</Text>
          </Box>

          {/* vitals */}
          <Grid gutter={8} mb={10}>
            <Grid.Col span={6}>
              <Box style={{ background: C.teal.tint, borderRadius: 8, padding: '7px 10px' }}>
                <Group gap={5} mb={2}><IconDroplet size={11} color={C.teal.accent} /><Text size="xs" fw={600} c="dark.5">Blood group</Text></Group>
                <Text size="sm" fw={800} style={{ color: C.teal.accent }}>
                  {p?.bloodGroup ? bloodGroupMap[p.bloodGroup as keyof typeof bloodGroupMap] : '-'}
                </Text>
              </Box>
            </Grid.Col>
            <Grid.Col span={6}>
              <Box style={{ background: C.violet.tint, borderRadius: 8, padding: '7px 10px' }}>
                <Group gap={5} mb={2}><IconAlertTriangle size={11} color={C.violet.accent} /><Text size="xs" fw={600} c="dark.5">Allergies</Text></Group>
                <Text size="xs" fw={700} style={{ color: C.violet.accent }}>{parseAllergies(p?.allergies)}</Text>
              </Box>
            </Grid.Col>
          </Grid>

          {/* chronic */}
          {p?.chronicDiseases?.length > 0 && (
            <Box style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, padding: '7px 12px' }}>
              <Group gap={5} mb={4}><IconHeartbeat size={11} color="#c2410c" /><Text size="xs" fw={600} style={{ color: '#c2410c' }}>Chronic conditions</Text></Group>
              <Group gap={5} wrap="wrap">
                {p?.chronicDiseases?.map((d: string) => (
                  <Badge key={d} color="orange" variant="light" size="xs" radius="sm">{d}</Badge>
                ))}
              </Group>
            </Box>
          )}

          {/* action */}
          <Button fullWidth mt={14} size="xs" radius="md" color="blue" rightSection={<IconChevronRight size={13} />} onClick={() => p?.id && navigate(`/doctor/appointments/${p.id}`)}>
            Start visit
          </Button>
        </>
      )}
    </Paper>
  )
}

// ─── Today Schedule ───────────────────────────────────────────────────────────
const TodaySchedule: React.FC<{ appointments?: any[] }> = ({ appointments = [] }) => (
  <Paper withBorder style={base('cyan', { height: '100%' })}>
    <Group justify="space-between" mb={12} align="center">
      <Stack gap={1}>
        <Text fw={700} size="sm" c="dark.8">Today's Schedule</Text>
        <Text size="xs" c="dimmed">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', day: '2-digit', month: '2-digit' })}
        </Text>
      </Stack>
      <Badge color="cyan" variant="light" size="sm" radius="sm">{appointments.length} appts</Badge>
    </Group>

    {/* table header */}
    <Group justify="space-between" px={10} mb={6}>
      {['Time', 'Patient', 'Reason', 'Status'].map(h => (
        <Text key={h} size="xs" fw={700} c="dimmed" style={{ flex: h === 'Patient' || h === 'Reason' ? 1 : 'unset', minWidth: h === 'Time' ? 42 : 'unset' }}>{h}</Text>
      ))}
    </Group>

    <ScrollArea.Autosize mah={210} offsetScrollbars>
      <Stack gap={5}>
        {appointments.length === 0 ? (
          <Stack align="center" justify="center" gap={8} style={{ flex: 1, padding: '40px 0' }}>
            <ThemeIcon size={48} radius="xl" variant="light" color="cyan">
              <IconCalendarStats size={22} />
            </ThemeIcon>
            <Text size="sm" c="dimmed" ta="center">No appointments today</Text>
            <Text size="xs" c="dimmed" ta="center">Your schedule is clear</Text>
          </Stack>
        ) : (
          appointments.map(a => {
            const isNext = a.status === 'SCHEDULED' && a.id === 'a2'
            return (
              <Group key={a.id} justify="space-between" wrap="nowrap" px={10} py={7}
                style={{
                  borderRadius: 9,
                  background: isNext ? C.azure.tint : a.status === 'COMPLETED' ? C.emerald.tint : a.status === 'CANCELLED' ? '#f8fafc' : C.cyan.tint,
                  border: isNext ? `1.5px solid ${C.azure.accent}40` : '1.5px solid transparent',
                }}>
                {/* time */}
                <Text size="xs" fw={800} style={{ color: isNext ? C.azure.accent : '#64748b', minWidth: 42 }}>{a.time}</Text>

                {/* patient */}
                <Group gap={7} wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                  <Avatar size={22} radius="xl"
                    style={{ background: isNext ? C.azure.grad : C.slate.grad, color: C.slate.text, fontSize: 9, fontWeight: 700, flexShrink: 0 }}>
                    {a.patientName.split(' ').pop()?.[0]}
                  </Avatar>
                  <Text size="xs" fw={600} c="dark.7" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.patientName}</Text>
                </Group>

                {/* reason */}
                <Text size="xs" c="dimmed" style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.reason}</Text>

                {/* status */}
                <Box style={{ flexShrink: 0 }}>
                  {a.status === 'COMPLETED'
                    ? <IconCircleCheckFilled size={15} color={C.emerald.accent} />
                    : a.status === 'CANCELLED'
                      ? <IconCircleDotFilled size={15} color="#94a3b8" />
                      : isNext
                        ? <IconCircleDotFilled size={15} color={C.azure.accent} />
                        : <StatusBadge status={a.status} />}
                </Box>
              </Group>
            )
          })
        )}
      </Stack>
    </ScrollArea.Autosize>
  </Paper>
)

// ─── Current Queue ────────────────────────────────────────────────────────────
const CurrentQueue: React.FC<{ appointments?: any[] }> = ({ appointments = [] }) => {
  const queue = appointments.filter(a => a.status === 'SCHEDULED')
  return (
    <Paper withBorder style={base('teal', { height: '100%' })}>
      <Group justify="space-between" mb={12} align="center">
        <Stack gap={1}>
          <Text fw={700} size="sm" c="dark.8">Current queue</Text>
          <Text size="xs" c="dimmed">Patients waiting</Text>
        </Stack>
        <Badge color="teal" variant="filled" size="sm" radius="sm">{queue.length} waiting</Badge>
      </Group>
      <ScrollArea.Autosize mah={240} offsetScrollbars>
        <Stack gap={7}>
          {queue.length === 0 ? (
            <Stack align="center" justify="center" gap={8} style={{ flex: 1, padding: '40px 0' }}>
              <ThemeIcon size={48} radius="xl" variant="light" color="teal">
                <IconUserCheck size={22} />
              </ThemeIcon>
              <Text size="sm" c="dimmed" ta="center">Queue is empty</Text>
              <Text size="xs" c="dimmed" ta="center">No active waiting patients</Text>
            </Stack>
          ) : (
            queue.map((a, idx) => (
              <Group key={a.id} justify="space-between" wrap="nowrap"
                style={{ padding: '8px 11px', borderRadius: 9, background: idx === 0 ? C.azure.tint : C.teal.tint, border: idx === 0 ? `1.5px solid ${C.azure.accent}30` : '1.5px solid transparent' }}>
                <Group gap={8} wrap="nowrap">
                  <Box style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: idx === 0 ? C.azure.grad : C.teal.grad,
                    display: 'grid', placeItems: 'center', flexShrink: 0,
                  }}>
                    <Text size="xs" fw={800} style={{ color: idx === 0 ? C.azure.text : C.teal.text }}>{idx + 1}</Text>
                  </Box>
                  <Stack gap={1}>
                    <Text size="xs" fw={600} c="dark.8">{a.patientName}</Text>
                    <Text size="xs" c="dimmed">{a.reason}</Text>
                  </Stack>
                </Group>
                <Group gap={6} wrap="nowrap" align="center">
                  <Group gap={3}>
                    <IconClock size={10} color={idx === 0 ? C.azure.accent : '#94a3b8'} />
                    <Text size="xs" fw={700} style={{ color: idx === 0 ? C.azure.accent : '#64748b' }}>{a.time}</Text>
                  </Group>
                  {idx === 0 && <Badge color="blue" variant="filled" size="xs" radius="sm">Next</Badge>}
                </Group>
              </Group>
            ))
          )}
        </Stack>
      </ScrollArea.Autosize>
    </Paper>
  )
}

// ─── Pending Clinical Tasks ───────────────────────────────────────────────────
const PendingTasks: React.FC = () => {
  const tasks = [
    { id: 't1', icon: <IconClipboardText size={13} />, label: 'Records to document', count: 3, color: 'cyan' as const, tint: C.cyan.tint },
    { id: 't2', icon: <IconCalendarDue size={13} />, label: 'Follow-ups due', count: 4, color: 'violet' as const, tint: C.violet.tint },
    { id: 't3', icon: <IconPill size={13} />, label: 'Prescriptions today', count: 2, color: 'teal' as const, tint: C.teal.tint },
    { id: 't4', icon: <IconNotes size={13} />, label: 'Pending results', count: 1, color: 'azure' as const, tint: C.azure.tint },
  ]
  return (
    <Paper withBorder style={base('violet', { height: '100%' })}>
      <Group justify="space-between" mb={12} align="center">
        <Stack gap={1}>
          <Text fw={700} size="sm" c="dark.8">To-do</Text>
          <Text size="xs" c="dimmed">Clinical tasks today</Text>
        </Stack>
        <ThemeIcon size={26} radius="xl" variant="light" color="violet">
          <IconAlertCircle size={12} />
        </ThemeIcon>
      </Group>
      <Stack gap={7} style={{ flex: 1 }}>
        {tasks.map(t => (
          <Group key={t.id} justify="space-between" wrap="nowrap"
            style={{ padding: '8px 11px', borderRadius: 9, background: t.tint }}>
            <Group gap={8} wrap="nowrap">
              <ThemeIcon size={28} radius="md" variant="light" color={t.color}>{t.icon}</ThemeIcon>
              <Text fw={600} size="xs" c="dark.8">{t.label}</Text>
            </Group>
            <Badge color={t.color} variant="light" size="sm">{t.count}</Badge>
          </Group>
        ))}
      </Stack>
      <Button
        fullWidth
        mt={12}
        variant="light"
        size="xs"
        color="violet"
        radius="md"
        onClick={() => {
          // You could pass navigate down as prop if you want, but for simplicity:
          window.location.href = '/doctor/appointments'
        }}
      >
        View all in Appointments
      </Button>
    </Paper>
  )
}

// ─── Recent Prescriptions ─────────────────────────────────────────────────────
const RecentPrescriptions: React.FC<{ prescriptions?: any[] }> = ({ prescriptions = [] }) => (
  <Paper withBorder style={base('cyan', { height: '100%' })}>
    <Group justify="space-between" mb={12} align="center">
      <Stack gap={1}>
        <Text fw={700} size="sm" c="dark.8">Recent prescriptions</Text>
        <Text size="xs" c="dimmed">Prescribed by you</Text>
      </Stack>
      <Button variant="subtle" size="xs" color="cyan" px={8}>View all</Button>
    </Group>
    <Stack gap={7} style={{ flex: 1, overflowY: 'auto', maxHeight: 310, paddingRight: 4 }}>
      {prescriptions.length === 0 ? (
        <Stack align="center" justify="center" gap={8} style={{ flex: 1, padding: '40px 0' }}>
          <ThemeIcon size={48} radius="xl" variant="light" color="cyan">
            <IconPill size={22} />
          </ThemeIcon>
          <Text size="sm" c="dimmed" ta="center">No recent prescriptions</Text>
        </Stack>
      ) : (
        prescriptions.map(rx => (
          <Box key={rx.id} style={{ padding: '9px 12px', borderRadius: 10, background: C.cyan.tint, border: `1px solid ${C.cyan.accent}20` }}>
            <Group justify="space-between" mb={5} wrap="nowrap">
              <Group gap={7} wrap="nowrap">
                <ThemeIcon size={26} radius="md" variant="light" color="cyan"><IconPill size={12} /></ThemeIcon>
                <Stack gap={1}>
                  <Text size="xs" fw={700} c="dark.8">{rx.patientName}</Text>
                  <Text size="xs" c="dimmed">{rx.prescriptionDate ? fmtDate(rx.prescriptionDate) : 'Unknown'}</Text>
                </Stack>
              </Group>
              <Badge color="cyan" variant="light" size="xs">{rx.medicines ? rx.medicines.length : 0} types</Badge>
            </Group>
            <Text size="xs" c="dimmed" style={{ paddingLeft: 33 }}>
              {rx.medicines && rx.medicines.length > 0 ? rx.medicines.slice(0, 2).map((m: any) => m.name).join(' · ') : 'No exact medicines'}
              {rx.medicines && rx.medicines.length > 2 ? ` +${rx.medicines.length - 2}` : ''}
            </Text>
            {rx.notes && (
              <Text size="xs" style={{ paddingLeft: 33, color: '#f59e0b', marginTop: 3 }}>⚠ {rx.notes}</Text>
            )}
          </Box>
        ))
      )}
    </Stack>
  </Paper>
)

// ─── Follow-up Due ────────────────────────────────────────────────────────────
const FollowUpDue: React.FC<{ followUps?: any[] }> = ({ followUps = [] }) => (
  <Paper withBorder style={base('violet', { height: '100%' })}>
    <Group justify="space-between" mb={12} align="center">
      <Stack gap={1}>
        <Text fw={700} size="sm" c="dark.8">Upcoming follow-ups</Text>
        <Text size="xs" c="dimmed">Patients needing follow-up</Text>
      </Stack>
      <Badge color="violet" variant="light" size="sm" radius="sm">{followUps.length} appts</Badge>
    </Group>
    <Stack gap={7} style={{ flex: 1, overflowY: 'auto', maxHeight: 310, paddingRight: 4 }}>
      {followUps.length === 0 ? (
        <Stack align="center" justify="center" gap={8} style={{ flex: 1, padding: '40px 0' }}>
          <ThemeIcon size={48} radius="xl" variant="light" color="violet">
            <IconCalendarDue size={22} />
          </ThemeIcon>
          <Text size="sm" c="dimmed" ta="center">No upcoming follow-ups</Text>
        </Stack>
      ) : (
        followUps.map(f => {
          const daysLeft = Math.ceil((new Date(f.followUpDate).getTime() - Date.now()) / 864e5)
          const urgent = daysLeft <= 3
          return (
            <Group key={f.id} justify="space-between" wrap="nowrap"
              style={{ padding: '8px 11px', borderRadius: 9, background: urgent ? '#fff7ed' : C.violet.tint }}>
              <Group gap={8} wrap="nowrap">
                <ThemeIcon size={28} radius="md" variant="light" color={urgent ? 'orange' : 'violet'}>
                  <IconCalendarDue size={12} />
                </ThemeIcon>
                <Stack gap={1}>
                  <Text size="xs" fw={700} c="dark.8">{f.patientName || 'Patient'}</Text>
                  <Text size="xs" c="dimmed">{f.diagnosis || 'No diagnosis'}</Text>
                  {f.referral && <Badge color="orange" variant="dot" size="xs">{f.referral}</Badge>}
                </Stack>
              </Group>
              <Stack gap={2} align="flex-end">
                <Text size="xs" fw={700} style={{ color: urgent ? '#c2410c' : C.violet.accent }}>
                  {f.followUpDate ? fmtDate(f.followUpDate) : ''}
                </Text>
                <Text size="xs" style={{ color: urgent ? '#c2410c' : '#94a3b8' }}>
                  {daysLeft <= 0 ? 'Today' : `${daysLeft} days left`}
                </Text>
              </Stack>
            </Group>
          )
        })
      )}
    </Stack>
  </Paper>
)

// ─── Weekly Load Chart ────────────────────────────────────────────────────────
const WeeklyLoadChart: React.FC = () => {
  const data = {
    labels: WEEKLY_LABELS,
    datasets: [{
      label: 'Appointments', data: WEEKLY_DATA,
      borderColor: C.azure.accent,
      backgroundColor: C.azure.accent + '22',
      pointBackgroundColor: WEEKLY_DATA.map((_, i) => i === new Date().getDay() - 1 ? C.azure.accent : C.azure.accent + '88'),
      pointRadius: WEEKLY_DATA.map((_, i) => i === new Date().getDay() - 1 ? 6 : 4),
      pointHoverRadius: 8,
      tension: 0.4,
      fill: true,
      borderWidth: 2,
    }],
  }
  const opts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { mode: 'index' as const, intersect: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 } } },
      y: { grid: { color: '#f1f5f9' }, border: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 }, stepSize: 4 } },
    },
  }
  return (
    <Paper withBorder style={base('azure', { height: '100%' })}>
      <Group justify="space-between" mb={12} align="center">
        <Stack gap={1}>
          <Text fw={700} size="sm" c="dark.8">Workload</Text>
          <Text size="xs" c="dimmed">Appointments — Last 7 days</Text>
        </Stack>
        <Group gap={6}>
          <Box style={{ width: 10, height: 10, borderRadius: '50%', background: C.azure.accent }} />
          <Text size="xs" c="dimmed">Today</Text>
          <Box style={{ width: 10, height: 10, borderRadius: '50%', background: C.azure.accent + '88' }} />
          <Text size="xs" c="dimmed">Other days</Text>
        </Group>
      </Group>
      <Box style={{ height: 160 }}>
        <Chart type="line" data={data} options={opts} style={{ height: '100%', width: '100%' }} />
      </Box>
    </Paper>
  )
}


// ─── Doctor Dashboard ─────────────────────────────────────────────────────────
const Dashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([])
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [nextPatient, setNextPatient] = useState<any | null>(null)
  const [followUps, setFollowUps] = useState<any[]>([])
  const [doctorInfo, setDoctorInfo] = useState<any | null>(null)
  const [now, setNow] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const navigate = useNavigate()

  const user = useSelector((state: any) => state.user)
  useEffect(() => {
    let mounted = true
    const id = user?.profileId
    console.log('====== DOCTOR DASHBOARD INIT chạy ======');
    console.log('API call uses ID:', id);

    if (!id) {
      setLoading(false)
      setError('No user id')
      return
    }
    DashboardService.getDoctorDashboard(id)
      .then((data: any) => {
        if (!mounted) return
        console.log('====== DOCTOR DASHBOARD DATA ======');
        console.log('API Response Raw Data:', data);
        console.log('-> Parsed todaySchedule (Current Queue / Today Schedule):', data?.todaySchedule);
        console.log('-> Parsed prescriptions:', data?.prescriptions);
        console.log('-> Parsed followUps (Upcoming follow-ups):', data?.followUps);
        console.log('-> Parsed nextPatient:', data?.nextPatient);
        console.log('===================================');

        setAppointments(Array.isArray(data?.todaySchedule) ? data.todaySchedule : [])
        setPrescriptions(Array.isArray(data?.prescriptions) ? data.prescriptions : [])
        setNextPatient(data?.nextPatient || null)
        setFollowUps(Array.isArray(data?.followUps) ? data.followUps : [])
        setDoctorInfo(data?.doctor || null)
        setLoading(false)
      })
      .catch((e) => {
        if (!mounted) return
        setError('Failed to load dashboard')
        setLoading(false)
      })
    const tick = setInterval(() => setNow(new Date()), 30_000)
    return () => { mounted = false; clearInterval(tick) }
  }, [user?.profileId])

  // derive KPI counts
  const todayAppts = appointments.length
  const scheduled = appointments.filter(a => a.status === 'SCHEDULED').length
  const completed = appointments.filter(a => a.status === 'COMPLETED').length

  const KPI_WITH_DATA = KPI_DEFS.map((d, i) => ({
    ...d,
    count: [todayAppts, scheduled, completed, followUps.length][i],
  }))

  return (
    <div style={{ padding: '20px 24px', background: '#f0f9ff', minHeight: '100vh' }}>

      {/* ── Header ── */}
      <Box style={{
        background: 'linear-gradient(120deg,#0c2d5e 0%,#1d4ed8 60%,#0369a1 100%)',
        borderRadius: CR, padding: '16px 22px', marginBottom: G_GAP,
      }}>
        <Group justify="space-between" align="center" wrap="nowrap">
          <Group gap={14} wrap="nowrap">
            <Box style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'linear-gradient(135deg,#bfdbfe,#93c5fd)',
              display: 'grid', placeItems: 'center', flexShrink: 0,
            }}>
              <IconStethoscope size={22} color="#1e3a5f" />
            </Box>
            <Stack gap={2}>
              <Text fw={800} style={{ fontSize: 18, color: '#eff6ff', lineHeight: 1.2 }}>
                Hello, Dr. {doctorInfo?.name || 'Doctor'}
              </Text>
              <Group gap={8} wrap="nowrap">
                <Badge color="blue" variant="light" size="xs">{doctorInfo?.specialty || ''}</Badge>
                <Text size="xs" style={{ color: '#93c5fd' }}>
                  {todayAppts} appointments today · {followUps.length} follow-ups
                </Text>
              </Group>
            </Stack>
          </Group>
          <Group gap={8} wrap="nowrap">
            <Text size="xs" style={{ color: '#93c5fd' }}>
              {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <Button variant="outline" size="xs" radius="xl"
              style={{ borderColor: '#60a5fa', color: '#bfdbfe' }}
              onClick={() => navigate('/doctor/appointments')}>Document note</Button>
            <Button variant="outline" size="xs" radius="xl"
              style={{ borderColor: '#60a5fa', color: '#bfdbfe' }}
              onClick={() => navigate('/doctor/pharmacy')}>Prescribe</Button>
            <Button size="xs" radius="xl" color="blue"
              onClick={() => navigate('/doctor/appointments')}>View schedule</Button>
          </Group>
        </Group>
      </Box>

      {/* ── Row 1: KPI ── */}
      <SimpleGrid cols={{ base: 1, sm: 2, xl: 4 }} spacing={G_GAP} mb={G_GAP}>
        {KPI_WITH_DATA.map(def => <KpiCard key={def.id} def={def} count={def.count} />)}
      </SimpleGrid>

      {/* ── Row 2: Next Patient + Today Schedule ── */}
      <Grid gutter={G_GAP} mb={G_GAP} align="stretch">
        <Grid.Col span={{ base: 12, lg: 4 }}><NextPatientCard next={nextPatient} navigate={navigate} /></Grid.Col>
        <Grid.Col span={{ base: 12, lg: 8 }}><TodaySchedule appointments={appointments} /></Grid.Col>
      </Grid>

      {/* ── Row 3: Queue + Pending Tasks ── */}
      <Grid gutter={G_GAP} mb={G_GAP} align="stretch">
        <Grid.Col span={{ base: 12, lg: 7 }}><CurrentQueue appointments={appointments} /></Grid.Col>
        <Grid.Col span={{ base: 12, lg: 5 }}><PendingTasks /></Grid.Col>
      </Grid>

      {/* ── Row 4: Prescriptions + Follow-up Due ── */}
      <Grid gutter={G_GAP} mb={G_GAP} align="stretch">
        <Grid.Col span={{ base: 12, lg: 6 }}><RecentPrescriptions prescriptions={prescriptions} /></Grid.Col>
        <Grid.Col span={{ base: 12, lg: 6 }}><FollowUpDue followUps={followUps} /></Grid.Col>
      </Grid>

      {/* ── Row 5: Weekly Load Chart ── */}
      <WeeklyLoadChart />

    </div>
  )
}

export default Dashboard