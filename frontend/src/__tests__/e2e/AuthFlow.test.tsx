import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AuthWrapper from '../../components/auth/AuthWrapper';
import iOSTheme from '../../theme/theme';

const muiTheme = createTheme({
  palette: {
    primary: { main: iOSTheme.colors.primary },
  },
});

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={muiTheme}>
      {component}
    </ThemeProvider>
  );
};

describe('Authentication Flow E2E', () => {
  it('allows switching between login and register forms', async () => {
    renderWithTheme(<AuthWrapper />);

    // Should start with login form
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();

    // Click sign up link
    const signUpLink = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(signUpLink);

    // Should switch to register form
    await waitFor(() => {
      expect(screen.getByText('Create Account')).toBeInTheDocument();
      expect(screen.getByText('Already have an account?')).toBeInTheDocument();
    });

    // Click sign in link to go back
    const signInLink = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(signInLink);

    // Should be back to login form
    await waitFor(() => {
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    });
  });

  it('validates required fields in login form', async () => {
    renderWithTheme(<AuthWrapper />);

    // Try to submit empty form
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText('Please fill in all fields')).toBeInTheDocument();
    });
  });

  it('validates required fields in register form', async () => {
    renderWithTheme(<AuthWrapper />);

    // Switch to register form
    const signUpLink = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(signUpLink);

    await waitFor(() => {
      expect(screen.getByText('Create Account')).toBeInTheDocument();
    });

    // Try to submit empty form
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(submitButton);

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText('Please fill in all fields')).toBeInTheDocument();
    });
  });

  it('validates password confirmation in register form', async () => {
    renderWithTheme(<AuthWrapper />);

    // Switch to register form
    const signUpLink = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(signUpLink);

    await waitFor(() => {
      expect(screen.getByText('Create Account')).toBeInTheDocument();
    });

    // Fill form with mismatched passwords
    fireEvent.change(screen.getByLabelText(/full name/i), { 
      target: { value: 'Test User' } 
    });
    fireEvent.change(screen.getByLabelText(/email/i), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getAllByLabelText(/password/i)[0], { 
      target: { value: 'password123' } 
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { 
      target: { value: 'differentpassword' } 
    });

    // Try to submit
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(submitButton);

    // Should show password mismatch error
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });
});