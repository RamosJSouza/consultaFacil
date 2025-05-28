import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { AuthGuard } from '../components/auth/AuthGuard';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { UserRole } from '../../domain/entities/UserRole';

// Client pages
import { ClientDashboard } from '../pages/client/Dashboard';
import { ClientAppointments } from '../pages/client/Appointments';
import { Professionals } from '../pages/client/Professionals';

// Professional pages
import { ProfessionalDashboard } from '../pages/professional/Dashboard';
import { ProfessionalSchedule } from '../pages/professional/Schedule';
import { ProfessionalClients } from '../pages/professional/Clients';

// Placeholder components for admin
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
        element: <Professionals />,
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