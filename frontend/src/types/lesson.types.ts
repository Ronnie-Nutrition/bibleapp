export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  content: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: number; // in minutes
  verses: string[];
  keyTakeaways: string[];
  practicalSteps: string[];
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LessonProgress {
  lessonId: string;
  userId: string;
  completed: boolean;
  completedAt?: Date;
  lastViewedAt?: Date;
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
  lessonCount?: number;
}