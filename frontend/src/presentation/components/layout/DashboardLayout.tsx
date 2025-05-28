import type { ReactNode } from 'react';
import { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../../domain/entities/UserRole';
import { DashboardHeader } from './DashboardHeader';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const getNavLinks = () => {
    switch (user?.role) {
      case UserRole.CLIENT:
        return [
          { name: 'Dashboard', href: '/client/dashboard', icon: 'home' },
          { name: 'Agendamentos', href: '/client/appointments', icon: 'calendar' },
          { name: 'Profissionais', href: '/client/professionals', icon: 'users' },
        ];
      case UserRole.PROFESSIONAL:
        return [
          { name: 'Dashboard', href: '/professional/dashboard', icon: 'home' },
          { name: 'Agenda', href: '/professional/schedule', icon: 'calendar' },
          { name: 'Clientes', href: '/professional/clients', icon: 'users' },
        ];
      case UserRole.SUPERADMIN:
        return [
          { name: 'Dashboard', href: '/admin/dashboard', icon: 'home' },
          { name: 'Usuários', href: '/admin/users', icon: 'users' },
          { name: 'Relatórios', href: '/admin/reports', icon: 'chart-bar' },
        ];
      default:
        return [];
    }
  };

  const breadcrumbs = useMemo(() => {
    const paths = location.pathname.split('/').filter(Boolean);
    const navLinks = getNavLinks();
    
    // Se estamos na página de dashboard, não precisa mostrar breadcrumbs
    if (paths.length === 2 && paths[1] === 'dashboard') {
      return [];
    }
    
    // Handle profile page specially
    if (paths.includes('profile')) {
      return [
        { 
          name: 'Meu Perfil', 
          href: location.pathname,
          isCurrent: true
        }
      ];
    }
    
    // Handle availability page specially
    if (paths.includes('availability')) {
      return [
        { 
          name: 'Agenda', 
          href: `/${paths[0]}/schedule`,
          isCurrent: false
        },
        { 
          name: 'Disponibilidade', 
          href: location.pathname,
          isCurrent: true
        }
      ];
    }
    
    // Build breadcrumbs based on current path, but skip the first segment (role)
    if (paths.length > 1) {
      return paths.slice(1).map((path, index) => {
        // Find matching nav link for current path segment
        const fullPath = `/${paths[0]}/${path}`;
        const matchingLink = navLinks.find(link => link.href === fullPath);
        
        return {
          name: matchingLink?.name || path.charAt(0).toUpperCase() + path.slice(1),
          href: `/${paths.slice(0, index + 2).join('/')}`,
          isCurrent: index === paths.length - 2
        };
      });
    }
    
    return [];
  }, [location.pathname]);

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const getProfilePath = () => {
    switch (user?.role) {
      case UserRole.CLIENT:
        return '/client/profile';
      case UserRole.PROFESSIONAL:
        return '/professional/profile';
      case UserRole.SUPERADMIN:
        return '/admin/profile';
      default:
        return '/profile';
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'home':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
        );
      case 'calendar':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        );
      case 'users':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
          </svg>
        );
      case 'chart-bar':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
        );
      default:
        return null;
    }
  };

  const getUserInitials = () => {
    if (!user?.name) return '?';
    const parts = user.name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const getRoleColor = () => {
    switch (user?.role) {
      case UserRole.CLIENT:
        return 'bg-emerald-600';
      case UserRole.PROFESSIONAL:
        return 'bg-blue-600';
      case UserRole.SUPERADMIN:
        return 'bg-purple-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-gray-900 bg-opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-xl transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 px-4 border-b bg-gradient-to-r from-blue-600 to-indigo-700">
            <h1 className="text-xl font-bold text-white">ConsultaFácil</h1>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${getRoleColor()}`}>
                  {getUserInitials()}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 truncate max-w-[180px]">{user?.name}</div>
                  <div className="text-xs text-gray-500">{
                    user?.role === UserRole.CLIENT 
                      ? 'Cliente' 
                      : user?.role === UserRole.PROFESSIONAL 
                      ? 'Profissional' 
                      : 'Administrador'
                  }</div>
                </div>
              </div>
              <nav className="space-y-1">
                {getNavLinks().map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                      isActivePath(link.href)
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className={`mr-3 ${isActivePath(link.href) ? 'text-blue-500' : 'text-gray-500'}`}>
                      {getIcon(link.icon)}
                    </span>
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
          <div className="p-4 border-t">
            <Link 
              to={getProfilePath()}
              className="block w-full px-4 py-2 text-sm text-center text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition duration-150 mb-2"
            >
              Meu Perfil
            </Link>
            <button
              onClick={logout}
              className="w-full px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-md transition duration-150"
            >
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Header with breadcrumbs */}
        <DashboardHeader 
          breadcrumbs={breadcrumbs} 
          toggleSidebar={() => setIsSidebarOpen(true)} 
        />
        
        <main className="flex-1 p-4 lg:p-8">{children}</main>
        <footer className="bg-white border-t py-4 px-6 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} ConsultaFácil. Todos os direitos reservados.
        </footer>
      </div>
    </div>
  );
}; 