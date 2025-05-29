import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { config } from '../../../infrastructure/config';
import { useNotifications } from '../../contexts/NotificationContext';
import type { User } from '../../../domain/entities/User';
import type { Availability } from '../../../domain/entities/Availability';
import { UserRole } from '../../../domain/entities/UserRole';
import { debounce } from 'lodash';

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
  const [filteredProfessionals, setFilteredProfessionals] = useState<User[]>([]);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [showProfessionalDropdown, setShowProfessionalDropdown] = useState(false);
  const [availableDays, setAvailableDays] = useState<number[]>([]);
  const [selectedProfessionalName, setSelectedProfessionalName] = useState('');
  
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
    // Limpa mensagens de erro quando o componente é montado
    setError('');
  }, []);

  useEffect(() => {
    if (formData.professionalId) {
      fetchProfessionalDetails(formData.professionalId);
      calculateDayOfWeek();
      fetchAvailableDays(formData.professionalId);
    }
  }, [formData.professionalId]);

  useEffect(() => {
    if (formData.professionalId && formData.dayOfWeek !== undefined) {
      fetchAvailabilities(formData.professionalId, formData.dayOfWeek);
    }
  }, [formData.professionalId, formData.dayOfWeek]);

  useEffect(() => {
    if (professionals.length > 0) {
      // Extract unique specialties
      const uniqueSpecialties = Array.from(
        new Set(professionals.filter(p => p.specialty).map(p => p.specialty))
      ).sort() as string[];
      
      setSpecialties(uniqueSpecialties);
      
      // Apply filters
      filterProfessionals();
    }
  }, [professionals, searchTerm, specialtyFilter]);

  useEffect(() => {
    // Update the date's day of week when it changes
    calculateDayOfWeek();
  }, [formData.date]);

  const filterProfessionals = () => {
    let filtered = [...professionals];
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        p => p.name.toLowerCase().includes(term) || 
             (p.specialty && p.specialty.toLowerCase().includes(term))
      );
    }
    
    // Apply specialty filter
    if (specialtyFilter) {
      filtered = filtered.filter(p => p.specialty === specialtyFilter);
    }
    
    setFilteredProfessionals(filtered);
  };

  const fetchProfessionals = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(`${config.apiUrl}/users/professionals`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProfessionals(response.data);
      setFilteredProfessionals(response.data);
      
      // If we have a professionalId from params, use it
      if (professionalId) {
        setFormData(prev => ({ 
          ...prev, 
          professionalId 
        }));
      }
      
      setError(''); // Limpa mensagens de erro quando os profissionais são carregados com sucesso
    } catch (error) {
      console.error('Failed to fetch professionals:', error);
      setError('Failed to load professionals. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const searchProfessionals = debounce(async (term: string) => {
    if (!term || term.trim() === '') {
      return;
    }
    
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(`${config.apiUrl}/users/professionals/search`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { term }
      });

      setProfessionals(response.data);
    } catch (error) {
      console.error('Failed to search professionals:', error);
    } finally {
      setIsLoading(false);
    }
  }, 500);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length >= 2) {
      searchProfessionals(value);
    } else if (value.length === 0) {
      fetchProfessionals();
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
      setSelectedProfessionalName(response.data.name);
      setError('');
    } catch (error) {
      console.error('Failed to fetch professional details:', error);
      setError('Failed to load professional details. Please try again later.');
    }
  };

  const fetchAvailableDays = async (professionalId: string) => {
    try {
      const response = await axios.get(
        `${config.apiUrl}/availability/professional/${professionalId}/days`
      );

      setAvailableDays(response.data);
      setError('');
    } catch (error) {
      console.error('Failed to fetch available days:', error);
      setError('Failed to load professional availability days. Please try again later.');
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
      } else if (timeSlots.length === 0) {
        // Clear time selection if no slots available
        setFormData(prev => ({
          ...prev,
          startTime: '',
          endTime: ''
        }));
      }
      
      setError('');
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

  const handleProfessionalSelect = (professional: User) => {
    setFormData(prev => ({ 
      ...prev, 
      professionalId: professional.id.toString() 
    }));
    setSelectedProfessionalName(professional.name);
    setSearchTerm(professional.name);
    setShowProfessionalDropdown(false);
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

  // Function to determine if a date should be disabled in the date picker
  const isDateDisabled = (dateString: string): boolean => {
    if (!formData.professionalId || availableDays.length === 0) return false;
    
    const date = new Date(dateString);
    const dayOfWeek = date.getDay();
    
    // Check if this day of week is in the available days
    return !availableDays.includes(dayOfWeek);
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
                <label htmlFor="professionalSearch" className="block text-sm font-medium text-gray-700 mb-1">
                  Search Professional
                </label>
                <div className="relative">
                  <input
                    id="professionalSearch"
                    type="text"
                    placeholder="Type to search by name or specialty..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onFocus={() => setShowProfessionalDropdown(true)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {showProfessionalDropdown && filteredProfessionals.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md max-h-60 overflow-auto">
                      {filteredProfessionals.map(prof => (
                        <div 
                          key={prof.id} 
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleProfessionalSelect(prof)}
                        >
                          <div className="font-medium">{prof.name}</div>
                          {prof.specialty && <div className="text-sm text-gray-500">{prof.specialty}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {formData.professionalId && (
                  <p className="text-sm text-green-600 mt-1">
                    Selected: {selectedProfessionalName}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Specialty
                </label>
                <select
                  id="specialty"
                  value={specialtyFilter}
                  onChange={(e) => setSpecialtyFilter(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">All Specialties</option>
                  {specialties.map(specialty => (
                    <option key={specialty} value={specialty}>
                      {specialty}
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
                  className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                    formData.professionalId && isDateDisabled(formData.date) ? 'bg-red-50 border-red-300' : ''
                  }`}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
                {formData.dayOfWeek !== undefined && (
                  <p className="text-sm text-gray-500 mt-1">
                    Selected day: {DAYS_OF_WEEK[formData.dayOfWeek]}
                    {formData.professionalId && isDateDisabled(formData.date) && (
                      <span className="text-red-500 ml-2">
                        (Professional not available on this day)
                      </span>
                    )}
                  </p>
                )}
                {formData.professionalId && availableDays.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-700">Available days:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {availableDays.map(day => (
                        <span 
                          key={day} 
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {DAYS_OF_WEEK[day]}
                        </span>
                      ))}
                    </div>
                  </div>
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
                  disabled={isDateDisabled(formData.date)}
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
              disabled={
                isSubmitting || 
                availableTimeSlots.length === 0 || 
                !formData.professionalId || 
                isDateDisabled(formData.date)
              }
              className={`px-4 py-2 text-white rounded-md ${
                isSubmitting || 
                availableTimeSlots.length === 0 || 
                !formData.professionalId ||
                isDateDisabled(formData.date)
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