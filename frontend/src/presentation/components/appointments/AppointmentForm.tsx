import { useState, useEffect } from 'react';
import { AppointmentService } from '../../../infrastructure/services/AppointmentService';
import { UserService } from '../../../infrastructure/services/UserService';
import type { Appointment } from '../../../domain/entities/Appointment';
import type { User } from '../../../domain/entities/User';
import { UserRole } from '../../../domain/entities/UserRole';
import { useAuth } from '../../contexts/AuthContext';

interface AppointmentFormProps {
  appointment?: Appointment;
  onSave: (appointment: Appointment) => void;
  onCancel: () => void;
  mode: 'create' | 'edit';
}

interface FormData {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  professionalId: string;
  clientId: string;
}

export const AppointmentForm = ({ appointment, onSave, onCancel, mode }: AppointmentFormProps) => {
  const { user: currentUser } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    professionalId: '',
    clientId: '',
  });
  const [professionals, setProfessionals] = useState<User[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userService = new UserService();
        const [fetchedProfessionals, fetchedClients] = await Promise.all([
          userService.getUsers({ role: UserRole.PROFESSIONAL }),
          userService.getUsers({ role: UserRole.CLIENT }),
        ]);

        setProfessionals(fetchedProfessionals);
        setClients(fetchedClients);

        if (appointment) {
          setFormData({
            title: appointment.title,
            description: appointment.description || '',
            startTime: new Date(appointment.startTime).toISOString().slice(0, 16),
            endTime: new Date(appointment.endTime).toISOString().slice(0, 16),
            professionalId: appointment.professional.id,
            clientId: appointment.client.id,
          });
        } else if (currentUser) {
          // Pre-fill based on current user's role
          if (currentUser.role === UserRole.PROFESSIONAL) {
            setFormData(prev => ({ ...prev, professionalId: currentUser.id }));
          } else if (currentUser.role === UserRole.CLIENT) {
            setFormData(prev => ({ ...prev, clientId: currentUser.id }));
          }
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
        setError('Failed to load users');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [appointment, currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const appointmentService = new AppointmentService();
      const startTime = new Date(formData.startTime);
      const endTime = new Date(formData.endTime);

      const appointmentData = {
        title: formData.title,
        description: formData.description,
        date: new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate()),
        startTime,
        endTime,
        professionalId: formData.professionalId,
        clientId: formData.clientId,
      };

      const savedAppointment = appointment
        ? await appointmentService.updateAppointment(appointment.id, appointmentData)
        : await appointmentService.createAppointment(appointmentData);

      onSave(savedAppointment);
    } catch (error) {
      console.error('Failed to save appointment:', error);
      setError('Failed to save appointment. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
            Start Time
          </label>
          <input
            type="datetime-local"
            id="startTime"
            required
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
            End Time
          </label>
          <input
            type="datetime-local"
            id="endTime"
            required
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      {currentUser?.role !== UserRole.PROFESSIONAL && (
        <div>
          <label htmlFor="professional" className="block text-sm font-medium text-gray-700">
            Professional
          </label>
          <select
            id="professional"
            required
            value={formData.professionalId}
            onChange={(e) => setFormData({ ...formData, professionalId: e.target.value })}
            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Select a professional</option>
            {professionals.map((professional) => (
              <option key={professional.id} value={professional.id}>
                {professional.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {currentUser?.role !== UserRole.CLIENT && (
        <div>
          <label htmlFor="client" className="block text-sm font-medium text-gray-700">
            Client
          </label>
          <select
            id="client"
            required
            value={formData.clientId}
            onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Select a client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {mode === 'create' ? 'Create Appointment' : 'Update Appointment'}
        </button>
      </div>
    </form>
  );
}; 