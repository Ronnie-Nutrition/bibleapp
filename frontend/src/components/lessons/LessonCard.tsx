import React from 'react';
import { Box, Card, CardContent, Typography, Chip } from '@mui/material';
import { AccessTime, LocalOffer } from '@mui/icons-material';
import iOSTheme from '../../theme/theme';
import { Lesson } from '../../types/lesson.types';

interface LessonCardProps {
  lesson: Lesson;
  isCompleted?: boolean;
  onClick: () => void;
}

const difficultyColors = {
  Beginner: iOSTheme.colors.success,
  Intermediate: iOSTheme.colors.warning,
  Advanced: iOSTheme.colors.error,
};

const LessonCard: React.FC<LessonCardProps> = ({ lesson, isCompleted = false, onClick }) => {
  return (
    <Card
      onClick={onClick}
      sx={{
        backgroundColor: isCompleted ? 'rgba(245, 245, 247, 0.75)' : 'rgba(255, 255, 255, 0.72)',
        backdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        borderRadius: iOSTheme.borderRadius.large,
        boxShadow: iOSTheme.shadows.liquidGlass,
        cursor: 'pointer',
        transition: `all ${iOSTheme.animation.fast}`,
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: iOSTheme.shadows.medium,
        },
        '&:active': {
          transform: 'translateY(0)',
          boxShadow: iOSTheme.shadows.small,
        },
      }}
    >
      <Box sx={{ padding: iOSTheme.spacing.lg }}>
        {/* Category & Completion Status */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography
            variant="caption"
            sx={{
              color: iOSTheme.colors.primary,
              fontSize: iOSTheme.typography.footnote.fontSize,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {lesson.category}
          </Typography>
          {isCompleted && (
            <Chip
              label="Completed"
              size="small"
              sx={{
                backgroundColor: iOSTheme.colors.success,
                color: 'white',
                height: '20px',
                fontSize: iOSTheme.typography.caption2.fontSize,
                fontWeight: 600,
              }}
            />
          )}
        </Box>

        {/* Title */}
        <Typography
          variant="h6"
          sx={{
            fontSize: iOSTheme.typography.headline.fontSize,
            fontWeight: iOSTheme.typography.headline.fontWeight,
            lineHeight: iOSTheme.typography.headline.lineHeight,
            color: iOSTheme.colors.textPrimary,
            mb: 1,
          }}
        >
          {lesson.title}
        </Typography>

        {/* Subtitle */}
        <Typography
          variant="body2"
          sx={{
            fontSize: iOSTheme.typography.subheadline.fontSize,
            color: iOSTheme.colors.textSecondary,
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {lesson.subtitle}
        </Typography>

        {/* Meta Info */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {/* Duration */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AccessTime sx={{ fontSize: '16px', color: iOSTheme.colors.systemGray }} />
            <Typography
              sx={{
                fontSize: iOSTheme.typography.footnote.fontSize,
                color: iOSTheme.colors.systemGray,
              }}
            >
              {lesson.duration} min
            </Typography>
          </Box>

          {/* Difficulty */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LocalOffer 
              sx={{ 
                fontSize: '16px', 
                color: difficultyColors[lesson.difficulty] 
              }} 
            />
            <Typography
              sx={{
                fontSize: iOSTheme.typography.footnote.fontSize,
                color: difficultyColors[lesson.difficulty],
                fontWeight: 600,
              }}
            >
              {lesson.difficulty}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Card>
  );
};

export default LessonCard;