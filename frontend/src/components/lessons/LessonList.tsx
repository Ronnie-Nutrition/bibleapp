import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert, Grid } from '@mui/material';
import LessonCard from './LessonCard';
import CategoryFilter from './CategoryFilter';
import SearchBar from './SearchBar';
import lessonService from '../../services/lesson.service';
import iOSTheme from '../../theme/theme';
import { Lesson, Category, LessonProgress } from '../../types/lesson.types';

const LessonList: React.FC = () => {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load all data in parallel
      const [lessonsData, categoriesData, progressData] = await Promise.all([
        lessonService.getAllLessons(),
        lessonService.getCategories(),
        lessonService.getUserProgress(),
      ]);

      setLessons(lessonsData);
      setCategories(categoriesData);
      setProgress(progressData);
    } catch (err) {
      setError('Failed to load lessons. Please try again.');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter lessons based on category and search
  const filteredLessons = useMemo(() => {
    let filtered = lessons;

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(lesson => lesson.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(lesson => 
        lesson.title.toLowerCase().includes(query) ||
        lesson.subtitle.toLowerCase().includes(query) ||
        lesson.description.toLowerCase().includes(query) ||
        lesson.category.toLowerCase().includes(query)
      );
    }

    // Sort by order
    return filtered.sort((a, b) => a.order - b.order);
  }, [lessons, selectedCategory, searchQuery]);

  // Check if lesson is completed
  const isLessonCompleted = (lessonId: string): boolean => {
    return progress.some(p => p.lessonId === lessonId && p.completed);
  };

  const handleLessonClick = (lessonId: string) => {
    navigate(`/lesson/${lessonId}`);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress sx={{ color: iOSTheme.colors.primary }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ padding: iOSTheme.spacing.xl }}>
        <Alert severity="error" sx={{ borderRadius: iOSTheme.borderRadius.medium }}>
          {error}
        </Alert>
      </Box>
    );
  }

  const completedCount = progress.filter(p => p.completed).length;
  const completionPercentage = lessons.length > 0 
    ? Math.round((completedCount / lessons.length) * 100) 
    : 0;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ padding: iOSTheme.spacing.xl, paddingBottom: 0 }}>
        <Typography
          variant="h4"
          sx={{
            fontSize: iOSTheme.typography.largeTitle.fontSize,
            fontWeight: iOSTheme.typography.largeTitle.fontWeight,
            lineHeight: iOSTheme.typography.largeTitle.lineHeight,
            color: iOSTheme.colors.textPrimary,
            marginBottom: iOSTheme.spacing.xs,
          }}
        >
          Biblical Lessons
        </Typography>
        
        <Typography
          sx={{
            fontSize: iOSTheme.typography.body.fontSize,
            color: iOSTheme.colors.textSecondary,
            marginBottom: iOSTheme.spacing.lg,
          }}
        >
          {completedCount} of {lessons.length} completed ({completionPercentage}%)
        </Typography>

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search lessons, topics, or verses..."
        />

        {/* Category Filter */}
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />
      </Box>

      {/* Lessons Grid */}
      <Box sx={{ padding: iOSTheme.spacing.xl, paddingTop: 0 }}>
        {filteredLessons.length === 0 ? (
          <Box sx={{ textAlign: 'center', padding: iOSTheme.spacing.xxxl }}>
            <Typography
              sx={{
                fontSize: iOSTheme.typography.body.fontSize,
                color: iOSTheme.colors.textSecondary,
              }}
            >
              No lessons found matching your search.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {filteredLessons.map((lesson) => (
              <Grid item xs={12} sm={6} md={4} key={lesson.id}>
                <LessonCard
                  lesson={lesson}
                  isCompleted={isLessonCompleted(lesson.id)}
                  onClick={() => handleLessonClick(lesson.id)}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default LessonList;