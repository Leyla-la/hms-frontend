import axiosInstance from "../Interceptor/AxiosInterceptor.tsx";
import * as AppointmentService from './AppointmentService.tsx'
import * as PatientService from './PatientProfileService.tsx'
import * as DoctorService from './DoctorProfileService.tsx'

export type AdminOverviewDTO = {
  kpis: Record<string, any>
  appointmentStatus: { status: string; count: number }[]
  lowStockCount: number
  topMedicines: any[]
  recentSales: any[]
  lastUpdated?: string
}

export async function getAdminOverview(): Promise<AdminOverviewDTO> {
  try {
    const r = await axiosInstance.get('/admin/dashboard')
    console.log('[DashboardService] getAdminOverview SUCCESS:', r.data);
    return r.data
  } catch (e) {
    console.error('[DashboardService] getAdminOverview FAILED, and fallback removed for performance:', e);
    throw e;
  }
}

export async function getDoctorDashboard(doctorId: string) {
  const TAG = '[DashboardService.getDoctorDashboard]'
  console.log(`${TAG} START — doctorId=${doctorId}`, { timestamp: new Date().toISOString() })

  // Since the primary endpoint /dashboard/doctor/{id} is not mapped in Gateway,
  // we default to building the composite fallback immediately using mapped routes.
  try {
    console.log(`${TAG} Building composite view from AppointmentMS endpoints…`)


    const [appointments, doc, prescriptions, followUps] = await Promise.all([
      AppointmentService.getAppointmentsByDoctor(doctorId).catch((err: any) => {
        console.error(`${TAG} ❌ getAppointmentsByDoctor FAILED:`, {
          status: err?.response?.status, message: err?.message, data: err?.response?.data
        })
        return []
      }),
      DoctorService.getDoctor(doctorId).catch((err: any) => {
        console.error(`${TAG} ❌ getDoctor FAILED:`, {
          status: err?.response?.status, message: err?.message
        })
        return null
      }),
      AppointmentService.getPrescriptionsByDoctorId(doctorId).catch((err: any) => {
        console.error(`${TAG} ❌ getPrescriptionsByDoctorId FAILED:`, err?.message)
        return []
      }),
      AppointmentService.getFollowUpsByDoctorId(doctorId).catch((err: any) => {
        console.error(`${TAG} ❌ getFollowUpsByDoctorId FAILED:`, err?.message)
        return []
      })
    ])

    console.log(`${TAG} Fallback raw data:`, { appointments, doc, prescriptions, followUps })

    // Robust utility to normalize and check if it's "Today"
    const normalizeDate = (dt: any) => {
        if (!dt) return null;
        const clean = String(dt).replace(/T /g, 'T'); // Fix potential 'T ' space issue
        return new Date(clean);
    }
    const isToday = (dt: Date | null) => {
        if (!dt || isNaN(dt.getTime())) return false;
        return dt.toDateString() === new Date().toDateString();
    }

    const allAppts = Array.isArray(appointments) ? appointments : []

    // Map to the shape Dashboard.tsx cards expect
    const todaySchedule = allAppts
      .filter((a: any) => {
          const dateObj = normalizeDate(a.appointmentTime);
          return isToday(dateObj);
      })
      .map((a: any) => {
        const dateObj = normalizeDate(a.appointmentTime);
        return {
          id:              a.id,
          patientName:     a.patientName ?? 'Unknown',
          reason:          a.reason ?? '',
          status:          a.status ?? 'SCHEDULED',
          time:            dateObj && !isNaN(dateObj.getTime())
            ? dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            : '--:--',
          appointmentTime: a.appointmentTime,
        patientPhone:    a.patientPhone,
        dob:             a.dob || a.patientDob, // In case backend returns it
        bloodGroup:      a.bloodGroup || a.patientBloodGroup,
        patientId:       a.patientId, // Need this to fetch extra profile data
        allergies:       undefined as any,
      }})

    const nextRaw = todaySchedule.find((a: any) => a.status === 'SCHEDULED') ?? null
    let nextPatient = nextRaw
      ? { ...nextRaw, name: nextRaw.patientName, appointmentTime: nextRaw.time }
      : null

    // Try to merge extra data for next patient if patientId exists
    if (nextPatient && nextRaw && nextRaw.patientId) {
      try {
        const pData = await PatientService.getPatient(nextRaw.patientId);
        if (pData) {
           nextPatient = {
               ...nextPatient,
               bloodGroup: pData.bloodGroup ?? nextPatient.bloodGroup,
               allergies: pData.allergies?.length ? pData.allergies : (typeof pData.allergies === 'string' ? [pData.allergies] : []),
               dob: pData.dateOfBirth ?? pData.dob ?? nextPatient.dob,
               patientPhone: pData.phoneNumber ?? pData.phone ?? nextPatient.patientPhone,
           }
        }
      } catch (err) {
        console.error("Could not fetch next patient details block:", err);
      }
    }

    const prescriptionsMapped = Array.isArray(prescriptions) ? prescriptions.map((p: any) => {
      const match = allAppts.find((a: any) => a.id === p.appointmentId || a.patientId === p.patientId);
      return { ...p, patientName: match?.patientName || 'Unknown Patient' };
    }) : [];

    const followUpsMapped = Array.isArray(followUps) ? followUps.map((f: any) => {
      const match = allAppts.find((a: any) => a.id === f.appointmentId || a.patientId === f.patientId);
      return { ...f, patientName: match?.patientName || 'Unknown Patient' };
    }) : [];

    const result = {
      todaySchedule,
      nextPatient,
      prescriptions: prescriptionsMapped,
      followUps:     followUpsMapped,
      doctor:        doc,
    }

    console.log(`${TAG} ✅ FALLBACK result:`, result)
    return result
  } catch (err: any) {
    console.error(`${TAG} Composite fallback failed:`, err)
    return {
      todaySchedule: [],
      nextPatient: null,
      prescriptions: [],
      followUps: [],
      doctor: null,
    }
  }
}


