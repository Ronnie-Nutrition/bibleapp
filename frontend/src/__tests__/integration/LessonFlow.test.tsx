import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';
import LessonList from '../../components/lessons/LessonList';
import lessonService from '../../services/lesson.service';
import iOSTheme from '../../theme/theme';

// Mock the lesson service
jest.mock('../../services/lesson.service');
const mockedLessonService = lessonService as jest.Mocked<typeof lessonService>;

const muiTheme = createTheme({
  palette: {
    primary: { main: iOSTheme.colors.primary },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={muiTheme}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </ThemeProvider>
  );
};

const mockLessons = [
  {
    id: '1',
    title: 'Leadership Principles',
    subtitle: 'Learn biblical leadership',
    description: 'A comprehensive guide to biblical leadership',
    content: 'Leadership content here...',
    category: 'Leadership',
    difficulty: 'Beginner' as const,
    duration: 15,
    verses: ['Proverbs 27:17'],
    keyTakeaways: ['Lead by example'],
    practicalSteps: ['Practice servant leadership'],
    order: 1,
  },
  {
    id: '2',
    title: 'Financial Stewardship',
    subtitle: 'Managing resources wisely',
    description: 'Biblical principles for financial management',
    content: 'Financial content here...',
    category: 'Finance',
    difficulty: 'Intermediate' as const,
    duration: 20,
    verses: ['Luke 16:10'],
    keyTakeaways: ['Be faithful in small things'],
    practicalSteps: ['Create a budget'],
    order: 2,
  },
];

const mockCategories = [
  { id: '1', name: 'Leadership', description: 'Leadership lessons', lessonCount: 1 },
  { id: '2', name: 'Finance', description: 'Financial lessons', lessonCount: 1 },
];

describe('Lesson Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedLessonService.getAllLessons.mockResolvedValue(mockLessons);
    mockedLessonService.getCategories.mockResolvedValue(mockCategories);
    mockedLessonService.getUserProgress.mockResolvedValue([]);
  });

  it('displays lessons and allows filtering by category', async () => {
    renderWithProviders(<LessonList />);

    // Wait for lessons to load
    await waitFor(() => {
      expect(screen.getByText('Leadership Principles')).toBeInTheDocument();
      expect(screen.getByText('Financial Stewardship')).toBeInTheDocument();
    });

    // Test category filtering
    const leadershipFilter = screen.getByText('Leadership (1)');
    fireEvent.click(leadershipFilter);

    // Should still show leadership lesson
    expect(screen.getByText('Leadership Principles')).toBeInTheDocument();
  });

  it('allows searching for lessons', async () => {
    renderWithProviders(<LessonList />);

    // Wait for lessons to load
    await waitFor(() => {
      expect(screen.getByText('Leadership Principles')).toBeInTheDocument();
    });

    // Search for leadership
    const searchInput = screen.getByPlaceholderText(/search lessons/i);
    fireEvent.change(searchInput, { target: { value: 'leadership' } });

    // Should show leadership lesson and hide finance lesson
    expect(screen.getByText('Leadership Principles')).toBeInTheDocument();
  });

  it('shows progress information', async () => {
    renderWithProviders(<LessonList />);

    // Wait for lessons to load
    await waitFor(() => {
      expect(screen.getByText('0 of 2 completed (0%)')).toBeInTheDocument();
    });
  });

  it('displays lesson metadata correctly', async () => {
    renderWithProviders(<LessonList />);

    // Wait for lessons to load
    await waitFor(() => {
      // Check lesson duration
      expect(screen.getByText('15 min')).toBeInTheDocument();
      expect(screen.getByText('20 min')).toBeInTheDocument();
      
      // Check difficulty levels
      expect(screen.getByText('Beginner')).toBeInTheDocument();
      expect(screen.getByText('Intermediate')).toBeInTheDocument();
      
      // Check categories
      expect(screen.getByText('Leadership')).toBeInTheDocument();
      expect(screen.getByText('Finance')).toBeInTheDocument();
    });
  });
});