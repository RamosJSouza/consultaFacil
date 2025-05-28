import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventInput, DateSelectArg, EventClickArg } from '@fullcalendar/core';
import type { Appointment } from '../../../domain/entities/Appointment';
import { AppointmentService } from '../../../infrastructure/services/AppointmentService';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../../domain/entities/UserRole';

// Define appointment status constants
const AppointmentStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled'
} as const;

interface AppointmentCalendarProps {
  onSelectSlot?: (start: Date, end: Date) => void;
  onSelectEvent?: (appointment: Appointment) => void;
  professionalId?: number;
  clientId?: number;
}

export const AppointmentCalendar = ({
  onSelectSlot,
  onSelectEvent,
  professionalId,
  clientId,
}: AppointmentCalendarProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const appointmentService = new AppointmentService();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const filters = {
          professionalId,
          clientId,
        };
        const fetchedAppointments = await appointmentService.getAppointments(filters);
        setAppointments(fetchedAppointments);
      } catch (error) {
        console.error('Failed to fetch appointments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [professionalId, clientId]);

  const getEventColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#10B981'; // green
      case 'pending':
        return '#F59E0B'; // yellow
      case 'cancelled':
        return '#EF4444'; // red
      default:
        return '#6B7280'; // gray
    }
  };

  const events: EventInput[] = appointments.map(appointment => ({
    id: String(appointment.id),
    title: appointment.title,
    start: `${appointment.date}T${appointment.startTime}`,
    end: `${appointment.date}T${appointment.endTime}`,
    backgroundColor: getEventColor(appointment.status),
    borderColor: getEventColor(appointment.status),
    extendedProps: { appointment },
  }));

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    if (onSelectSlot && user?.role === UserRole.CLIENT) {
      onSelectSlot(selectInfo.start, selectInfo.end);
    }
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    if (onSelectEvent) {
      const appointment = clickInfo.event.extendedProps.appointment as Appointment;
      onSelectEvent(appointment);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        editable={false}
        selectable={user?.role === UserRole.CLIENT}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        events={events}
        select={handleDateSelect}
        eventClick={handleEventClick}
        height="auto"
        allDaySlot={false}
        slotMinTime="08:00:00"
        slotMaxTime="20:00:00"
      />
    </div>
  );
}; 