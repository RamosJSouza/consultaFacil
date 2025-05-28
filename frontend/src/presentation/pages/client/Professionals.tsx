import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { config } from '../../../infrastructure/config';
import { UserRole } from '../../../domain/entities/UserRole';
import type { User } from '../../../domain/entities/User';

export const Professionals = () => {
  const [professionals, setProfessionals] = useState<User[]>([]);
  const [linkedProfessionals, setLinkedProfessionals] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const fetchProfessionals = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const [professionalsResponse, linksResponse] = await Promise.all([
        axios.get(`${config.apiUrl}/users`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { role: UserRole.PROFESSIONAL }
        }),
        axios.get(`${config.apiUrl}/links/professional`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setProfessionals(professionalsResponse.data);
      setLinkedProfessionals(linksResponse.data.map((link: any) => link.professionalId));
    } catch (error) {
      console.error('Failed to fetch professionals:', error);
      setError('Failed to load professionals. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkProfessional = async (professionalId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      await axios.post(
        `${config.apiUrl}/links/professional`,
        { professionalId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setLinkedProfessionals([...linkedProfessionals, professionalId]);
    } catch (error) {
      console.error('Failed to link professional:', error);
      setError('Failed to link professional. Please try again later.');
    }
  };

  const handleUnlinkProfessional = async (professionalId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      await axios.delete(`${config.apiUrl}/links/professional/${professionalId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setLinkedProfessionals(linkedProfessionals.filter(id => id !== professionalId));
    } catch (error) {
      console.error('Failed to unlink professional:', error);
      setError('Failed to unlink professional. Please try again later.');
    }
  };

  const handleScheduleAppointment = (professionalId: number) => {
    navigate(`/client/appointments/new?professionalId=${professionalId}`);
  };

  const filteredProfessionals = professionals.filter(professional => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      professional.name.toLowerCase().includes(searchLower) ||
      (professional.specialty && professional.specialty.toLowerCase().includes(searchLower))
    );
  });

  if (isLoading && professionals.length === 0) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Professionals</h1>
        <p className="mt-2 text-gray-600">Find professionals and schedule appointments</p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-md">{error}</div>
      )}

      {filteredProfessionals.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-lg shadow">
          <p className="text-gray-500">No professionals found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProfessionals.map((professional) => (
            <div key={professional.id} className="overflow-hidden bg-white rounded-lg shadow">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">Dr. {professional.name}</h3>
                {professional.specialty && (
                  <p className="mt-1 text-sm text-gray-500">{professional.specialty}</p>
                )}
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => handleScheduleAppointment(professional.id)}
                    className="px-3 py-1 text-sm text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200"
                  >
                    Schedule
                  </button>
                  {linkedProfessionals.includes(professional.id) ? (
                    <button
                      onClick={() => handleUnlinkProfessional(professional.id)}
                      className="px-3 py-1 text-sm text-red-700 bg-red-100 rounded-md hover:bg-red-200"
                    >
                      Unlink
                    </button>
                  ) : (
                    <button
                      onClick={() => handleLinkProfessional(professional.id)}
                      className="px-3 py-1 text-sm text-green-700 bg-green-100 rounded-md hover:bg-green-200"
                    >
                      Link
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 