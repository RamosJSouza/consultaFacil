import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { Register } from '../pages/auth/Register';
import { ForgotPassword } from '../pages/auth/ForgotPassword';
import { ResetPassword } from '../pages/auth/ResetPassword';
import { ClientDashboard } from '../pages/client/Dashboard';
import { ClientAppointments } from '../pages/client/Appointments';
import { NewAppointment } from '../pages/client/NewAppointment';
import { ProfessionalDashboard } from '../pages/professional/Dashboard';
import { ProfessionalSchedule } from '../pages/professional/Schedule';
import { ProfessionalAvailability } from '../pages/professional/Availability';
import { AdminDashboard } from '../pages/admin/Dashboard';
import { AdminUsers } from '../pages/admin/Users';
import { Layout } from '../components/Layout';
import { AuthGuard } from '../components/auth/AuthGuard';
import { UserRole } from '../../domain/entities/UserRole';
import { UserProfile } from '../pages/profile/UserProfile';

export const AppRouter = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginForm />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* Protected client routes */}
      <Route
        path="/client/*"
        element={
          <AuthGuard allowedRoles={[UserRole.CLIENT]}>
            <Layout>
              <Routes>
                <Route path="dashboard" element={<ClientDashboard />} />
                <Route path="appointments" element={<ClientAppointments />} />
                <Route path="appointments/new" element={<NewAppointment />} />
                <Route path="appointments/new/:professionalId" element={<NewAppointment />} />
                <Route path="profile" element={<UserProfile />} />
                <Route path="*" element={<Navigate to="/client/dashboard" replace />} />
              </Routes>
            </Layout>
          </AuthGuard>
        }
      />
      
      {/* Protected professional routes */}
      <Route
        path="/professional/*"
        element={
          <AuthGuard allowedRoles={[UserRole.PROFESSIONAL]}>
            <Layout>
              <Routes>
                <Route path="dashboard" element={<ProfessionalDashboard />} />
                <Route path="schedule" element={<ProfessionalSchedule />} />
                <Route path="schedule/availability" element={<ProfessionalAvailability />} />
                <Route path="profile" element={<UserProfile />} />
                <Route path="*" element={<Navigate to="/professional/dashboard" replace />} />
              </Routes>
            </Layout>
          </AuthGuard>
        }
      />
      
      {/* Protected admin routes */}
      <Route
        path="/admin/*"
        element={
          <AuthGuard allowedRoles={[UserRole.SUPERADMIN]}>
            <Layout>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="profile" element={<UserProfile />} />
                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
              </Routes>
            </Layout>
          </AuthGuard>
        }
      />
      
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}; 