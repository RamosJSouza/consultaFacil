import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { LoginForm } from '../presentation/components/auth/LoginForm';
import { NotificationProvider } from '../presentation/contexts/NotificationContext';
import { AuthProvider } from '../presentation/contexts/AuthContext';
import { NotificationBell } from '../presentation/components/notifications/NotificationBell';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

describe('LoginForm Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('renders login form correctly', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  test('shows validation errors for empty fields', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      </BrowserRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/email é obrigatório/i)).toBeInTheDocument();
      expect(screen.getByText(/senha é obrigatória/i)).toBeInTheDocument();
    });
  });

  test('handles successful login', async () => {
    const mockToken = 'test-token';
    const mockUser = { id: '1', name: 'Test User', email: 'test@example.com', role: 'CLIENT' };

    mockedAxios.post.mockResolvedValueOnce({
      data: { token: mockToken, user: mockUser }
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });

    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: 'password123' }
    });

    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        { email: 'test@example.com', password: 'password123' }
      );
      expect(localStorage.getItem('token')).toBe(mockToken);
    });
  });

  test('handles login error', async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: { data: { message: 'Invalid credentials' } }
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });

    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: 'wrongpassword' }
    });

    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/credenciais inválidas/i)).toBeInTheDocument();
    });
  });
});

describe('NotificationBell Component', () => {
  const mockNotifications = [
    {
      id: '1',
      title: 'New Appointment',
      message: 'You have a new appointment request',
      type: 'appointment_created',
      read: false,
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Appointment Confirmed',
      message: 'Your appointment has been confirmed',
      type: 'appointment_confirmed',
      read: true,
      createdAt: new Date().toISOString()
    }
  ];

  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    mockedAxios.get.mockResolvedValueOnce({
      data: mockNotifications
    });
  });

  test('renders notification bell with correct unread count', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <NotificationBell />
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    // Wait for notifications to load
    await waitFor(() => {
      const unreadBadge = screen.getByText('1');
      expect(unreadBadge).toBeInTheDocument();
    });
  });

  test('opens notification dropdown when clicked', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <NotificationBell />
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    // Wait for notifications to load
    await waitFor(() => {
      const bell = screen.getByLabelText('Notifications');
      fireEvent.click(bell);
      
      expect(screen.getByText('New Appointment')).toBeInTheDocument();
      expect(screen.getByText('Appointment Confirmed')).toBeInTheDocument();
    });
  });
});

// Test for AuthContext
describe('AuthContext', () => {
  test('provides authentication state and methods', async () => {
    const TestComponent = () => {
      const [isLoggedIn, setIsLoggedIn] = React.useState(false);
      
      React.useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
      }, []);
      
      return (
        <div>
          <div data-testid="login-status">{isLoggedIn ? 'Logged In' : 'Logged Out'}</div>
        </div>
      );
    };

    // First render without token
    localStorage.removeItem('token');
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByTestId('login-status')).toHaveTextContent('Logged Out');

    // Now set token and re-render
    localStorage.setItem('token', 'test-token');
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByTestId('login-status')).toHaveTextContent('Logged In');
  });
}); 