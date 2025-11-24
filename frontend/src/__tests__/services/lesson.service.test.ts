import lessonService from '../../services/lesson.service';
import apiClient from '../../services/api.config';
import { Lesson, Category, LessonProgress } from '../../types/lesson.types';

// Mock the API client
jest.mock('../../services/api.config');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('LessonService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllLessons', () => {
    it('fetches all lessons successfully', async () => {
      const mockLessons: Lesson[] = [
        {
          id: '1',
          title: 'Test Lesson',
          subtitle: 'Test subtitle',
          description: 'Test description',
          content: 'Test content',
          category: 'Leadership',
          difficulty: 'Beginner',
          duration: 10,
          verses: ['John 3:16'],
          keyTakeaways: ['Test takeaway'],
          practicalSteps: ['Test step'],
          order: 1,
        },
      ];

      mockedApiClient.get.mockResolvedValueOnce({ data: mockLessons });

      const result = await lessonService.getAllLessons();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/lessons/');
      expect(result).toEqual(mockLessons);
    });

    it('handles API error', async () => {
      const error = new Error('API Error');
      mockedApiClient.get.mockRejectedValueOnce(error);

      await expect(lessonService.getAllLessons()).rejects.toThrow('API Error');
    });
  });

  describe('getLessonById', () => {
    it('fetches lesson by ID successfully', async () => {
      const mockLesson: Lesson = {
        id: '1',
        title: 'Test Lesson',
        subtitle: 'Test subtitle',
        description: 'Test description',
        content: 'Test content',
        category: 'Leadership',
        difficulty: 'Beginner',
        duration: 10,
        verses: ['John 3:16'],
        keyTakeaways: ['Test takeaway'],
        practicalSteps: ['Test step'],
        order: 1,
      };

      mockedApiClient.get.mockResolvedValueOnce({ data: mockLesson });

      const result = await lessonService.getLessonById('1');

      expect(mockedApiClient.get).toHaveBeenCalledWith('/lessons/1');
      expect(result).toEqual(mockLesson);
    });
  });

  describe('getCategories', () => {
    it('fetches categories successfully', async () => {
      const mockCategories: Category[] = [
        {
          id: '1',
          name: 'Leadership',
          description: 'Leadership lessons',
          lessonCount: 5,
        },
      ];

      mockedApiClient.get.mockResolvedValueOnce({ data: mockCategories });

      const result = await lessonService.getCategories();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/lessons/categories');
      expect(result).toEqual(mockCategories);
    });
  });

  describe('markLessonComplete', () => {
    it('marks lesson as completed successfully', async () => {
      const mockProgress: LessonProgress = {
        lessonId: '1',
        userId: 'user1',
        completed: true,
        completedAt: new Date(),
      };

      mockedApiClient.post.mockResolvedValueOnce({ data: mockProgress });

      const result = await lessonService.markLessonComplete('1');

      expect(mockedApiClient.post).toHaveBeenCalledWith('/progress/complete/1');
      expect(result).toEqual(mockProgress);
    });
  });

  describe('searchLessons', () => {
    it('searches lessons successfully', async () => {
      const mockLessons: Lesson[] = [
        {
          id: '1',
          title: 'Leadership Lesson',
          subtitle: 'Test subtitle',
          description: 'Test description',
          content: 'Test content',
          category: 'Leadership',
          difficulty: 'Beginner',
          duration: 10,
          verses: ['John 3:16'],
          keyTakeaways: ['Test takeaway'],
          practicalSteps: ['Test step'],
          order: 1,
        },
      ];

      mockedApiClient.get.mockResolvedValueOnce({ data: mockLessons });

      const result = await lessonService.searchLessons('leadership');

      expect(mockedApiClient.get).toHaveBeenCalledWith('/lessons/search?q=leadership');
      expect(result).toEqual(mockLessons);
    });

    it('encodes search query properly', async () => {
      mockedApiClient.get.mockResolvedValueOnce({ data: [] });

      await lessonService.searchLessons('test & query');

      expect(mockedApiClient.get).toHaveBeenCalledWith('/lessons/search?q=test%20%26%20query');
    });
  });
});