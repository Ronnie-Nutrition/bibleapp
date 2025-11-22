from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
import json

User = get_user_model()


class CustomUserModelTest(TestCase):
    """Test the CustomUser model"""

    def test_create_user(self):
        """Test creating a regular user"""
        user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            display_name='Test User'
        )
        self.assertEqual(user.email, 'test@example.com')
        self.assertEqual(user.display_name, 'Test User')
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)

    def test_create_superuser(self):
        """Test creating a superuser"""
        admin = User.objects.create_superuser(
            email='admin@example.com',
            password='adminpass123'
        )
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)

    def test_user_string_representation(self):
        """Test user string representation"""
        user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            display_name='Test User'
        )
        self.assertEqual(str(user), 'test@example.com')


class UserPreferencesModelTest(TestCase):
    """Test the UserPreferences model"""

    def setUp(self):
        """Set up test fixtures"""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )

    def test_create_user_preferences(self):
        """Test creating user preferences"""
        from apps.auth_app.models import UserPreferences

        prefs = UserPreferences.objects.create(
            user=self.user,
            notifications_enabled=True,
            daily_reminder_time='09:00'
        )
        self.assertEqual(prefs.user, self.user)
        self.assertTrue(prefs.notifications_enabled)
        self.assertEqual(prefs.daily_reminder_time, '09:00')

    def test_preferences_default_values(self):
        """Test default values for preferences"""
        from apps.auth_app.models import UserPreferences

        prefs = UserPreferences.objects.create(user=self.user)
        self.assertTrue(prefs.notifications_enabled)
        self.assertEqual(prefs.daily_reminder_time, '09:00')


class AuthenticationAPITest(APITestCase):
    """Test authentication endpoints"""

    def setUp(self):
        """Set up test fixtures"""
        self.client = APIClient()
        self.register_url = reverse('auth:register')
        self.login_url = reverse('auth:login')
        self.test_user_data = {
            'email': 'test@example.com',
            'password': 'testpass123',
            'display_name': 'Test User'
        }

    def test_user_registration_success(self):
        """Test successful user registration"""
        response = self.client.post(
            self.register_url,
            self.test_user_data,
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(User.objects.get().email, 'test@example.com')

    def test_user_registration_missing_email(self):
        """Test registration fails with missing email"""
        data = self.test_user_data.copy()
        del data['email']

        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_registration_invalid_email(self):
        """Test registration fails with invalid email"""
        data = self.test_user_data.copy()
        data['email'] = 'invalid-email'

        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_registration_duplicate_email(self):
        """Test registration fails with duplicate email"""
        # Create first user
        User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )

        # Try to register with same email
        response = self.client.post(
            self.register_url,
            self.test_user_data,
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_login_success(self):
        """Test successful user login"""
        # Create user
        User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )

        # Login
        response = self.client.post(
            self.login_url,
            {
                'email': 'test@example.com',
                'password': 'testpass123'
            },
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)

    def test_user_login_wrong_password(self):
        """Test login fails with wrong password"""
        User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )

        response = self.client.post(
            self.login_url,
            {
                'email': 'test@example.com',
                'password': 'wrongpassword'
            },
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_login_nonexistent_user(self):
        """Test login fails with nonexistent user"""
        response = self.client.post(
            self.login_url,
            {
                'email': 'nonexistent@example.com',
                'password': 'anypassword'
            },
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_profile_fetch(self):
        """Test fetching user profile"""
        user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            display_name='Test User'
        )

        # Authenticate
        response = self.client.post(
            self.login_url,
            {
                'email': 'test@example.com',
                'password': 'testpass123'
            },
            format='json'
        )
        token = response.data['token']

        # Fetch profile
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token}')
        profile_url = reverse('auth:profile')
        response = self.client.get(profile_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'test@example.com')

    def test_user_logout(self):
        """Test user logout"""
        user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )

        # Login
        response = self.client.post(
            self.login_url,
            {
                'email': 'test@example.com',
                'password': 'testpass123'
            },
            format='json'
        )
        token = response.data['token']

        # Logout
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token}')
        logout_url = reverse('auth:logout')
        response = self.client.post(logout_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)


class PasswordResetTest(APITestCase):
    """Test password reset functionality"""

    def setUp(self):
        """Set up test fixtures"""
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='oldpassword123'
        )

    def test_password_reset_request(self):
        """Test requesting password reset"""
        forgot_password_url = reverse('auth:forgot-password')
        response = self.client.post(
            forgot_password_url,
            {'email': 'test@example.com'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_password_reset_nonexistent_email(self):
        """Test password reset with nonexistent email"""
        forgot_password_url = reverse('auth:forgot-password')
        response = self.client.post(
            forgot_password_url,
            {'email': 'nonexistent@example.com'},
            format='json'
        )
        # Should return 404
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_password_reset_change(self):
        """Test changing password after reset"""
        reset_url = reverse('auth:reset-password')
        response = self.client.post(
            reset_url,
            {
                'email': 'test@example.com',
                'old_password': 'oldpassword123',
                'new_password': 'newpassword123'
            },
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify login with new password works
        login_url = reverse('auth:login')
        response = self.client.post(
            login_url,
            {
                'email': 'test@example.com',
                'password': 'newpassword123'
            },
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class UserStatsTest(APITestCase):
    """Test user statistics"""

    def setUp(self):
        """Set up test fixtures"""
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )

    def test_get_user_stats(self):
        """Test fetching user stats"""
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
        token = response.data['token']

        # Get stats
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token}')
        stats_url = reverse('auth:stats')
        response = self.client.get(stats_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('lessons_completed', response.data)
        self.assertIn('total_study_time', response.data)
