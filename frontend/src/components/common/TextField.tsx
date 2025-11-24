import React from 'react';
import { TextField as MuiTextField, TextFieldProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import iOSTheme from '../../theme/theme';

const StyledTextField = styled(MuiTextField)({
  '& .MuiInputBase-root': {
    height: iOSTheme.sizes.inputHeight,
    borderRadius: iOSTheme.borderRadius.medium,
    fontSize: iOSTheme.typography.body.fontSize,
    backgroundColor: iOSTheme.colors.systemGray6,
    transition: `all ${iOSTheme.animation.fast}`,
    
    '&:hover': {
      backgroundColor: iOSTheme.colors.systemGray5,
    },
    
    '&.Mui-focused': {
      backgroundColor: 'white',
      boxShadow: `0 0 0 2px ${iOSTheme.colors.primary}`,
    }
  },
  
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: iOSTheme.colors.borderLight,
      borderWidth: '1px',
    },
    '&:hover fieldset': {
      borderColor: iOSTheme.colors.border,
    },
    '&.Mui-focused fieldset': {
      borderColor: 'transparent',
      borderWidth: '1px',
    }
  },
  
  '& .MuiInputLabel-root': {
    fontSize: iOSTheme.typography.body.fontSize,
    color: iOSTheme.colors.systemGray,
    
    '&.Mui-focused': {
      color: iOSTheme.colors.primary,
    }
  },
  
  '& .MuiFormHelperText-root': {
    fontSize: iOSTheme.typography.caption1.fontSize,
    marginLeft: iOSTheme.spacing.xs,
    marginTop: iOSTheme.spacing.xs,
    
    '&.Mui-error': {
      color: iOSTheme.colors.error,
    }
  }
});

const TextField: React.FC<TextFieldProps> = (props) => {
  return <StyledTextField variant="outlined" fullWidth {...props} />;
};

export default TextField;