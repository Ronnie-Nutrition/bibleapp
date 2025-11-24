import React, { useState } from 'react';
import { Box, InputBase, IconButton } from '@mui/material';
import { Search, Clear } from '@mui/icons-material';
import iOSTheme from '../../theme/theme';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  value, 
  onChange, 
  placeholder = "Search lessons..." 
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: iOSTheme.colors.systemGray6,
        borderRadius: iOSTheme.borderRadius.medium,
        padding: `${iOSTheme.spacing.sm} ${iOSTheme.spacing.md}`,
        border: `1px solid ${isFocused ? iOSTheme.colors.primary : 'transparent'}`,
        transition: `all ${iOSTheme.animation.fast}`,
        boxShadow: isFocused ? `0 0 0 2px ${iOSTheme.colors.primary}20` : 'none',
      }}
    >
      <Search 
        sx={{ 
          color: iOSTheme.colors.systemGray2, 
          marginRight: iOSTheme.spacing.sm,
          fontSize: '20px'
        }} 
      />
      
      <InputBase
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        fullWidth
        sx={{
          fontSize: iOSTheme.typography.body.fontSize,
          color: iOSTheme.colors.textPrimary,
          '& ::placeholder': {
            color: iOSTheme.colors.systemGray2,
            opacity: 1,
          },
        }}
      />

      {value && (
        <IconButton
          size="small"
          onClick={() => onChange('')}
          sx={{ 
            padding: iOSTheme.spacing.xs,
            '&:hover': {
              backgroundColor: iOSTheme.colors.systemGray5,
            }
          }}
        >
          <Clear sx={{ fontSize: '18px', color: iOSTheme.colors.systemGray }} />
        </IconButton>
      )}
    </Box>
  );
};

export default SearchBar;