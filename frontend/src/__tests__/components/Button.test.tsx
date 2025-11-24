import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Button from '../../components/common/Button';
import iOSTheme from '../../theme/theme';

const muiTheme = createTheme({
  palette: {
    primary: {
      main: iOSTheme.colors.primary,
    },
  },
});

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={muiTheme}>
      {component}
    </ThemeProvider>
  );
};

describe('Button Component', () => {
  it('renders button with text', () => {
    renderWithTheme(<Button>Test Button</Button>);
    
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('shows loading spinner when loading prop is true', () => {
    renderWithTheme(<Button loading>Test Button</Button>);
    
    // Check that the loading spinner is present
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    // Button should be disabled when loading
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled when disabled prop is true', () => {
    renderWithTheme(<Button disabled>Test Button</Button>);
    
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('calls onClick when clicked', () => {
    const mockOnClick = jest.fn();
    renderWithTheme(<Button onClick={mockOnClick}>Test Button</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('renders different variants correctly', () => {
    const { rerender } = renderWithTheme(
      <Button variant="contained">Contained Button</Button>
    );
    
    let button = screen.getByRole('button');
    expect(button).toBeInTheDocument();

    rerender(
      <ThemeProvider theme={muiTheme}>
        <Button variant="outlined">Outlined Button</Button>
      </ThemeProvider>
    );
    
    button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });
});