import { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { config } from '../../infrastructure/config';
import type { User } from '../../domain/entities/User';
import { UserRole } from '../../domain/entities/UserRole';
import { toast } from 'react-toastify';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se há um token no localStorage
    const token = localStorage.getItem('token');
    
    if (token) {
      fetchCurrentUser(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchCurrentUser = async (token: string) => {
    try {
      const response = await axios.get(`${config.apiUrl}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      await fetchCurrentUser(token);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${config.apiUrl}/auth/login`, {
        email,
        password
      });
      
      const { accessToken, user } = response.data;
      
      localStorage.setItem('token', accessToken);
      setUser(user);
      
      console.log('Login successful, user role:', user.role);
      
      // Redirecionar com base no tipo de usuário
      switch (user.role) {
        case UserRole.CLIENT:
          console.log('Redirecting to client dashboard');
          navigate('/client/dashboard');
          break;
        case UserRole.PROFESSIONAL:
          console.log('Redirecting to professional dashboard');
          navigate('/professional/dashboard');
          break;
        case UserRole.SUPERADMIN:
          console.log('Redirecting to admin dashboard');
          navigate('/admin/dashboard');
          break;
        default:
          console.log('Unknown role, redirecting to home');
          navigate('/');
      }
      
      toast.success(`Bem-vindo(a), ${user.name}!`);
      return user;
    } catch (error: any) {
      console.error('Login failed:', error);
      toast.error('Falha no login: ' + (error.response?.data?.message || error.message || 'Erro desconhecido'));
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
    toast.info('Você saiu do sistema');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}; 