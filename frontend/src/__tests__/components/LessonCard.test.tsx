import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import LessonCard from '../../components/lessons/LessonCard';
import { Lesson } from '../../types/lesson.types';
import iOSTheme from '../../theme/theme';

const mockLesson: Lesson = {
  id: '1',
  title: 'Test Lesson',
  subtitle: 'A test lesson for unit testing',
  description: 'This is a test lesson description',
  content: 'Test content',
  category: 'Leadership',
  difficulty: 'Beginner',
  duration: 10,
  verses: ['John 3:16'],
  keyTakeaways: ['Test takeaway'],
  practicalSteps: ['Test step'],
  order: 1,
};

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

describe('LessonCard', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders lesson information correctly', () => {
    renderWithTheme(
      <LessonCard lesson={mockLesson} onClick={mockOnClick} />
    );

    expect(screen.getByText('Test Lesson')).toBeInTheDocument();
    expect(screen.getByText('A test lesson for unit testing')).toBeInTheDocument();
    expect(screen.getByText('Leadership')).toBeInTheDocument();
    expect(screen.getByText('10 min')).toBeInTheDocument();
    expect(screen.getByText('Beginner')).toBeInTheDocument();
  });

  it('shows completed status when lesson is completed', () => {
    renderWithTheme(
      <LessonCard lesson={mockLesson} isCompleted={true} onClick={mockOnClick} />
    );

    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('calls onClick when card is clicked', () => {
    renderWithTheme(
      <LessonCard lesson={mockLesson} onClick={mockOnClick} />
    );

    fireEvent.click(screen.getByRole('button', { hidden: true }));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('displays correct difficulty color', () => {
    const { container } = renderWithTheme(
      <LessonCard lesson={mockLesson} onClick={mockOnClick} />
    );

    const difficultyElement = screen.getByText('Beginner');
    expect(difficultyElement).toHaveStyle({ color: iOSTheme.colors.success });
  });

  it('handles different difficulty levels', () => {
    const intermediateLesson = { ...mockLesson, difficulty: 'Intermediate' as const };
    renderWithTheme(
      <LessonCard lesson={intermediateLesson} onClick={mockOnClick} />
    );

    const difficultyElement = screen.getByText('Intermediate');
    expect(difficultyElement).toHaveStyle({ color: iOSTheme.colors.warning });
  });
});