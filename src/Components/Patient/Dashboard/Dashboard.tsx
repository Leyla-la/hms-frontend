import React, { useEffect, useMemo, useState } from 'react'
import {
  Avatar, Badge, Box, Button, Grid, Group,
  Paper, SimpleGrid, Stack, Text, ThemeIcon,
  ScrollArea,
} from '@mantine/core'
import {
  IconCalendarStats, IconClock,
  IconChevronRight, IconPill,
  IconCalendarDue, IconDroplet, IconAlertTriangle,
  IconHeartbeat, IconBook, IconRefresh, IconQuote,
  IconStethoscope, IconClipboardList,
} from '@tabler/icons-react'
import { Chart } from 'primereact/chart'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import DashboardService from '../../../Service/DashboardService.tsx'
import * as PatientService from '../../../Service/PatientProfileService.tsx'
import KpiCard from '../../Dashboard/KpiCard.tsx'
import StatusBadge from '../../Dashboard/StatusBadge.tsx'
import { bloodGroupMap } from '../../../Data/DropdownData.tsx'

// ─── utils ────────────────────────────────────────────────────────────────────
// "yyyy-MM-dd HH:mm:ss" → JS Date (safe cross-browser by replacing space with T)
const parseD = (dt: string): Date => {
  if (!dt) return new Date(0)
  return new Date(dt.replace(' ', 'T'))
}
const fmtTime = (dt: string) => parseD(dt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
const fmtDate = (dt: string) => parseD(dt).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })
const fmtDateShort = (dt: string) => parseD(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

// ─── Wellness quotes ──────────────────────────────────────────────────────────
const HEALTH_QUOTES = [
  { text: "Take care of your body. It's the only place you have to live.", author: 'Jim Rohn' },
  { text: 'Health is not valued till sickness comes.', author: 'Thomas Fuller' },
  { text: 'A healthy outside starts from the inside.', author: 'Robert Urich' },
  { text: 'Prevention is better than cure.', author: 'Desiderius Erasmus' },
  { text: 'Your body hears everything your mind says.', author: 'Naomi Judd' },
  { text: 'The greatest wealth is health.', author: 'Virgil' },
]
const randomQuote = () => HEALTH_QUOTES[Math.floor(Math.random() * HEALTH_QUOTES.length)]

// ─── Aggregate daily trend data into monthly buckets (last 6 months) ─────────
const buildMonthlyTrend = (trend: { labels: string[], values: number[] }) => {
  const map: Record<string, number> = {}
    ; (trend.labels || []).forEach((label, i) => {
      const month = label.slice(0, 7) // "2024-01"
      map[month] = (map[month] || 0) + ((trend.values || [])[i] || 0)
    })
  const result: { label: string; count: number }[] = []
  for (let m = 5; m >= 0; m--) {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - m)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    result.push({ label: d.toLocaleString('en-US', { month: 'short' }), count: map[key] || 0 })
  }
  return result
}

// ─── PALETTE ─────────────────────────────────────────────────────────────────
const C = {
  azure: { grad: 'linear-gradient(135deg,#bfdbfe,#93c5fd)', accent: '#1d4ed8', tint: '#eff6ff', text: '#1e3a5f' },
  cyan: { grad: 'linear-gradient(135deg,#a5f3fc,#67e8f9)', accent: '#0891b2', tint: '#ecfeff', text: '#164e63' },
  teal: { grad: 'linear-gradient(135deg,#99f6e4,#5eead4)', accent: '#0d9488', tint: '#f0fdfa', text: '#134e4a' },
  slate: { grad: 'linear-gradient(135deg,#e2e8f0,#cbd5e1)', accent: '#475569', tint: '#f8fafc', text: '#1e293b' },
  violet: { grad: 'linear-gradient(135deg,#ddd6fe,#c4b5fd)', accent: '#6d28d9', tint: '#f5f3ff', text: '#2e1065' },
  emerald: { grad: 'linear-gradient(135deg,#a7f3d0,#6ee7b7)', accent: '#059669', tint: '#ecfdf5', text: '#064e3b' },
  sky: { grad: 'linear-gradient(135deg,#bae6fd,#7dd3fc)', accent: '#0284c7', tint: '#f0f9ff', text: '#0c4a6e' },
  indigo: { grad: 'linear-gradient(135deg,#c7d2fe,#a5b4fc)', accent: '#4338ca', tint: '#eef2ff', text: '#1e1b4b' },
} as const
type Hue = keyof typeof C

