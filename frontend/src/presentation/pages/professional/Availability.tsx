import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { config } from '../../../infrastructure/config';
import { useNotifications } from '../../contexts/NotificationContext';
import type { Availability } from '../../../domain/entities/Availability';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export const ProfessionalAvailability = () => {
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    dayOfWeek: 1, // Default to Monday
    startTime: '08:00:00',
    endTime: '17:00:00',
    isRecurring: true, // Por padrão, as disponibilidades serão recorrentes
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAvailabilities();
  }, []);

  const fetchAvailabilities = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(`${config.apiUrl}/availability`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAvailabilities(response.data);
    } catch (error) {
      console.error('Failed to fetch availabilities:', error);
      setError('Failed to load availabilities. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: target.checked }));
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

      // Check if we're editing an existing availability or creating a new one
      if (editingId) {
        await axios.put(
          `${config.apiUrl}/availability/${editingId}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showToast('Success', 'Availability updated successfully', 'success');
      } else {
        await axios.post(
          `${config.apiUrl}/availability`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showToast('Success', 'Availability created successfully', 'success');
      }
      
      // Reset form and refetch availabilities
      setFormData({
        dayOfWeek: 1,
        startTime: '08:00:00',
        endTime: '17:00:00',
        isRecurring: true,
      });
      setEditingId(null);
      fetchAvailabilities();
    } catch (error: any) {
      console.error('Failed to save availability:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save availability';
      setError(errorMessage);
      showToast('Error', errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (availability: Availability) => {
    setFormData({
      dayOfWeek: availability.dayOfWeek,
      startTime: availability.startTime,
      endTime: availability.endTime,
      isRecurring: availability.isRecurring,
    });
    setEditingId(availability.id);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this availability?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      await axios.delete(`${config.apiUrl}/availability/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showToast('Success', 'Availability deleted successfully', 'success');
      
      // Remove the deleted availability from state
      setAvailabilities(availabilities.filter(a => a.id !== id));
    } catch (error) {
      console.error('Failed to delete availability:', error);
      showToast('Error', 'Failed to delete availability', 'error');
    }
  };

  const handleCancel = () => {
    setFormData({
      dayOfWeek: 1,
      startTime: '08:00:00',
      endTime: '17:00:00',
      isRecurring: true,
    });
    setEditingId(null);
  };

  const filterAvailabilitiesByDay = (day: number | null) => {
    if (day === null) {
      return availabilities;
    }
    return availabilities.filter(a => a.dayOfWeek === day);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  if (isLoading && availabilities.length === 0) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Set Your Availability</h1>
        <button 
          onClick={() => navigate('/professional/schedule')} 
          className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Back to Schedule
        </button>
      </div>

      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-md">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Availability Form */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">
              {editingId ? 'Edit Availability' : 'Add New Availability'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="dayOfWeek" className="block text-sm font-medium text-gray-700 mb-1">
                  Day of Week
                </label>
                <select
                  id="dayOfWeek"
                  name="dayOfWeek"
                  value={formData.dayOfWeek}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  {DAYS_OF_WEEK.map(day => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  id="startTime"
                  name="startTime"
                  type="time"
                  value={formatTime(formData.startTime)}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  id="endTime"
                  name="endTime"
                  type="time"
                  value={formatTime(formData.endTime)}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <div className="flex items-center">
                  <input
                    id="isRecurring"
                    name="isRecurring"
                    type="checkbox"
                    checked={formData.isRecurring}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isRecurring" className="ml-2 block text-sm text-gray-700">
                    Repeats weekly
                  </label>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {formData.isRecurring 
                    ? 'This availability will repeat every week'
                    : 'This is a one-time availability'}
                </p>
              </div>

              <div className="flex justify-end space-x-2">
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                    isSubmitting
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isSubmitting
                    ? 'Saving...'
                    : editingId
                    ? 'Update Availability'
                    : 'Add Availability'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Availability List */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Your Availability</h2>
              <div className="mt-2 flex space-x-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setSelectedDay(null)}
                  className={`px-3 py-1 text-sm rounded-md ${
                    selectedDay === null ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  All Days
                </button>
                {DAYS_OF_WEEK.map(day => (
                  <button
                    key={day.value}
                    onClick={() => setSelectedDay(day.value)}
                    className={`px-3 py-1 text-sm rounded-md ${
                      selectedDay === day.value ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            {filterAvailabilitiesByDay(selectedDay).length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No availabilities set for {selectedDay !== null ? DAYS_OF_WEEK.find(d => d.value === selectedDay)?.label : 'any day'}.
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filterAvailabilitiesByDay(selectedDay).map(availability => (
                  <li key={availability.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-800">
                          {DAYS_OF_WEEK.find(d => d.value === availability.dayOfWeek)?.label}
                          {availability.isRecurring ? 
                            <span className="ml-2 text-xs text-blue-600 font-normal">Repeats weekly</span> : 
                            <span className="ml-2 text-xs text-gray-500 font-normal">One-time only</span>
                          }
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatTime(availability.startTime)} - {formatTime(availability.endTime)}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(availability)}
                          className="px-3 py-1 text-xs text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(availability.id)}
                          className="px-3 py-1 text-xs text-red-700 bg-red-100 rounded-md hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 