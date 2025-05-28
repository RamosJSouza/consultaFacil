import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { config } from '../../../infrastructure/config';
import type { Appointment } from '../../../domain/entities/Appointment';

export const ClientAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const params: Record<string, string> = {};
      if (filter !== 'all') {
        params.status = filter;
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

  const handleCancelAppointment = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      await axios.patch(
        `${config.apiUrl}/appointments/${id}`,
        { status: 'cancelled' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setAppointments(appointments.map(appointment => 
        appointment.id === id ? { ...appointment, status: 'cancelled' } : appointment
      ));
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      setError('Failed to cancel appointment. Please try again later.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">Pending</span>;
      case 'confirmed':
        return <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">Confirmed</span>;
      case 'cancelled':
        return <span className="px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">Cancelled</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium text-gray-800 bg-gray-100 rounded-full">Unknown</span>;
    }
  };

  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(`${date}T${time}`);
    return dateObj.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading && appointments.length === 0) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Appointments</h1>
        <button 
          onClick={() => navigate('/client/appointments/new')} 
          className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          New Appointment
        </button>
      </div>

      <div className="mb-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm rounded-md ${
              filter === 'all' ? 'bg-gray-200 text-gray-800' : 'bg-white text-gray-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 text-sm rounded-md ${
              filter === 'pending' ? 'bg-yellow-200 text-yellow-800' : 'bg-white text-gray-600'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('confirmed')}
            className={`px-3 py-1 text-sm rounded-md ${
              filter === 'confirmed' ? 'bg-green-200 text-green-800' : 'bg-white text-gray-600'
            }`}
          >
            Confirmed
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-3 py-1 text-sm rounded-md ${
              filter === 'cancelled' ? 'bg-red-200 text-red-800' : 'bg-white text-gray-600'
            }`}
          >
            Cancelled
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-md">{error}</div>
      )}

      {appointments.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-lg shadow">
          <p className="text-gray-500">No appointments found</p>
        </div>
      ) : (
        <div className="overflow-hidden bg-white shadow sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {appointments.map((appointment) => (
              <li key={appointment.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600 truncate">{appointment.title}</p>
                      <p className="text-sm text-gray-500">
                        with Dr. {appointment.professional?.name || 'Unknown'}
                      </p>
                    </div>
                    <div className="flex items-center">
                      {getStatusBadge(appointment.status)}
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        {formatDateTime(appointment.date, appointment.startTime)}
                      </p>
                    </div>
                    <div className="flex mt-2 space-x-2 sm:mt-0">
                      <button 
                        onClick={() => navigate(`/client/appointments/${appointment.id}`)}
                        className="px-3 py-1 text-xs text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200"
                      >
                        View
                      </button>
                      {appointment.status !== 'cancelled' && (
                        <button 
                          onClick={() => handleCancelAppointment(appointment.id)}
                          className="px-3 py-1 text-xs text-red-700 bg-red-100 rounded-md hover:bg-red-200"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}; 