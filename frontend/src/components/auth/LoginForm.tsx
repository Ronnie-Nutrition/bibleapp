import React, { useState } from 'react';
import { Box, Typography, Alert, Link as MuiLink } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import TextField from '../common/TextField';
import Button from '../common/Button';
import iOSTheme from '../../theme/theme';

interface LoginFormProps {
  onToggleMode: () => void;
  onSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onToggleMode, onSuccess }) => {
  const { login, error } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    if (!formData.email || !formData.password) {
      setFormError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await login(formData.email, formData.password);
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to login';
      if (errorMessage.includes('user-not-found')) {
        setFormError('No account found with this email');
      } else if (errorMessage.includes('wrong-password')) {
        setFormError('Incorrect password');
      } else if (errorMessage.includes('invalid-email')) {
        setFormError('Invalid email address');
      } else {
        setFormError('Login failed. Please try again.');
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
        Welcome Back
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
        autoComplete="current-password"
      />

      <Button
        type="submit"
        variant="contained"
        fullWidth
        loading={loading}
        sx={{ marginTop: iOSTheme.spacing.md }}
      >
        Sign In
      </Button>

      <Typography 
        sx={{ 
          textAlign: 'center',
          fontSize: iOSTheme.typography.footnote.fontSize,
          color: iOSTheme.colors.textSecondary
        }}
      >
        Don't have an account?{' '}
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
          Sign Up
        </MuiLink>
      </Typography>
    </Box>
  );
};

export default LoginForm;