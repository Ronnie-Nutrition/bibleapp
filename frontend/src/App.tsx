import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import AuthWrapper from './components/auth/AuthWrapper';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LessonList from './components/lessons/LessonList';
import LessonDetail from './components/lessons/LessonDetail';
import iOSTheme from './theme/theme';
import './App.css';

// Create Material UI theme with iOS design tokens
const muiTheme = createTheme({
  palette: {
    primary: {
      main: iOSTheme.colors.primary,
      dark: iOSTheme.colors.primaryDark,
      light: iOSTheme.colors.primaryLight,
    },
    error: {
      main: iOSTheme.colors.error,
    },
    success: {
      main: iOSTheme.colors.success,
    },
    warning: {
      main: iOSTheme.colors.warning,
    },
    background: {
      default: iOSTheme.colors.background,
      paper: iOSTheme.colors.cardBackground,
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/auth" element={<AuthWrapper />} />
            <Route 
              path="/home" 
              element={
                <ProtectedRoute>
                  <LessonList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/lesson/:id" 
              element={
                <ProtectedRoute>
                  <LessonDetail />
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/home" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
