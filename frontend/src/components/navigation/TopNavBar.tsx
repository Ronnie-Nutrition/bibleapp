import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, Avatar } from '@mui/material';
import { ArrowBack, Notifications } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import iOSTheme from '../../theme/theme';

interface TopNavBarProps {
  title?: string;
  showBack?: boolean;
  showProfile?: boolean;
  showNotifications?: boolean;
}

const TopNavBar: React.FC<TopNavBarProps> = ({ 
  title, 
  showBack = false, 
  showProfile = true,
  showNotifications = false 
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();


  // Hide nav bar on certain pages
  const hideOnPaths = ['/auth', '/lesson/'];
  const shouldHide = hideOnPaths.some(path => location.pathname.includes(path));

  if (shouldHide) {
    return null;
  }

  // Determine title based on current route
  const getTitle = () => {
    if (title) return title;
    
    const pathToTitle: { [key: string]: string } = {
      '/home': 'Bible Business',
      '/profile': 'Profile',
      '/settings': 'Settings',
    };
    
    return pathToTitle[location.pathname] || 'Bible Business';
  };

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        height: iOSTheme.sizes.navigationBarHeight,
        backgroundColor: 'rgba(255, 255, 255, 0.82)',
        backdropFilter: 'blur(12px) saturate(160%)',
        border: '1px solid rgba(255, 255, 255, 0.28)',
        borderRadius: iOSTheme.borderRadius.medium,
        boxShadow: iOSTheme.shadows.medium,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `0 ${iOSTheme.spacing.lg}`,
        zIndex: 999,
      }}
    >
      {/* Left Side */}
      <Box sx={{ display: 'flex', alignItems: 'center', minWidth: '44px' }}>
        {showBack && (
          <IconButton 
            onClick={() => navigate(-1)}
            sx={{ marginLeft: `-${iOSTheme.spacing.sm}` }}
          >
            <ArrowBack />
          </IconButton>
        )}
      </Box>

      {/* Center - Title */}
      <Typography
        sx={{
          fontSize: iOSTheme.typography.headline.fontSize,
          fontWeight: iOSTheme.typography.headline.fontWeight,
          color: iOSTheme.colors.textPrimary,
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          whiteSpace: 'nowrap',
        }}
      >
        {getTitle()}
      </Typography>

      {/* Right Side */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: '44px' }}>
        {showNotifications && (
          <IconButton size="small">
            <Notifications />
          </IconButton>
        )}
        
        {showProfile && user && (
          <Avatar
            src={user.photoURL || undefined}
            sx={{
              width: 30,
              height: 30,
              backgroundColor: iOSTheme.colors.primary,
              fontSize: iOSTheme.typography.footnote.fontSize,
              fontWeight: 600,
              cursor: 'pointer',
            }}
            onClick={() => navigate('/profile')}
          >
            {user.displayName?.charAt(0) || user.email?.charAt(0)}
          </Avatar>
        )}
      </Box>
    </Box>
  );
};

export default TopNavBar;