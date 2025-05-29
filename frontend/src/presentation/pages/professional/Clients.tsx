import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserService } from '../../../infrastructure/services/UserService';
import { AppointmentService } from '../../../infrastructure/services/AppointmentService';
import type { User } from '../../../domain/entities/User';
import type { Appointment } from '../../../domain/entities/Appointment';
import { useNotifications } from '../../contexts/NotificationContext';
import axios from 'axios';
import { config } from '../../../infrastructure/config';

interface ExtendedUser extends User {
  recentAppointments: Appointment[];
  linkStatus?: 'approved' | 'pending';
}

interface PendingLinkRequest {
  id: number;
  clientId: number;
  professionalId: number;
  client: User;
}

export const ProfessionalClients = () => {
  const [clients, setClients] = useState<ExtendedUser[]>([]);
  const [pendingClients, setPendingClients] = useState<ExtendedUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'approved' | 'pending'>('approved');
  const { user } = useAuth();
  const userService = new UserService();
  const appointmentService = new AppointmentService();
  const { showToast } = useNotifications();

  useEffect(() => {
    fetchClients();
  }, [user, activeTab]);

  const fetchClients = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError('');
      
      if (activeTab === 'approved') {
        // Fetch linked clients (approved)
        const linkedClients = await fetchLinkedClients();
        setClients(linkedClients);
      } else {
        // Fetch pending link requests
        const pendingLinkRequests = await fetchPendingLinkRequests();
        setPendingClients(pendingLinkRequests);
      }
    } catch (error) {
      setError('Failed to fetch clients');
      console.error('Error fetching clients:', error);
      showToast('Error', 'Failed to fetch clients', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLinkedClients = async () => {
    if (!user) return [];

    try {
      console.log('Fetching linked clients...');
      
      // Fetch approved clients
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get<User[]>(`${config.apiUrl}/users/${user.id}/linked-clients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Linked clients response:', response.data);
      
      // Fetch recent appointments for each client
      const clientsWithAppointments = await Promise.all(
        response.data.map(async (client) => {
          const appointments = await appointmentService.getAppointments({
            professionalId: user.id,
            clientId: client.id,
          });

          return {
            ...client,
            recentAppointments: appointments.slice(0, 3), // Show only last 3 appointments
            linkStatus: 'approved' as const
          };
        })
      );

      return clientsWithAppointments;
    } catch (error) {
      console.error('Error fetching linked clients:', error);
      return [];
    }
  };

  const fetchPendingLinkRequests = async () => {
    if (!user) return [];

    try {
      console.log('Fetching pending link requests...');
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Fetch pending link requests
      const response = await axios.get<PendingLinkRequest[]>(`${config.apiUrl}/links/professional/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Pending link requests response:', response.data);

      // Transform the response to match the ExtendedUser interface
      const pendingClients: ExtendedUser[] = response.data.map(link => ({
        ...link.client,
        recentAppointments: [],
        linkStatus: 'pending'
      }));

      return pendingClients;
    } catch (error) {
      console.error('Error fetching pending link requests:', error);
      return [];
    }
  };

  const handleApproveLink = async (clientId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      await axios.post(
        `${config.apiUrl}/links/approve`,
        { clientId, professionalId: user?.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Move client from pending to approved list
      const approvedClient = pendingClients.find(client => client.id === clientId);
      if (approvedClient) {
        setClients([...clients, { ...approvedClient, linkStatus: 'approved' }]);
        setPendingClients(pendingClients.filter(client => client.id !== clientId));
      }

      showToast('Success', 'Client link approved successfully', 'success');
    } catch (error) {
      console.error('Failed to approve client link:', error);
      showToast('Error', 'Failed to approve client link', 'error');
    }
  };

  const handleRejectLink = async (clientId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      await axios.delete(`${config.apiUrl}/links`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { clientId, professionalId: user?.id }
      });

      // Remove the client from pending list
      setPendingClients(pendingClients.filter(client => client.id !== clientId));
      showToast('Success', 'Client link request rejected', 'success');
    } catch (error) {
      console.error('Failed to reject client link:', error);
      showToast('Error', 'Failed to reject client link', 'error');
    }
  };

  // Filter clients based on search term
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredClients = activeTab === 'approved' 
    ? clients.filter(client => 
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : pendingClients.filter(client => 
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
                onChange={handleSearch}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-professional-500 focus:border-professional-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('approved')}
              className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === 'approved'
                  ? 'border-professional-500 text-professional-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Approved Clients
              {clients.length > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {clients.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'border-professional-500 text-professional-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending Requests
              {pendingClients.length > 0 && (
                <span className="ml-2 bg-yellow-100 text-yellow-800 py-0.5 px-2.5 rounded-full text-xs">
                  {pendingClients.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {error && (
          <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-md">{error}</div>
        )}

        {activeTab === 'approved' ? (
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
                                  {new Date(appointment.date).toLocaleDateString()}
                                  {' '}
                                  {new Date(`${appointment.date}T${appointment.startTime}`).toLocaleTimeString([], {
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
            {filteredClients.length === 0 && (
              <div className="px-4 py-5 text-center sm:px-6">
                <p className="text-gray-500">
                  {searchTerm ? 'No clients match your search' : 'No approved clients yet'}
                </p>
              </div>
            )}
          </ul>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredClients.map((client) => (
              <li key={client.id} className="px-4 py-5 sm:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{client.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">{client.email}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApproveLink(client.id)}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectLink(client.id)}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </li>
            ))}
            {filteredClients.length === 0 && (
              <div className="px-4 py-5 text-center sm:px-6">
                <p className="text-gray-500">
                  {searchTerm ? 'No pending requests match your search' : 'No pending client requests'}
                </p>
              </div>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}; 