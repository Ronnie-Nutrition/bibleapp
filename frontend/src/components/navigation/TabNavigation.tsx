import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { Home, MenuBook, Person, Settings } from '@mui/icons-material';
import iOSTheme from '../../theme/theme';

interface TabItem {
  label: string;
  icon: React.ReactElement;
  path: string;
}

const tabs: TabItem[] = [
  { label: 'Home', icon: <Home />, path: '/home' },
  { label: 'Lessons', icon: <MenuBook />, path: '/home' },
  { label: 'Profile', icon: <Person />, path: '/profile' },
  { label: 'Settings', icon: <Settings />, path: '/settings' },
];

const TabNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentIndex = tabs.findIndex(tab => tab.path === location.pathname);
  const value = currentIndex >= 0 ? currentIndex : 0;

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    navigate(tabs[newValue].path);
  };

  // Hide tab bar on certain pages
  const hideOnPaths = ['/auth', '/lesson/'];
  const shouldHide = hideOnPaths.some(path => location.pathname.includes(path));

  if (shouldHide) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTop: `1px solid ${iOSTheme.colors.borderLight}`,
        paddingBottom: 'env(safe-area-inset-bottom)', // iOS safe area
        zIndex: 1000,
      }}
    >
      <BottomNavigation
        value={value}
        onChange={handleChange}
        sx={{
          height: iOSTheme.sizes.tabBarHeight,
          backgroundColor: 'white',
          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            padding: '6px 0',
            color: iOSTheme.colors.systemGray,
            '&.Mui-selected': {
              color: iOSTheme.colors.primary,
            },
            '& .MuiSvgIcon-root': {
              fontSize: '24px',
              marginBottom: '2px',
            },
            '& .MuiBottomNavigationAction-label': {
              fontSize: iOSTheme.typography.caption2.fontSize,
              fontWeight: 500,
              '&.Mui-selected': {
                fontWeight: 600,
              },
            },
          },
        }}
      >
        {tabs.map((tab, index) => (
          <BottomNavigationAction
            key={index}
            label={tab.label}
            icon={tab.icon}
          />
        ))}
      </BottomNavigation>
    </Box>
  );
};

export default TabNavigation;