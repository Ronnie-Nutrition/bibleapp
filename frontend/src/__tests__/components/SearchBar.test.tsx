import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import SearchBar from '../../components/lessons/SearchBar';
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

describe('SearchBar', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default placeholder', () => {
    renderWithTheme(
      <SearchBar value="" onChange={mockOnChange} />
    );

    expect(screen.getByPlaceholderText('Search lessons...')).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    renderWithTheme(
      <SearchBar 
        value="" 
        onChange={mockOnChange} 
        placeholder="Custom placeholder" 
      />
    );

    expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument();
  });

  it('displays current value', () => {
    renderWithTheme(
      <SearchBar value="test search" onChange={mockOnChange} />
    );

    const input = screen.getByDisplayValue('test search');
    expect(input).toBeInTheDocument();
  });

  it('calls onChange when typing', () => {
    renderWithTheme(
      <SearchBar value="" onChange={mockOnChange} />
    );

    const input = screen.getByPlaceholderText('Search lessons...');
    fireEvent.change(input, { target: { value: 'new search' } });

    expect(mockOnChange).toHaveBeenCalledWith('new search');
  });

  it('shows clear button when there is text', () => {
    renderWithTheme(
      <SearchBar value="some text" onChange={mockOnChange} />
    );

    const clearButton = screen.getByRole('button');
    expect(clearButton).toBeInTheDocument();
  });

  it('hides clear button when text is empty', () => {
    renderWithTheme(
      <SearchBar value="" onChange={mockOnChange} />
    );

    const clearButton = screen.queryByRole('button');
    expect(clearButton).not.toBeInTheDocument();
  });

  it('clears text when clear button is clicked', () => {
    renderWithTheme(
      <SearchBar value="some text" onChange={mockOnChange} />
    );

    const clearButton = screen.getByRole('button');
    fireEvent.click(clearButton);

    expect(mockOnChange).toHaveBeenCalledWith('');
  });
});