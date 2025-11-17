"""
Authentication Models
Defines user models and authentication-related data structures
"""

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


class CustomUser(AbstractUser):
    """
    Custom User model extending Django's AbstractUser
    Stores user authentication and profile information
    """

    # Firebase UID for authentication sync
    firebase_uid = models.CharField(max_length=255, unique=True, blank=True, null=True)

    # Email verification
    email_verified = models.BooleanField(default=False)
    email_verification_token = models.CharField(max_length=255, blank=True, null=True)

    # Password reset tracking
    password_reset_requested = models.DateTimeField(null=True, blank=True)
    password_reset_code = models.CharField(max_length=255, blank=True, null=True)
    password_changed_at = models.DateTimeField(null=True, blank=True)

    # Profile information
    profile_image_url = models.URLField(blank=True, null=True)
    bio = models.TextField(blank=True, null=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"

    def mark_email_as_verified(self):
        """Mark user's email as verified"""
        self.email_verified = True
        self.email_verification_token = None
        self.save()


class UserPreferences(models.Model):
    """
    User notification and app preferences
    """

    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='preferences')

    # Notification settings
    notifications_enabled = models.BooleanField(default=True)
    email_notifications = models.BooleanField(default=True)
    daily_lessons_enabled = models.BooleanField(default=True)

    # Daily reminder time (HH:mm UTC format)
    daily_reminder_time = models.TimeField(default='09:00')

    # Preferred lesson categories
    preferred_categories = models.JSONField(default=list, blank=True)

    # Notification type preferences
    notification_types = models.JSONField(
        default=dict,
        help_text="Dictionary of notification type toggles"
    )

    # Display preferences
    theme = models.CharField(
        max_length=10,
        choices=[
            ('light', 'Light'),
            ('dark', 'Dark'),
            ('system', 'System'),
        ],
        default='system'
    )

    # Language preference
    language = models.CharField(
        max_length=10,
        default='en',
        choices=[
            ('en', 'English'),
            ('es', 'Spanish'),
            ('fr', 'French'),
        ]
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'User Preferences'
        verbose_name_plural = 'User Preferences'

    def __str__(self):
        return f"Preferences for {self.user.email}"

    def get_default_notification_types(self):
        """Get default notification type settings"""
        return {
            'new-lessons': True,
            'announcements': True,
            'reminders': True,
            'daily-lessons': True
        }

    def ensure_notification_types(self):
        """Ensure all required notification types are present"""
        if not self.notification_types:
            self.notification_types = self.get_default_notification_types()
            self.save()


class UserStats(models.Model):
    """
    User engagement and progress statistics
    """

    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='stats')

    # Learning stats
    lessons_completed = models.IntegerField(default=0)
    lessons_started = models.IntegerField(default=0)
    total_time_spent = models.IntegerField(default=0, help_text="Time in minutes")
    favorite_count = models.IntegerField(default=0)

    # Streak tracking
    current_streak = models.IntegerField(default=0, help_text="Days in current streak")
    longest_streak = models.IntegerField(default=0, help_text="Longest streak ever")
    last_lesson_date = models.DateField(null=True, blank=True)

    # Engagement
    total_sessions = models.IntegerField(default=0)
    average_session_duration = models.IntegerField(default=0, help_text="Minutes")

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'User Stats'
        verbose_name_plural = 'User Stats'

    def __str__(self):
        return f"Stats for {self.user.email}"

    def update_streak(self):
        """Update user's streak based on last lesson date"""
        from datetime import date, timedelta

        if not self.last_lesson_date:
            return

        today = date.today()
        days_since = (today - self.last_lesson_date).days

        if days_since == 0:
            # Same day, no change
            pass
        elif days_since == 1:
            # Consecutive day, increment streak
            self.current_streak += 1
            if self.current_streak > self.longest_streak:
                self.longest_streak = self.current_streak
        else:
            # Streak broken
            self.current_streak = 0

        self.last_lesson_date = today
        self.save()


class LoginHistory(models.Model):
    """
    Track user login history for security auditing
    """

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='login_history')

    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    login_successful = models.BooleanField(default=True)
    failure_reason = models.CharField(max_length=255, blank=True, null=True)

    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Login History'
        verbose_name_plural = 'Login Histories'

    def __str__(self):
        return f"{self.user.email} - {self.timestamp}"
