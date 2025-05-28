import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { config } from '../../../infrastructure/config';
import { UserRole } from '../../../domain/entities/UserRole';
import type { User } from '../../../domain/entities/User';
import type { Availability } from '../../../domain/entities/Availability';

type Specialty = string;
type TimeFrame = 'day' | 'week' | 'month' | 'all';

interface ProfessionalAvailability {
  professionalId: number;
  hasAvailability: {
    day: boolean;
    week: boolean;
    month: boolean;
  };
}

export const Professionals = () => {
  const [professionals, setProfessionals] = useState<User[]>([]);
  const [linkedProfessionals, setLinkedProfessionals] = useState<number[]>([]);
  const [availabilities, setAvailabilities] = useState<ProfessionalAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | 'all'>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<TimeFrame>('all');
  const [showLinkedOnly, setShowLinkedOnly] = useState(false);
  
  // Estados para detalhes do profissional
  const [selectedProfessional, setSelectedProfessional] = useState<User | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfessionals();
  }, []);
  
  useEffect(() => {
    if (professionals.length > 0) {
      checkAvailabilities();
    }
  }, [professionals]);

  const fetchProfessionals = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const [professionalsResponse, linksResponse] = await Promise.all([
        axios.get(`${config.apiUrl}/users/professionals`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${config.apiUrl}/links/client`, {
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
  
  const checkAvailabilities = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Criar um array para armazenar as disponibilidades de cada profissional
      const professionalAvailabilities: ProfessionalAvailability[] = [];
      
      // Para cada profissional, verificar disponibilidades nos próximos dias/semanas/mês
      for (const professional of professionals) {
        try {
          // Obter disponibilidades do profissional
          const availabilityResponse = await axios.get(
            `${config.apiUrl}/availability/professional/${professional.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          const availabilities: Availability[] = availabilityResponse.data;
          
          // Verificar se há disponibilidade para o dia atual (hoje)
          const today = new Date();
          const dayOfWeek = today.getDay(); // 0-6 (Domingo-Sábado)
          
          const hasAvailabilityToday = availabilities.some(
            avail => avail.dayOfWeek === dayOfWeek && avail.isAvailable
          );
          
          // Verificar disponibilidade para a semana
          const hasAvailabilityThisWeek = availabilities.some(avail => avail.isAvailable);
          
          // Considerar que a disponibilidade mensal é verdadeira se houver alguma disponibilidade
          // (isto é uma simplificação, poderia ser mais sofisticado verificando datas específicas)
          const hasAvailabilityThisMonth = hasAvailabilityThisWeek;
          
          professionalAvailabilities.push({
            professionalId: professional.id,
            hasAvailability: {
              day: hasAvailabilityToday,
              week: hasAvailabilityThisWeek,
              month: hasAvailabilityThisMonth
            }
          });
        } catch (err) {
          console.error(`Failed to fetch availability for professional ${professional.id}:`, err);
          // Adicionar profissional com disponibilidade desconhecida (consideramos como não disponível)
          professionalAvailabilities.push({
            professionalId: professional.id,
            hasAvailability: {
              day: false,
              week: false,
              month: false
            }
          });
        }
      }
      
      setAvailabilities(professionalAvailabilities);
    } catch (error) {
      console.error('Error checking availabilities:', error);
    }
  };

  const handleLinkProfessional = async (professionalId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      await axios.post(
        `${config.apiUrl}/links`,
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

      await axios.delete(`${config.apiUrl}/links`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { professionalId }
      });

      setLinkedProfessionals(linkedProfessionals.filter(id => id !== professionalId));
    } catch (error) {
      console.error('Failed to unlink professional:', error);
      setError('Failed to unlink professional. Please try again later.');
    }
  };

  const handleScheduleAppointment = (professionalId: number) => {
    navigate(`/client/appointments/new/${professionalId}`);
  };
  
  const handleViewDetails = (professional: User) => {
    setSelectedProfessional(professional);
    setShowDetails(true);
  };
  
  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedProfessional(null);
  };
  
  // Obter lista de especialidades únicas para o filtro
  const specialties = Array.from(
    new Set(professionals.filter(p => p.specialty).map(p => p.specialty as string))
  ).sort();
  
  // Verificar se um profissional tem disponibilidade no período selecionado
  const hasAvailabilityInTimeFrame = (professionalId: number, timeFrame: TimeFrame): boolean => {
    if (timeFrame === 'all') return true;
    
    const availability = availabilities.find(a => a.professionalId === professionalId);
    if (!availability) return false;
    
    return availability.hasAvailability[timeFrame === 'day' ? 'day' : timeFrame === 'week' ? 'week' : 'month'];
  };

  // Filtragem de profissionais com base em todos os filtros
  const filteredProfessionals = professionals.filter(professional => {
    // Filtro por texto (nome e especialidade)
    const matchesSearchTerm = !searchTerm || 
      professional.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (professional.specialty && professional.specialty.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filtro por especialidade
    const matchesSpecialty = selectedSpecialty === 'all' || 
      professional.specialty === selectedSpecialty;
    
    // Filtro por disponibilidade
    const matchesAvailability = hasAvailabilityInTimeFrame(professional.id, availabilityFilter);
    
    // Filtro por vínculo
    const matchesLinked = !showLinkedOnly || linkedProfessionals.includes(professional.id);
    
    return matchesSearchTerm && matchesSpecialty && matchesAvailability && matchesLinked;
  });

  if (isLoading && professionals.length === 0) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Profissionais</h1>
        <p className="mt-2 text-gray-600">Encontre profissionais e agende consultas</p>
      </div>

      {/* Filtros */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Filtros</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Busca por texto */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Buscar por nome ou especialidade
            </label>
            <div className="relative">
              <input
                id="search"
                type="text"
                placeholder="Digite para buscar..."
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
          
          {/* Filtro por especialidade */}
          <div>
            <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-1">
              Especialidade
            </label>
            <select
              id="specialty"
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas as especialidades</option>
              {specialties.map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>
          </div>
          
          {/* Filtro por disponibilidade */}
          <div>
            <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-1">
              Disponibilidade
            </label>
            <select
              id="availability"
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value as TimeFrame)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Qualquer disponibilidade</option>
              <option value="day">Disponível hoje</option>
              <option value="week">Disponível esta semana</option>
              <option value="month">Disponível este mês</option>
            </select>
          </div>
          
          {/* Filtro por vínculo */}
          <div className="flex items-center">
            <input
              id="linkedOnly"
              type="checkbox"
              checked={showLinkedOnly}
              onChange={(e) => setShowLinkedOnly(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="linkedOnly" className="ml-2 block text-sm text-gray-700">
              Mostrar apenas meus profissionais
            </label>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-md">{error}</div>
      )}

      {filteredProfessionals.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-lg shadow">
          <p className="text-gray-500">Nenhum profissional encontrado com os filtros selecionados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProfessionals.map((professional) => {
            const availability = availabilities.find(a => a.professionalId === professional.id);
            
            return (
              <div key={professional.id} className="overflow-hidden bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="px-6 py-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Dr. {professional.name}</h3>
                      {professional.specialty && (
                        <p className="mt-1 text-sm text-gray-500">{professional.specialty}</p>
                      )}
                    </div>
                    {/* Badge de disponibilidade */}
                    {availability && (
                      <div className="flex items-center space-x-1">
                        {availability.hasAvailability.day && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Hoje
                          </span>
                        )}
                        {!availability.hasAvailability.day && availability.hasAvailability.week && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            Esta semana
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Licença (se disponível) */}
                  {professional.licenseNumber && (
                    <p className="mt-2 text-xs text-gray-500">
                      Registro: {professional.licenseNumber}
                    </p>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-between space-x-2">
                      <button
                        onClick={() => handleViewDetails(professional)}
                        className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 flex-1"
                      >
                        Ver detalhes
                      </button>
                      <button
                        onClick={() => handleScheduleAppointment(professional.id)}
                        className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 flex-1"
                      >
                        Agendar
                      </button>
                    </div>
                    <div className="mt-2">
                      {linkedProfessionals.includes(professional.id) ? (
                        <button
                          onClick={() => handleUnlinkProfessional(professional.id)}
                          className="w-full px-3 py-1.5 text-sm text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50"
                        >
                          Remover dos meus profissionais
                        </button>
                      ) : (
                        <button
                          onClick={() => handleLinkProfessional(professional.id)}
                          className="w-full px-3 py-1.5 text-sm text-green-700 bg-white border border-green-300 rounded-md hover:bg-green-50"
                        >
                          Adicionar aos meus profissionais
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Modal de detalhes do profissional */}
      {showDetails && selectedProfessional && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={handleCloseDetails}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Dr. {selectedProfessional.name}
                  </h3>
                  <div className="mt-4">
                    {selectedProfessional.specialty && (
                      <div className="mb-3">
                        <span className="text-sm font-medium text-gray-500">Especialidade:</span>
                        <p className="mt-1">{selectedProfessional.specialty}</p>
                      </div>
                    )}
                    
                    {selectedProfessional.licenseNumber && (
                      <div className="mb-3">
                        <span className="text-sm font-medium text-gray-500">Número de registro:</span>
                        <p className="mt-1">{selectedProfessional.licenseNumber}</p>
                      </div>
                    )}
                    
                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-500">Disponibilidade:</span>
                      <div className="mt-1">
                        {availabilities.find(a => a.professionalId === selectedProfessional.id)?.hasAvailability.day ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
                            Disponível hoje
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mr-2">
                            Indisponível hoje
                          </span>
                        )}
                        
                        {availabilities.find(a => a.professionalId === selectedProfessional.id)?.hasAvailability.week ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Disponível esta semana
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Indisponível esta semana
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-6 border-t border-gray-200 pt-4">
                      <p className="text-sm text-gray-500 mb-4">
                        Para mais detalhes sobre horários disponíveis, clique em "Agendar" e consulte o calendário de disponibilidade.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    handleCloseDetails();
                    handleScheduleAppointment(selectedProfessional.id);
                  }}
                >
                  Agendar consulta
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={handleCloseDetails}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 