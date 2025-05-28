import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { config } from '../../../infrastructure/config';
import { UserRole } from '../../../domain/entities/UserRole';

interface DashboardStats {
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  cancelledAppointments: number;
  totalUsers: number;
  clientCount: number;
  professionalCount: number;
}

export const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalAppointments: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    cancelledAppointments: 0,
    totalUsers: 0,
    clientCount: 0,
    professionalCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const [appointmentsResponse, usersResponse] = await Promise.all([
        axios.get(`${config.apiUrl}/appointments/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${config.apiUrl}/users/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const appointmentStats = appointmentsResponse.data;
      const userStats = usersResponse.data;

      setStats({
        totalAppointments: appointmentStats.total || 0,
        pendingAppointments: appointmentStats.pending || 0,
        confirmedAppointments: appointmentStats.confirmed || 0,
        cancelledAppointments: appointmentStats.cancelled || 0,
        totalUsers: userStats.total || 0,
        clientCount: userStats.clients || 0,
        professionalCount: userStats.professionals || 0
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <div className="space-x-4">
          <button 
            onClick={() => navigate('/admin/users')} 
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Manage Users
          </button>
          <button 
            onClick={() => navigate('/admin/rules')} 
            className="px-4 py-2 text-white bg-purple-600 rounded-md hover:bg-purple-700"
          >
            System Rules
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-md">{error}</div>
      )}

      <div className="grid grid-cols-1 gap-5 mb-8 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-5 bg-white rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Total Appointments</div>
          <div className="mt-1 text-3xl font-semibold text-blue-500">{stats.totalAppointments}</div>
        </div>
        <div className="p-5 bg-white rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Pending Appointments</div>
          <div className="mt-1 text-3xl font-semibold text-yellow-500">{stats.pendingAppointments}</div>
        </div>
        <div className="p-5 bg-white rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Confirmed Appointments</div>
          <div className="mt-1 text-3xl font-semibold text-green-500">{stats.confirmedAppointments}</div>
        </div>
        <div className="p-5 bg-white rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Cancelled Appointments</div>
          <div className="mt-1 text-3xl font-semibold text-red-500">{stats.cancelledAppointments}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="p-5 bg-white rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Total Users</div>
          <div className="mt-1 text-3xl font-semibold text-indigo-500">{stats.totalUsers}</div>
        </div>
        <div className="p-5 bg-white rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Clients</div>
          <div className="mt-1 text-3xl font-semibold text-blue-500">{stats.clientCount}</div>
        </div>
        <div className="p-5 bg-white rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Professionals</div>
          <div className="mt-1 text-3xl font-semibold text-green-500">{stats.professionalCount}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 mt-8 lg:grid-cols-2">
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <button 
              onClick={() => navigate('/admin/users/new')}
              className="flex items-center p-4 text-left bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <div className="flex-shrink-0 p-2 mr-4 text-blue-500 bg-blue-100 rounded-full">
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Create User</h3>
                <p className="text-sm text-gray-500">Add a new client or professional</p>
              </div>
            </button>
            <button 
              onClick={() => navigate('/admin/appointments')}
              className="flex items-center p-4 text-left bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <div className="flex-shrink-0 p-2 mr-4 text-green-500 bg-green-100 rounded-full">
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">View Appointments</h3>
                <p className="text-sm text-gray-500">Manage all appointments</p>
              </div>
            </button>
            <button 
              onClick={() => navigate('/admin/rules')}
              className="flex items-center p-4 text-left bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <div className="flex-shrink-0 p-2 mr-4 text-purple-500 bg-purple-100 rounded-full">
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">System Settings</h3>
                <p className="text-sm text-gray-500">Configure scheduling rules</p>
              </div>
            </button>
            <button 
              onClick={() => navigate('/admin/reports')}
              className="flex items-center p-4 text-left bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <div className="flex-shrink-0 p-2 mr-4 text-indigo-500 bg-indigo-100 rounded-full">
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Reports</h3>
                <p className="text-sm text-gray-500">View analytics and statistics</p>
              </div>
            </button>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">System Status</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">API Server</p>
                  <p className="text-sm text-gray-900">Version: 1.0.0</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">Online</span>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Database</p>
                  <p className="text-sm text-gray-900">PostgreSQL</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">Connected</span>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Email Service</p>
                  <p className="text-sm text-gray-900">Nodemailer</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">Active</span>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Last Backup</p>
                  <p className="text-sm text-gray-900">Today at 03:00 AM</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">Success</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 