import React, { useEffect, useMemo, useState } from 'react'
import {
  Avatar, Badge, Box, Button, Grid, Group,
  Paper, SimpleGrid, Stack, Text, ThemeIcon,
} from '@mantine/core'
import {
  IconUsers, IconStethoscope, IconCalendarStats, IconReportMoney,
  IconAlertTriangle, IconMedicineSyrup, IconClipboardText, IconPackage,
  IconArrowUpRight, IconClock, IconCircleCheckFilled, IconCircleDotFilled,
} from '@tabler/icons-react'
import { Chart } from 'primereact/chart'
import KpiCard from '../../Dashboard/KpiCard.tsx'
import Spark from '../../Dashboard/Spark.tsx'
import StatusBadge from '../../Dashboard/StatusBadge.tsx'
import AppointmentsTrend from '../../Dashboard/AppointmentsTrend.tsx'
import TopPatientsCard from '../../Dashboard/TopPatientsCard.tsx'
import TopMedicinesCard from '../../Dashboard/TopMedicinesCard.tsx'

import * as DashboardService from '../../../Service/DashboardService.tsx'
import InventoryHealth from '../../Dashboard/InventoryHealth.tsx'
import LowStockCard from '../../Dashboard/LowStockCard.tsx'
import LiveAlerts from '../../Dashboard/LiveAlerts.tsx'
import UpcomingAppointments from '../../Dashboard/UpcomingAppointments.tsx'

// ─── utils ────────────────────────────────────────────────────────────────────
const vnd = (n: number) => n.toLocaleString('vi-VN') + ' ₫'

// ─── PASTEL PALETTE — green-anchored, cool tones only ────────────────────────
// grad: KPI card background   accent: border / icon / text highlight
// tint: row item background   text: readable on grad
const P = {
  green: { grad: 'linear-gradient(135deg,#bbf7d0,#86efac)', accent: '#16a34a', tint: '#f0fdf4', text: '#14532d' },
  teal: { grad: 'linear-gradient(135deg,#99f6e4,#5eead4)', accent: '#0d9488', tint: '#f0fdfa', text: '#134e4a' },
  sky: { grad: 'linear-gradient(135deg,#bae6fd,#7dd3fc)', accent: '#0284c7', tint: '#f0f9ff', text: '#0c4a6e' },
  indigo: { grad: 'linear-gradient(135deg,#c7d2fe,#a5b4fc)', accent: '#4338ca', tint: '#eef2ff', text: '#312e81' },
  purple: { grad: 'linear-gradient(135deg,#e9d5ff,#d8b4fe)', accent: '#7c3aed', tint: '#faf5ff', text: '#4c1d95' },
  slate: { grad: 'linear-gradient(135deg,#e2e8f0,#cbd5e1)', accent: '#475569', tint: '#f8fafc', text: '#1e293b' },
} as const
type Hue = keyof typeof P

// ─── layout ───────────────────────────────────────────────────────────────────
const G = 14   // gap
const CP = 18  // card padding
const CR = 14  // card radius

const base = (h?: Hue, extra?: React.CSSProperties): React.CSSProperties => ({
  display: 'flex', flexDirection: 'column',
  borderRadius: CR, padding: CP,
  borderColor: h ? P[h].accent + '40' : '#e2e8f0',
  borderLeftWidth: h ? 3 : 1,
  ...extra,
})

// ─── chart & timeseries placeholders (kept minimal)
// ─── chart & timeseries placeholders (empty)
const WEEK_DATA = [0, 0, 0, 0, 0, 0, 0]
const QUARTER_DATA = [0, 0, 0, 0]
const YEAR_DATA = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

// Moved inside component state

// Using shared `KpiCard` and `Spark` from src/Components/Dashboard

// AppointmentsTrend and InventoryHealth extracted to shared components

