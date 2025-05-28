import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { config } from '../../../infrastructure/config';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { Appointment } from '../../../domain/entities/Appointment';

export const ProfessionalSchedule = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, [selectedStatus]);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const params: Record<string, string> = {};
      if (selectedStatus !== 'all') {
        params.status = selectedStatus;
      }

      const response = await axios.get(`${config.apiUrl}/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      setAppointments(response.data);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      setError('Failed to load appointments. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppointmentUpdate = async (id: number, status: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      await axios.patch(
        `${config.apiUrl}/appointments/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state with proper type safety
      setAppointments(prevAppointments => {
        return prevAppointments.map(appointment => {
          if (appointment.id === id) {
            return { ...appointment, status } as Appointment;
          }
          return appointment;
        });
      });
    } catch (error) {
      console.error(`Failed to update appointment to ${status}:`, error);
      setError(`Failed to update appointment. Please try again later.`);
    }
  };

  const getCalendarEvents = () => {
    return appointments.map(appointment => ({
      id: String(appointment.id),
      title: `${appointment.title} - ${appointment.client?.name || 'Unknown Client'}`,
      start: `${appointment.date}T${appointment.startTime}`,
      end: `${appointment.date}T${appointment.endTime}`,
      backgroundColor: 
        appointment.status === 'confirmed' ? '#10B981' : 
        appointment.status === 'pending' ? '#F59E0B' : '#EF4444',
      extendedProps: {
        status: appointment.status
      }
    }));
  };

  const handleEventClick = (info: any) => {
    const appointmentId = info.event.id;
    const status = info.event.extendedProps.status;
    
    // Show different actions based on status
    if (status === 'pending') {
      const confirmAction = window.confirm(
        `Do you want to confirm this appointment?\n\n${info.event.title}`
      );
      if (confirmAction) {
        handleAppointmentUpdate(Number(appointmentId), 'confirmed');
      }
    } else if (status === 'confirmed') {
      const cancelAction = window.confirm(
        `Do you want to cancel this appointment?\n\n${info.event.title}`
      );
      if (cancelAction) {
        handleAppointmentUpdate(Number(appointmentId), 'cancelled');
      }
    }
  };

  const handleDateSelect = (selectInfo: any) => {
    const startTime = new Date(selectInfo.start);
    const endTime = new Date(selectInfo.end);
    navigate(
      `/professional/schedule/availability?start=${startTime.toISOString()}&end=${endTime.toISOString()}`
    );
  };

  if (isLoading && appointments.length === 0) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Schedule Management</h1>
        <button 
          onClick={() => navigate('/professional/schedule/availability')} 
          className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700"
        >
          Set Availability
        </button>
      </div>

      <div className="mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-3 py-1 text-sm rounded-md ${
              selectedStatus === 'all' ? 'bg-gray-200 text-gray-800' : 'bg-white text-gray-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedStatus('pending')}
            className={`px-3 py-1 text-sm rounded-md ${
              selectedStatus === 'pending' ? 'bg-yellow-200 text-yellow-800' : 'bg-white text-gray-600'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setSelectedStatus('confirmed')}
            className={`px-3 py-1 text-sm rounded-md ${
              selectedStatus === 'confirmed' ? 'bg-green-200 text-green-800' : 'bg-white text-gray-600'
            }`}
          >
            Confirmed
          </button>
          <button
            onClick={() => setSelectedStatus('cancelled')}
            className={`px-3 py-1 text-sm rounded-md ${
              selectedStatus === 'cancelled' ? 'bg-red-200 text-red-800' : 'bg-white text-gray-600'
            }`}
          >
            Cancelled
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-md">{error}</div>
      )}

      <div className="bg-white rounded-lg shadow p-4">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Your Schedule</h2>
          <p className="text-sm text-gray-500 mt-1">
            Click on a pending appointment to confirm it, or on a confirmed appointment to cancel it.
            Click and drag to set your availability.
          </p>
        </div>
        <div className="h-screen max-h-[600px]">
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
            allDaySlot={false}
            slotMinTime="08:00:00"
            slotMaxTime="20:00:00"
          />
        </div>
      </div>
    </div>
  );
}; 