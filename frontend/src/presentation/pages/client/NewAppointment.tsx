import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { config } from '../../../infrastructure/config';
import { useNotifications } from '../../contexts/NotificationContext';
import type { User } from '../../../domain/entities/User';
import type { Availability } from '../../../domain/entities/Availability';
import { UserRole } from '../../../domain/entities/UserRole';

const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

export const NewAppointment = () => {
  const { professionalId } = useParams<{ professionalId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useNotifications();
  
  const [professional, setProfessional] = useState<User | null>(null);
  const [professionals, setProfessionals] = useState<User[]>([]);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    professionalId: professionalId || '',
    title: '',
    description: '',
    date: new Date().toISOString().substring(0, 10),
    dayOfWeek: new Date().getDay(),
    startTime: '',
    endTime: '',
  });

  // Get available time slots for the selected day
  const [availableTimeSlots, setAvailableTimeSlots] = useState<{ startTime: string; endTime: string }[]>([]);

  useEffect(() => {
    fetchProfessionals();
  }, []);

  useEffect(() => {
    if (formData.professionalId) {
      fetchProfessionalDetails(formData.professionalId);
      calculateDayOfWeek();
    }
  }, [formData.professionalId, formData.date]);

  useEffect(() => {
    if (formData.professionalId && formData.dayOfWeek !== undefined) {
      fetchAvailabilities(formData.professionalId, formData.dayOfWeek);
    }
  }, [formData.professionalId, formData.dayOfWeek]);

  const fetchProfessionals = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(`${config.apiUrl}/users`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { role: UserRole.PROFESSIONAL }
      });

      setProfessionals(response.data);
      
      // If no professional is selected yet, but we have professionals, select the first one
      if (!formData.professionalId && response.data.length > 0) {
        setFormData(prev => ({ 
          ...prev, 
          professionalId: response.data[0].id.toString() 
        }));
      }
    } catch (error) {
      console.error('Failed to fetch professionals:', error);
      setError('Failed to load professionals. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProfessionalDetails = async (id: string) => {
    if (!id) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(`${config.apiUrl}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProfessional(response.data);
    } catch (error) {
      console.error('Failed to fetch professional details:', error);
      setError('Failed to load professional details. Please try again later.');
    }
  };

  const fetchAvailabilities = async (professionalId: string, dayOfWeek: number) => {
    try {
      const response = await axios.get(
        `${config.apiUrl}/availability/professional/${professionalId}/day/${dayOfWeek}`
      );

      setAvailabilities(response.data);
      
      // Extract available time slots
      const timeSlots = response.data.map((availability: Availability) => ({
        startTime: availability.startTime,
        endTime: availability.endTime
      }));
      
      setAvailableTimeSlots(timeSlots);
      
      // If we have availabilities and no time is selected, select the first available time
      if (timeSlots.length > 0 && !formData.startTime) {
        setFormData(prev => ({
          ...prev,
          startTime: timeSlots[0].startTime,
          endTime: calculateEndTime(timeSlots[0].startTime)
        }));
      }
    } catch (error) {
      console.error('Failed to fetch availabilities:', error);
      setError('Failed to load professional availability. Please try again later.');
    }
  };

  const calculateDayOfWeek = () => {
    const selectedDate = new Date(formData.date);
    const dayOfWeek = selectedDate.getDay();
    
    setFormData(prev => ({
      ...prev,
      dayOfWeek
    }));
  };

  const calculateEndTime = (startTime: string): string => {
    // Default appointment duration is 1 hour
    const [hours, minutes, seconds] = startTime.split(':').map(Number);
    const endHours = hours + 1;
    return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${(seconds || 0).toString().padStart(2, '0')}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'startTime') {
      // When start time changes, update end time to be 1 hour later
      setFormData(prev => ({
        ...prev,
        [name]: value,
        endTime: calculateEndTime(value)
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      setError('');
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Submit the appointment
      const appointmentData = {
        professionalId: Number(formData.professionalId),
        title: formData.title,
        description: formData.description,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime
      };

      await axios.post(
        `${config.apiUrl}/appointments`,
        appointmentData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      showToast('Success', 'Appointment scheduled successfully', 'success');
      navigate('/client/appointments');
    } catch (error: any) {
      console.error('Failed to schedule appointment:', error);
      const errorMessage = error.response?.data?.message || 'Failed to schedule appointment';
      setError(errorMessage);
      showToast('Error', errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && professionals.length === 0) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Schedule New Appointment</h1>
        <button 
          onClick={() => navigate('/client/appointments')} 
          className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Back to Appointments
        </button>
      </div>

      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-md">{error}</div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="professionalId" className="block text-sm font-medium text-gray-700 mb-1">
                  Professional
                </label>
                <select
                  id="professionalId"
                  name="professionalId"
                  value={formData.professionalId}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a professional</option>
                  {professionals.map(professional => (
                    <option key={professional.id} value={professional.id}>
                      {professional.name} - {professional.specialty}
                    </option>
                  ))}
                </select>
              </div>

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
                  placeholder="e.g., Consultation, Check-up"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Describe your reason for appointment"
                />
              </div>
            </div>

            <div className="space-y-4">
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
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
                {formData.dayOfWeek !== undefined && (
                  <p className="text-sm text-gray-500 mt-1">
                    Selected day: {DAYS_OF_WEEK[formData.dayOfWeek]}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <select
                  id="startTime"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a time</option>
                  {availableTimeSlots.map((slot, index) => (
                    <option key={index} value={slot.startTime}>
                      {slot.startTime.substring(0, 5)}
                    </option>
                  ))}
                </select>
                {availableTimeSlots.length === 0 && formData.date && formData.professionalId && (
                  <p className="text-sm text-red-500 mt-1">
                    No available time slots for this day. Please select another date.
                  </p>
                )}
              </div>

              {professional && (
                <div className="p-4 bg-gray-50 rounded-md">
                  <h3 className="font-medium text-gray-700">Professional Details</h3>
                  <p className="text-sm text-gray-500">Name: {professional.name}</p>
                  <p className="text-sm text-gray-500">Specialty: {professional.specialty}</p>
                  <p className="text-sm text-gray-500">License: {professional.licenseNumber}</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || availableTimeSlots.length === 0}
              className={`px-4 py-2 text-white rounded-md ${
                isSubmitting || availableTimeSlots.length === 0
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? 'Scheduling...' : 'Schedule Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 