// ─── Doctors by dept — CSS progress bars ─────────────────────────────────────
const DoctorsByDept: React.FC<{ data?: Record<string, number> }> = ({ data }) => {
  const depts = useMemo(() => {
    if (!data || Object.keys(data).length === 0) return []
    const colors = [P.green.accent, P.teal.accent, P.sky.accent, P.indigo.accent, P.purple.accent, P.slate.accent]
    return Object.entries(data).map(([label, value], idx) => ({
      label,
      value: Number(value),
      color: colors[idx % colors.length]
    })).sort((a, b) => b.value - a.value)
  }, [data])

  const max = Math.max(1, ...depts.map(d => d.value))
  return (
    <Paper withBorder style={base('indigo', { minHeight: 290, maxHeight: 290, height: '100%' })}>
      <Stack gap={1} mb={12}>
        <Text fw={700} size="sm" c="dark.8">Doctors by Dept.</Text>
        <Text size="xs" c="dimmed">Active staff distribution</Text>
      </Stack>
      <Stack gap={10} style={{ flex: 1, overflowY: 'auto', paddingRight: 4, minHeight: 200, maxHeight: 200 }}>
        {depts.length === 0 ? <Text size="xs" c="dimmed" fs="italic">No data available</Text> : depts.map(d => (
          <Box key={d.label} >
            <Group justify="space-between" mb={4}>
              <Text size="xs" fw={600} c="dark.6">{d.label}</Text>
              <Text size="xs" fw={700} c="dark.8">{d.value}</Text>
            </Group>
            <Box style={{ height: 6, borderRadius: 99, background: '#e2e8f0' }}>
              <Box style={{ height: '100%', borderRadius: 99, width: `${(d.value / max) * 100}%`, background: d.color }} />
            </Box>
          </Box>
        ))}
      </Stack>
    </Paper>
  )
}

