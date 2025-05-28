import { useState } from 'react';
import { AppointmentCalendar } from '../../components/appointments/AppointmentCalendar';
import { useAuth } from '../../contexts/AuthContext';
import type { Appointment } from '../../../domain/entities/Appointment';

export const ClientAppointments = () => {
  const { user } = useAuth();
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const handleSelectAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleSelectSlot = (start: Date, end: Date) => {
    // Navigate to new appointment form with pre-filled date/time
    window.location.href = `/client/appointments/new?start=${start.toISOString()}&end=${end.toISOString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">My Appointments</h1>
      </div>

      <div className="bg-white rounded-lg shadow">
        <AppointmentCalendar
          clientId={user?.id}
          onSelectEvent={handleSelectAppointment}
          onSelectSlot={handleSelectSlot}
        />
      </div>

      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Appointment Details
              </h2>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Title</h3>
                <p className="mt-1 text-sm text-gray-900">{selectedAppointment.title}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Professional</h3>
                <p className="mt-1 text-sm text-gray-900">
                  Dr. {selectedAppointment.professional.name}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Date & Time</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(selectedAppointment.startTime).toLocaleDateString()}
                  {' '}
                  {new Date(selectedAppointment.startTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {' - '}
                  {new Date(selectedAppointment.endTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <p className="mt-1 text-sm text-gray-900">{selectedAppointment.status}</p>
              </div>

              {selectedAppointment.description && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Description</h3>
                  <p className="mt-1 text-sm text-gray-900">{selectedAppointment.description}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => setSelectedAppointment(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-client-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 