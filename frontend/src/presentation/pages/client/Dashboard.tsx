import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AppointmentService } from '../../../infrastructure/services/AppointmentService';
import { UserService } from '../../../infrastructure/services/UserService';
import type { Appointment } from '../../../domain/entities/Appointment';
import type { User } from '../../../domain/entities/User';

export const ClientDashboard = () => {
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [linkedProfessionals, setLinkedProfessionals] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        const appointmentService = new AppointmentService();
        const userService = new UserService();
        
        const [appointments, professionals] = await Promise.all([
          appointmentService.getAppointments({
            clientId: user.id,
            startDate: new Date(),
          }),
          userService.getLinkedProfessionals(user.id),
        ]);
        
        setUpcomingAppointments(appointments.slice(0, 5)); // Show only next 5 appointments
        setLinkedProfessionals(professionals);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Welcome, {user?.name}</h1>
        <Link
          to="/client/appointments/new"
          className="px-4 py-2 text-sm font-medium text-white bg-client-500 rounded-md hover:bg-client-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-client-500"
        >
          New Appointment
        </Link>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming Appointments */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Upcoming Appointments</h2>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {upcomingAppointments.length === 0 ? (
              <p className="text-gray-500">No upcoming appointments</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {upcomingAppointments.map((appointment) => (
                  <li key={appointment.id} className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{appointment.title}</p>
                        <p className="text-sm text-gray-500">
                          with Dr. {appointment.professional.name}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(appointment.startTime).toLocaleDateString()}
                        {' '}
                        {new Date(appointment.startTime).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4">
              <Link
                to="/client/appointments"
                className="text-sm font-medium text-client-500 hover:text-client-600"
              >
                View all appointments →
              </Link>
            </div>
          </div>
        </div>
        
        {/* Linked Professionals */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">My Professionals</h2>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {linkedProfessionals.length === 0 ? (
              <p className="text-gray-500">No linked professionals</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {linkedProfessionals.map((professional) => (
                  <li key={professional.id} className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Dr. {professional.name}
                        </p>
                        <p className="text-sm text-gray-500">{professional.specialty}</p>
                      </div>
                      <Link
                        to={`/client/appointments/new?professionalId=${professional.id}`}
                        className="text-sm font-medium text-client-500 hover:text-client-600"
                      >
                        Schedule
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4">
              <Link
                to="/client/professionals"
                className="text-sm font-medium text-client-500 hover:text-client-600"
              >
                Find more professionals →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 