const G_GAP = 16
const CP = 18
const CR = 14

const base = (h?: Hue, extra?: React.CSSProperties): React.CSSProperties => ({
  display: 'flex', flexDirection: 'column',
  borderRadius: CR, padding: CP,
  borderColor: h ? C[h].accent + '40' : '#e2e8f0',
  borderLeftWidth: h ? 3 : 1,
  ...extra,
})

// ─── Header ───────────────────────────────────────────────────────────────────
const PatientHeader: React.FC<{ patient: any }> = ({ patient }) => {
  const navigate = useNavigate()
  return (
    <Box style={{
      background: 'linear-gradient(120deg,#0f766e 0%,#14b8a6 60%,#6366f1 100%)',
      borderRadius: CR, padding: '20px 28px', marginBottom: G_GAP,
      boxShadow: '0 4px 24px -4px rgba(13,148,136,0.3)',
    }}>
      <Group justify="space-between" align="center" wrap="nowrap">
        <Group gap={16} wrap="nowrap">
          <Box style={{
            width: 54, height: 54, borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)', display: 'grid', placeItems: 'center', flexShrink: 0,
            backdropFilter: 'blur(8px)', border: '2px solid rgba(255,255,255,0.3)',
          }}>
            <IconHeartbeat size={28} color="#fff" />
          </Box>
          <Stack gap={3}>
            <Text fw={800} style={{ fontSize: 22, color: '#fff', lineHeight: 1.2 }}>
              Welcome back, {patient.name} 👋
            </Text>
            <Text size="sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
              My Care Hub — Your personal health overview
            </Text>
          </Stack>
        </Group>
        <Group gap={8} wrap="nowrap">
          <Button variant="outline" size="sm" radius="xl" leftSection={<IconBook size={14} />}
            style={{ borderColor: 'rgba(255,255,255,0.6)', color: '#fff' }}
            onClick={() => navigate('/patient/appointments')}>
            Book appointment
          </Button>
          <Button variant="outline" size="sm" radius="xl" leftSection={<IconRefresh size={14} />}
            style={{ borderColor: 'rgba(255,255,255,0.6)', color: '#fff' }}
            onClick={() => navigate('/patient/profile')}>
            Update profile
          </Button>
        </Group>
      </Group>
    </Box>
  )
}

