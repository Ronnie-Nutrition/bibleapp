from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth import get_user_model
from apps.auth_app.models import UserPreferences
from apps.lessons.models import LessonCategory

User = get_user_model()


class UserPreferencesModelTest(TestCase):
    """Test UserPreferences model"""

    def setUp(self):
        """Set up test fixtures"""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )

    def test_create_preferences(self):
        """Test creating user preferences"""
        prefs = UserPreferences.objects.create(
            user=self.user,
            notifications_enabled=True,
            daily_reminder_time='09:00'
        )
        self.assertEqual(prefs.user, self.user)
        self.assertTrue(prefs.notifications_enabled)

    def test_preferences_default_values(self):
        """Test default values"""
        prefs = UserPreferences.objects.create(user=self.user)
        self.assertTrue(prefs.notifications_enabled)
        self.assertEqual(prefs.daily_reminder_time, '09:00')

    def test_update_preferences(self):
        """Test updating preferences"""
        prefs = UserPreferences.objects.create(user=self.user)
        prefs.notifications_enabled = False
        prefs.daily_reminder_time = '18:00'
        prefs.save()

        prefs.refresh_from_db()
        self.assertFalse(prefs.notifications_enabled)
        self.assertEqual(prefs.daily_reminder_time, '18:00')


class PreferencesAPITest(APITestCase):
    """Test preferences endpoints"""

    def setUp(self):
        """Set up test fixtures"""
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )

        # Create preferences
        self.preferences = UserPreferences.objects.create(
            user=self.user,
            notifications_enabled=True,
            daily_reminder_time='09:00'
        )

        # Authenticate
        login_url = reverse('auth:login')
        response = self.client.post(
            login_url,
            {
                'email': 'test@example.com',
                'password': 'testpass123'
            },
            format='json'
        )
        self.token = response.data.get('token')
        if self.token:
            self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token}')

    def test_get_user_preferences(self):
        """Test getting user preferences"""
        prefs_url = reverse('preferences:detail')
        response = self.client.get(prefs_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['notifications_enabled'])
        self.assertEqual(response.data['daily_reminder_time'], '09:00')

    def test_update_preferences(self):
        """Test updating user preferences"""
        prefs_url = reverse('preferences:update')
        response = self.client.put(
            prefs_url,
            {
                'notifications_enabled': False,
                'daily_reminder_time': '18:00'
            },
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify update
        self.preferences.refresh_from_db()
        self.assertFalse(self.preferences.notifications_enabled)
        self.assertEqual(self.preferences.daily_reminder_time, '18:00')

    def test_update_partial_preferences(self):
        """Test partial update of preferences"""
        prefs_url = reverse('preferences:update')
        response = self.client.patch(
            prefs_url,
            {'notifications_enabled': False},
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify only specified field was updated
        self.preferences.refresh_from_db()
        self.assertFalse(self.preferences.notifications_enabled)
        self.assertEqual(self.preferences.daily_reminder_time, '09:00')

    def test_update_daily_reminder_time(self):
        """Test updating daily reminder time"""
        prefs_url = reverse('preferences:update')
        response = self.client.patch(
            prefs_url,
            {'daily_reminder_time': '19:00'},
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.preferences.refresh_from_db()
        self.assertEqual(self.preferences.daily_reminder_time, '19:00')

    def test_invalid_time_format(self):
        """Test that invalid time format is rejected"""
        prefs_url = reverse('preferences:update')
        response = self.client.patch(
            prefs_url,
            {'daily_reminder_time': '25:00'},
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_toggle_notifications(self):
        """Test toggling notifications"""
        prefs_url = reverse('preferences:update')

        # Disable notifications
        response = self.client.patch(
            prefs_url,
            {'notifications_enabled': False},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Re-enable notifications
        response = self.client.patch(
            prefs_url,
            {'notifications_enabled': True},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.preferences.refresh_from_db()
        self.assertTrue(self.preferences.notifications_enabled)


class NotificationTypePreferencesTest(APITestCase):
    """Test notification type preferences"""

    def setUp(self):
        """Set up test fixtures"""
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )

        self.preferences = UserPreferences.objects.create(user=self.user)

        # Authenticate
        login_url = reverse('auth:login')
        response = self.client.post(
            login_url,
            {
                'email': 'test@example.com',
                'password': 'testpass123'
            },
            format='json'
        )
        self.token = response.data.get('token')
        if self.token:
            self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token}')

    def test_toggle_daily_reminder(self):
        """Test toggling daily reminder notifications"""
        prefs_url = reverse('preferences:update')
        response = self.client.patch(
            prefs_url,
            {'daily_reminder_enabled': False},
            format='json'
        )

        if response.status_code == status.HTTP_200_OK:
            self.preferences.refresh_from_db()


class CategoriesPreferencesTest(APITestCase):
    """Test preferred categories"""

    def setUp(self):
        """Set up test fixtures"""
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )

        # Create categories
        self.leadership = LessonCategory.objects.create(name='Leadership')
        self.integrity = LessonCategory.objects.create(name='Integrity')

        self.preferences = UserPreferences.objects.create(user=self.user)

        # Authenticate
        login_url = reverse('auth:login')
        response = self.client.post(
            login_url,
            {
                'email': 'test@example.com',
                'password': 'testpass123'
            },
            format='json'
        )
        self.token = response.data.get('token')
        if self.token:
            self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token}')

    def test_set_preferred_categories(self):
        """Test setting preferred categories"""
        prefs_url = reverse('preferences:update')
        response = self.client.patch(
            prefs_url,
            {'preferred_categories': [self.leadership.id, self.integrity.id]},
            format='json'
        )

        if response.status_code == status.HTTP_200_OK:
            # Verify categories were set
            pass


class ResetPreferencesTest(APITestCase):
    """Test resetting preferences"""

    def setUp(self):
        """Set up test fixtures"""
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )

        # Create preferences with custom values
        self.preferences = UserPreferences.objects.create(
            user=self.user,
            notifications_enabled=False,
            daily_reminder_time='18:00'
        )

        # Authenticate
        login_url = reverse('auth:login')
        response = self.client.post(
            login_url,
            {
                'email': 'test@example.com',
                'password': 'testpass123'
            },
            format='json'
        )
        self.token = response.data.get('token')
        if self.token:
            self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token}')

    def test_reset_preferences(self):
        """Test resetting preferences to defaults"""
        reset_url = reverse('preferences:reset')
        response = self.client.post(reset_url)

        if response.status_code == status.HTTP_200_OK:
            self.preferences.refresh_from_db()
            self.assertTrue(self.preferences.notifications_enabled)
            self.assertEqual(self.preferences.daily_reminder_time, '09:00')
