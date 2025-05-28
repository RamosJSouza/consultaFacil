import { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { config } from '../../infrastructure/config';
import type { User } from '../../domain/entities/User';
import { UserRole } from '../../domain/entities/UserRole';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
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

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${config.apiUrl}/auth/login`, {
        email,
        password
      });
      
      const { accessToken, user } = response.data;
      
      localStorage.setItem('token', accessToken);
      setUser(user);
      
      // Redirecionar com base no tipo de usuário
      switch (user.role) {
        case UserRole.CLIENT:
          navigate('/client/dashboard');
          break;
        case UserRole.PROFESSIONAL:
          navigate('/professional/dashboard');
          break;
        case UserRole.ADMIN:
        case 'superadmin':
          navigate('/admin/dashboard');
          break;
        default:
          navigate('/');
      }
      
      return user;
    } catch (error: any) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout
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