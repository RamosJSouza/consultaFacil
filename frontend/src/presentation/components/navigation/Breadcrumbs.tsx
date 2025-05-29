import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../../domain/entities/UserRole';

interface Breadcrumb {
  name: string;
  href: string;
  isCurrent: boolean;
}

interface BreadcrumbsProps {
  items: Breadcrumb[];
}

export const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  const { user } = useAuth();
  
  if (!items.length) return null;
  
  // Determinar a rota do dashboard com base no papel do usuário
  const getDashboardRoute = () => {
    if (!user) return '/login';
    
    switch (user.role) {
      case UserRole.CLIENT:
        return '/client/dashboard';
      case UserRole.PROFESSIONAL:
        return '/professional/dashboard';
      case UserRole.SUPERADMIN:
        return '/admin/dashboard';
      default:
        return '/';
    }
  };
  
  return (
    <nav className="px-4 lg:px-6 py-3 bg-gray-100 border-t border-b border-gray-200">
      <ol className="flex items-center flex-wrap space-x-2 text-sm">
        <li className="flex items-center">
          <Link 
            to={getDashboardRoute()}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Dashboard"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </Link>
        </li>
        
        {/* Filtramos o primeiro item (/ Cliente, / Profissional, / Admin) se não for o único item */}
        {items.length > 1 
          ? items.slice(1).map((crumb, index) => (
              <li key={`${crumb.href}-${index}`} className="flex items-center">
                <span className="text-gray-400 mx-1" aria-hidden="true">/</span>
                {crumb.isCurrent ? (
                  <span className="font-medium text-blue-600" aria-current="page">{crumb.name}</span>
                ) : (
                  <Link
                    to={crumb.href}
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    {crumb.name}
                  </Link>
                )}
              </li>
            ))
          : items.map((crumb, index) => (
              <li key={`${crumb.href}-${index}`} className="flex items-center">
                <span className="text-gray-400 mx-1" aria-hidden="true">/</span>
                {crumb.isCurrent ? (
                  <span className="font-medium text-blue-600" aria-current="page">{crumb.name}</span>
                ) : (
                  <Link
                    to={crumb.href}
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    {crumb.name}
                  </Link>
                )}
              </li>
            ))
        }
      </ol>
    </nav>
  );
}; 