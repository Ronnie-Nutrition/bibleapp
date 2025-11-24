import React from 'react';
import { Box } from '@mui/material';
import TopNavBar from '../navigation/TopNavBar';
import TabNavigation from '../navigation/TabNavigation';
import iOSTheme from '../../theme/theme';

interface MainLayoutProps {
  children: React.ReactNode;
  showTopNav?: boolean;
  showTabNav?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  showTopNav = true,
  showTabNav = true 
}) => {
  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: iOSTheme.colors.background,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {showTopNav && <TopNavBar />}
      
      <Box
        component="main"
        sx={{
          flex: 1,
          paddingBottom: showTabNav ? iOSTheme.sizes.tabBarHeight : 0,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {children}
      </Box>
      
      {showTabNav && <TabNavigation />}
    </Box>
  );
};

export default MainLayout;