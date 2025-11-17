"""
Authentication Serializers
Serializers for user registration, login, and profile management
"""

from rest_framework import serializers
from django.contrib.auth import authenticate
from email_validator import validate_email, EmailNotValidError
from .models import CustomUser, UserPreferences, UserStats
import re


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user profile data"""

    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'first_name', 'last_name', 'username',
            'email_verified', 'profile_image_url', 'bio',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'email_verified']


class UserPreferencesSerializer(serializers.ModelSerializer):
    """Serializer for user preferences"""

    class Meta:
        model = UserPreferences
        fields = [
            'notifications_enabled', 'email_notifications', 'daily_lessons_enabled',
            'daily_reminder_time', 'preferred_categories', 'notification_types',
            'theme', 'language'
        ]


class UserStatsSerializer(serializers.ModelSerializer):
    """Serializer for user statistics"""

    class Meta:
        model = UserStats
        fields = [
            'lessons_completed', 'lessons_started', 'total_time_spent',
            'favorite_count', 'current_streak', 'longest_streak',
            'total_sessions', 'average_session_duration'
        ]
        read_only_fields = fields


class UserDetailSerializer(serializers.ModelSerializer):
    """Detailed user serializer including preferences and stats"""

    preferences = UserPreferencesSerializer(read_only=True)
    stats = UserStatsSerializer(read_only=True)

    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'first_name', 'last_name', 'username',
            'email_verified', 'profile_image_url', 'bio',
            'preferences', 'stats', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'email_verified']


class RegisterSerializer(serializers.Serializer):
    """Serializer for user registration"""

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    display_name = serializers.CharField(max_length=50)

    def validate_email(self, value):
        """Validate email format"""
        try:
            validate_email(value)
        except EmailNotValidError as e:
            raise serializers.ValidationError(f"Invalid email format: {str(e)}")

        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered")

        return value.lower().strip()

    def validate_password(self, value):
        """Validate password strength"""
        errors = []

        if len(value) < 8:
            errors.append("Password must be at least 8 characters long")

        if not any(char.isupper() for char in value):
            errors.append("Password must contain at least one uppercase letter (A-Z)")

        if not any(char.islower() for char in value):
            errors.append("Password must contain at least one lowercase letter (a-z)")

        if not any(char.isdigit() for char in value):
            errors.append("Password must contain at least one number (0-9)")

        if not any(char in "!@#$%^&*()_+-=[]{};\':\"\\|,.<>/?" for char in value):
            errors.append("Password must contain at least one special character (!@#$%^&*)")

        if errors:
            raise serializers.ValidationError({
                'error': 'Password does not meet strength requirements',
                'code': 'WEAK_PASSWORD',
                'details': errors
            })

        return value

    def validate_display_name(self, value):
        """Validate display name"""
        trimmed = value.strip()

        if len(trimmed) < 2:
            raise serializers.ValidationError("Display name must be at least 2 characters long")

        if len(trimmed) > 50:
            raise serializers.ValidationError("Display name must not exceed 50 characters")

        if not re.match(r"^[a-zA-Z\s'-]+$", trimmed):
            raise serializers.ValidationError(
                "Display name can only contain letters, spaces, hyphens, and apostrophes"
            )

        return trimmed

    def create(self, validated_data):
        """Create user with validated data"""
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            username=validated_data['email'],
            first_name=validated_data['display_name'].split()[0],
            last_name=' '.join(validated_data['display_name'].split()[1:]) if ' ' in validated_data['display_name'] else ''
        )

        # Create user preferences
        UserPreferences.objects.create(
            user=user,
            notifications_enabled=True,
            email_notifications=True,
            daily_lessons_enabled=True,
            notification_types={
                'new-lessons': True,
                'announcements': True,
                'reminders': True,
                'daily-lessons': True
            }
        )

        # Create user stats
        UserStats.objects.create(user=user)

        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for user login"""

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        """Validate login credentials"""
        email = data.get('email', '').lower().strip()
        password = data.get('password', '')

        if not email or not password:
            raise serializers.ValidationError({
                'error': 'Email and password are required',
                'code': 'MISSING_CREDENTIALS'
            })

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError({
                'error': 'Invalid email or password',
                'code': 'INVALID_CREDENTIALS'
            })

        if not user.check_password(password):
            raise serializers.ValidationError({
                'error': 'Invalid email or password',
                'code': 'INVALID_CREDENTIALS'
            })

        if not user.is_active:
            raise serializers.ValidationError({
                'error': 'User account is inactive',
                'code': 'INACTIVE_USER'
            })

        data['user'] = user
        return data


class PasswordResetSerializer(serializers.Serializer):
    """Serializer for password reset request"""

    email = serializers.EmailField()

    def validate_email(self, value):
        """Check if user with email exists"""
        try:
            CustomUser.objects.get(email=value.lower().strip())
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError({
                'error': 'User not found',
                'code': 'USER_NOT_FOUND'
            })

        return value.lower().strip()


class PasswordChangeSerializer(serializers.Serializer):
    """Serializer for password change"""

    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    new_password_confirm = serializers.CharField(write_only=True, min_length=8)

    def validate_new_password(self, value):
        """Validate new password strength"""
        errors = []

        if len(value) < 8:
            errors.append("Password must be at least 8 characters long")

        if not any(char.isupper() for char in value):
            errors.append("Password must contain at least one uppercase letter (A-Z)")

        if not any(char.islower() for char in value):
            errors.append("Password must contain at least one lowercase letter (a-z)")

        if not any(char.isdigit() for char in value):
            errors.append("Password must contain at least one number (0-9)")

        if not any(char in "!@#$%^&*()_+-=[]{};\':\"\\|,.<>/?" for char in value):
            errors.append("Password must contain at least one special character (!@#$%^&*)")

        if errors:
            raise serializers.ValidationError(errors)

        return value

    def validate(self, data):
        """Validate password fields"""
        if data.get('new_password') != data.get('new_password_confirm'):
            raise serializers.ValidationError({
                'new_password_confirm': 'Passwords do not match'
            })

        if data.get('new_password') == data.get('current_password'):
            raise serializers.ValidationError({
                'new_password': 'New password must be different from current password'
            })

        return data


class UpdateEmailSerializer(serializers.Serializer):
    """Serializer for email update"""

    new_email = serializers.EmailField()

    def validate_new_email(self, value):
        """Validate new email"""
        try:
            validate_email(value)
        except EmailNotValidError as e:
            raise serializers.ValidationError(f"Invalid email format: {str(e)}")

        if CustomUser.objects.filter(email=value.lower().strip()).exists():
            raise serializers.ValidationError("Email already registered")

        return value.lower().strip()
