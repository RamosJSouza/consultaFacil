import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserService } from '../../../infrastructure/services/UserService';
import { AppointmentService } from '../../../infrastructure/services/AppointmentService';
import { User } from '../../../domain/entities/User';
import type { Appointment } from '../../../domain/entities/Appointment';

interface ExtendedUser extends User {
  recentAppointments: Appointment[];
}

export const ProfessionalClients = () => {
  const [clients, setClients] = useState<ExtendedUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const userService = new UserService();
  const appointmentService = new AppointmentService();

  useEffect(() => {
    const fetchClients = async () => {
      if (!user) return;

      try {
        const linkedClients = await userService.getLinkedClients(user.id);
        
        // Fetch recent appointments for each client
        const clientsWithAppointments = await Promise.all(
          linkedClients.map(async (client) => {
            const appointments = await appointmentService.getAppointments({
              professionalId: user.id,
              clientId: client.id,
            });

            return Object.assign(client, {
              recentAppointments: appointments.slice(0, 3), // Show only last 3 appointments
            });
          })
        );

        setClients(clientsWithAppointments);
      } catch (error) {
        setError('Failed to fetch clients');
        console.error('Error fetching clients:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, [user]);

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">My Clients</h1>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <label htmlFor="search" className="sr-only">
                Search clients
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-professional-500 focus:border-professional-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        <ul className="divide-y divide-gray-200">
          {filteredClients.map((client) => (
            <li key={client.id} className="px-4 py-5 sm:px-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{client.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">{client.email}</p>
                  </div>
                  <Link
                    to={`/professional/appointments/new?clientId=${client.id}`}
                    className="px-4 py-2 text-sm font-medium text-white bg-professional-500 rounded-md hover:bg-professional-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-professional-500"
                  >
                    Schedule Appointment
                  </Link>
                </div>

                {client.recentAppointments.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Recent Appointments</h4>
                    <ul className="mt-2 divide-y divide-gray-200">
                      {client.recentAppointments.map((appointment) => (
                        <li key={appointment.id} className="py-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {appointment.title}
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(appointment.startTime).toLocaleDateString()}
                                {' '}
                                {new Date(appointment.startTime).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize" style={{
                              backgroundColor: appointment.status === 'confirmed' ? 'rgb(209, 250, 229)' : 
                                           appointment.status === 'cancelled' ? 'rgb(254, 226, 226)' :
                                           'rgb(254, 243, 199)',
                              color: appointment.status === 'confirmed' ? 'rgb(6, 95, 70)' :
                                    appointment.status === 'cancelled' ? 'rgb(153, 27, 27)' :
                                    'rgb(146, 64, 14)',
                            }}>
                              {appointment.status}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>

        {filteredClients.length === 0 && (
          <div className="px-4 py-5 text-center sm:px-6">
            <p className="text-gray-500">
              {searchTerm ? 'No clients match your search' : 'No clients yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}; 