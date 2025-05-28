import type { ReactNode } from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../../domain/entities/UserRole';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    switch (user?.role) {
      case UserRole.CLIENT:
        return [
          { name: 'Dashboard', href: '/client/dashboard' },
          { name: 'Appointments', href: '/client/appointments' },
          { name: 'Professionals', href: '/client/professionals' },
        ];
      case UserRole.PROFESSIONAL:
        return [
          { name: 'Dashboard', href: '/professional/dashboard' },
          { name: 'Schedule', href: '/professional/schedule' },
          { name: 'Clients', href: '/professional/clients' },
        ];
      case UserRole.SUPERADMIN:
        return [
          { name: 'Dashboard', href: '/admin/dashboard' },
          { name: 'Users', href: '/admin/users' },
          { name: 'Reports', href: '/admin/reports' },
        ];
      default:
        return [];
    }
  };

  const getRoleColor = () => {
    switch (user?.role) {
      case UserRole.CLIENT:
        return 'bg-client-500 hover:bg-client-600';
      case UserRole.PROFESSIONAL:
        return 'bg-professional-500 hover:bg-professional-600';
      case UserRole.SUPERADMIN:
        return 'bg-superadmin-500 hover:bg-superadmin-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <h1 className="text-xl font-semibold">ConsultaFácil</h1>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden"
              aria-label="Close sidebar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-1">
            {getNavLinks().map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="block px-4 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
              >
                {link.name}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className={`w-full px-4 py-2 text-sm text-white rounded-md ${getRoleColor()}`}
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-white shadow-sm lg:hidden">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-1 -ml-1 rounded-md lg:hidden"
            aria-label="Open sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold">ConsultaFácil</h1>
          <div className="w-6"></div>
        </div>
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}; 