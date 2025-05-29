import { useState, useEffect } from 'react';
import type { Appointment } from '../../../domain/entities/Appointment';
import { AppointmentService } from '../../../infrastructure/services/AppointmentService';

interface AppointmentModalProps {
  appointmentId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (id: number) => Promise<void>;
  onCancel?: (id: number) => Promise<void>;
}

export const AppointmentModal = ({ 
  appointmentId, 
  isOpen, 
  onClose, 
  onConfirm, 
  onCancel 
}: AppointmentModalProps) => {
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const appointmentService = new AppointmentService();

  useEffect(() => {
    if (isOpen && appointmentId) {
      fetchAppointmentDetails();
    }
  }, [isOpen, appointmentId]);

  const fetchAppointmentDetails = async () => {
    if (!appointmentId) return;
    
    try {
      setIsLoading(true);
      setError('');
      const data = await appointmentService.getAppointment(appointmentId);
      setAppointment(data);
    } catch (error) {
      console.error('Failed to fetch appointment details:', error);
      setError('Failed to load appointment details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!appointment) return;
    
    try {
      setIsLoading(true);
      setError('');
      
      if (onConfirm) {
        await onConfirm(appointment.id);
        
        // Não buscar os detalhes novamente - apenas fechar o modal
        // Deixe o componente pai (Schedule) atualizar os dados
        onClose();
      }
    } catch (error) {
      console.error('Failed to confirm appointment:', error);
      setError('Failed to confirm appointment');
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!appointment) return;
    
    try {
      setIsLoading(true);
      setError('');
      
      if (onCancel) {
        await onCancel(appointment.id);
        
        // Não buscar os detalhes novamente - apenas fechar o modal
        // Deixe o componente pai (Schedule) atualizar os dados
        onClose();
      }
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      setError('Failed to cancel appointment');
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Appointment Details
                </h3>
                
                {isLoading ? (
                  <div className="mt-4 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : error ? (
                  <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
                    {error}
                  </div>
                ) : appointment ? (
                  <div className="mt-4 space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Title</h4>
                      <p className="text-base font-medium text-gray-900">{appointment.title}</p>
                    </div>
                    
                    {appointment.description && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Description</h4>
                        <p className="text-base text-gray-900">{appointment.description}</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Date</h4>
                        <p className="text-base text-gray-900">
                          {new Date(appointment.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Time</h4>
                        <p className="text-base text-gray-900">
                          {new Date(`${appointment.date}T${appointment.startTime}`).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                          {' - '}
                          {new Date(`${appointment.date}T${appointment.endTime}`).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Client</h4>
                        <p className="text-base text-gray-900">{appointment.client?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Status</h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          appointment.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800' 
                            : appointment.status === 'cancelled' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 text-center text-gray-500">
                    No appointment details available
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            {appointment && appointment.status === 'pending' && onConfirm && (
              <button
                type="button"
                onClick={handleConfirm}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Confirm Appointment
              </button>
            )}
            
            {appointment && appointment.status === 'confirmed' && onCancel && (
              <button
                type="button"
                onClick={handleCancel}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel Appointment
              </button>
            )}
            
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 