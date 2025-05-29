import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../../domain/entities/UserRole';
import { NotificationBell } from '../notifications/NotificationBell';
import { Breadcrumbs } from '../navigation/Breadcrumbs';

interface Breadcrumb {
  name: string;
  href: string;
  isCurrent: boolean;
}

interface DashboardHeaderProps {
  breadcrumbs: Breadcrumb[];
  toggleSidebar: () => void;
}

export const DashboardHeader = ({ breadcrumbs, toggleSidebar }: DashboardHeaderProps) => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
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
    <header className="sticky top-0 z-10 bg-white shadow-sm">
      {/* Top navigation bar */}
      <div className="bg-white border-b">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Mobile menu button and logo */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={toggleSidebar}
                className="p-1 -ml-1 rounded-md text-gray-500 hover:text-gray-900"
                aria-label="Open sidebar"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="ml-4 text-lg font-semibold lg:hidden">ConsultaFácil</h1>
            </div>
            
            {/* Center - Title (visible on desktop) */}
            <div className="hidden lg:flex lg:items-center">
              <h1 className="text-lg font-semibold text-blue-800">Dashboard ConsultaFácil</h1>
            </div>

            {/* Right side - Notification and profile */}
            <div className="flex items-center gap-3 md:gap-6 ml-auto">
              {/* Notification bell */}
              <div className="flex items-center">
                <NotificationBell />
              </div>

              {/* Profile dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none group"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${getRoleColor()} ring-2 ring-white`}>
                    {getUserInitials()}
                  </div>
                  <span className="hidden md:flex items-center text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    <span className="max-w-[100px] truncate">{user?.name?.split(' ')[0]}</span>
                    <svg className="w-4 h-4 ml-1 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm text-gray-500">Conectado como</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                    </div>

                    <Link
                      to={getProfilePath()}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Meu Perfil
                    </Link>
                    
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Configurações
                    </Link>
                    
                    <div className="border-t border-gray-100 mt-1"></div>
                    
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sair
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} />
    </header>
  );
}; 