export async function getPatientDashboard(patientId: string) {
  try {
    const r = await axiosInstance.get(`/dashboard/patient/${patientId}`)
    return r.data
  } catch (e) {
    // Calculate date range for trend: last 6 months
    const now = new Date()
    const toDate = now.toISOString().slice(0, 10)
    const fromDate = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().slice(0, 10)

    // Fire all requests in parallel
    const [upcoming, allAppts, prescriptions, records, followUps, trend] = await Promise.all([
      // Upcoming with doctorName (new endpoint)
      AppointmentService.getUpcomingWithDetails(patientId, 5).catch((e) => {
          console.error('[Dashboard] getUpcomingWithDetails FAILED:', e);
          return [];
      }),
      // All appointments for the recent-appointments list
      AppointmentService.getAppointmentsByPatient(patientId).catch((e) => {
          console.error('[Dashboard] getAppointmentsByPatient FAILED:', e);
          return [];
      }),
      // Prescriptions
      AppointmentService.getPrescriptionsByPatientId(patientId).catch((e) => {
          console.error('[Dashboard] getPrescriptionsByPatientId FAILED:', e);
          return [];
      }),
      // Medical records (for latestRecord)
      AppointmentService.getReportsByPatientId(patientId).catch((e) => {
          console.error('[Dashboard] getReportsByPatientId FAILED:', e);
          return [];
      }),
      // Dedicated follow-ups (records where followUpDate IS NOT NULL) — new endpoint
      AppointmentService.getFollowUpsByPatientId(patientId).catch((e) => {
          console.error('[Dashboard] getFollowUpsByPatientId FAILED:', e);
          return [];
      }),
      // Appointment trend for chart (daily → aggregated monthly on frontend)
      AppointmentService.getAppointmentTrend(patientId, fromDate, toDate).catch((e) => {
          console.error('[Dashboard] getAppointmentTrend FAILED:', e);
          return { labels: [], values: [] };
      }),
    ])

    console.log('[Dashboard] REAL DATA FETCHED SUCCESSFULLY:', {
        upcoming,
        allAppts,
        prescriptions,
        records,
        followUps,
        trend
    });

    const sortedRecords = [...(records || [])].sort(
      (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return {
      // first upcoming appointment already has doctorName
      nextAppointment: Array.isArray(upcoming) && upcoming.length > 0 ? upcoming[0] : null,
      // all appointments (past + future), frontend filters by date for each section
      recentAppointments: allAppts || [],
      prescriptions: prescriptions || [],
      latestRecord: sortedRecords[0] || null,
      // dedicated follow-ups — already filtered at DB level (followUpDate IS NOT NULL)
      followUps: followUps || [],
      // trend data for chart: { labels: string[], values: number[] }
      trend: trend || { labels: [], values: [] },
    }
  }
}

export default { getAdminOverview, getDoctorDashboard, getPatientDashboard }
