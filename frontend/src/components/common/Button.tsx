import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import iOSTheme from '../../theme/theme';

interface ButtonProps extends MuiButtonProps {
  loading?: boolean;
}

const StyledButton = styled(MuiButton)(({ variant }) => ({
  height: iOSTheme.sizes.buttonHeight,
  borderRadius: iOSTheme.borderRadius.medium,
  textTransform: 'none',
  fontSize: iOSTheme.typography.headline.fontSize,
  fontWeight: iOSTheme.typography.headline.fontWeight,
  letterSpacing: iOSTheme.typography.headline.letterSpacing,
  padding: `0 ${iOSTheme.spacing.lg}`,
  transition: `all ${iOSTheme.animation.fast}`,
  
  ...(variant === 'contained' && {
    backgroundColor: iOSTheme.colors.primary,
    color: 'white',
    boxShadow: 'none',
    '&:hover': {
      backgroundColor: iOSTheme.colors.primaryDark,
      boxShadow: iOSTheme.shadows.small,
    },
    '&:disabled': {
      backgroundColor: iOSTheme.colors.systemGray4,
      color: iOSTheme.colors.systemGray2,
    }
  }),
  
  ...(variant === 'outlined' && {
    borderColor: iOSTheme.colors.primary,
    color: iOSTheme.colors.primary,
    borderWidth: '1px',
    '&:hover': {
      borderColor: iOSTheme.colors.primaryDark,
      backgroundColor: iOSTheme.colors.primaryLight + '10',
    }
  }),
  
  ...(variant === 'text' && {
    color: iOSTheme.colors.primary,
    '&:hover': {
      backgroundColor: iOSTheme.colors.primaryLight + '10',
    }
  })
}));

const Button: React.FC<ButtonProps> = ({ children, loading, disabled, ...props }) => {
  return (
    <StyledButton 
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <CircularProgress size={20} color="inherit" />
      ) : (
        children
      )}
    </StyledButton>
  );
};

export default Button;