import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../../domain/entities/UserRole';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const AuthGuard = ({ children, allowedRoles }: AuthGuardProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirecionar para a dashboard correspondente ao papel do usuário
    if (user.role === UserRole.CLIENT) {
      return <Navigate to="/client/dashboard" replace />;
    } else if (user.role === UserRole.PROFESSIONAL) {
      return <Navigate to="/professional/dashboard" replace />;
    } else if (user.role === UserRole.SUPERADMIN) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    
    // Fallback para login se a role não for reconhecida
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}; 