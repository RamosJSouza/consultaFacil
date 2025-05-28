import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { NotificationBell } from './notifications/NotificationBell';
import { UserRole } from '../../domain/entities/UserRole';
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  HomeIcon,
  CalendarIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getNavLinks = () => {
    if (!user) return [];

    switch (user.role) {
      case UserRole.CLIENT:
        return [
          { name: 'Dashboard', href: '/client/dashboard', icon: HomeIcon },
          { name: 'Meus Agendamentos', href: '/client/appointments', icon: CalendarIcon },
          { name: 'Profissionais', href: '/client/professionals', icon: UsersIcon },
          { name: 'Perfil', href: '/client/profile', icon: UserCircleIcon },
        ];
      case UserRole.PROFESSIONAL:
        return [
          { name: 'Dashboard', href: '/professional/dashboard', icon: HomeIcon },
          { name: 'Agenda', href: '/professional/schedule', icon: CalendarIcon },
          { name: 'Clientes', href: '/professional/clients', icon: UsersIcon },
          { name: 'Perfil', href: '/professional/profile', icon: UserCircleIcon },
        ];
      case UserRole.ADMIN:
        return [
          { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
          { name: 'Usuários', href: '/admin/users', icon: UsersIcon },
          { name: 'Agendamentos', href: '/admin/appointments', icon: CalendarIcon },
          { name: 'Relatórios', href: '/admin/reports', icon: ClipboardDocumentListIcon },
          { name: 'Configurações', href: '/admin/settings', icon: Cog6ToothIcon },
        ];
      default:
        return [];
    }
  };

  const isActiveLink = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = getNavLinks();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${
          sidebarOpen ? 'block' : 'hidden'
        }`}
        onClick={() => setSidebarOpen(false)}
      >
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
      </div>

      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 transition duration-300 transform bg-white lg:translate-x-0 lg:static lg:inset-auto ${
          sidebarOpen ? 'translate-x-0 ease-out' : '-translate-x-full ease-in'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200">
          <div className="flex items-center">
            <span className="text-xl font-semibold text-gray-800">ConsultaFácil</span>
          </div>
          <button
            className="p-1 -mr-1 rounded-md lg:hidden hover:bg-gray-100"
            onClick={() => setSidebarOpen(false)}
          >
            <XMarkIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="flex flex-col flex-1 h-0 overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActiveLink(item.href)
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon
                  className={`mr-3 flex-shrink-0 h-6 w-6 ${
                    isActiveLink(item.href)
                      ? 'text-gray-500'
                      : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {item.name}
              </Link>
            ))}

            <button
              onClick={handleLogout}
              className="group flex w-full items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <ArrowRightOnRectangleIcon className="mr-3 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-500" />
              Sair
            </button>
          </nav>
        </div>
      </div>

      <div className="flex flex-col flex-1 lg:pl-64">
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
          <button
            className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Abrir menu lateral</span>
            <Bars3Icon className="h-6 w-6" />
          </button>

          <div className="flex flex-1 justify-end px-4">
            <div className="ml-4 flex items-center md:ml-6">
              <NotificationBell />

              <div className="relative ml-3">
                <div className="flex items-center">
                  <div className="ml-3 space-y-1 text-right">
                    <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                    <p className="text-xs font-medium text-gray-500">
                      {user?.role === UserRole.CLIENT
                        ? 'Cliente'
                        : user?.role === UserRole.PROFESSIONAL
                        ? 'Profissional'
                        : 'Administrador'}
                    </p>
                  </div>
                  <UserCircleIcon className="ml-2 h-8 w-8 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}; 