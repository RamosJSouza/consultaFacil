import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DashboardLayout } from '../DashboardLayout';
import { UserRole } from '../../../../domain/entities/UserRole';

// Mock the useAuth hook
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock the useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('DashboardLayout', () => {
  const TestContent = () => <div>Dashboard Content</div>;

  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders dashboard layout with client navigation', () => {
    const mockUseAuth = jest.requireMock('../../../contexts/AuthContext').useAuth;
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        role: UserRole.CLIENT,
        name: 'Test Client',
      },
      logout: jest.fn(),
    });

    render(
      <MemoryRouter>
        <DashboardLayout>
          <TestContent />
        </DashboardLayout>
      </MemoryRouter>
    );

    expect(screen.getByText('ConsultaFácil')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Appointments')).toBeInTheDocument();
    expect(screen.getByText('Professionals')).toBeInTheDocument();
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
  });

  it('renders dashboard layout with professional navigation', () => {
    const mockUseAuth = jest.requireMock('../../../contexts/AuthContext').useAuth;
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        role: UserRole.PROFESSIONAL,
        name: 'Test Professional',
      },
      logout: jest.fn(),
    });

    render(
      <MemoryRouter>
        <DashboardLayout>
          <TestContent />
        </DashboardLayout>
      </MemoryRouter>
    );

    expect(screen.getByText('ConsultaFácil')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Schedule')).toBeInTheDocument();
    expect(screen.getByText('Clients')).toBeInTheDocument();
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
  });

  it('renders dashboard layout with admin navigation', () => {
    const mockUseAuth = jest.requireMock('../../../contexts/AuthContext').useAuth;
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        role: UserRole.SUPERADMIN,
        name: 'Test Admin',
      },
      logout: jest.fn(),
    });

    render(
      <MemoryRouter>
        <DashboardLayout>
          <TestContent />
        </DashboardLayout>
      </MemoryRouter>
    );

    expect(screen.getByText('ConsultaFácil')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
  });

  it('handles logout correctly', async () => {
    const mockLogout = jest.fn();
    const mockUseAuth = jest.requireMock('../../../contexts/AuthContext').useAuth;
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        role: UserRole.CLIENT,
        name: 'Test Client',
      },
      logout: mockLogout,
    });

    render(
      <MemoryRouter>
        <DashboardLayout>
          <TestContent />
        </DashboardLayout>
      </MemoryRouter>
    );

    const signOutButton = screen.getByText('Sign out');
    fireEvent.click(signOutButton);

    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('toggles mobile sidebar', () => {
    const mockUseAuth = jest.requireMock('../../../contexts/AuthContext').useAuth;
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        role: UserRole.CLIENT,
        name: 'Test Client',
      },
      logout: jest.fn(),
    });

    render(
      <MemoryRouter>
        <DashboardLayout>
          <TestContent />
        </DashboardLayout>
      </MemoryRouter>
    );

    // Open sidebar
    const openButton = screen.getByLabelText(/open sidebar/i);
    fireEvent.click(openButton);
    expect(screen.getByRole('navigation')).toHaveClass('translate-x-0');

    // Close sidebar
    const closeButton = screen.getByLabelText(/close sidebar/i);
    fireEvent.click(closeButton);
    expect(screen.getByRole('navigation')).toHaveClass('-translate-x-full');
  });
}); 