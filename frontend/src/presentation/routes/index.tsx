import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { Register } from '../pages/auth/Register';
import { ForgotPassword } from '../pages/auth/ForgotPassword';
import { ResetPassword } from '../pages/auth/ResetPassword';
import { ClientDashboard } from '../pages/client/Dashboard';
import { ClientAppointments } from '../pages/client/Appointments';
import { NewAppointment } from '../pages/client/NewAppointment';
import { Professionals } from '../pages/client/Professionals';
import { ProfessionalDashboard } from '../pages/professional/Dashboard';
import { ProfessionalSchedule } from '../pages/professional/Schedule';
import { ProfessionalAvailability } from '../pages/professional/Availability';
import { ProfessionalClients } from '../pages/professional/Clients';
import { ProfessionalNewAppointment } from '../pages/professional/NewAppointment';
import { AdminDashboard } from '../pages/admin/Dashboard';
import { AdminUsers } from '../pages/admin/Users';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { AuthGuard } from '../components/auth/AuthGuard';
import { UserRole } from '../../domain/entities/UserRole';
import { UserProfile } from '../pages/profile/UserProfile';
import { HomeRedirect } from '../components/auth/HomeRedirect';

export const AppRouter = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginForm />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/" element={<HomeRedirect />} />
      
      {/* Protected client routes */}
      <Route
        path="/client/*"
        element={
          <AuthGuard allowedRoles={[UserRole.CLIENT]}>
            <DashboardLayout>
              <Routes>
                <Route path="dashboard" element={<ClientDashboard />} />
                <Route path="appointments" element={<ClientAppointments />} />
                <Route path="appointments/new" element={<NewAppointment />} />
                <Route path="appointments/new/:professionalId" element={<NewAppointment />} />
                <Route path="professionals" element={<Professionals />} />
                <Route path="profile" element={<UserProfile />} />
                <Route path="*" element={<Navigate to="/client/dashboard" replace />} />
              </Routes>
            </DashboardLayout>
          </AuthGuard>
        }
      />
      
      {/* Protected professional routes */}
      <Route
        path="/professional/*"
        element={
          <AuthGuard allowedRoles={[UserRole.PROFESSIONAL]}>
            <DashboardLayout>
              <Routes>
                <Route path="dashboard" element={<ProfessionalDashboard />} />
                <Route path="appointments/new" element={<ProfessionalNewAppointment />} />
                <Route path="schedule" element={<ProfessionalSchedule />} />
                <Route path="schedule/availability" element={<ProfessionalAvailability />} />
                <Route path="clients" element={<ProfessionalClients />} />
                <Route path="profile" element={<UserProfile />} />
                <Route path="*" element={<Navigate to="/professional/dashboard" replace />} />
              </Routes>
            </DashboardLayout>
          </AuthGuard>
        }
      />
      
      {/* Protected admin routes */}
      <Route
        path="/admin/*"
        element={
          <AuthGuard allowedRoles={[UserRole.SUPERADMIN]}>
            <DashboardLayout>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="profile" element={<UserProfile />} />
                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
              </Routes>
            </DashboardLayout>
          </AuthGuard>
        }
      />
      
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}; 