import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthGuard } from '../AuthGuard';
import { UserRole } from '../../../../domain/entities/UserRole';

// Mock the useAuth hook
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock the useLocation hook
const mockLocation = { pathname: '/test', state: {} };
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => mockLocation,
}));

describe('AuthGuard', () => {
  const TestComponent = () => <div>Protected Content</div>;

  it('shows loading state when authentication is in progress', () => {
    const mockUseAuth = jest.requireMock('../../../contexts/AuthContext').useAuth;
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: true,
    });

    render(
      <MemoryRouter>
        <AuthGuard>
          <TestComponent />
        </AuthGuard>
      </MemoryRouter>
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('redirects to login when user is not authenticated', () => {
    const mockUseAuth = jest.requireMock('../../../contexts/AuthContext').useAuth;
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/"
            element={
              <AuthGuard>
                <TestComponent />
              </AuthGuard>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/login page/i)).toBeInTheDocument();
  });

  it('renders children when user is authenticated and no roles are required', () => {
    const mockUseAuth = jest.requireMock('../../../contexts/AuthContext').useAuth;
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        role: UserRole.CLIENT,
      },
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <AuthGuard>
          <TestComponent />
        </AuthGuard>
      </MemoryRouter>
    );

    expect(screen.getByText(/protected content/i)).toBeInTheDocument();
  });

  it('redirects to appropriate dashboard when user role does not match required roles', () => {
    const mockUseAuth = jest.requireMock('../../../contexts/AuthContext').useAuth;
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        role: UserRole.CLIENT,
      },
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <Routes>
          <Route path="/professional/dashboard" element={<div>Professional Dashboard</div>} />
          <Route
            path="/"
            element={
              <AuthGuard allowedRoles={[UserRole.PROFESSIONAL]}>
                <TestComponent />
              </AuthGuard>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByText(/protected content/i)).not.toBeInTheDocument();
  });

  it('renders children when user role matches required roles', () => {
    const mockUseAuth = jest.requireMock('../../../contexts/AuthContext').useAuth;
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        role: UserRole.PROFESSIONAL,
      },
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <AuthGuard allowedRoles={[UserRole.PROFESSIONAL]}>
          <TestComponent />
        </AuthGuard>
      </MemoryRouter>
    );

    expect(screen.getByText(/protected content/i)).toBeInTheDocument();
  });
}); 