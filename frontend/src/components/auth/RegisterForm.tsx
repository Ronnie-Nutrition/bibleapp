import React, { useState } from 'react';
import { Box, Typography, Alert, Link as MuiLink } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import TextField from '../common/TextField';
import Button from '../common/Button';
import iOSTheme from '../../theme/theme';

interface RegisterFormProps {
  onToggleMode: () => void;
  onSuccess?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onToggleMode, onSuccess }) => {
  const { register, error } = useAuth();
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setFormError('');
  };

  const validateForm = (): boolean => {
    if (!formData.displayName || !formData.email || !formData.password || !formData.confirmPassword) {
      setFormError('Please fill in all fields');
      return false;
    }

    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await register(formData.email, formData.password, formData.displayName);
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to register';
      if (errorMessage.includes('email-already-in-use')) {
        setFormError('An account with this email already exists');
      } else if (errorMessage.includes('invalid-email')) {
        setFormError('Invalid email address');
      } else if (errorMessage.includes('weak-password')) {
        setFormError('Password is too weak');
      } else {
        setFormError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: iOSTheme.spacing.lg,
        padding: iOSTheme.spacing.xl,
        maxWidth: '400px',
        margin: '0 auto',
        width: '100%'
      }}
    >
      <Typography 
        variant="h4" 
        sx={{ 
          fontSize: iOSTheme.typography.title1.fontSize,
          fontWeight: iOSTheme.typography.title1.fontWeight,
          textAlign: 'center',
          color: iOSTheme.colors.textPrimary,
          marginBottom: iOSTheme.spacing.lg
        }}
      >
        Create Account
      </Typography>

      {(formError || error) && (
        <Alert 
          severity="error"
          sx={{
            borderRadius: iOSTheme.borderRadius.medium,
            fontSize: iOSTheme.typography.footnote.fontSize
          }}
        >
          {formError || error}
        </Alert>
      )}

      <TextField
        name="displayName"
        label="Full Name"
        value={formData.displayName}
        onChange={handleChange}
        required
        autoComplete="name"
      />

      <TextField
        name="email"
        label="Email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        required
        autoComplete="email"
      />

      <TextField
        name="password"
        label="Password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        required
        autoComplete="new-password"
        helperText="Minimum 6 characters"
      />

      <TextField
        name="confirmPassword"
        label="Confirm Password"
        type="password"
        value={formData.confirmPassword}
        onChange={handleChange}
        required
        autoComplete="new-password"
      />

      <Button
        type="submit"
        variant="contained"
        fullWidth
        loading={loading}
        sx={{ marginTop: iOSTheme.spacing.md }}
      >
        Sign Up
      </Button>

      <Typography 
        sx={{ 
          textAlign: 'center',
          fontSize: iOSTheme.typography.footnote.fontSize,
          color: iOSTheme.colors.textSecondary
        }}
      >
        Already have an account?{' '}
        <MuiLink
          component="button"
          type="button"
          onClick={onToggleMode}
          sx={{
            color: iOSTheme.colors.primary,
            textDecoration: 'none',
            fontWeight: 600,
            '&:hover': {
              textDecoration: 'underline'
            }
          }}
        >
          Sign In
        </MuiLink>
      </Typography>
    </Box>
  );
};

export default RegisterForm;