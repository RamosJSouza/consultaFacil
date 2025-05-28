import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../../domain/entities/UserRole';

/**
 * Componente que redireciona o usuário para a página apropriada com base no seu estado de autenticação
 * - Se não estiver autenticado: redireciona para o login
 * - Se estiver autenticado: redireciona para a dashboard correspondente ao seu papel
 */
export const HomeRedirect = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Redirecionar com base no papel do usuário
  switch (user.role) {
    case UserRole.CLIENT:
      return <Navigate to="/client/dashboard" replace />;
    case UserRole.PROFESSIONAL:
      return <Navigate to="/professional/dashboard" replace />;
    case UserRole.SUPERADMIN:
      return <Navigate to="/admin/dashboard" replace />;
    default:
      // Fallback para login se o papel não for reconhecido
      return <Navigate to="/login" replace />;
  }
}; 