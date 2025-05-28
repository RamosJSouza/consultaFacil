import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { AuthGuard } from '../components/auth/AuthGuard';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { UserRole } from '../../domain/entities/UserRole';

// Placeholder components until we create the actual pages
const ClientDashboard = () => <div>Client Dashboard</div>;
const ClientAppointments = () => <div>Client Appointments</div>;
const ClientProfessionals = () => <div>Client Professionals</div>;

const ProfessionalDashboard = () => <div>Professional Dashboard</div>;
const ProfessionalSchedule = () => <div>Professional Schedule</div>;
const ProfessionalClients = () => <div>Professional Clients</div>;

const AdminDashboard = () => <div>Admin Dashboard</div>;
const AdminUsers = () => <div>Admin Users</div>;
const AdminReports = () => <div>Admin Reports</div>;

const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginForm />,
  },
  {
    path: '/login',
    element: <LoginForm />,
  },
  {
    path: '/register',
    element: <RegisterForm />,
  },
  // Client routes
  {
    path: '/client',
    element: (
      <AuthGuard allowedRoles={[UserRole.CLIENT]}>
        <DashboardLayout>
          <Outlet />
        </DashboardLayout>
      </AuthGuard>
    ),
    children: [
      {
        path: 'dashboard',
        element: <ClientDashboard />,
      },
      {
        path: 'appointments',
        element: <ClientAppointments />,
      },
      {
        path: 'professionals',
        element: <ClientProfessionals />,
      },
    ],
  },
  // Professional routes
  {
    path: '/professional',
    element: (
      <AuthGuard allowedRoles={[UserRole.PROFESSIONAL]}>
        <DashboardLayout>
          <Outlet />
        </DashboardLayout>
      </AuthGuard>
    ),
    children: [
      {
        path: 'dashboard',
        element: <ProfessionalDashboard />,
      },
      {
        path: 'schedule',
        element: <ProfessionalSchedule />,
      },
      {
        path: 'clients',
        element: <ProfessionalClients />,
      },
    ],
  },
  // Admin routes
  {
    path: '/admin',
    element: (
      <AuthGuard allowedRoles={[UserRole.SUPERADMIN]}>
        <DashboardLayout>
          <Outlet />
        </DashboardLayout>
      </AuthGuard>
    ),
    children: [
      {
        path: 'dashboard',
        element: <AdminDashboard />,
      },
      {
        path: 'users',
        element: <AdminUsers />,
      },
      {
        path: 'reports',
        element: <AdminReports />,
      },
    ],
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
}; 