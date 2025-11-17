"""
Lessons Models
Defines lesson and related content structures
"""

from django.db import models
from django.contrib.postgres.fields import ArrayField


class Lesson(models.Model):
    """
    Biblical lesson for entrepreneurs
    """

    DIFFICULTY_CHOICES = [
        ('Beginner', 'Beginner'),
        ('Intermediate', 'Intermediate'),
        ('Advanced', 'Advanced'),
    ]

    CATEGORY_CHOICES = [
        ('Leadership & Authority', 'Leadership & Authority'),
        ('Integrity & Ethics', 'Integrity & Ethics'),
        ('Financial Stewardship', 'Financial Stewardship'),
        ('Trust & Faith', 'Trust & Faith'),
        ('Serving Others', 'Serving Others'),
        ('Perseverance', 'Perseverance'),
        ('Wisdom & Discernment', 'Wisdom & Discernment'),
        ('Community & Partnership', 'Community & Partnership'),
        ('Time & Productivity', 'Time & Productivity'),
        ('Decision Making', 'Decision Making'),
    ]

    # Basic information
    lesson_id = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=255)
    subtitle = models.CharField(max_length=255, blank=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES)

    # Content
    content = models.TextField()
    key_takeaway = models.TextField()
    duration = models.IntegerField(help_text="Duration in minutes")

    # Bible verses (stored as JSON)
    bible_verses = models.JSONField(default=list)

    # Practical steps (stored as JSON)
    practical_steps = models.JSONField(default=list)

    # Media
    featured_image_url = models.URLField(blank=True, null=True)
    video_url = models.URLField(blank=True, null=True)

    # Metadata
    is_published = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    order = models.IntegerField(default=0, help_text="Display order")

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Lesson'
        verbose_name_plural = 'Lessons'

    def __str__(self):
        return f"{self.title} ({self.lesson_id})"


class UserProgress(models.Model):
    """
    Track user progress on individual lessons
    """

    STATUS_CHOICES = [
        ('not_started', 'Not Started'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]

    user = models.ForeignKey('auth_app.CustomUser', on_delete=models.CASCADE, related_name='lesson_progress')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='user_progress')

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_started')
    progress_percentage = models.IntegerField(default=0, help_text="0-100")
    time_spent = models.IntegerField(default=0, help_text="Time in minutes")

    # Reading progress
    read_at = models.DateTimeField(null=True, blank=True)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    # User rating
    rating = models.IntegerField(null=True, blank=True, choices=[(i, i) for i in range(1, 6)])
    notes = models.TextField(blank=True, null=True)

    # Is favorited
    is_favorite = models.BooleanField(default=False)

    class Meta:
        unique_together = ('user', 'lesson')
        ordering = ['-started_at']
        verbose_name = 'User Progress'
        verbose_name_plural = 'User Progress'

    def __str__(self):
        return f"{self.user.email} - {self.lesson.title}: {self.status}"

    def mark_completed(self):
        """Mark lesson as completed"""
        self.status = 'completed'
        self.progress_percentage = 100
        self.completed_at = models.functions.Now()
        self.save()

    def update_progress(self, percentage):
        """Update lesson progress percentage"""
        self.progress_percentage = min(percentage, 100)
        if self.status == 'not_started':
            self.status = 'in_progress'
        if percentage >= 100:
            self.status = 'completed'
            self.completed_at = models.functions.Now()
        self.save()


class LessonCategory(models.Model):
    """
    Lesson categories for organization and filtering
    """

    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon_url = models.URLField(blank=True, null=True)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order', 'name']
        verbose_name = 'Lesson Category'
        verbose_name_plural = 'Lesson Categories'

    def __str__(self):
        return self.name


class BibleVerse(models.Model):
    """
    Bible verses referenced in lessons
    """

    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='verse_references')

    book = models.CharField(max_length=50)
    chapter = models.IntegerField()
    verse = models.IntegerField()
    end_verse = models.IntegerField(null=True, blank=True)
    text = models.TextField()

    class Meta:
        ordering = ['book', 'chapter', 'verse']
        verbose_name = 'Bible Verse'
        verbose_name_plural = 'Bible Verses'

    def __str__(self):
        if self.end_verse:
            return f"{self.book} {self.chapter}:{self.verse}-{self.end_verse}"
        return f"{self.book} {self.chapter}:{self.verse}"
