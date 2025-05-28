import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import axios from 'axios';
import { config } from '../../../infrastructure/config';
import type { Appointment } from '../../../domain/entities/Appointment';

export const ClientDashboard = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }

        const response = await axios.get(`${config.apiUrl}/appointments`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { status: 'confirmed' }
        });

        setAppointments(response.data);
      } catch (error) {
        console.error('Failed to fetch appointments:', error);
        setError('Failed to load appointments. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const getCalendarEvents = () => {
    return appointments.map(appointment => ({
      id: String(appointment.id),
      title: appointment.title,
      start: `${appointment.date}T${appointment.startTime}`,
      end: `${appointment.date}T${appointment.endTime}`,
      backgroundColor: 
        appointment.status === 'confirmed' ? '#10B981' : 
        appointment.status === 'pending' ? '#F59E0B' : '#EF4444'
    }));
  };

  const handleEventClick = (info: any) => {
    const appointmentId = info.event.id;
    navigate(`/client/appointments/${appointmentId}`);
  };

  const renderStats = () => {
    const pending = appointments.filter(a => a.status === 'pending').length;
    const confirmed = appointments.filter(a => a.status === 'confirmed').length;
    const cancelled = appointments.filter(a => a.status === 'cancelled').length;

    return (
      <div className="grid grid-cols-1 gap-5 mt-5 sm:grid-cols-3">
        <div className="p-5 bg-white rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Pending Appointments</div>
          <div className="mt-1 text-3xl font-semibold text-yellow-500">{pending}</div>
        </div>
        <div className="p-5 bg-white rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Confirmed Appointments</div>
          <div className="mt-1 text-3xl font-semibold text-green-500">{confirmed}</div>
        </div>
        <div className="p-5 bg-white rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Cancelled Appointments</div>
          <div className="mt-1 text-3xl font-semibold text-red-500">{cancelled}</div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Welcome, {user?.name}</h1>
        <button 
          onClick={() => navigate('/client/appointments/new')} 
          className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          New Appointment
        </button>
      </div>

      {renderStats()}

      <div className="mt-8 bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4">Upcoming Appointments</h2>
        <div className="h-96">
          <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            events={getCalendarEvents()}
            eventClick={handleEventClick}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,dayGridWeek'
            }}
          />
        </div>
      </div>
    </div>
  );
}; 