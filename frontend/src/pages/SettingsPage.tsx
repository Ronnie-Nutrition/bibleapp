import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Switch } from '@mui/material';
import { ChevronRight } from '@mui/icons-material';
import MainLayout from '../components/layout/MainLayout';
import iOSTheme from '../theme/theme';

const SettingsPage: React.FC = () => {
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);

  const settingsGroups = [
    {
      title: 'Preferences',
      items: [
        {
          primary: 'Push Notifications',
          secondary: 'Receive daily verse reminders',
          action: (
            <Switch
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: iOSTheme.colors.success,
                  '& + .MuiSwitch-track': {
                    backgroundColor: iOSTheme.colors.success,
                  },
                },
              }}
            />
          ),
        },
        {
          primary: 'Dark Mode',
          secondary: 'Coming soon',
          action: (
            <Switch
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
              disabled
            />
          ),
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          primary: 'Version',
          secondary: '1.0.0',
          action: null,
        },
        {
          primary: 'Terms of Service',
          secondary: null,
          action: <ChevronRight sx={{ color: iOSTheme.colors.systemGray2 }} />,
        },
        {
          primary: 'Privacy Policy',
          secondary: null,
          action: <ChevronRight sx={{ color: iOSTheme.colors.systemGray2 }} />,
        },
      ],
    },
  ];

  return (
    <MainLayout>
      <Box sx={{ padding: iOSTheme.spacing.xl }}>
        {settingsGroups.map((group, groupIndex) => (
          <Box key={groupIndex} sx={{ marginBottom: iOSTheme.spacing.xl }}>
            <Typography
              sx={{
                fontSize: iOSTheme.typography.footnote.fontSize,
                color: iOSTheme.colors.systemGray,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginLeft: iOSTheme.spacing.lg,
                marginBottom: iOSTheme.spacing.sm,
              }}
            >
              {group.title}
            </Typography>

            <Paper
              elevation={0}
              sx={{
                backgroundColor: 'white',
                borderRadius: iOSTheme.borderRadius.large,
                border: `1px solid ${iOSTheme.colors.borderLight}`,
                overflow: 'hidden',
              }}
            >
              <List sx={{ padding: 0 }}>
                {group.items.map((item, itemIndex) => (
                  <ListItem
                    key={itemIndex}
                    sx={{
                      padding: `${iOSTheme.spacing.lg} ${iOSTheme.spacing.xl}`,
                      borderBottom: itemIndex < group.items.length - 1 
                        ? `1px solid ${iOSTheme.colors.borderLight}` 
                        : 'none',
                    }}
                  >
                    <ListItemText
                      primary={item.primary}
                      secondary={item.secondary}
                      primaryTypographyProps={{
                        fontSize: iOSTheme.typography.body.fontSize,
                        fontWeight: 500,
                        color: iOSTheme.colors.textPrimary,
                      }}
                      secondaryTypographyProps={{
                        fontSize: iOSTheme.typography.footnote.fontSize,
                        color: iOSTheme.colors.textSecondary,
                      }}
                    />
                    {item.action}
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>
        ))}
      </Box>
    </MainLayout>
  );
};

export default SettingsPage;