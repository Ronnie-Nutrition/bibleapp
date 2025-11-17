"""
Django Admin configuration for auth_app
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, UserPreferences, UserStats, LoginHistory


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    """Admin for CustomUser model"""
    list_display = ['email', 'get_full_name', 'is_active', 'email_verified', 'created_at']
    list_filter = ['is_active', 'email_verified', 'created_at']
    search_fields = ['email', 'first_name', 'last_name']
    ordering = ['-created_at']

    fieldsets = UserAdmin.fieldsets + (
        ('Custom Fields', {
            'fields': ('firebase_uid', 'email_verified', 'profile_image_url', 'bio',
                      'password_reset_requested', 'password_changed_at')
        }),
    )


@admin.register(UserPreferences)
class UserPreferencesAdmin(admin.ModelAdmin):
    """Admin for UserPreferences model"""
    list_display = ['user', 'notifications_enabled', 'daily_lessons_enabled', 'theme']
    list_filter = ['notifications_enabled', 'email_notifications', 'daily_lessons_enabled', 'theme']
    search_fields = ['user__email']


@admin.register(UserStats)
class UserStatsAdmin(admin.ModelAdmin):
    """Admin for UserStats model"""
    list_display = ['user', 'lessons_completed', 'current_streak', 'longest_streak']
    list_filter = ['created_at']
    search_fields = ['user__email']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(LoginHistory)
class LoginHistoryAdmin(admin.ModelAdmin):
    """Admin for LoginHistory model"""
    list_display = ['user', 'login_successful', 'ip_address', 'timestamp']
    list_filter = ['login_successful', 'timestamp']
    search_fields = ['user__email', 'ip_address']
    readonly_fields = ['timestamp']
