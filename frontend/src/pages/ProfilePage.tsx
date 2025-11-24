import React from 'react';
import { Box, Typography, Paper, Avatar, Button, Divider } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import iOSTheme from '../theme/theme';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user) {
    return <MainLayout>Loading...</MainLayout>;
  }

  return (
    <MainLayout>
      <Box sx={{ padding: iOSTheme.spacing.xl }}>
        {/* Profile Header */}
        <Paper
          elevation={0}
          sx={{
            backgroundColor: 'white',
            borderRadius: iOSTheme.borderRadius.large,
            padding: iOSTheme.spacing.xl,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: iOSTheme.spacing.xl,
            border: `1px solid ${iOSTheme.colors.borderLight}`,
          }}
        >
          <Avatar
            src={user.photoURL || undefined}
            sx={{
              width: 100,
              height: 100,
              backgroundColor: iOSTheme.colors.primary,
              fontSize: '36px',
              fontWeight: 600,
              marginBottom: iOSTheme.spacing.lg,
            }}
          >
            {user.displayName?.charAt(0) || user.email?.charAt(0)}
          </Avatar>

          <Typography
            sx={{
              fontSize: iOSTheme.typography.title2.fontSize,
              fontWeight: iOSTheme.typography.title2.fontWeight,
              color: iOSTheme.colors.textPrimary,
              marginBottom: iOSTheme.spacing.xs,
            }}
          >
            {user.displayName || 'User'}
          </Typography>

          <Typography
            sx={{
              fontSize: iOSTheme.typography.body.fontSize,
              color: iOSTheme.colors.textSecondary,
            }}
          >
            {user.email}
          </Typography>
        </Paper>

        {/* Stats */}
        <Paper
          elevation={0}
          sx={{
            backgroundColor: 'white',
            borderRadius: iOSTheme.borderRadius.large,
            padding: iOSTheme.spacing.xl,
            marginBottom: iOSTheme.spacing.xl,
            border: `1px solid ${iOSTheme.colors.borderLight}`,
          }}
        >
          <Typography
            sx={{
              fontSize: iOSTheme.typography.headline.fontSize,
              fontWeight: iOSTheme.typography.headline.fontWeight,
              color: iOSTheme.colors.textPrimary,
              marginBottom: iOSTheme.spacing.lg,
            }}
          >
            Your Progress
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                sx={{
                  fontSize: iOSTheme.typography.title1.fontSize,
                  fontWeight: iOSTheme.typography.title1.fontWeight,
                  color: iOSTheme.colors.primary,
                }}
              >
                0
              </Typography>
              <Typography
                sx={{
                  fontSize: iOSTheme.typography.footnote.fontSize,
                  color: iOSTheme.colors.textSecondary,
                }}
              >
                Completed
              </Typography>
            </Box>

            <Divider orientation="vertical" flexItem />

            <Box sx={{ textAlign: 'center' }}>
              <Typography
                sx={{
                  fontSize: iOSTheme.typography.title1.fontSize,
                  fontWeight: iOSTheme.typography.title1.fontWeight,
                  color: iOSTheme.colors.warning,
                }}
              >
                14
              </Typography>
              <Typography
                sx={{
                  fontSize: iOSTheme.typography.footnote.fontSize,
                  color: iOSTheme.colors.textSecondary,
                }}
              >
                Total Lessons
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Actions */}
        <Button
          variant="contained"
          fullWidth
          onClick={handleLogout}
          sx={{
            backgroundColor: iOSTheme.colors.error,
            '&:hover': {
              backgroundColor: iOSTheme.colors.error,
              opacity: 0.9,
            }
          }}
        >
          Sign Out
        </Button>
      </Box>
    </MainLayout>
  );
};

export default ProfilePage;