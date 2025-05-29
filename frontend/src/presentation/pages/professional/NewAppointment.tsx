import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { AppointmentService } from '../../../infrastructure/services/AppointmentService';
import { UserService } from '../../../infrastructure/services/UserService';
import type { User } from '../../../domain/entities/User';
import axios from 'axios';
import { config } from '../../../infrastructure/config';

export const ProfessionalNewAppointment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const queryParams = new URLSearchParams(location.search);
  const clientIdParam = queryParams.get('clientId');

  const [clients, setClients] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClients, setFilteredClients] = useState<User[]>([]);

  const [formData, setFormData] = useState({
    clientId: clientIdParam || '',
    title: '',
    description: '',
    date: new Date().toISOString().substring(0, 10),
    startTime: '09:00',
    endTime: '10:00',
  });

  useEffect(() => {
    if (user) {
      fetchLinkedClients();
    }
  }, [user]);

  useEffect(() => {
    if (clients.length > 0) {
      filterClients();
    }
  }, [clients, searchTerm]);

  const fetchLinkedClients = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError('');
      
      const userService = new UserService();
      const linkedClients = await userService.getLinkedClients(user.id);
      
      setClients(linkedClients);
      setFilteredClients(linkedClients);
      
      // If we have a clientId from params, find the client and set the name
      if (clientIdParam) {
        const selectedClient = linkedClients.find(c => c.id.toString() === clientIdParam);
        if (selectedClient) {
          setFormData(prev => ({
            ...prev,
            clientId: clientIdParam
          }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch linked clients:', error);
      setError('Failed to load your clients. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterClients = () => {
    if (!searchTerm) {
      setFilteredClients(clients);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = clients.filter(
      c => c.name.toLowerCase().includes(term) || c.email.toLowerCase().includes(term)
    );
    setFilteredClients(filtered);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'startTime') {
      // When start time changes, update end time to be 1 hour later
      const startTime = new Date(`2000-01-01T${value}`);
      const endTime = new Date(startTime.getTime() + 60 * 60000);
      const endTimeStr = endTime.toTimeString().substring(0, 5);
      
      setFormData(prev => ({
        ...prev,
        [name]: value,
        endTime: endTimeStr
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      showToast('Error', 'You must be logged in to create appointments', 'error');
      return;
    }
    
    if (!formData.clientId) {
      setError('Please select a client');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      // Format date and times
      const appointmentData = {
        professionalId: user.id,
        clientId: parseInt(formData.clientId),
        title: formData.title,
        description: formData.description || '',
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime
      };
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Create the appointment
      await axios.post(
        `${config.apiUrl}/appointments`,
        appointmentData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      showToast('Success', 'Appointment created successfully', 'success');
      navigate('/professional/schedule');
    } catch (error: any) {
      console.error('Failed to create appointment:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create appointment';
      setError(errorMessage);
      showToast('Error', errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Create New Appointment</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Updated Client Selection with Auto-Complete */}
          <div>
            <label htmlFor="clientSearch" className="block text-sm font-medium text-gray-700 mb-1">
              Search and Select Client (by name or email)
            </label>
            <div className="relative">
              <input
                type="text"
                id="clientSearch"
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && filteredClients.length > 0) {
                    const selectedClient = filteredClients[0];  // Auto-select first match for simplicity
                    setFormData(prev => ({ ...prev, clientId: selectedClient.id.toString() }));
                    setSearchTerm('');  // Clear search after selection
                    setFilteredClients([]);  // Hide list after selection
                  }
                }}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {filteredClients.length > 0 && (
                <ul className="mt-2 bg-white border rounded shadow">
                  {filteredClients.map(client => (
                    <li key={client.id} onClick={() => {
                      setFormData(prev => ({ ...prev, clientId: client.id.toString() }));
                      setSearchTerm(client.name + ' - ' + client.email);  // Auto-fill input with both for confirmation
                      setFilteredClients([]);  // Hide list
                    }} className="p-2 cursor-pointer hover:bg-gray-100">
                      {client.name} - {client.email}
                    </li>
                  ))}
                </ul>
              )}
              {formData.clientId && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {filteredClients.find(c => c.id.toString() === formData.clientId)?.name} (Email: {filteredClients.find(c => c.id.toString() === formData.clientId)?.email})
                </p>
              )}
            </div>
          </div>

          {/* Appointment Details */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Appointment Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., Consultation, Therapy Session"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Add any additional notes or instructions"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                id="startTime"
                name="startTime"
                type="time"
                value={formData.startTime}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                id="endTime"
                name="endTime"
                type="time"
                value={formData.endTime}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/professional/schedule')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-professional-600 border border-transparent rounded-md shadow-sm hover:bg-professional-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-professional-500 disabled:bg-professional-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 