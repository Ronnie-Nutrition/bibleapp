import apiClient from './api.config';
import { Lesson, LessonProgress, Category } from '../types/lesson.types';

class LessonService {
  // Get all lessons
  async getAllLessons(): Promise<Lesson[]> {
    const response = await apiClient.get<Lesson[]>('/lessons/');
    return response.data;
  }

  // Get lesson by ID
  async getLessonById(id: string): Promise<Lesson> {
    const response = await apiClient.get<Lesson>(`/lessons/${id}`);
    return response.data;
  }

  // Get lessons by category
  async getLessonsByCategory(categoryId: string): Promise<Lesson[]> {
    const response = await apiClient.get<Lesson[]>(`/lessons/category/${categoryId}`);
    return response.data;
  }

  // Get all categories
  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get<Category[]>('/lessons/categories');
    return response.data;
  }

  // Get user's lesson progress
  async getUserProgress(): Promise<LessonProgress[]> {
    const response = await apiClient.get<LessonProgress[]>('/progress/');
    return response.data;
  }

  // Mark lesson as completed
  async markLessonComplete(lessonId: string): Promise<LessonProgress> {
    const response = await apiClient.post<LessonProgress>(`/progress/complete/${lessonId}`);
    return response.data;
  }

  // Update lesson progress (notes, etc)
  async updateProgress(lessonId: string, data: Partial<LessonProgress>): Promise<LessonProgress> {
    const response = await apiClient.put<LessonProgress>(`/progress/${lessonId}`, data);
    return response.data;
  }

  // Search lessons
  async searchLessons(query: string): Promise<Lesson[]> {
    const response = await apiClient.get<Lesson[]>(`/lessons/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }
}

export default new LessonService();