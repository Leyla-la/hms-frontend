import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import Random from '../Components/Sidebar/Random.tsx'
import AdminDashboard from '../Layout/AdminDashboard.tsx'
import LoginPage from '../Pages/LoginPage.tsx'
import RegisterPage from '../Pages/RegisterPage.tsx'
import PublicRoute from './PublicRoute.tsx'
import ProtectedRoute from './ProtectedRoute.tsx'
import PatientDashboard from '../Layout/PatientDashboard.tsx'
import DoctorDashboard from '../Layout/DoctorDashboard.tsx'
import PatientProfilePage from '../Pages/Patient/PatientProfilePage.tsx'
import DoctorProfilePage from '../Pages/Doctor/DoctorProfilePage.tsx'
import PatientAppointmentPage from '../Pages/Patient/PatientAppointmentPage.tsx'
import DoctorAppointmentPage from '../Pages/Doctor/DoctorAppointmentPage.tsx'
import DoctorAppointmentDetailsPage from '../Pages/Doctor/DoctorAppointmentDetailsPage.tsx'
import AdminMedicinePage from '../Pages/Admin/AdminMedicinePage.tsx'
import NotFoundPage from '../Pages/NotFoundPage.tsx'


import { useSelector } from 'react-redux';
import AdminInventoryPage from '../Pages/Admin/AdminInventoryPage.tsx'
import AdminSalesPage from '../Pages/Admin/AdminSalesPage.tsx'
import AdminPatientPage from '../Pages/Admin/AdminPatientPage.tsx'
import AdminDoctorPage from '../Pages/Admin/AdminDoctorPage.tsx'
import AdminDashboardPage from '../Pages/Admin/AdminDashboardPage.tsx'
import PatientDashboardPage from '../Pages/Patient/PatientDashboardPage.tsx'
import DoctorDashboardPage from '../Pages/Doctor/DoctorDashboardPage.tsx'
import DoctorPharmacyPage from '../Pages/Doctor/DoctorPharmacyPage.tsx'
import DoctorPatientPage from '../Pages/Doctor/DoctorPatientPage.tsx'

const RoleBasedRedirect = () => {
    const user = useSelector((state: any) => state.user);
    if (!user || !user.role) {
        return <Navigate to="/login" replace />;
    }
    if (user.role === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
    }
    if (user.role === 'doctor') {
        return <Navigate to="/doctor/dashboard" replace />;
    }
    if (user.role === 'patient') {
        return <Navigate to="/patient/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
};

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<RoleBasedRedirect />} />
                <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
                <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>}>
                    <Route path="dashboard" element={<AdminDashboardPage />} />
                    <Route path="patients" element={<AdminPatientPage />} />
                    <Route path="doctors" element={<AdminDoctorPage />} />
                    <Route path="sales" element={<AdminSalesPage />} />
                    <Route path="medicines" element={<AdminMedicinePage />} />
                    <Route path="inventory" element={<AdminInventoryPage />} />
                </Route>
                <Route path="/patient" element={<ProtectedRoute><PatientDashboard /></ProtectedRoute>}>
                    <Route path="dashboard" element={<PatientDashboardPage />} />
                    <Route path="profile" element={<PatientProfilePage />} />
                    <Route path="appointments" element={<PatientAppointmentPage />} />
                </Route>
                <Route path="/doctor" element={<ProtectedRoute><DoctorDashboard /></ProtectedRoute>}>
                    <Route path="dashboard" element={<DoctorDashboardPage />} />
                    <Route path="profile" element={<DoctorProfilePage />} />
                    <Route path="pharmacy" element={<DoctorPharmacyPage />} />
                    <Route path="patients" element={<DoctorPatientPage />} />
                    <Route path="appointments" element={<DoctorAppointmentPage />} />
                    <Route path="appointments/:id" element={<DoctorAppointmentDetailsPage />} />
                    <Route path="doctors" element={<Random />} />
                </Route>
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </BrowserRouter >
    )
}

export default AppRoutes