// LowStockCard, LiveAlerts, TopPatientsCard and UpcomingAppointments
// have been extracted to `src/Components/Dashboard` for reuse.

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard: React.FC = () => {
  const [medicines, setMedicines] = useState<any[]>([])
  const [inventories, setInventories] = useState<any[]>([])
  const [sales, setSales] = useState<any[]>([])
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [topPatients, setTopPatients] = useState<any[]>([])
  const [topMedicines, setTopMedicines] = useState<any[]>([])
  const [upcoming, setUpcoming] = useState<any[]>([])
  const [doctorsByDept, setDoctorsByDept] = useState<Record<string, number>>({})
  const [liveAlertsData, setLiveAlertsData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [revenueTotal, setRevenueTotal] = useState(0)

  const [kpiDefs, setKpiDefs] = useState([
    { id: 'patients', label: 'Total Patients', sub: 'Registered', hue: 'green' as Hue, icon: <IconUsers size={17} />, spark: [0, 0, 0, 0, 0, 0, 0], delta: '-', val: '0' },
    { id: 'doctors', label: 'Active Doctors', sub: 'On roster', hue: 'teal' as Hue, icon: <IconStethoscope size={17} />, spark: [0, 0, 0, 0, 0, 0, 0], delta: '-', val: '0' },
    { id: 'appts', label: 'Appointments', sub: 'Total', hue: 'sky' as Hue, icon: <IconCalendarStats size={17} />, spark: [0, 0, 0, 0, 0, 0, 0], delta: '-', val: '0' },
    { id: 'rev', label: 'Revenue', sub: 'Total', hue: 'indigo' as Hue, icon: <IconReportMoney size={17} />, spark: [0, 0, 0, 0, 0, 0, 0], delta: '-', val: '0 ₫' },
  ])

  const handleExport = () => {
    const data = `Dashboard Report - ${new Date().toLocaleString()}\n` + kpiDefs.map(k => `${k.label}: ${k.val}`).join('\n');
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hms-report.txt';
    a.click();
  };

  const handleCreateReport = () => window.print();

  useEffect(() => {
    let mounted = true
    DashboardService.getAdminOverview()
      .then(async (data: any) => {
        if (!mounted) return
        console.log('[Dashboard] Raw data for Admin Dashboard:', data);
        console.log('[Dashboard] kpis', data?.kpis);
        console.log('[Dashboard] doctorsByDept', data?.doctorsByDept);

        // topMedicines from PharmacyMS → use as TopMedicines
        const rawTopMeds = Array.isArray(data?.topMedicines) ? data.topMedicines : []
        setTopMedicines(rawTopMeds)

        // Low stock: Prefer explicit lowStockItems from API, fallback to hacky derivation
        const apiLowStock = Array.isArray(data?.lowStockItems) ? data.lowStockItems : []
        if (apiLowStock.length > 0) {
          setMedicines(apiLowStock)
        } else {
          // Fallback derivation
          const lowStockItems = rawTopMeds.filter((m: any) => Number(m.quantity ?? m.stock ?? 999) < 50)
          setMedicines(lowStockItems)
        }

        // inventoryHealth for chart
        if (data?.kpis) {
          setInventories([{
             active: Number(data.kpis.activeMedicines) || 0,
             expired: Number(data.kpis.expiredMedicines) || 0,
             soldOut: Number(data.kpis.soldOutMedicines) || 0
          }])
        }

        // liveAlerts: Filter for workflow statuses AND explicit KPI attention items
        const apptStatus: any[] = Array.isArray(data?.appointmentStatus) ? data.appointmentStatus : []
        const alertsList = apptStatus
          .filter((s: any) => Number(s.count) > 0 && !['OVERDUE', 'LOW_STOCK'].includes(s.status.toUpperCase()))
          .map((s: any) => ({ 
            type: s.status.charAt(0).toUpperCase() + s.status.slice(1).toLowerCase(), 
            message: `${s.count} appointment(s) ${s.status.toLowerCase()}`, 
            count: s.count 
          }))

        // Explicit Attention Alerts (KPI based)
        const overdueCount = Number(data?.kpis?.overdueAppointments) || 0;
        if (overdueCount > 0) {
          alertsList.push({ type: 'Overdue', message: `${overdueCount} overdue appointment(s) need attention`, count: overdueCount });
        }

        const expiredCount = Number(data?.kpis?.expiredMedicines) || 0;
        if (expiredCount > 0) {
          alertsList.push({ type: 'Expired', message: `${expiredCount} expired medicine batches detected`, count: expiredCount });
        }

        const soldOutCount = Number(data?.kpis?.soldOutMedicines) || 0;
        if (soldOutCount > 0) {
          alertsList.push({ type: 'Sold Out', message: `${soldOutCount} medicines are completely out of stock`, count: soldOutCount });
        }

        setLiveAlertsData(alertsList)

        setKpiDefs(prev => {
          const next = [...prev];
          if (data?.kpis) {
            next[0].val = (Number(data.kpis.totalUsers) || 0).toLocaleString();
            next[1].val = (Number(data.kpis.totalDoctors) || 0).toLocaleString();
            next[2].val = (Number(data.kpis.totalAppointments) || 0).toLocaleString();
            
            // Add custom Overdue label if count > 0
            const overdue = Number(data.kpis.overdueAppointments) || 0;
            if (overdue > 0) {
              next[2].sub = `Total (${overdue} overdue)`;
            }
          }
          if (data?.doctorsByDept && Object.keys(data.doctorsByDept).length > 0) {
            setDoctorsByDept(data.doctorsByDept);
          }

          const revenueSum = (data?.kpis?.totalRevenue != null) ? Number(data.kpis.totalRevenue) : 
                             (data?.totalRevenue != null) ? Number(data.totalRevenue) : 0;
          
          setRevenueTotal(revenueSum);
          next[3].val = (revenueSum || 0).toLocaleString('vi-VN') + ' ₫';

          return next;
        });

        // topPatients: now returned by backend as TopPatientDTO
        if (Array.isArray(data?.topPatients)) {
          setTopPatients(data.topPatients)
        } else {
          setTopPatients([])
        }

        // Upcoming appointments: fetch /appointments/dashboard/today/all separately
        try {
          const axiosInstance = (await import('../../../Interceptor/AxiosInterceptor.tsx')).default
          const todayResp = await axiosInstance.get('/appointments/dashboard/today/all')
          const todayList: any[] = Array.isArray(todayResp.data) ? todayResp.data : []
          const mapped = todayList.map((a: any) => {
            let t = '??:??'
            if (a.appointmentTime) {
              const str = String(a.appointmentTime).trim()
              const separator = str.includes('T') ? 'T' : ' '
              const parts = str.split(separator)
              if (parts.length > 1) {
                t = parts[1].trim().substring(0, 5)
              }
            }
            return {
              id: a.id,
              time: t,
              patient: a.patientName || `Patient #${a.patientId}`,
              doctor: a.doctorName || `Dr. #${a.doctorId}`,
              dept: a.reason || 'General Checkup',
              status: (a.status || 'scheduled').toLowerCase()
            }
          })
          if (mounted) setUpcoming(mapped)
        } catch (err) {
          console.warn('[Dashboard] Could not fetch today appointments:', err)
        }

        if (mounted) setLoading(false)
      })
      .catch((e) => {
        if (!mounted) return
        setError('Failed to load admin overview')
        setLoading(false)
      })
    return () => { mounted = false }
  }, [])

  if (loading) return <div style={{ padding: 24, background: '#f0fdf4', minHeight: '100vh' }}>Loading real-time data...</div>
  if (error) return <div style={{ padding: 24, color: 'red', background: '#f0fdf4', minHeight: '100vh' }}>Dashboard Error: {error}</div>

  return (
    <div style={{ padding: '20px 24px', background: '#f0fdf4', minHeight: '100vh' }}>

      {/* ── Header — dark green anchor ── */}
      <Box style={{
        background: 'linear-gradient(120deg,#14532d 0%,#166534 60%,#15803d 100%)',
        borderRadius: CR, padding: '16px 22px', marginBottom: G,
      }}>
        <Group justify="space-between" align="center">
          <Stack gap={2}>
            <Text fw={800} style={{ fontSize: 19, color: '#f0fdf4', lineHeight: 1.2 }}>Admin Dashboard</Text>
            <Text size="xs" style={{ color: '#86efac' }}>Database Real-time · {new Date().toLocaleTimeString('en-US')}</Text>
          </Stack>
          <Group gap={8}>
            <Button variant="outline" size="xs" radius="xl" onClick={handleExport}
              style={{ borderColor: '#4ade80', color: '#bbf7d0' }}>Export</Button>
            <Button size="xs" radius="xl" color="green" onClick={handleCreateReport}>Create report</Button>
          </Group>
        </Group>
      </Box>

      {/* Row 1 — KPI */}
      <SimpleGrid cols={{ base: 1, sm: 2, xl: 4 }} spacing={G} mb={G}>
        {kpiDefs.map(def => <KpiCard key={def.id} def={def} revenue={revenueTotal} />)}
      </SimpleGrid>

      {/* Row 2 — Charts */}
      <Grid gutter={G} mb={G} align="stretch">
        <Grid.Col span={{ base: 12, lg: 7 }}><AppointmentsTrend /></Grid.Col>
        <Grid.Col span={{ base: 12, lg: 5 }}><InventoryHealth health={inventories[0]} /></Grid.Col>
      </Grid>

      {/* Row 3 — Alerts & Inventory info */}
      <Grid gutter={G} mb={G} align="stretch">
        <Grid.Col span={{ base: 12, lg: 4 }}><LowStockCard medicines={medicines} /></Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}><TopMedicinesCard medicines={topMedicines} /></Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}><LiveAlerts alerts={liveAlertsData} /></Grid.Col>
      </Grid>

      {/* Row 4 — People & Appointments */}
      <Grid gutter={G} align="stretch">
        <Grid.Col span={{ base: 12, lg: 4 }}><TopPatientsCard patients={topPatients} vnd={vnd} palette={P} /></Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}><UpcomingAppointments appointments={upcoming} palette={P} /></Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}><DoctorsByDept data={doctorsByDept} /></Grid.Col>
      </Grid>

    </div>
  )
}

export default Dashboard