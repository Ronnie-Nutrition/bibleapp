import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert, 
  Chip,
  Divider,
  IconButton,
  Paper
} from '@mui/material';
import { 
  ArrowBack, 
  AccessTime, 
  LocalOffer, 
  MenuBook,
  CheckCircle,
  BookmarkBorder,
  Bookmark
} from '@mui/icons-material';
import Button from '../common/Button';
import lessonService from '../../services/lesson.service';
import iOSTheme from '../../theme/theme';
import { Lesson, LessonProgress } from '../../types/lesson.types';

const LessonDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<LessonProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [completingLesson, setCompletingLesson] = useState(false);

  useEffect(() => {
    if (id) {
      loadLesson(id);
    }
  }, [id]);

  const loadLesson = async (lessonId: string) => {
    try {
      setLoading(true);
      setError('');
      
      const [lessonData, progressData] = await Promise.all([
        lessonService.getLessonById(lessonId),
        lessonService.getUserProgress(),
      ]);

      setLesson(lessonData);
      
      // Find progress for this lesson
      const lessonProgress = progressData.find(p => p.lessonId === lessonId);
      setProgress(lessonProgress || null);
      
    } catch (err) {
      setError('Failed to load lesson. Please try again.');
      console.error('Error loading lesson:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteLesson = async () => {
    if (!id) return;
    
    try {
      setCompletingLesson(true);
      const updatedProgress = await lessonService.markLessonComplete(id);
      setProgress(updatedProgress);
    } catch (err) {
      console.error('Error completing lesson:', err);
    } finally {
      setCompletingLesson(false);
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // TODO: Implement bookmark functionality
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: iOSTheme.colors.background,
        }}
      >
        <CircularProgress sx={{ color: iOSTheme.colors.primary }} />
      </Box>
    );
  }

  if (error || !lesson) {
    return (
      <Box sx={{ padding: iOSTheme.spacing.xl }}>
        <Alert severity="error" sx={{ borderRadius: iOSTheme.borderRadius.medium }}>
          {error || 'Lesson not found'}
        </Alert>
      </Box>
    );
  }

  const difficultyColors = {
    Beginner: iOSTheme.colors.success,
    Intermediate: iOSTheme.colors.warning,
    Advanced: iOSTheme.colors.error,
  };

  return (
    <Box sx={{ backgroundColor: iOSTheme.colors.background, minHeight: '100vh' }}>
      {/* Header */}
      <Box
        sx={{
          backgroundColor: 'white',
          borderBottom: `1px solid ${iOSTheme.colors.borderLight}`,
          padding: iOSTheme.spacing.lg,
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <IconButton onClick={() => navigate(-1)} sx={{ marginLeft: `-${iOSTheme.spacing.sm}` }}>
            <ArrowBack />
          </IconButton>
          
          <Typography
            sx={{
              fontSize: iOSTheme.typography.headline.fontSize,
              fontWeight: iOSTheme.typography.headline.fontWeight,
              color: iOSTheme.colors.textPrimary,
            }}
          >
            Lesson {lesson.order}
          </Typography>
          
          <IconButton onClick={handleBookmark}>
            {isBookmarked ? (
              <Bookmark sx={{ color: iOSTheme.colors.primary }} />
            ) : (
              <BookmarkBorder />
            )}
          </IconButton>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ padding: iOSTheme.spacing.xl }}>
        {/* Lesson Info Card */}
        <Paper
          elevation={0}
          sx={{
            backgroundColor: 'white',
            borderRadius: iOSTheme.borderRadius.large,
            padding: iOSTheme.spacing.xl,
            marginBottom: iOSTheme.spacing.xl,
            border: `1px solid ${iOSTheme.colors.borderLight}`,
          }}
        >
          {/* Category */}
          <Typography
            sx={{
              color: iOSTheme.colors.primary,
              fontSize: iOSTheme.typography.footnote.fontSize,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: iOSTheme.spacing.sm,
            }}
          >
            {lesson.category}
          </Typography>

          {/* Title */}
          <Typography
            variant="h4"
            sx={{
              fontSize: iOSTheme.typography.title1.fontSize,
              fontWeight: iOSTheme.typography.title1.fontWeight,
              lineHeight: iOSTheme.typography.title1.lineHeight,
              color: iOSTheme.colors.textPrimary,
              marginBottom: iOSTheme.spacing.md,
            }}
          >
            {lesson.title}
          </Typography>

          {/* Subtitle */}
          <Typography
            sx={{
              fontSize: iOSTheme.typography.body.fontSize,
              color: iOSTheme.colors.textSecondary,
              marginBottom: iOSTheme.spacing.lg,
            }}
          >
            {lesson.subtitle}
          </Typography>

          {/* Meta Info */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip
              icon={<AccessTime sx={{ fontSize: '16px' }} />}
              label={`${lesson.duration} minutes`}
              size="small"
              sx={{ 
                backgroundColor: iOSTheme.colors.systemGray6,
                fontSize: iOSTheme.typography.footnote.fontSize,
              }}
            />
            <Chip
              icon={<LocalOffer sx={{ fontSize: '16px' }} />}
              label={lesson.difficulty}
              size="small"
              sx={{ 
                backgroundColor: `${difficultyColors[lesson.difficulty]}20`,
                color: difficultyColors[lesson.difficulty],
                fontSize: iOSTheme.typography.footnote.fontSize,
                fontWeight: 600,
              }}
            />
            {progress?.completed && (
              <Chip
                icon={<CheckCircle sx={{ fontSize: '16px' }} />}
                label="Completed"
                size="small"
                sx={{ 
                  backgroundColor: `${iOSTheme.colors.success}20`,
                  color: iOSTheme.colors.success,
                  fontSize: iOSTheme.typography.footnote.fontSize,
                  fontWeight: 600,
                }}
              />
            )}
          </Box>
        </Paper>

        {/* Bible Verses */}
        {lesson.verses.length > 0 && (
          <Paper
            elevation={0}
            sx={{
              backgroundColor: iOSTheme.colors.systemGray6,
              borderRadius: iOSTheme.borderRadius.large,
              padding: iOSTheme.spacing.xl,
              marginBottom: iOSTheme.spacing.xl,
              border: `1px solid ${iOSTheme.colors.borderLight}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: iOSTheme.spacing.md }}>
              <MenuBook sx={{ color: iOSTheme.colors.primary, fontSize: '20px' }} />
              <Typography
                sx={{
                  fontSize: iOSTheme.typography.headline.fontSize,
                  fontWeight: iOSTheme.typography.headline.fontWeight,
                  color: iOSTheme.colors.textPrimary,
                }}
              >
                Bible Verses
              </Typography>
            </Box>
            {lesson.verses.map((verse, index) => (
              <Typography
                key={index}
                sx={{
                  fontSize: iOSTheme.typography.body.fontSize,
                  color: iOSTheme.colors.textPrimary,
                  fontStyle: 'italic',
                  marginBottom: index < lesson.verses.length - 1 ? iOSTheme.spacing.md : 0,
                }}
              >
                "{verse}"
              </Typography>
            ))}
          </Paper>
        )}

        {/* Main Content */}
        <Paper
          elevation={0}
          sx={{
            backgroundColor: 'white',
            borderRadius: iOSTheme.borderRadius.large,
            padding: iOSTheme.spacing.xl,
            marginBottom: iOSTheme.spacing.xl,
            border: `1px solid ${iOSTheme.colors.borderLight}`,
          }}
        >
          <Typography
            sx={{
              fontSize: iOSTheme.typography.body.fontSize,
              lineHeight: '1.8',
              color: iOSTheme.colors.textPrimary,
              whiteSpace: 'pre-wrap',
            }}
          >
            {lesson.content}
          </Typography>
        </Paper>

        {/* Key Takeaways */}
        {lesson.keyTakeaways.length > 0 && (
          <Paper
            elevation={0}
            sx={{
              backgroundColor: 'white',
              borderRadius: iOSTheme.borderRadius.large,
              padding: iOSTheme.spacing.xl,
              marginBottom: iOSTheme.spacing.xl,
              border: `1px solid ${iOSTheme.colors.borderLight}`,
            }}
          >
            <Typography
              sx={{
                fontSize: iOSTheme.typography.headline.fontSize,
                fontWeight: iOSTheme.typography.headline.fontWeight,
                color: iOSTheme.colors.textPrimary,
                marginBottom: iOSTheme.spacing.lg,
              }}
            >
              Key Takeaways
            </Typography>
            {lesson.keyTakeaways.map((takeaway, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 1, marginBottom: iOSTheme.spacing.md }}>
                <Typography sx={{ color: iOSTheme.colors.primary, fontWeight: 600 }}>
                  {index + 1}.
                </Typography>
                <Typography
                  sx={{
                    fontSize: iOSTheme.typography.body.fontSize,
                    color: iOSTheme.colors.textPrimary,
                    flex: 1,
                  }}
                >
                  {takeaway}
                </Typography>
              </Box>
            ))}
          </Paper>
        )}

        {/* Practical Steps */}
        {lesson.practicalSteps.length > 0 && (
          <Paper
            elevation={0}
            sx={{
              backgroundColor: iOSTheme.colors.primaryLight + '10',
              borderRadius: iOSTheme.borderRadius.large,
              padding: iOSTheme.spacing.xl,
              marginBottom: iOSTheme.spacing.xl,
              border: `1px solid ${iOSTheme.colors.primary}30`,
            }}
          >
            <Typography
              sx={{
                fontSize: iOSTheme.typography.headline.fontSize,
                fontWeight: iOSTheme.typography.headline.fontWeight,
                color: iOSTheme.colors.textPrimary,
                marginBottom: iOSTheme.spacing.lg,
              }}
            >
              Practical Business Steps
            </Typography>
            {lesson.practicalSteps.map((step, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 1, marginBottom: iOSTheme.spacing.md }}>
                <Box
                  sx={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: iOSTheme.colors.primary,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: iOSTheme.typography.caption1.fontSize,
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  {index + 1}
                </Box>
                <Typography
                  sx={{
                    fontSize: iOSTheme.typography.body.fontSize,
                    color: iOSTheme.colors.textPrimary,
                    flex: 1,
                  }}
                >
                  {step}
                </Typography>
              </Box>
            ))}
          </Paper>
        )}

        {/* Complete Button */}
        {!progress?.completed && (
          <Box sx={{ marginTop: iOSTheme.spacing.xxxl, marginBottom: iOSTheme.spacing.xxxl }}>
            <Button
              variant="contained"
              fullWidth
              loading={completingLesson}
              onClick={handleCompleteLesson}
              startIcon={<CheckCircle />}
              sx={{ height: '56px' }}
            >
              Mark as Completed
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default LessonDetail;