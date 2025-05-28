import { useState, useEffect } from 'react';
import { AppointmentService } from '../../../infrastructure/services/AppointmentService';
import { UserService } from '../../../infrastructure/services/UserService';
import type { User } from '../../../domain/entities/User';
import { UserRole } from '../../../domain/entities/UserRole';

interface AppointmentStats {
  total: number;
  confirmed: number;
  cancelled: number;
  pending: number;
  byProfessional: {
    [professionalId: string]: number;
  };
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  professionals: number;
  clients: number;
  newUsersThisMonth: number;
}

export const AdminReports = () => {
  const [appointmentStats, setAppointmentStats] = useState<AppointmentStats>({
    total: 0,
    confirmed: 0,
    cancelled: 0,
    pending: 0,
    byProfessional: {},
  });
  const [userStats, setUserStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    professionals: 0,
    clients: 0,
    newUsersThisMonth: 0,
  });
  const [topProfessionals, setTopProfessionals] = useState<(User & { appointmentCount: number })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userService = new UserService();
        const appointmentService = new AppointmentService();

        const [users, appointments] = await Promise.all([
          userService.getUsers(),
          appointmentService.getAppointments({}),
        ]);

        // Calculate user statistics
        const activeUsers = users.filter(user => user.isActive);
        const professionals = users.filter(user => user.role === UserRole.PROFESSIONAL);
        const clients = users.filter(user => user.role === UserRole.CLIENT);
        
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const newUsers = users.filter(user => new Date(user.createdAt) >= firstDayOfMonth);

        setUserStats({
          totalUsers: users.length,
          activeUsers: activeUsers.length,
          professionals: professionals.length,
          clients: clients.length,
          newUsersThisMonth: newUsers.length,
        });

        // Calculate appointment statistics
        const appointmentsByStatus = appointments.reduce(
          (acc, appointment) => {
            acc[appointment.status]++;
            acc.total++;
            
            const professionalId = appointment.professional.id;
            acc.byProfessional[professionalId] = (acc.byProfessional[professionalId] || 0) + 1;
            
            return acc;
          },
          {
            total: 0,
            confirmed: 0,
            cancelled: 0,
            pending: 0,
            byProfessional: {} as { [key: string]: number },
          }
        );

        setAppointmentStats(appointmentsByStatus);

        // Calculate top professionals with proper typing
        const professionalStats = professionals.map(professional => ({
          ...professional,
          appointmentCount: appointmentsByStatus.byProfessional[professional.id] || 0,
        })) as (User & { appointmentCount: number })[];

        setTopProfessionals(
          professionalStats
            .sort((a, b) => b.appointmentCount - a.appointmentCount)
            .slice(0, 5)
        );

      } catch (error) {
        console.error('Failed to fetch statistics:', error);
        setError('Failed to load statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
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
      <h1 className="text-2xl font-semibold text-gray-900">System Reports</h1>

      {/* User Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="p-5 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Users Overview</h3>
          <dl className="mt-4 space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Total Users</dt>
              <dd className="text-sm font-medium text-gray-900">{userStats.totalUsers}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Active Users</dt>
              <dd className="text-sm font-medium text-gray-900">{userStats.activeUsers}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">New This Month</dt>
              <dd className="text-sm font-medium text-gray-900">{userStats.newUsersThisMonth}</dd>
            </div>
          </dl>
        </div>

        <div className="p-5 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">User Types</h3>
          <dl className="mt-4 space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Professionals</dt>
              <dd className="text-sm font-medium text-gray-900">{userStats.professionals}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Clients</dt>
              <dd className="text-sm font-medium text-gray-900">{userStats.clients}</dd>
            </div>
          </dl>
        </div>

        <div className="p-5 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Appointments Overview</h3>
          <dl className="mt-4 space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Total Appointments</dt>
              <dd className="text-sm font-medium text-gray-900">{appointmentStats.total}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Confirmed</dt>
              <dd className="text-sm font-medium text-green-600">{appointmentStats.confirmed}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Cancelled</dt>
              <dd className="text-sm font-medium text-red-600">{appointmentStats.cancelled}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Pending</dt>
              <dd className="text-sm font-medium text-yellow-600">{appointmentStats.pending}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Top Professionals */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Top Professionals</h2>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="flow-root">
            <ul className="-my-5 divide-y divide-gray-200">
              {topProfessionals.map((professional) => (
                <li key={professional.id} className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {professional.name}
                      </p>
                      <p className="text-sm text-gray-500">{professional.email}</p>
                    </div>
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {professional.appointmentCount} appointments
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
  );
}; 