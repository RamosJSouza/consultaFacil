import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AppointmentService } from '../../../infrastructure/services/AppointmentService';
import { UserService } from '../../../infrastructure/services/UserService';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import { config } from '../../../infrastructure/config';
import type { Appointment } from '../../../domain/entities/Appointment';
import type { User } from '../../../domain/entities/User';

export const ProfessionalDashboard = () => {
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [linkedClients, setLinkedClients] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

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

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(`${config.apiUrl}/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTodayAppointments(response.data);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      setError('Failed to load appointments. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const getCalendarEvents = () => {
    return todayAppointments.map(appointment => ({
      id: String(appointment.id),
      title: `${appointment.title} - ${appointment.client?.name || 'Unknown Client'}`,
      start: `${appointment.date}T${appointment.startTime}`,
      end: `${appointment.date}T${appointment.endTime}`,
      backgroundColor: 
        appointment.status === 'confirmed' ? '#10B981' : 
        appointment.status === 'pending' ? '#F59E0B' : '#EF4444'
    }));
  };

  const handleEventClick = (info: any) => {
    const appointmentId = info.event.id;
    navigate(`/professional/appointments/${appointmentId}`);
  };

  const handleDateSelect = (selectInfo: any) => {
    const startTime = new Date(selectInfo.start);
    const endTime = new Date(selectInfo.end);
    navigate(
      `/professional/schedule/availability?start=${startTime.toISOString()}&end=${endTime.toISOString()}`
    );
  };

  const renderStats = () => {
    const pendingCount = todayAppointments.filter(a => a.status === 'pending').length;
    const confirmedCount = todayAppointments.filter(a => a.status === 'confirmed').length;
    const today = new Date().toISOString().split('T')[0];
    const todayAppointmentsCount = todayAppointments.filter(a => a.date === today && a.status === 'confirmed').length;

    return (
      <div className="grid grid-cols-1 gap-5 mt-5 sm:grid-cols-3">
        <div className="p-5 bg-white rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Today's Appointments</div>
          <div className="mt-1 text-3xl font-semibold text-blue-500">{todayAppointmentsCount}</div>
        </div>
        <div className="p-5 bg-white rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Pending Approval</div>
          <div className="mt-1 text-3xl font-semibold text-yellow-500">{pendingCount}</div>
        </div>
        <div className="p-5 bg-white rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Total Confirmed</div>
          <div className="mt-1 text-3xl font-semibold text-green-500">{confirmedCount}</div>
        </div>
      </div>
    );
  };

  if (isLoading && todayAppointments.length === 0) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
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

      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-md">{error}</div>
      )}

      {renderStats()}

      <div className="mt-8 bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4">Your Schedule</h2>
        <div className="h-96">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            initialView="timeGridWeek"
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            events={getCalendarEvents()}
            eventClick={handleEventClick}
            select={handleDateSelect}
          />
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