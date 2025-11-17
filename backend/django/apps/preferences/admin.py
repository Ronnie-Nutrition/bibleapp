"""
Django Admin configuration for preferences app
"""

from django.contrib import admin
from .models import NotificationPreference, ScheduledNotification, NotificationTemplate, UserActivityLog


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    """Admin for NotificationPreference model"""
    list_display = ['user', 'notifications_enabled', 'email_notifications_enabled', 'daily_lessons_enabled']
    list_filter = ['notifications_enabled', 'email_notifications_enabled', 'daily_lessons_enabled', 'notification_frequency']
    search_fields = ['user__email']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(ScheduledNotification)
class ScheduledNotificationAdmin(admin.ModelAdmin):
    """Admin for ScheduledNotification model"""
    list_display = ['user', 'notification_type', 'status', 'was_delivered', 'was_opened', 'scheduled_time']
    list_filter = ['notification_type', 'status', 'was_delivered', 'was_opened', 'scheduled_time']
    search_fields = ['user__email', 'title', 'message']
    readonly_fields = ['created_at', 'updated_at', 'sent_time', 'opened_at']

    fieldsets = (
        ('Notification Details', {
            'fields': ('user', 'lesson', 'notification_type', 'title', 'message')
        }),
        ('Status', {
            'fields': ('status', 'was_delivered', 'delivery_error')
        }),
        ('Scheduling', {
            'fields': ('scheduled_time', 'sent_time')
        }),
        ('User Interaction', {
            'fields': ('was_opened', 'opened_at', 'was_clicked')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(NotificationTemplate)
class NotificationTemplateAdmin(admin.ModelAdmin):
    """Admin for NotificationTemplate model"""
    list_display = ['name', 'notification_type', 'is_active']
    list_filter = ['notification_type', 'is_active']
    search_fields = ['name', 'title_template']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(UserActivityLog)
class UserActivityLogAdmin(admin.ModelAdmin):
    """Admin for UserActivityLog model"""
    list_display = ['user', 'action', 'lesson', 'timestamp']
    list_filter = ['action', 'timestamp']
    search_fields = ['user__email', 'lesson__title']
    readonly_fields = ['timestamp']
