import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { config } from '../../../infrastructure/config';
import { UserRole } from '../../../domain/entities/UserRole';

export const UserProfile = () => {
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specialty: '',
    licenseNumber: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        specialty: user.specialty || '',
        licenseNumber: user.licenseNumber || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token || !user) {
        throw new Error('Não autenticado');
      }

      // Log para depuração
      console.log('Token de autenticação:', token);
      console.log('Dados a serem enviados:', {
        id: user.id,
        name: formData.name,
        ...(user.role === UserRole.PROFESSIONAL ? {
          specialty: formData.specialty,
          licenseNumber: formData.licenseNumber,
        } : {})
      });
      console.log('URL da API:', `${config.apiUrl}/users/${user.id}`);

      // Apenas enviamos os campos que podem ser atualizados
      const dataToSend = {
        name: formData.name,
        ...(user.role === UserRole.PROFESSIONAL ? {
          specialty: formData.specialty,
          licenseNumber: formData.licenseNumber,
        } : {})
      };

      const response = await axios.put(
        `${config.apiUrl}/users/${user.id}`,
        dataToSend,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      console.log('Resposta da API:', response.data);
      
      // Refresh user data in context
      await refreshUser();
      
      toast.success('Perfil atualizado com sucesso!');
      setIsEditing(false);
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      console.error('Detalhes do erro:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError(error.response?.data?.message || error.message || 'Erro ao atualizar perfil');
      toast.error('Falha ao atualizar perfil: ' + (error.response?.data?.message || error.message || 'Erro desconhecido'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Você precisa estar logado para ver seu perfil.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
          <h1 className="text-2xl font-semibold text-white">Meu Perfil</h1>
        </div>

        <div className="p-6">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nome
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition duration-150"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 text-gray-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">O email não pode ser alterado.</p>
                </div>

                {user.role === UserRole.PROFESSIONAL && (
                  <>
                    <div>
                      <label htmlFor="specialty" className="block text-sm font-medium text-gray-700">
                        Especialidade
                      </label>
                      <input
                        type="text"
                        id="specialty"
                        name="specialty"
                        value={formData.specialty}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition duration-150"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
                        Número de Registro
                      </label>
                      <input
                        type="text"
                        id="licenseNumber"
                        name="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition duration-150"
                        required
                      />
                    </div>
                  </>
                )}
              </div>

              {error && (
                <div className="p-4 text-sm text-red-700 bg-red-50 rounded-md border border-red-200">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    // Reset form data to original values
                    if (user) {
                      setFormData({
                        name: user.name || '',
                        email: user.email || '',
                        specialty: user.specialty || '',
                        licenseNumber: user.licenseNumber || '',
                      });
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 transition duration-150"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Salvando...
                    </span>
                  ) : (
                    'Salvar Alterações'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500">Nome</h3>
                  <p className="mt-1 text-base font-medium text-gray-900">{user.name}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p className="mt-1 text-base font-medium text-gray-900">{user.email}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500">Tipo de Usuário</h3>
                  <p className="mt-1 flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === UserRole.CLIENT 
                        ? 'bg-green-100 text-green-800' 
                        : user.role === UserRole.PROFESSIONAL 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {user.role === UserRole.CLIENT
                        ? 'Cliente'
                        : user.role === UserRole.PROFESSIONAL
                        ? 'Profissional'
                        : 'Administrador'}
                    </span>
                  </p>
                </div>

                {user.role === UserRole.PROFESSIONAL && (
                  <>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500">Especialidade</h3>
                      <p className="mt-1 text-base font-medium text-gray-900">{user.specialty || 'Não informada'}</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500">Número de Registro</h3>
                      <p className="mt-1 text-base font-medium text-gray-900">{user.licenseNumber || 'Não informado'}</p>
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar Perfil
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 