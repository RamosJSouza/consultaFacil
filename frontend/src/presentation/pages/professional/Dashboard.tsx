import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AppointmentService } from '../../../infrastructure/services/AppointmentService';
import { UserService } from '../../../infrastructure/services/UserService';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { config } from '../../../infrastructure/config';
import type { Appointment } from '../../../domain/entities/Appointment';
import type { User } from '../../../domain/entities/User';
import { AppointmentModal } from '../../components/appointments/AppointmentModal';
import { useNotifications } from '../../contexts/NotificationContext';
import axios from 'axios';

export const ProfessionalDashboard = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [linkedClients, setLinkedClients] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const appointmentService = new AppointmentService();

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError('');
      
      const userService = new UserService();

      const today = new Date().toISOString().split('T')[0];  // Get today's date in YYYY-MM-DD format
      const appointments = await AppointmentService.getAppointmentsForProfessional(user.id);
      const todayAppointments = appointments.filter(appointment => appointment.date === today && appointment.status !== 'cancelled');
      const futureAppts = appointments.filter(appt => {
        const apptDate = new Date(appt.date);
        return apptDate > new Date(today);
      }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // Get linked clients
      const clients = await userService.getLinkedClients(user.id);

      setAppointments(appointments);
      setTodayAppointments(todayAppointments);
      setUpcomingAppointments(futureAppts.slice(0, 5)); // Show next 5 appointments
      setLinkedClients(clients.slice(0, 5)); // Show top 5 clients
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const getCalendarEvents = () => {
    return appointments.map(appointment => ({
      id: String(appointment.id),
      title: `${appointment.title} - ${appointment.client?.name || 'Unknown Client'}`,
      start: `${appointment.date}T${appointment.startTime}`,
      end: `${appointment.date}T${appointment.endTime}`,
      backgroundColor: 
        appointment.status === 'confirmed' ? '#10B981' : 
        appointment.status === 'pending' ? '#F59E0B' : '#EF4444',
      borderColor: 
        appointment.status === 'confirmed' ? '#059669' : 
        appointment.status === 'pending' ? '#D97706' : '#DC2626',
      textColor: '#FFFFFF'
    }));
  };

  const handleEventClick = (info: any) => {
    const appointmentId = parseInt(info.event.id);
    setSelectedAppointmentId(appointmentId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleConfirmAppointment = async (id: number) => {
    try {
      await appointmentService.confirmAppointment(id);
      showToast('Success', 'Appointment confirmed successfully', 'success');
      await fetchDashboardData(); // Refresh data after confirmation
    } catch (error) {
      console.error('Failed to confirm appointment:', error);
      showToast('Error', 'Failed to confirm appointment', 'error');
      throw error; // Re-throw to be handled by the modal
    }
  };

  const handleCancelAppointment = async (id: number) => {
    try {
      await appointmentService.cancelAppointment(id);
      showToast('Success', 'Appointment cancelled successfully', 'success');
      await fetchDashboardData(); // Refresh data after cancellation
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      showToast('Error', 'Failed to cancel appointment', 'error');
      throw error; // Re-throw to be handled by the modal
    }
  };

  const handleDateSelect = (selectInfo: any) => {
    const startTime = new Date(selectInfo.start);
    const endTime = new Date(selectInfo.end);
    window.location.href = 
      `/professional/schedule/availability?start=${startTime.toISOString()}&end=${endTime.toISOString()}`;
  };

  const renderStats = () => {
    const pendingCount = appointments.filter(a => a.status === 'pending').length;
    const confirmedCount = appointments.filter(a => a.status === 'confirmed').length;
    const todayCount = todayAppointments.filter(a => a.status === 'confirmed').length;

    return (
      <div className="grid grid-cols-1 gap-5 mt-5 sm:grid-cols-3">
        <div className="p-5 bg-white rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Today's Appointments</div>
          <div className="mt-1 text-3xl font-semibold text-blue-500">{todayCount}</div>
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

  if (isLoading && appointments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Welcome, Dr. {user?.name}</h1>
        <div className="flex space-x-3">
          <Link
            to="/professional/appointments/new"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            New Appointment
          </Link>
          <Link
            to="/professional/schedule"
            className="px-4 py-2 text-sm font-medium text-white bg-professional-500 rounded-md hover:bg-professional-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-professional-500"
          >
            View Schedule
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-md">{error}</div>
      )}

      {renderStats()}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Upcoming Appointments - 1/3 width */}
        <div className="bg-white rounded-lg shadow lg:col-span-1">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Upcoming Appointments</h2>
          </div>
          <div className="px-4 py-5 sm:p-6 max-h-96 overflow-y-auto">
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
                          with {appointment.client?.name || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(appointment.date).toLocaleDateString()} at{' '}
                          {new Date(`${appointment.date}T${appointment.startTime}`).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        appointment.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : appointment.status === 'cancelled' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {appointment.status}
                      </span>
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

        {/* Calendar - 2/3 width */}
        <div className="bg-white rounded-lg shadow lg:col-span-2">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Your Schedule</h2>
          </div>
          <div className="p-4">
            <div className="h-96">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                initialView="timeGridDay"
                selectable={true}
                selectMirror={true}
                dayMaxEvents={true}
                events={getCalendarEvents()}
                eventClick={handleEventClick}
                select={handleDateSelect}
                height="100%"
                allDaySlot={false}
                slotMinTime="08:00:00"
                slotMaxTime="20:00:00"
              />
            </div>
          </div>
        </div>

        {/* Recent Clients */}
        <div className="bg-white rounded-lg shadow lg:col-span-3">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Recent Clients</h2>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {linkedClients.length === 0 ? (
              <p className="text-gray-500">No clients yet</p>
            ) : (
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {linkedClients.map((client) => (
                  <li key={client.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex flex-col h-full">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{client.name}</p>
                        <p className="text-sm text-gray-500">{client.email}</p>
                      </div>
                      <div className="mt-auto pt-3 flex justify-between items-center">
                        <Link
                          to={`/professional/appointments/new?clientId=${client.id}`}
                          className="text-xs font-medium text-blue-500 hover:text-blue-600"
                        >
                          Schedule
                        </Link>
                        <Link
                          to={`/professional/clients/${client.id}`}
                          className="text-xs font-medium text-professional-500 hover:text-professional-600"
                        >
                          View History
                        </Link>
                      </div>
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

      {/* Appointment Modal */}
      <AppointmentModal
        appointmentId={selectedAppointmentId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmAppointment}
        onCancel={handleCancelAppointment}
      />
    </div>
  );
}; 