import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RegisterForm } from '../RegisterForm';
import { AuthProvider } from '../../../contexts/AuthContext';
import { UserRole } from '../../../../domain/entities/UserRole';

// Mock the useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('RegisterForm', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders register form', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <RegisterForm />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('shows professional-specific fields when professional role is selected', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <RegisterForm />
        </AuthProvider>
      </MemoryRouter>
    );

    const roleSelect = screen.getByLabelText(/role/i);
    fireEvent.change(roleSelect, { target: { value: UserRole.PROFESSIONAL } });

    expect(screen.getByLabelText(/specialty/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/license number/i)).toBeInTheDocument();
  });

  it('navigates to correct dashboard on successful registration', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: UserRole.PROFESSIONAL,
      specialty: 'Dentist',
      licenseNumber: '12345',
      isActive: true,
      createdAt: new Date(),
    };

    // Mock the register function
    const mockRegister = jest.fn().mockResolvedValue({ user: mockUser });
    const mockUseAuth = jest.fn().mockReturnValue({
      register: mockRegister,
      user: mockUser,
    });

    jest.mock('../../../contexts/AuthContext', () => ({
      useAuth: () => mockUseAuth(),
    }));

    render(
      <MemoryRouter>
        <AuthProvider>
          <RegisterForm />
        </AuthProvider>
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const nameInput = screen.getByLabelText(/full name/i);
    const roleSelect = screen.getByLabelText(/role/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(roleSelect, { target: { value: UserRole.PROFESSIONAL } });

    const specialtyInput = screen.getByLabelText(/specialty/i);
    const licenseInput = screen.getByLabelText(/license number/i);

    fireEvent.change(specialtyInput, { target: { value: 'Dentist' } });
    fireEvent.change(licenseInput, { target: { value: '12345' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/professional/dashboard');
    });
  });

  it('shows error message on registration failure', async () => {
    // Mock the register function to reject
    const mockRegister = jest.fn().mockRejectedValue(new Error('Registration failed'));
    const mockUseAuth = jest.fn().mockReturnValue({
      register: mockRegister,
      user: null,
    });

    jest.mock('../../../contexts/AuthContext', () => ({
      useAuth: () => mockUseAuth(),
    }));

    render(
      <MemoryRouter>
        <AuthProvider>
          <RegisterForm />
        </AuthProvider>
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const nameInput = screen.getByLabelText(/full name/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to register/i)).toBeInTheDocument();
    });
  });
}); 