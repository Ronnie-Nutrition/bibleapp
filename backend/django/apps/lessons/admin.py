"""
Django Admin configuration for lessons app
"""

from django.contrib import admin
from .models import Lesson, UserProgress, LessonCategory, BibleVerse


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    """Admin for Lesson model"""
    list_display = ['title', 'category', 'difficulty', 'duration', 'is_published', 'is_featured', 'created_at']
    list_filter = ['category', 'difficulty', 'is_published', 'is_featured', 'created_at']
    search_fields = ['title', 'subtitle', 'content']
    prepopulated_fields = {'lesson_id': ('title',)}
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        ('Basic Information', {
            'fields': ('lesson_id', 'title', 'subtitle', 'category', 'difficulty', 'duration')
        }),
        ('Content', {
            'fields': ('content', 'key_takeaway', 'bible_verses', 'practical_steps')
        }),
        ('Media', {
            'fields': ('featured_image_url', 'video_url')
        }),
        ('Publishing', {
            'fields': ('is_published', 'is_featured', 'order')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(UserProgress)
class UserProgressAdmin(admin.ModelAdmin):
    """Admin for UserProgress model"""
    list_display = ['user', 'lesson', 'status', 'progress_percentage', 'rating', 'is_favorite']
    list_filter = ['status', 'rating', 'is_favorite', 'started_at']
    search_fields = ['user__email', 'lesson__title']
    readonly_fields = ['started_at']


@admin.register(LessonCategory)
class LessonCategoryAdmin(admin.ModelAdmin):
    """Admin for LessonCategory model"""
    list_display = ['name', 'order']
    list_editable = ['order']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(BibleVerse)
class BibleVerseAdmin(admin.ModelAdmin):
    """Admin for BibleVerse model"""
    list_display = ['lesson', 'book', 'chapter', 'verse', 'end_verse']
    list_filter = ['book', 'chapter']
    search_fields = ['lesson__title', 'text', 'book']
