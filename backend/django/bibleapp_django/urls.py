"""
Django REST API URL Configuration
Maps API endpoints to views
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.auth_app.views import AuthViewSet, UserViewSet
from apps.lessons.views import LessonViewSet, UserProgressViewSet
from apps.preferences.views import PreferencesViewSet
from apps.core.health import health_check, detailed_health_check
from apps.core.metrics import metrics_endpoint, application_metrics

# Initialize router
router = DefaultRouter()

# Register viewsets
router.register(r'lessons', LessonViewSet, basename='lesson')
router.register(r'progress', UserProgressViewSet, basename='progress')

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # Health check endpoints
    path('health/', health_check, name='health'),
    path('health/detailed/', detailed_health_check, name='health-detailed'),
    
    # Metrics endpoints
    path('metrics/', metrics_endpoint, name='metrics'),
    path('metrics/application/', application_metrics, name='application-metrics'),

    # API v1
    path('api/v1/', include(router.urls)),

    # Authentication endpoints
    path('api/v1/auth/register/', AuthViewSet.as_view({'post': 'register'}), name='auth-register'),
    path('api/v1/auth/login/', AuthViewSet.as_view({'post': 'login'}), name='auth-login'),
    path('api/v1/auth/logout/', AuthViewSet.as_view({'post': 'logout'}), name='auth-logout'),
    path('api/v1/auth/forgot-password/', AuthViewSet.as_view({'post': 'forgot_password'}), name='auth-forgot-password'),
    path('api/v1/auth/reset-password/', AuthViewSet.as_view({'post': 'reset_password'}), name='auth-reset-password'),
    path('api/v1/auth/update-email/', AuthViewSet.as_view({'post': 'update_email'}), name='auth-update-email'),
    path('api/v1/auth/me/', AuthViewSet.as_view({'get': 'me'}), name='auth-me'),

    # User endpoints
    path('api/v1/users/profile/', UserViewSet.as_view({'get': 'profile', 'patch': 'profile_update'}), name='user-profile'),
    path('api/v1/users/stats/', UserViewSet.as_view({'get': 'stats'}), name='user-stats'),
    path('api/v1/users/preferences/', UserViewSet.as_view({'get': 'preferences', 'patch': 'preferences'}), name='user-preferences'),

    # Preferences endpoints
    path('api/v1/preferences/', PreferencesViewSet.as_view({'get': 'list'}), name='preferences-list'),
    path('api/v1/preferences/update/', PreferencesViewSet.as_view({'post': 'update'}), name='preferences-update'),
    path('api/v1/preferences/notification-type/', PreferencesViewSet.as_view({'post': 'notification_type'}), name='preferences-notification-type'),
    path('api/v1/preferences/categories/', PreferencesViewSet.as_view({'post': 'categories'}), name='preferences-categories'),
    path('api/v1/preferences/daily-time/', PreferencesViewSet.as_view({'post': 'daily_time'}), name='preferences-daily-time'),
    path('api/v1/preferences/batch-update/', PreferencesViewSet.as_view({'post': 'batch_update'}), name='preferences-batch-update'),
    path('api/v1/preferences/reset/', PreferencesViewSet.as_view({'post': 'reset'}), name='preferences-reset'),
    path('api/v1/preferences/stats/', PreferencesViewSet.as_view({'get': 'stats'}), name='preferences-stats'),
    path('api/v1/preferences/quiet-hours/', PreferencesViewSet.as_view({'post': 'quiet_hours'}), name='preferences-quiet-hours'),
    path('api/v1/preferences/notification-frequency/', PreferencesViewSet.as_view({'post': 'notification_frequency'}), name='preferences-notification-frequency'),

    # DRF auth
    path('api-auth/', include('rest_framework.urls')),
]
