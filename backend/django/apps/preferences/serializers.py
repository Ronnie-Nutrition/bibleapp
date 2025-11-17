"""
Preferences Serializers
Serializers for notification preferences and related settings
"""

from rest_framework import serializers
from .models import NotificationPreference, ScheduledNotification, UserActivityLog


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    """Serializer for user notification preferences"""

    class Meta:
        model = NotificationPreference
        fields = [
            'notifications_enabled', 'email_notifications_enabled',
            'daily_lessons_enabled', 'daily_reminder_time',
            'new_lessons', 'announcements', 'reminders', 'daily_lessons',
            'preferred_categories', 'quiet_hours_enabled',
            'quiet_hours_start', 'quiet_hours_end',
            'notification_frequency', 'show_tips', 'show_achievements',
            'show_reminders'
        ]


class PreferenceUpdateSerializer(serializers.Serializer):
    """Serializer for updating single preference"""

    key = serializers.CharField()
    value = serializers.JSONField()

    VALID_KEYS = [
        'notificationsEnabled',
        'emailNotifications',
        'dailyLessonsEnabled',
        'dailyReminderTime',
        'newLessons',
        'announcements',
        'reminders',
        'dailyLessons',
        'preferredCategories',
        'theme',
        'language'
    ]

    def validate_key(self, value):
        """Validate preference key"""
        if value not in self.VALID_KEYS:
            raise serializers.ValidationError(f"Invalid preference key: {value}")
        return value


class NotificationTypeUpdateSerializer(serializers.Serializer):
    """Serializer for updating notification types"""

    NOTIFICATION_TYPES = [
        'new-lessons',
        'announcements',
        'reminders',
        'daily-lessons'
    ]

    notification_type = serializers.ChoiceField(choices=NOTIFICATION_TYPES)
    enabled = serializers.BooleanField()


class PreferredCategoriesSerializer(serializers.Serializer):
    """Serializer for updating preferred categories"""

    VALID_CATEGORIES = [
        'Leadership & Authority',
        'Integrity & Ethics',
        'Financial Stewardship',
        'Trust & Faith',
        'Serving Others',
        'Perseverance',
        'Wisdom & Discernment',
        'Community & Partnership',
        'Time & Productivity',
        'Decision Making',
    ]

    categories = serializers.ListField(
        child=serializers.ChoiceField(choices=VALID_CATEGORIES)
    )


class DailyReminderTimeSerializer(serializers.Serializer):
    """Serializer for setting daily reminder time"""

    time = serializers.TimeField(format='%H:%M')

    def validate_time(self, value):
        """Validate time format"""
        # Time should be in HH:mm format
        if not value:
            raise serializers.ValidationError("Valid time is required")
        return value


class PreferenceBatchUpdateSerializer(serializers.Serializer):
    """Serializer for batch updating multiple preferences"""

    preferences = serializers.JSONField()

    def validate_preferences(self, value):
        """Validate preferences object"""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Preferences must be a dictionary")

        valid_keys = PreferenceUpdateSerializer.VALID_KEYS
        for key in value.keys():
            if key not in valid_keys:
                raise serializers.ValidationError(f"Invalid preference key: {key}")

        return value


class PreferenceStatsSerializer(serializers.Serializer):
    """Serializer for preference statistics"""

    total_users = serializers.IntegerField()
    notifications_enabled_count = serializers.IntegerField()
    notifications_disabled_count = serializers.IntegerField()
    email_notifications_enabled_count = serializers.IntegerField()
    daily_lessons_enabled_count = serializers.IntegerField()
    average_daily_reminder_time = serializers.TimeField()
    most_preferred_categories = serializers.ListField(child=serializers.CharField())
    notification_frequency_distribution = serializers.DictField()
    quiet_hours_enabled_count = serializers.IntegerField()


class ScheduledNotificationSerializer(serializers.ModelSerializer):
    """Serializer for scheduled notifications"""

    lesson_title = serializers.CharField(source='lesson.title', read_only=True, required=False)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    type_display = serializers.CharField(source='get_notification_type_display', read_only=True)

    class Meta:
        model = ScheduledNotification
        fields = [
            'id', 'notification_type', 'type_display', 'status', 'status_display',
            'title', 'message', 'lesson', 'lesson_title',
            'scheduled_time', 'sent_time', 'was_delivered',
            'was_opened', 'was_clicked', 'opened_at'
        ]
        read_only_fields = [
            'id', 'sent_time', 'was_delivered', 'was_opened',
            'was_clicked', 'opened_at'
        ]


class ActivityLogSerializer(serializers.ModelSerializer):
    """Serializer for user activity logs"""

    action_display = serializers.CharField(source='get_action_display', read_only=True)
    lesson_title = serializers.CharField(source='lesson.title', read_only=True, required=False)

    class Meta:
        model = UserActivityLog
        fields = [
            'id', 'action', 'action_display', 'lesson', 'lesson_title',
            'metadata', 'timestamp'
        ]
        read_only_fields = fields


class QuietHoursSerializer(serializers.Serializer):
    """Serializer for setting quiet hours"""

    enabled = serializers.BooleanField()
    start_time = serializers.TimeField(format='%H:%M', required=False)
    end_time = serializers.TimeField(format='%H:%M', required=False)

    def validate(self, data):
        """Validate quiet hours"""
        if data.get('enabled'):
            if not data.get('start_time') or not data.get('end_time'):
                raise serializers.ValidationError(
                    "start_time and end_time are required when quiet hours are enabled"
                )

            if data.get('start_time') >= data.get('end_time'):
                raise serializers.ValidationError(
                    "start_time must be before end_time"
                )

        return data


class NotificationFrequencySerializer(serializers.Serializer):
    """Serializer for setting notification frequency"""

    FREQUENCY_CHOICES = [
        'instant',
        'daily',
        'weekly'
    ]

    frequency = serializers.ChoiceField(choices=FREQUENCY_CHOICES)
