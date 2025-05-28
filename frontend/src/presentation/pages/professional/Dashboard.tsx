import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AppointmentService } from '../../../infrastructure/services/AppointmentService';
import { UserService } from '../../../infrastructure/services/UserService';
import type { Appointment } from '../../../domain/entities/Appointment';
import type { User } from '../../../domain/entities/User';

export const ProfessionalDashboard = () => {
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [linkedClients, setLinkedClients] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        const appointmentService = new AppointmentService();
        const userService = new UserService();

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const [todayAppts, futureAppts, clients] = await Promise.all([
          appointmentService.getAppointments({
            professionalId: user.id,
            startDate: today,
            endDate: tomorrow,
          }),
          appointmentService.getAppointments({
            professionalId: user.id,
            startDate: tomorrow,
          }),
          userService.getLinkedClients(user.id),
        ]);

        setTodayAppointments(todayAppts);
        setUpcomingAppointments(futureAppts.slice(0, 5)); // Show next 5 appointments
        setLinkedClients(clients.slice(0, 5)); // Show top 5 clients
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Welcome, Dr. {user?.name}</h1>
        <Link
          to="/professional/schedule"
          className="px-4 py-2 text-sm font-medium text-white bg-professional-500 rounded-md hover:bg-professional-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-professional-500"
        >
          View Schedule
        </Link>
      </div>

      {/* Today's Appointments */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Today's Appointments</h2>
        </div>
        <div className="px-4 py-5 sm:p-6">
          {todayAppointments.length === 0 ? (
            <p className="text-gray-500">No appointments scheduled for today</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {todayAppointments.map((appointment) => (
                <li key={appointment.id} className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{appointment.title}</p>
                      <p className="text-sm text-gray-500">
                        with {appointment.client.name}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(appointment.startTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming Appointments */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Upcoming Appointments</h2>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {upcomingAppointments.length === 0 ? (
              <p className="text-gray-500">No upcoming appointments</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {upcomingAppointments.map((appointment) => (
                  <li key={appointment.id} className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{appointment.title}</p>
                        <p className="text-sm text-gray-500">
                          with {appointment.client.name}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(appointment.startTime).toLocaleDateString()}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4">
              <Link
                to="/professional/schedule"
                className="text-sm font-medium text-professional-500 hover:text-professional-600"
              >
                View full schedule →
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Clients */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Recent Clients</h2>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {linkedClients.length === 0 ? (
              <p className="text-gray-500">No clients yet</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {linkedClients.map((client) => (
                  <li key={client.id} className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{client.name}</p>
                        <p className="text-sm text-gray-500">{client.email}</p>
                      </div>
                      <Link
                        to={`/professional/clients/${client.id}`}
                        className="text-sm font-medium text-professional-500 hover:text-professional-600"
                      >
                        View History
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4">
              <Link
                to="/professional/clients"
                className="text-sm font-medium text-professional-500 hover:text-professional-600"
              >
                View all clients →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 