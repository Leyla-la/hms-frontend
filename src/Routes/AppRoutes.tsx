import { BrowserRouter, Route, Routes } from 'react-router-dom'
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


const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
                <Route path="/" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>}>
                    <Route path="/dashboard" element={<Random />} />
                    <Route path="/pharmacy" element={<Random />} />
                    <Route path="/patients" element={<Random />} />
                    <Route path="/doctors" element={<Random />} />
                </Route>
                <Route path="/patient" element={<ProtectedRoute><PatientDashboard /></ProtectedRoute>}>
                    <Route path="dashboard" element={<Random />} />
                    <Route path="profile" element={<PatientProfilePage />} />
                    <Route path="appointments" element={<Random />} />
                </Route>
                <Route path="/doctor" element={<ProtectedRoute><DoctorDashboard /></ProtectedRoute>}>
                    <Route path="dashboard" element={<Random />} />
                    <Route path="profile" element={<DoctorProfilePage />} />
                    <Route path="pharmacy" element={<Random />} />
                    <Route path="patients" element={<Random />} />
                    <Route path="appointments" element={<Random />} />
                    <Route path="doctors" element={<Random />} />
                </Route>
            </Routes>
        </BrowserRouter >
    )
}

export default AppRoutes