// ─── Next Appointment Hero Card ───────────────────────────────────────────────
const NextAppointmentHeroCard: React.FC<{ appointment: any | null }> = ({ appointment }) => {
  const navigate = useNavigate()
  if (!appointment) {
    return (
      <Paper withBorder style={{
        ...base('teal', { height: '100%', alignItems: 'center', justifyContent: 'center', gap: 12, textAlign: 'center', paddingTop: 50, paddingBottom: 50 }),
        background: 'linear-gradient(160deg, #f0fdfa 0%, #ccfbf1 100%)',
      }}>
        <Box style={{ background: 'rgba(13,148,136,0.1)', borderRadius: '50%', width: 72, height: 72, display: 'grid', placeItems: 'center' }}>
          <IconCalendarDue size={36} color={C.teal.accent} />
        </Box>
        <Text fw={600} size="lg" c="teal.7">No upcoming appointments</Text>
        <Text size="sm" c="dimmed">Schedule a visit with your doctor</Text>
        <Button mt={4} size="sm" radius="xl" color="teal" rightSection={<IconChevronRight size={14} />}
          onClick={() => navigate('/patient/appointments')}>
          Book now
        </Button>
      </Paper>
    )
  }

  return (
    <Paper withBorder style={{
      ...base('teal', { height: '100%' }),
      background: 'linear-gradient(160deg, #f0fdfa 0%, #fff 60%)',
    }}>
      <Group justify="space-between" mb={14} align="center">
        <Stack gap={1}>
          <Text fw={700} size="lg" c="dark.8">Your next appointment</Text>
          <Group gap={6} align="center">
            <IconClock size={14} color={C.teal.accent} />
            <Text size="sm" fw={700} style={{ color: C.teal.accent }}>{fmtDate(appointment.appointmentTime)}</Text>
            <Text size="sm" fw={700} style={{ color: C.teal.accent }}>{fmtTime(appointment.appointmentTime)}</Text>
          </Group>
        </Stack>
        <StatusBadge status={appointment.status} />
      </Group>

      <Group gap={12} mb={14} wrap="nowrap" align="flex-start">
        <Avatar radius="xl" size={48} style={{ background: 'linear-gradient(135deg,#5eead4,#a5b4fc)', color: '#fff', fontWeight: 700, fontSize: 18 }}>
          {(appointment.doctorName || '?').split(' ').pop()?.[0]}
        </Avatar>
        <Stack gap={2}>
          <Text fw={700} size="md" c="dark.9">{appointment.doctorName || 'Doctor'}</Text>
          {appointment.doctorSpecialization && <Text size="xs" c="dimmed">{appointment.doctorSpecialization}</Text>}
        </Stack>
      </Group>

      <Box style={{ background: C.teal.tint, borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
        <Text size="xs" fw={600} c="teal.7" mb={4} style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reason for visit</Text>
        <Text size="sm" c="dark.8">{appointment.reason || '—'}</Text>
        {appointment.notes && <Text size="xs" c="dimmed" mt={8} style={{ fontStyle: 'italic' }}>Notes: {appointment.notes}</Text>}
      </Box>

      <Button fullWidth size="sm" radius="md" color="teal" rightSection={<IconChevronRight size={14} />}
        onClick={() => navigate('/patient/appointments')}>
        View all appointments
      </Button>
    </Paper>
  )
}

// ─── Health Summary Card ──────────────────────────────────────────────────────
const HealthSummaryCard: React.FC<{ patient: any }> = ({ patient }) => {
  const safeArr = (val: any) => { try { return Array.isArray(val) ? val : JSON.parse(val || '[]') } catch { return [] } }
  const allergiesList = safeArr(patient.allergies)
  const chronicList = safeArr(patient.chronicDiseases)
  const displayBloodGroup = bloodGroupMap[patient.bloodGroup] ?? patient.bloodGroup ?? '—'
  const [quote] = useState(randomQuote)

  return (
    <Paper withBorder shadow="sm" radius="lg" p="xl"
      style={{ height: '100%', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      <Group justify="space-between" mb="lg" align="center" wrap="nowrap">
        <Text fw={800} size="lg" c="dark.8" style={{ letterSpacing: '-0.02em' }}>Your health summary</Text>
        <ThemeIcon size={40} radius="md" variant="light" color="teal"><IconHeartbeat size={24} /></ThemeIcon>
      </Group>

      <Grid gutter="md" style={{ flex: 1 }}>
        {/* Blood group — icon and label in same row */}
        <Grid.Col span={4}>
          <Box style={{
            background: 'linear-gradient(135deg, #ecfdf5 0%, #a7f3d0 100%)',
            borderRadius: '14px', padding: '18px 14px', height: '100%',
            textAlign: 'center', border: '1px solid #6ee7b7',
            display: 'flex', flexDirection: 'column',
          }}>
            <Group gap={8} mb={10}>
              <IconDroplet size={20} color="#0f766e" />
              <Text size="sm" fw={600} c="teal.8">Blood group</Text>
            </Group>
            <Text fw={900} style={{ fontSize: 46, lineHeight: 1, color: '#0f766e' }}>{displayBloodGroup}</Text>
          </Box>
        </Grid.Col>

        {/* Allergies */}
        <Grid.Col span={4}>
          <Box style={{
            background: 'linear-gradient(135deg, #fdf4ff 0%, #f3e8ff 100%)',
            borderRadius: '14px', padding: '18px 14px', height: '100%',
            border: '1px solid #d8b4fe',
          }}>
            <Group gap={8} mb={10}>
              <IconAlertTriangle size={22} color="#7c3aed" />
              <Text size="sm" fw={700} c="violet.8">Allergies</Text>
            </Group>
            <Group gap={6} wrap="wrap">
              {allergiesList.length > 0
                ? allergiesList.map((a: string) => <Badge key={a} color="violet" variant="light" radius="xl" size="md" style={{ textTransform: 'uppercase', fontWeight: 600 }}>{a}</Badge>)
                : <Text size="sm" c="dimmed" fs="italic">No allergies</Text>}
            </Group>
          </Box>
        </Grid.Col>

        {/* Chronic conditions */}
        <Grid.Col span={4}>
          <Box style={{
            background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
            borderRadius: '14px', padding: '18px 14px', height: '100%',
            border: '1px solid #fdba74',
          }}>
            <Group gap={8} mb={10}>
              <IconHeartbeat size={22} color="#c2410c" />
              <Text size="sm" fw={700} c="orange.8">Chronic conditions</Text>
            </Group>
            <Group gap={6} wrap="wrap">
              {chronicList.length > 0
                ? chronicList.map((d: string) => <Badge key={d} color="orange" variant="light" radius="xl" size="md" style={{ textTransform: 'uppercase', fontWeight: 600 }}>{d}</Badge>)
                : <Text size="sm" c="dimmed" fs="italic">No chronic conditions</Text>}
            </Group>
          </Box>
        </Grid.Col>
      </Grid>

      {/* Wellness quote footer */}
      <Group mt="xl" pt="md" gap={10} wrap="nowrap" style={{ borderTop: '1px dashed #e2e8f0' }}>
        <ThemeIcon variant="gradient" gradient={{ from: 'teal', to: 'cyan' }} size={28} radius="xl" style={{ flexShrink: 0 }}>
          <IconQuote size={14} />
        </ThemeIcon>
        <Stack gap={0}>
          <Text size="xs" c="dimmed" fs="italic">"{quote.text}"</Text>
          <Text size="xs" fw={700} c="teal.7">— {quote.author}</Text>
        </Stack>
      </Group>
    </Paper>
  )
}

// ─── Recent Appointments ──────────────────────────────────────────────────────
const APPT_COLORS: Array<'indigo' | 'sky' | 'teal' | 'emerald'> = ['indigo', 'sky', 'teal', 'emerald']

const RecentAppointments: React.FC<{ appointments: any[] }> = ({ appointments }) => {
  const navigate = useNavigate()
  return (
    <Paper withBorder style={{ ...base('sky', { height: '100%' }), background: 'linear-gradient(160deg, #f0f9ff 0%, #fff 80%)' }}>
      <Group justify="space-between" mb={12} align="center">
        <Group gap={10}>
          <ThemeIcon size={32} radius="md" variant="gradient" gradient={{ from: 'cyan', to: 'blue' }}>
            <IconCalendarStats size={16} />
          </ThemeIcon>
          <Text fw={700} size="lg" c="dark.8">Recent appointments</Text>
        </Group>
        <Button variant="subtle" size="xs" color="blue" onClick={() => navigate('/patient/appointments')}>View all</Button>
      </Group>
      {appointments.length === 0
        ? <Text size="sm" c="dimmed" fs="italic" mt={8}>No past appointments</Text>
        : (
          <Stack gap={8}>
            {appointments.map((appt, i) => (
              <Group key={appt.id} justify="space-between" wrap="nowrap" style={{
                padding: '10px 14px', borderRadius: 12, background: 'white',
                border: '1px solid #e0f2fe', boxShadow: '0 1px 4px -1px rgba(14,165,233,0.1)',
              }}>
                <Group gap={12} wrap="nowrap">
                  <ThemeIcon size={36} radius="md" variant="light" color={APPT_COLORS[i % APPT_COLORS.length]}>
                    <IconCalendarDue size={16} />
                  </ThemeIcon>
                  <Stack gap={0}>
                    <Text size="sm" fw={700} c="dark.8">{appt.doctorName || 'Doctor'}</Text>
                    <Group gap={6}>
                      <Text size="xs" fw={600} style={{ color: '#0284c7' }}>{fmtDateShort(appt.appointmentTime)}</Text>
                      <Text size="xs" c="dimmed">·</Text>
                      <Text size="xs" c="dimmed">{appt.reason}</Text>
                    </Group>
                  </Stack>
                </Group>
                <StatusBadge status={appt.status} />
              </Group>
            ))}
          </Stack>
        )}
    </Paper>
  )
}

// ─── Recent Prescriptions ─────────────────────────────────────────────────────
const RX_COLORS: Array<'teal' | 'emerald' | 'cyan'> = ['teal', 'emerald', 'cyan']

const RecentPrescriptions: React.FC<{ prescriptions: any[] }> = ({ prescriptions }) => (
  <Paper withBorder style={{ ...base('emerald', { height: '100%' }), background: 'linear-gradient(160deg, #ecfdf5 0%, #fff 80%)' }}>
    <Group mb={12} gap={10}>
      <ThemeIcon size={32} radius="md" variant="gradient" gradient={{ from: 'teal', to: 'green' }}>
        <IconPill size={16} />
      </ThemeIcon>
      <Text fw={700} size="lg" c="dark.8">Recent prescriptions</Text>
    </Group>
    {prescriptions.length === 0
      ? <Text size="sm" c="dimmed" fs="italic" mt={8}>No recent prescriptions</Text>
      : (
        <Stack gap={10}>
          {prescriptions.map((rx, i) => (
            <Box key={rx.id} style={{ padding: '12px 14px', borderRadius: 12, background: 'white', border: '1px solid #d1fae5' }}>
              <Group justify="space-between" mb={8}>
                <Group gap={10} wrap="nowrap">
                  <ThemeIcon size={32} radius="md" variant="light" color={RX_COLORS[i % RX_COLORS.length]}>
                    <IconPill size={14} />
                  </ThemeIcon>
                  <Stack gap={0}>
                    <Text size="sm" fw={700} c="dark.8">{rx.doctorName}</Text>
                    <Text size="xs" c="dimmed">{rx.prescriptionDate ? fmtDate(rx.prescriptionDate) : ''}</Text>
                  </Stack>
                </Group>
              </Group>
              <Group gap={6} wrap="wrap">
                {Array.isArray(rx.medicines) && rx.medicines.slice(0, 3).map((med: any, idx: number) => (
                  <Badge key={med.id || med.medicineId || idx} color="teal" variant="light" size="xs" radius="xl">
                    {typeof med === 'string' ? med : med.name}
                  </Badge>
                ))}
                {Array.isArray(rx.medicines) && rx.medicines.length > 3 && <Text size="xs" c="dimmed">+{rx.medicines.length - 3} more</Text>}
              </Group>
              {rx.notes && <Text size="xs" c="orange" mt={6}>⚠ {rx.notes}</Text>}
            </Box>
          ))}
        </Stack>
      )}
  </Paper>
)

// ─── Latest Medical Record ─────────────────────────────────────────────────────
const RecentRecordSummary: React.FC<{ record: any | null }> = ({ record }) => {
  if (!record) {
    return (
      <Paper withBorder style={{ ...base('indigo', { height: '100%', alignItems: 'center', justifyContent: 'center', gap: 8, textAlign: 'center' }), background: 'linear-gradient(160deg, #eef2ff 0%, #fff 80%)' }}>
        <Box style={{ background: 'rgba(99,102,241,0.1)', borderRadius: '50%', width: 64, height: 64, display: 'grid', placeItems: 'center' }}>
          <IconClipboardList size={32} color={C.indigo.accent} />
        </Box>
        <Text fw={600} c="indigo" size="md" mt={8}>No recent medical records</Text>
        <Text size="xs" c="dimmed">Records appear after your appointments</Text>
      </Paper>
    )
  }

  const safeTests = Array.isArray(record.tests) ? record.tests : []
  const safeSymptoms = Array.isArray(record.symptoms) ? record.symptoms : (record.symptoms ? [record.symptoms] : [])

  return (
    <Paper withBorder style={{ ...base('indigo', { height: '100%' }), background: 'linear-gradient(160deg, #eef2ff 0%, #fff 60%)' }}>
      <Group justify="space-between" mb={16} align="flex-start">
        <Group gap={12} wrap="nowrap">
          <ThemeIcon size={40} radius="md" variant="gradient" gradient={{ from: 'indigo', to: 'violet' }}>
            <IconClipboardList size={20} />
          </ThemeIcon>
          <Stack gap={2}>
            <Text fw={700} size="md" c="dark.8">Latest medical record</Text>
            <Text size="xs" c="dimmed">{record.createdAt ? fmtDate(record.createdAt) : ''}</Text>
          </Stack>
        </Group>
        {record.doctorName && <Badge color="indigo" variant="light" size="sm" radius="xl">Dr. {record.doctorName}</Badge>}
      </Group>

      <Box style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)', borderRadius: 12, padding: '14px 16px', marginBottom: 12, border: '1px solid #c7d2fe' }}>
        <Text size="xs" fw={700} c="indigo.6" mb={4} style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Diagnosis</Text>
        <Text fw={700} size="sm" c="dark.8">{record.diagnosis || '—'}</Text>
      </Box>

      <Stack gap={10}>
        {safeSymptoms.length > 0 && (
          <Box style={{ padding: '10px 12px', borderRadius: 10, background: '#f5f3ff', border: '1px solid #ede9fe' }}>
            <Text size="xs" fw={700} c="violet.7" mb={6} style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Symptoms</Text>
            <Group gap={6} wrap="wrap">
              {safeSymptoms.map((s: string, i: number) => <Badge key={i} color="violet" variant="light" size="xs" radius="xl">{s}</Badge>)}
            </Group>
          </Box>
        )}
        {safeTests.length > 0 && (
          <Box>
            <Text size="xs" fw={700} c="indigo.7" mb={6} style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tests ordered</Text>
            <Group gap={6} wrap="wrap">
              {safeTests.map((test: string, i: number) => <Badge key={i} color="indigo" variant="outline" size="xs" radius="xl">{test}</Badge>)}
            </Group>
          </Box>
        )}
        {record.notes && (
          <Box style={{ padding: '10px 12px', borderRadius: 10, background: '#fffbeb', border: '1px solid #fde68a' }}>
            <Text size="xs" fw={700} c="amber.8" mb={4} style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Doctor's notes</Text>
            <Text size="sm" c="dark.7" style={{ fontStyle: 'italic' }}>{record.notes}</Text>
          </Box>
        )}
      </Stack>
    </Paper>
  )
}

// ─── Scheduled Follow-ups (data: AppointmentRecord where followUpDate IS NOT NULL) ──
const FollowUpDueCard: React.FC<{ followUps: any[] }> = ({ followUps }) => (
  <Paper withBorder style={{ ...base('violet', { height: '100%' }), background: 'linear-gradient(160deg, #f5f3ff 0%, #fff 70%)' }}>
    <Group justify="space-between" mb={4} align="center">
      <Group gap={12} wrap="nowrap">
        <ThemeIcon size={40} radius="md" variant="gradient" gradient={{ from: 'violet', to: 'indigo' }}>
          <IconStethoscope size={20} />
        </ThemeIcon>
        <Stack gap={2}>
          <Text fw={700} size="lg" c="dark.8">Scheduled follow-ups</Text>
          <Text size="xs" c="dimmed">Doctor-recommended check-ins after visits</Text>
        </Stack>
      </Group>
      <Badge color="violet" variant="light" size="md" radius="xl">{followUps.length}</Badge>
    </Group>

    {followUps.length === 0
      ? (
        <Group align="center" justify="center" mt={28} style={{ flexDirection: 'column', opacity: 0.5 }}>
          <IconCalendarDue size={36} color={C.violet.accent} />
          <Text size="sm" c="dimmed" mt={8}>No follow-ups scheduled</Text>
        </Group>
      )
      : (
        <ScrollArea.Autosize mah={240} mt={14} offsetScrollbars>
          <Stack gap={10}>
            {followUps.map((f, idx) => {
              const followDate = f.followUpDate ? new Date(f.followUpDate) : null
              const daysLeft = followDate ? Math.ceil((followDate.getTime() - Date.now()) / 864e5) : null
              const overdue = daysLeft !== null && daysLeft < 0
              const urgent = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7
              return (
                <Group key={f.id || idx} justify="space-between" wrap="nowrap" style={{
                  padding: '12px 14px', borderRadius: 12,
                  background: overdue ? '#fdf2f8' : urgent ? '#faf5ff' : 'white',
                  border: `1px solid ${overdue ? '#f0abfc' : urgent ? '#d8b4fe' : '#e9d5ff'}`,
                }}>
                  <Stack gap={3}>
                    <Text size="sm" fw={700} c="dark.8">{f.diagnosis || 'Follow-up required'}</Text>
                    <Text size="xs" c="dimmed">
                      {followDate ? followDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
                    </Text>
                    {f.referral && <Badge color="orange" variant="dot" size="xs">{f.referral}</Badge>}
                  </Stack>
                  <Badge color={overdue ? 'red' : urgent ? 'orange' : 'violet'} variant={overdue ? 'filled' : 'light'} size="sm" radius="xl">
                    {daysLeft === null ? '—' : overdue ? 'Overdue' : daysLeft === 0 ? 'Today!' : `${daysLeft}d left`}
                  </Badge>
                </Group>
              )
            })}
          </Stack>
        </ScrollArea.Autosize>
      )}
  </Paper>
)

// ─── Appointment Trends Chart — gradient area (real data from backend trend API) ─
const AppointmentTrendsChart: React.FC<{ trend: { labels: string[], values: number[] } }> = ({ trend }) => {
  const monthly = buildMonthlyTrend(trend)
  const total = monthly.reduce((s, m) => s + m.count, 0)

  // Chart.js scriptable backgroundColor → canvas LinearGradient (teal → transparent)
  const gradientBg = (context: any) => {
    const chart = context.chart
    const { ctx, chartArea } = chart
    if (!chartArea) return 'rgba(20,184,166,0.15)'
    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
    gradient.addColorStop(0, 'rgba(20,184,166,0.55)')   // top — opaque teal
    gradient.addColorStop(0.6, 'rgba(20,184,166,0.12)')  // mid
    gradient.addColorStop(1, 'rgba(20,184,166,0.0)')     // bottom — fully transparent
    return gradient
  }

  const chartData = {
    labels: monthly.map(m => m.label),
    datasets: [{
      label: 'Appointments',
      data: monthly.map(m => m.count),
      // area fill uses the gradient function
      backgroundColor: gradientBg,
      fill: true,
      // line
      borderColor: '#0d9488',
      borderWidth: 2.5,
      // smooth curve
      tension: 0.42,
      // points
      pointBackgroundColor: '#0d9488',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
      pointHoverBackgroundColor: '#0f766e',
    }],
  }

  const opts = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15,118,110,0.9)',
        titleColor: '#ccfbf1',
        bodyColor: '#fff',
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          title: (items: any[]) => items[0]?.label || '',
          label: (item: any) => ` ${item.parsed.y} appointment${item.parsed.y !== 1 ? 's' : ''}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { size: 12, weight: '500' as const } },
        border: { display: false },
      },
      y: {
        grid: { color: '#f0fdf4', lineWidth: 1 },
        ticks: { color: '#94a3b8', font: { size: 11 }, stepSize: 1, padding: 6 },
        border: { display: false },
        beginAtZero: true,
      },
    },
  }

  return (
    <Paper withBorder style={{ ...base('teal', {}), background: 'linear-gradient(160deg, #f0fdfa 0%, #fff 80%)' }}>
      <Group justify="space-between" mb={16} align="center">
        <Group gap={10}>
          <ThemeIcon size={36} radius="md" variant="gradient" gradient={{ from: 'teal', to: 'cyan' }}>
            <IconCalendarStats size={18} />
          </ThemeIcon>
          <Stack gap={1}>
            <Text fw={700} size="lg" c="dark.8">Your appointment trends</Text>
            <Text size="xs" c="dimmed">Last 6 months · real data · visits per month</Text>
          </Stack>
        </Group>
        <Group gap={8}>
          <Badge color="teal" variant="light" size="md" radius="xl">
            {total} total visit{total !== 1 ? 's' : ''}
          </Badge>
        </Group>
      </Group>
      <Box style={{ height: 220 }}>
        <Chart type="line" data={chartData} options={opts} style={{ height: '100%', width: '100%' }} />
      </Box>
    </Paper>
  )
}


// ─── Main Patient Dashboard ───────────────────────────────────────────────────
const PatientDashboard: React.FC = () => {
  const user = useSelector((state: any) => state.user)
  const [now] = useState(new Date())

  const [patient, setPatient] = useState<any>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [latestRecord, setLatestRecord] = useState<any>(null)
  const [followUps, setFollowUps] = useState<any[]>([])
  const [nextAppointment, setNextAppointment] = useState<any>(null)
  const [trend, setTrend] = useState<{ labels: string[], values: number[] }>({ labels: [], values: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
      ; (async () => {
        setLoading(true)
        setError(null)
        try {
          if (!user?.profileId) {
            setError('No authenticated user; dashboard requires login')
            setLoading(false)
            return
          }

          const dash = await DashboardService.getPatientDashboard(String(user.profileId))
          if (!mounted) return
          if (!dash) { setError('Dashboard data unavailable'); setLoading(false); return }

          // Fetch patient profile separately (not in dash fallback)
          try {
            const prof = await PatientService.getPatient(user.profileId)
            if (mounted && prof) setPatient(prof)
          } catch (e) { }

          // next appointment comes from /dashboard/upcoming/details — already has doctorName
          if (dash.nextAppointment) setNextAppointment(dash.nextAppointment)

          // all appointments for recent list
          if (Array.isArray(dash.recentAppointments)) setAppointments(dash.recentAppointments)

          if (Array.isArray(dash.prescriptions)) setPrescriptions(dash.prescriptions)
          if (dash.latestRecord) setLatestRecord(dash.latestRecord)

          // follow-ups from dedicated endpoint
          if (Array.isArray(dash.followUps)) setFollowUps(dash.followUps)

          // trend data
          if (dash.trend) setTrend(dash.trend)

          setLoading(false)
        } catch (e: any) {
          setError(e?.message || 'Failed to load dashboard')
          setLoading(false)
        }
      })()
    return () => { mounted = false }
  }, [user?.profileId])

  // Past appointments for recent-appointments list (use parseD for safe date comparison)
  const recentPastAppointments = useMemo(() =>
    appointments
      .filter(a => parseD(a.appointmentTime) < now)
      .sort((a, b) => parseD(b.appointmentTime).getTime() - parseD(a.appointmentTime).getTime())
      .slice(0, 4),
    [appointments, now])

  const recentPrescriptionsList = useMemo(() => prescriptions.slice(0, 3), [prescriptions])

  const totalAppointments = appointments.length
  const prescriptionCount = prescriptions.length
  const followUpCount = followUps.length

  const KPI_DEFS = useMemo(() => [
    {
      id: 'next',
      label: 'Next appointment',
      sub: nextAppointment ? fmtDate(nextAppointment.appointmentTime) : 'None scheduled',
      hue: 'teal' as Hue,
      icon: <IconCalendarDue size={17} />,
      val: nextAppointment ? fmtTime(nextAppointment.appointmentTime) : '—',
      delta: nextAppointment ? (nextAppointment.doctorName || '').split(' ').pop() : '',
      spark: [1, 2, 1, 0, 3],
    },
    {
      id: 'total',
      label: 'Total appointments',
      sub: 'All time',
      hue: 'sky' as Hue,
      icon: <IconCalendarStats size={17} />,
      val: String(totalAppointments),
      delta: 'visits',
      spark: [2, 3, 1, 4, 2],
    },
    {
      id: 'rx',
      label: 'Prescriptions',
      sub: 'Recent',
      hue: 'emerald' as Hue,
      icon: <IconPill size={17} />,
      val: String(prescriptionCount),
      delta: 'prescriptions',
      spark: [1, 2, 0, 3, 1],
    },
    {
      id: 'follow',
      label: 'Follow-ups due',
      sub: 'Upcoming care',
      hue: 'violet' as Hue,
      icon: <IconStethoscope size={17} />,
      val: String(followUpCount),
      delta: 'scheduled',
      spark: [0, 1, 2, 0, 1],
    },
  ], [nextAppointment, totalAppointments, prescriptionCount, followUpCount])

  if (loading) return (
    <div style={{ padding: 60, textAlign: 'center', color: '#0d9488', fontWeight: 700, fontSize: 18 }}>
      Loading My Care Hub…
    </div>
  )
  if (error) return (
    <div style={{ padding: 24 }}>
      <Text fw={700} color="red">Error loading dashboard:</Text>
      <div style={{ marginTop: 8 }}>{error}</div>
    </div>
  )
  if (!patient) return <div style={{ padding: 24, color: '#64748b' }}>No patient data available.</div>

  return (
    <div style={{ padding: '20px 24px', background: 'linear-gradient(180deg, #f0fdfa 0%, #f8fafc 100%)', minHeight: '100vh' }}>

      <PatientHeader patient={patient} />

      <SimpleGrid cols={{ base: 1, sm: 2, xl: 4 }} spacing={G_GAP} mb={G_GAP}>
        {KPI_DEFS.map(def => <KpiCard key={def.id} def={def} />)}
      </SimpleGrid>

      <Grid gutter={G_GAP} mb={G_GAP} align="stretch">
        <Grid.Col span={{ base: 12, lg: 5 }}>
          <NextAppointmentHeroCard appointment={nextAppointment} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 7 }}>
          <HealthSummaryCard patient={patient} />
        </Grid.Col>
      </Grid>

      <Grid gutter={G_GAP} mb={G_GAP} align="stretch">
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <RecentAppointments appointments={recentPastAppointments} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <RecentPrescriptions prescriptions={recentPrescriptionsList} />
        </Grid.Col>
      </Grid>

      <Grid gutter={G_GAP} mb={G_GAP} align="stretch">
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <RecentRecordSummary record={latestRecord} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <FollowUpDueCard followUps={followUps} />
        </Grid.Col>
      </Grid>

      {/* Appointment trends — real data from /appointments/dashboard/trend */}
      <AppointmentTrendsChart trend={trend} />

    </div>
  )
}

export default PatientDashboard