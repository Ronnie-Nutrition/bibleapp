import React, { useState } from 'react';
import { Box, Paper } from '@mui/material';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import iOSTheme from '../../theme/theme';

interface AuthWrapperProps {
  onAuthSuccess?: () => void;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ onAuthSuccess }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: iOSTheme.colors.systemGray6,
        padding: iOSTheme.spacing.xl
      }}
    >
      <Paper
        elevation={0}
        sx={{
          backgroundColor: 'white',
          borderRadius: iOSTheme.borderRadius.xlarge,
          boxShadow: iOSTheme.shadows.card,
          width: '100%',
          maxWidth: '500px',
          overflow: 'hidden'
        }}
      >
        {isLoginMode ? (
          <LoginForm 
            onToggleMode={toggleMode}
            onSuccess={onAuthSuccess}
          />
        ) : (
          <RegisterForm 
            onToggleMode={toggleMode}
            onSuccess={onAuthSuccess}
          />
        )}
      </Paper>
    </Box>
  );
};

export default AuthWrapper;