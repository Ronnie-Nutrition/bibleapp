"""
User Preferences Models
Defines user preference and notification settings
"""

from django.db import models
from django.utils import timezone


class NotificationPreference(models.Model):
    """
    Detailed notification preferences for users
    """

    NOTIFICATION_TYPE_CHOICES = [
        ('new-lessons', 'New Lessons'),
        ('announcements', 'Announcements'),
        ('reminders', 'Reminders'),
        ('daily-lessons', 'Daily Lessons'),
    ]

    user = models.OneToOneField('auth_app.CustomUser', on_delete=models.CASCADE, related_name='notification_preference')

    # Global notification toggle
    notifications_enabled = models.BooleanField(default=True)
    email_notifications_enabled = models.BooleanField(default=True)

    # Daily lessons
    daily_lessons_enabled = models.BooleanField(default=True)
    daily_reminder_time = models.TimeField(default='09:00', help_text="UTC time HH:mm format")

    # Notification type toggles
    new_lessons = models.BooleanField(default=True)
    announcements = models.BooleanField(default=True)
    reminders = models.BooleanField(default=True)
    daily_lessons = models.BooleanField(default=True)

    # Preferred lesson categories (JSON array)
    preferred_categories = models.JSONField(default=list, blank=True)

    # Quiet hours (don't send notifications during these times)
    quiet_hours_enabled = models.BooleanField(default=False)
    quiet_hours_start = models.TimeField(null=True, blank=True)
    quiet_hours_end = models.TimeField(null=True, blank=True)

    # Frequency preferences
    FREQUENCY_CHOICES = [
        ('instant', 'Instant'),
        ('daily', 'Daily Digest'),
        ('weekly', 'Weekly Digest'),
    ]
    notification_frequency = models.CharField(
        max_length=20,
        choices=FREQUENCY_CHOICES,
        default='instant'
    )

    # Display preferences
    show_tips = models.BooleanField(default=True)
    show_achievements = models.BooleanField(default=True)
    show_reminders = models.BooleanField(default=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_modified_by = models.CharField(max_length=20, choices=[('user', 'User'), ('admin', 'Admin')], default='user')

    class Meta:
        verbose_name = 'Notification Preference'
        verbose_name_plural = 'Notification Preferences'

    def __str__(self):
        return f"Notifications for {self.user.email}"

    def to_dict(self):
        """Convert preferences to dictionary"""
        return {
            'notificationsEnabled': self.notifications_enabled,
            'emailNotifications': self.email_notifications_enabled,
            'dailyLessonsEnabled': self.daily_lessons_enabled,
            'dailyReminderTime': self.daily_reminder_time.strftime('%H:%M'),
            'notificationTypes': {
                'new-lessons': self.new_lessons,
                'announcements': self.announcements,
                'reminders': self.reminders,
                'daily-lessons': self.daily_lessons,
            },
            'preferredCategories': self.preferred_categories,
            'quietHoursEnabled': self.quiet_hours_enabled,
            'notificationFrequency': self.notification_frequency,
        }


class ScheduledNotification(models.Model):
    """
    Track scheduled and sent notifications
    """

    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('sent', 'Sent'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]

    TYPE_CHOICES = [
        ('daily-lesson', 'Daily Lesson'),
        ('new-lesson', 'New Lesson'),
        ('announcement', 'Announcement'),
        ('reminder', 'Reminder'),
    ]

    user = models.ForeignKey('auth_app.CustomUser', on_delete=models.CASCADE, related_name='scheduled_notifications')
    lesson = models.ForeignKey('lessons.Lesson', on_delete=models.SET_NULL, null=True, blank=True, related_name='notifications')

    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')

    title = models.CharField(max_length=255)
    message = models.TextField()

    # Scheduling
    scheduled_time = models.DateTimeField()
    sent_time = models.DateTimeField(null=True, blank=True)

    # Results
    was_delivered = models.BooleanField(default=False)
    delivery_error = models.TextField(blank=True, null=True)

    # User interaction
    was_opened = models.BooleanField(default=False)
    was_clicked = models.BooleanField(default=False)
    opened_at = models.DateTimeField(null=True, blank=True)

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-scheduled_time']
        verbose_name = 'Scheduled Notification'
        verbose_name_plural = 'Scheduled Notifications'
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['scheduled_time', 'status']),
        ]

    def __str__(self):
        return f"{self.notification_type} - {self.user.email} - {self.scheduled_time}"


class NotificationTemplate(models.Model):
    """
    Reusable notification templates
    """

    name = models.CharField(max_length=100, unique=True)
    notification_type = models.CharField(
        max_length=20,
        choices=ScheduledNotification.TYPE_CHOICES
    )
    title_template = models.CharField(max_length=255)
    message_template = models.TextField()

    # Variables that can be used in templates: {lesson_title}, {user_name}, etc.
    variables = models.JSONField(default=list, blank=True)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Notification Template'
        verbose_name_plural = 'Notification Templates'

    def __str__(self):
        return self.name

    def format_message(self, **kwargs):
        """Format template with provided variables"""
        try:
            return {
                'title': self.title_template.format(**kwargs),
                'message': self.message_template.format(**kwargs),
            }
        except KeyError as e:
            raise ValueError(f"Missing template variable: {e}")


class UserActivityLog(models.Model):
    """
    Log user activity for analytics and engagement tracking
    """

    ACTION_CHOICES = [
        ('lesson_started', 'Lesson Started'),
        ('lesson_completed', 'Lesson Completed'),
        ('lesson_rated', 'Lesson Rated'),
        ('lesson_favorited', 'Lesson Favorited'),
        ('notification_received', 'Notification Received'),
        ('notification_opened', 'Notification Opened'),
        ('settings_changed', 'Settings Changed'),
        ('login', 'Login'),
        ('logout', 'Logout'),
    ]

    user = models.ForeignKey('auth_app.CustomUser', on_delete=models.CASCADE, related_name='activity_logs')
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)

    # Related objects
    lesson = models.ForeignKey('lessons.Lesson', on_delete=models.SET_NULL, null=True, blank=True)

    # Additional data stored as JSON
    metadata = models.JSONField(default=dict, blank=True)

    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)

    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'User Activity Log'
        verbose_name_plural = 'User Activity Logs'
        indexes = [
            models.Index(fields=['user', '-timestamp']),
            models.Index(fields=['action', '-timestamp']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.action} - {self.timestamp}"
