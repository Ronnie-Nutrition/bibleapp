import React from 'react';
import { Box, Chip, ScrollContainer } from '@mui/material';
import iOSTheme from '../../theme/theme';
import { Category } from '../../types/lesson.types';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string | null) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ 
  categories, 
  selectedCategory, 
  onCategorySelect 
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: iOSTheme.spacing.sm,
        overflowX: 'auto',
        padding: `${iOSTheme.spacing.md} 0`,
        WebkitOverflowScrolling: 'touch',
        '&::-webkit-scrollbar': { display: 'none' },
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
      }}
    >
      {/* All Lessons Chip */}
      <Chip
        label="All Lessons"
        onClick={() => onCategorySelect(null)}
        sx={{
          backgroundColor: selectedCategory === null 
            ? iOSTheme.colors.primary 
            : iOSTheme.colors.systemGray6,
          color: selectedCategory === null 
            ? 'white' 
            : iOSTheme.colors.textPrimary,
          border: 'none',
          fontSize: iOSTheme.typography.subheadline.fontSize,
          fontWeight: 600,
          padding: `${iOSTheme.spacing.xs} ${iOSTheme.spacing.md}`,
          height: '32px',
          transition: `all ${iOSTheme.animation.fast}`,
          '&:hover': {
            backgroundColor: selectedCategory === null 
              ? iOSTheme.colors.primaryDark 
              : iOSTheme.colors.systemGray5,
          },
        }}
      />

      {/* Category Chips */}
      {categories.map((category) => (
        <Chip
          key={category.id}
          label={`${category.name} (${category.lessonCount || 0})`}
          onClick={() => onCategorySelect(category.id)}
          sx={{
            backgroundColor: selectedCategory === category.id 
              ? iOSTheme.colors.primary 
              : iOSTheme.colors.systemGray6,
            color: selectedCategory === category.id 
              ? 'white' 
              : iOSTheme.colors.textPrimary,
            border: 'none',
            fontSize: iOSTheme.typography.subheadline.fontSize,
            fontWeight: 600,
            padding: `${iOSTheme.spacing.xs} ${iOSTheme.spacing.md}`,
            height: '32px',
            transition: `all ${iOSTheme.animation.fast}`,
            flexShrink: 0,
            '&:hover': {
              backgroundColor: selectedCategory === category.id 
                ? iOSTheme.colors.primaryDark 
                : iOSTheme.colors.systemGray5,
            },
          }}
        />
      ))}
    </Box>
  );
};

export default CategoryFilter;