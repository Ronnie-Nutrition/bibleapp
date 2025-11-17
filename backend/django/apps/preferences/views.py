"""
Preferences Views
REST API views for user notification preferences and settings
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Count, Q
from .models import NotificationPreference, ScheduledNotification, UserActivityLog
from .serializers import (
    NotificationPreferenceSerializer, PreferenceUpdateSerializer,
    NotificationTypeUpdateSerializer, PreferredCategoriesSerializer,
    DailyReminderTimeSerializer, PreferenceBatchUpdateSerializer,
    PreferenceStatsSerializer, QuietHoursSerializer,
    NotificationFrequencySerializer
)


class PreferencesViewSet(viewsets.ViewSet):
    """
    ViewSet for user notification preferences
    """

    permission_classes = [IsAuthenticated]

    def get_preferences(self, request):
        """Get or create user preferences"""
        try:
            preferences = NotificationPreference.objects.get(user=request.user)
        except NotificationPreference.DoesNotExist:
            preferences = NotificationPreference.objects.create(user=request.user)

        return preferences

    @action(detail=False, methods=['get'])
    def list(self, request):
        """Get user notification preferences"""
        preferences = self.get_preferences(request)
        serializer = NotificationPreferenceSerializer(preferences)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def update(self, request):
        """Update a single preference"""
        serializer = PreferenceUpdateSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        preferences = self.get_preferences(request)
        key = serializer.validated_data.get('key')
        value = serializer.validated_data.get('value')

        # Map API key names to model field names
        field_mapping = {
            'notificationsEnabled': 'notifications_enabled',
            'emailNotifications': 'email_notifications_enabled',
            'dailyLessonsEnabled': 'daily_lessons_enabled',
            'dailyReminderTime': 'daily_reminder_time',
            'theme': 'theme',
            'language': 'language'
        }

        field_name = field_mapping.get(key)

        if not field_name:
            return Response({
                'error': f'Invalid preference key: {key}',
                'code': 'INVALID_KEY'
            }, status=status.HTTP_400_BAD_REQUEST)

        setattr(preferences, field_name, value)
        preferences.save()

        return Response({
            'success': True,
            'message': f'Preference "{key}" updated successfully'
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def notification_type(self, request):
        """Update notification type preference"""
        serializer = NotificationTypeUpdateSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        preferences = self.get_preferences(request)
        notification_type = serializer.validated_data.get('notification_type')
        enabled = serializer.validated_data.get('enabled')

        # Map notification type to field
        field_mapping = {
            'new-lessons': 'new_lessons',
            'announcements': 'announcements',
            'reminders': 'reminders',
            'daily-lessons': 'daily_lessons'
        }

        field_name = field_mapping.get(notification_type)

        if not field_name:
            return Response({
                'error': f'Invalid notification type: {notification_type}',
                'code': 'INVALID_TYPE'
            }, status=status.HTTP_400_BAD_REQUEST)

        setattr(preferences, field_name, enabled)
        preferences.save()

        return Response({
            'success': True,
            'message': f'Notification type "{notification_type}" updated'
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def categories(self, request):
        """Update preferred lesson categories"""
        serializer = PreferredCategoriesSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        preferences = self.get_preferences(request)
        preferences.preferred_categories = serializer.validated_data.get('categories')
        preferences.save()

        return Response({
            'success': True,
            'preferred_categories': preferences.preferred_categories
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def daily_time(self, request):
        """Set daily reminder time"""
        serializer = DailyReminderTimeSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        preferences = self.get_preferences(request)
        preferences.daily_reminder_time = serializer.validated_data.get('time')
        preferences.save()

        return Response({
            'success': True,
            'daily_reminder_time': preferences.daily_reminder_time.strftime('%H:%M')
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def batch_update(self, request):
        """Update multiple preferences at once"""
        serializer = PreferenceBatchUpdateSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        preferences = self.get_preferences(request)
        preferences_dict = serializer.validated_data.get('preferences', {})

        # Map API key names to model field names
        field_mapping = {
            'notificationsEnabled': 'notifications_enabled',
            'emailNotifications': 'email_notifications_enabled',
            'dailyLessonsEnabled': 'daily_lessons_enabled',
            'dailyReminderTime': 'daily_reminder_time',
            'newLessons': 'new_lessons',
            'announcements': 'announcements',
            'reminders': 'reminders',
            'dailyLessons': 'daily_lessons',
            'preferredCategories': 'preferred_categories',
            'theme': 'theme',
            'language': 'language'
        }

        for api_key, value in preferences_dict.items():
            field_name = field_mapping.get(api_key)
            if field_name:
                setattr(preferences, field_name, value)

        preferences.save()

        return Response({
            'success': True,
            'message': 'Multiple preferences updated successfully'
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def reset(self, request):
        """Reset preferences to defaults"""
        preferences = self.get_preferences(request)

        # Reset to defaults
        preferences.notifications_enabled = True
        preferences.email_notifications_enabled = True
        preferences.daily_lessons_enabled = True
        preferences.daily_reminder_time = __import__('datetime', fromlist=['time']).time(9, 0)
        preferences.notification_frequency = 'instant'
        preferences.new_lessons = True
        preferences.announcements = True
        preferences.reminders = True
        preferences.daily_lessons = True
        preferences.preferred_categories = []
        preferences.quiet_hours_enabled = False
        preferences.show_tips = True
        preferences.show_achievements = True
        preferences.show_reminders = True
        preferences.save()

        return Response({
            'success': True,
            'message': 'Preferences reset to defaults'
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get aggregate preference statistics"""
        from apps.auth_app.models import CustomUser
        from django.db.models import Count

        total_users = CustomUser.objects.count()
        notifications_enabled = NotificationPreference.objects.filter(
            notifications_enabled=True
        ).count()
        notifications_disabled = total_users - notifications_enabled

        email_enabled = NotificationPreference.objects.filter(
            email_notifications_enabled=True
        ).count()

        daily_lessons_enabled = NotificationPreference.objects.filter(
            daily_lessons_enabled=True
        ).count()

        quiet_hours_enabled = NotificationPreference.objects.filter(
            quiet_hours_enabled=True
        ).count()

        # Most preferred categories
        from django.db.models import F
        preferred_categories = NotificationPreference.objects.filter(
            preferred_categories__len__gt=0
        ).values_list('preferred_categories', flat=True)

        category_counts = {}
        for cats in preferred_categories:
            for cat in cats:
                category_counts[cat] = category_counts.get(cat, 0) + 1

        most_preferred = sorted(
            category_counts.items(),
            key=lambda x: x[1],
            reverse=True
        )[:5]

        # Notification frequency distribution
        frequency_dist = NotificationPreference.objects.values(
            'notification_frequency'
        ).annotate(count=Count('id'))

        data = {
            'total_users': total_users,
            'notifications_enabled_count': notifications_enabled,
            'notifications_disabled_count': notifications_disabled,
            'email_notifications_enabled_count': email_enabled,
            'daily_lessons_enabled_count': daily_lessons_enabled,
            'most_preferred_categories': [cat[0] for cat in most_preferred],
            'notification_frequency_distribution': {
                item['notification_frequency']: item['count']
                for item in frequency_dist
            },
            'quiet_hours_enabled_count': quiet_hours_enabled
        }

        return Response(data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def quiet_hours(self, request):
        """Set quiet hours"""
        serializer = QuietHoursSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        preferences = self.get_preferences(request)
        preferences.quiet_hours_enabled = serializer.validated_data.get('enabled')

        if serializer.validated_data.get('start_time'):
            preferences.quiet_hours_start = serializer.validated_data.get('start_time')

        if serializer.validated_data.get('end_time'):
            preferences.quiet_hours_end = serializer.validated_data.get('end_time')

        preferences.save()

        return Response({
            'success': True,
            'message': 'Quiet hours updated'
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def notification_frequency(self, request):
        """Set notification frequency"""
        serializer = NotificationFrequencySerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        preferences = self.get_preferences(request)
        preferences.notification_frequency = serializer.validated_data.get('frequency')
        preferences.save()

        return Response({
            'success': True,
            'notification_frequency': preferences.notification_frequency
        }, status=status.HTTP_200_OK)
