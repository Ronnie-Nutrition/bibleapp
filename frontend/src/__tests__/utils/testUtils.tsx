import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';
import iOSTheme from '../../theme/theme';

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
  },
});

interface AllTheProvidersProps {
  children: React.ReactNode;
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  return (
    <ThemeProvider theme={muiTheme}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </ThemeProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };