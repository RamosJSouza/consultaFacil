import { useState, useEffect } from 'react';
import { UserService } from '../../../infrastructure/services/UserService';
import { AppointmentService } from '../../../infrastructure/services/AppointmentService';
import type { User } from '../../../domain/entities/User';
import type { Appointment } from '../../../domain/entities/Appointment';
import { UserRole } from '../../../domain/entities/UserRole';

interface DashboardMetrics {
  totalUsers: number;
  totalProfessionals: number;
  totalClients: number;
  totalAppointments: number;
  recentAppointments: Appointment[];
  recentUsers: User[];
}

export const AdminDashboard = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalUsers: 0,
    totalProfessionals: 0,
    totalClients: 0,
    totalAppointments: 0,
    recentAppointments: [],
    recentUsers: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const userService = new UserService();
        const appointmentService = new AppointmentService();

        const [users, appointments] = await Promise.all([
          userService.getUsers(),
          appointmentService.getAppointments({}),
        ]);

        const professionals = users.filter((user: User) => user.role === UserRole.PROFESSIONAL);
        const clients = users.filter((user: User) => user.role === UserRole.CLIENT);

        setMetrics({
          totalUsers: users.length,
          totalProfessionals: professionals.length,
          totalClients: clients.length,
          totalAppointments: appointments.length,
          recentAppointments: appointments.slice(0, 5), // Last 5 appointments
          recentUsers: users.slice(0, 5), // Last 5 registered users
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-5 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Total Users</h3>
          <p className="mt-1 text-3xl font-semibold text-gray-600">{metrics.totalUsers}</p>
        </div>
        <div className="p-5 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Professionals</h3>
          <p className="mt-1 text-3xl font-semibold text-gray-600">{metrics.totalProfessionals}</p>
        </div>
        <div className="p-5 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Clients</h3>
          <p className="mt-1 text-3xl font-semibold text-gray-600">{metrics.totalClients}</p>
        </div>
        <div className="p-5 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Total Appointments</h3>
          <p className="mt-1 text-3xl font-semibold text-gray-600">{metrics.totalAppointments}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Appointments */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Recent Appointments</h2>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {metrics.recentAppointments.map((appointment) => (
                  <li key={appointment.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {appointment.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(appointment.startTime).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                            ${
                              appointment.status === 'confirmed'
                                ? 'bg-green-100 text-green-800'
                                : appointment.status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }
                          `}
                        >
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Recent Users</h2>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {metrics.recentUsers.map((user) => (
                  <li key={user.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.name}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                            ${
                              user.role === UserRole.PROFESSIONAL
                                ? 'bg-blue-100 text-blue-800'
                                : user.role === UserRole.CLIENT
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }
                          `}
                        >
                          {user.role.toLowerCase()}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 