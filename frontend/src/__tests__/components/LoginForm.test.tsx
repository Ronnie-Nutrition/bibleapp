import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import LoginForm from '../../components/auth/LoginForm';
import { AuthProvider } from '../../context/AuthContext';
import iOSTheme from '../../theme/theme';

// Mock Firebase
jest.mock('../../services/firebase.config', () => ({
  auth: {
    currentUser: null,
  },
}));

const muiTheme = createTheme({
  palette: {
    primary: {
      main: iOSTheme.colors.primary,
    },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={muiTheme}>
      <AuthProvider>
        {component}
      </AuthProvider>
    </ThemeProvider>
  );
};

describe('LoginForm', () => {
  const mockOnToggleMode = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form correctly', () => {
    renderWithProviders(
      <LoginForm 
        onToggleMode={mockOnToggleMode} 
        onSuccess={mockOnSuccess} 
      />
    );

    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows validation error for empty fields', async () => {
    renderWithProviders(
      <LoginForm 
        onToggleMode={mockOnToggleMode} 
        onSuccess={mockOnSuccess} 
      />
    );

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please fill in all fields')).toBeInTheDocument();
    });
  });

  it('updates input values when typing', () => {
    renderWithProviders(
      <LoginForm 
        onToggleMode={mockOnToggleMode} 
        onSuccess={mockOnSuccess} 
      />
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('calls onToggleMode when sign up link is clicked', () => {
    renderWithProviders(
      <LoginForm 
        onToggleMode={mockOnToggleMode} 
        onSuccess={mockOnSuccess} 
      />
    );

    const signUpLink = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(signUpLink);

    expect(mockOnToggleMode).toHaveBeenCalledTimes(1);
  });

  it('clears error when input changes', async () => {
    renderWithProviders(
      <LoginForm 
        onToggleMode={mockOnToggleMode} 
        onSuccess={mockOnSuccess} 
      />
    );

    // Trigger validation error
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please fill in all fields')).toBeInTheDocument();
    });

    // Start typing to clear error
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    await waitFor(() => {
      expect(screen.queryByText('Please fill in all fields')).not.toBeInTheDocument();
    });
  });
});