import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../../domain/entities/UserRole';

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon, label, isActive }) => {
  return (
    <Link
      to={to}
      className={`flex items-center px-4 py-2 mt-2 text-sm rounded-md ${
        isActive
          ? 'bg-gray-200 text-gray-900'
          : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
      }`}
    >
      <span className="mr-3">{icon}</span>
      {label}
    </Link>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const renderClientMenu = () => (
    <>
      <SidebarItem
        to="/client/dashboard"
        icon={<i className="fas fa-home"></i>}
        label="Dashboard"
        isActive={isActive('/client/dashboard')}
      />
      <SidebarItem
        to="/client/appointments"
        icon={<i className="fas fa-calendar-alt"></i>}
        label="My Appointments"
        isActive={isActive('/client/appointments')}
      />
      <SidebarItem
        to="/client/professionals"
        icon={<i className="fas fa-user-md"></i>}
        label="Find Professionals"
        isActive={isActive('/client/professionals')}
      />
    </>
  );

  const renderProfessionalMenu = () => (
    <>
      <SidebarItem
        to="/professional/dashboard"
        icon={<i className="fas fa-home"></i>}
        label="Dashboard"
        isActive={isActive('/professional/dashboard')}
      />
      <SidebarItem
        to="/professional/schedule"
        icon={<i className="fas fa-calendar-alt"></i>}
        label="Schedule"
        isActive={isActive('/professional/schedule')}
      />
      <SidebarItem
        to="/professional/clients"
        icon={<i className="fas fa-users"></i>}
        label="My Clients"
        isActive={isActive('/professional/clients')}
      />
    </>
  );

  const renderAdminMenu = () => (
    <>
      <SidebarItem
        to="/admin/dashboard"
        icon={<i className="fas fa-home"></i>}
        label="Dashboard"
        isActive={isActive('/admin/dashboard')}
      />
      <SidebarItem
        to="/admin/users"
        icon={<i className="fas fa-users"></i>}
        label="Users"
        isActive={isActive('/admin/users')}
      />
    </>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 border-b">
            <h2 className="text-xl font-semibold text-gray-800">ConsultaFácil</h2>
          </div>

          <div className="flex-grow p-4">
            <nav className="space-y-1">
              {user?.role === UserRole.CLIENT && renderClientMenu()}
              {user?.role === UserRole.PROFESSIONAL && renderProfessionalMenu()}
              {user?.role === UserRole.SUPERADMIN && renderAdminMenu()}
              
              <div className="pt-4 mt-4 border-t border-gray-200">
                <SidebarItem
                  to={`/${user?.role.toLowerCase()}/profile`}
                  icon={<i className="fas fa-user-circle"></i>}
                  label="My Profile"
                  isActive={isActive(`/${user?.role.toLowerCase()}/profile`)}
                />
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 mt-2 text-sm text-gray-600 rounded-md hover:bg-gray-200 hover:text-gray-900"
                >
                  <span className="mr-3">
                    <i className="fas fa-sign-out-alt"></i>
                  </span>
                  Logout
                </button>
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-gray-600 rounded-md md:hidden hover:text-gray-900 hover:bg-gray-100"
          >
            <i className={`fas ${isSidebarOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>

          <div className="flex items-center ml-auto">
            <div className="relative">
              <span className="text-sm font-medium text-gray-700">
                {user?.name} ({user?.role})
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}; 