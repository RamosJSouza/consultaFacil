import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserService } from '../../../infrastructure/services/UserService';
import type { User } from '../../../domain/entities/User';
import { UserRole } from '../../../domain/entities/UserRole';

export const Professionals = () => {
  const [professionals, setProfessionals] = useState<User[]>([]);
  const [linkedProfessionals, setLinkedProfessionals] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const userService = new UserService();

  useEffect(() => {
    const fetchProfessionals = async () => {
      if (!user) return;

      try {
        const [allProfessionals, linked] = await Promise.all([
          userService.getUsers({ role: UserRole.PROFESSIONAL, isActive: true }),
          userService.getLinkedProfessionals(user.id),
        ]);

        setProfessionals(allProfessionals);
        setLinkedProfessionals(linked);
      } catch (error) {
        setError('Failed to fetch professionals');
        console.error('Error fetching professionals:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfessionals();
  }, [user]);

  const handleLinkProfessional = async (professionalId: string) => {
    if (!user) return;

    try {
      await userService.linkProfessional(user.id, professionalId);
      const updatedLinked = await userService.getLinkedProfessionals(user.id);
      setLinkedProfessionals(updatedLinked);
    } catch (error) {
      console.error('Error linking professional:', error);
    }
  };

  const handleUnlinkProfessional = async (professionalId: string) => {
    if (!user) return;

    try {
      await userService.unlinkProfessional(user.id, professionalId);
      const updatedLinked = await userService.getLinkedProfessionals(user.id);
      setLinkedProfessionals(updatedLinked);
    } catch (error) {
      console.error('Error unlinking professional:', error);
    }
  };

  const specialties = Array.from(
    new Set(professionals.map((p) => p.specialty).filter(Boolean))
  );

  const filteredProfessionals = professionals.filter((professional) => {
    const matchesSearch = professional.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesSpecialty = !selectedSpecialty || professional.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

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
        <h1 className="text-2xl font-semibold text-gray-900">Find Professionals</h1>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <label htmlFor="search" className="sr-only">
                Search professionals
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-client-500 focus:border-client-500 sm:text-sm"
              />
            </div>
            <div className="sm:w-64">
              <label htmlFor="specialty" className="sr-only">
                Filter by specialty
              </label>
              <select
                id="specialty"
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-client-500 focus:border-client-500 sm:text-sm"
              >
                <option value="">All Specialties</option>
                {specialties.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <ul className="divide-y divide-gray-200">
          {filteredProfessionals.map((professional) => {
            const isLinked = linkedProfessionals.some((p) => p.id === professional.id);

            return (
              <li key={professional.id} className="px-4 py-5 sm:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Dr. {professional.name}
                    </h3>
                    {professional.specialty && (
                      <p className="mt-1 text-sm text-gray-500">{professional.specialty}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    {isLinked ? (
                      <>
                        <Link
                          to={`/client/appointments/new?professionalId=${professional.id}`}
                          className="px-4 py-2 text-sm font-medium text-white bg-client-500 rounded-md hover:bg-client-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-client-500"
                        >
                          Schedule Appointment
                        </Link>
                        <button
                          onClick={() => handleUnlinkProfessional(professional.id)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-client-500"
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleLinkProfessional(professional.id)}
                        className="px-4 py-2 text-sm font-medium text-white bg-client-500 rounded-md hover:bg-client-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-client-500"
                      >
                        Add Professional
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}; 