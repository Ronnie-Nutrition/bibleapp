"""
Authentication Views
REST API views for user registration, login, and account management
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate
from .models import CustomUser, UserPreferences, UserStats
from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer, UserDetailSerializer,
    PasswordResetSerializer, PasswordChangeSerializer, UpdateEmailSerializer
)


class AuthViewSet(viewsets.ViewSet):
    """
    ViewSet for authentication operations
    Handles registration, login, password reset, and account management
    """

    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        """
        Register a new user
        POST /api/auth/register/
        """
        serializer = RegisterSerializer(data=request.data)

        if not serializer.is_valid():
            errors = serializer.errors
            # Format validation errors
            if 'non_field_errors' in errors:
                return Response({
                    'error': str(errors['non_field_errors'][0]),
                    'code': 'VALIDATION_ERROR'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Get first error
            first_error_key = list(errors.keys())[0]
            error_message = errors[first_error_key]

            if isinstance(error_message, dict):
                # Structured error response
                return Response(error_message, status=status.HTTP_400_BAD_REQUEST)
            else:
                # String error message
                return Response({
                    'error': str(error_message[0]) if isinstance(error_message, list) else str(error_message),
                    'code': 'REGISTRATION_ERROR'
                }, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = serializer.save()
            return Response({
                'userId': user.id,
                'email': user.email,
                'displayName': user.get_full_name() or user.username
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                'error': str(e),
                'code': 'REGISTRATION_ERROR'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        """
        Authenticate user and return user data
        POST /api/auth/login/
        """
        serializer = LoginSerializer(data=request.data)

        if not serializer.is_valid():
            errors = serializer.errors
            if 'non_field_errors' in errors:
                error_response = errors['non_field_errors'][0]
                if isinstance(error_response, dict):
                    return Response(error_response, status=status.HTTP_401_UNAUTHORIZED)
                else:
                    return Response({
                        'error': str(error_response),
                        'code': 'LOGIN_ERROR'
                    }, status=status.HTTP_401_UNAUTHORIZED)

            return Response({
                'error': 'Invalid email or password',
                'code': 'INVALID_CREDENTIALS'
            }, status=status.HTTP_401_UNAUTHORIZED)

        user = serializer.validated_data.get('user')

        user_serializer = UserDetailSerializer(user)

        return Response({
            'userId': user.id,
            'email': user.email,
            'displayName': user.get_full_name() or user.username,
            'user': user_serializer.data
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def forgot_password(self, request):
        """
        Generate password reset link
        POST /api/auth/forgot-password/
        """
        serializer = PasswordResetSerializer(data=request.data)

        if not serializer.is_valid():
            errors = serializer.errors
            if 'email' in errors:
                error_response = errors['email'][0]
                if isinstance(error_response, dict):
                    return Response(error_response, status=status.HTTP_404_NOT_FOUND)

            return Response({
                'error': 'User not found',
                'code': 'USER_NOT_FOUND'
            }, status=status.HTTP_404_NOT_FOUND)

        return Response({
            'success': True,
            'message': 'Password reset link sent to email'
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def reset_password(self, request):
        """
        Reset password (requires current password verification)
        POST /api/auth/reset-password/
        """
        serializer = PasswordChangeSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        current_password = serializer.validated_data.get('current_password')

        # Verify current password
        if not user.check_password(current_password):
            return Response({
                'error': 'Current password is incorrect',
                'code': 'INVALID_PASSWORD'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Set new password
        new_password = serializer.validated_data.get('new_password')
        user.set_password(new_password)
        user.password_changed_at = __import__('django.utils.timezone', fromlist=['now']).now()
        user.save()

        return Response({
            'success': True,
            'message': 'Password changed successfully'
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def update_email(self, request):
        """
        Update user email
        POST /api/auth/update-email/
        """
        serializer = UpdateEmailSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        new_email = serializer.validated_data.get('new_email')

        user.email = new_email
        user.username = new_email
        user.email_verified = False
        user.save()

        return Response({
            'success': True,
            'message': 'Email updated successfully',
            'email': new_email
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """
        Get current user profile
        GET /api/auth/me/
        """
        serializer = UserDetailSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def logout(self, request):
        """
        Logout user (mainly for clearing tokens on client)
        POST /api/auth/logout/
        """
        return Response({
            'success': True,
            'message': 'Logged out successfully'
        }, status=status.HTTP_200_OK)


class UserViewSet(viewsets.ViewSet):
    """
    ViewSet for user profile operations
    """

    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def profile(self, request):
        """
        Get current user profile
        GET /api/users/profile/
        """
        serializer = UserDetailSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['patch'])
    def profile_update(self, request):
        """
        Update user profile
        PATCH /api/users/profile/
        """
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=True)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get user statistics
        GET /api/users/stats/
        """
        try:
            stats = UserStats.objects.get(user=request.user)
        except UserStats.DoesNotExist:
            stats = UserStats.objects.create(user=request.user)

        from apps.lessons.serializers import UserStatsSerializer
        serializer = UserStatsSerializer(stats)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get', 'patch'])
    def preferences(self, request):
        """
        Get or update user preferences
        GET /api/users/preferences/
        PATCH /api/users/preferences/
        """
        try:
            preferences = UserPreferences.objects.get(user=request.user)
        except UserPreferences.DoesNotExist:
            preferences = UserPreferences.objects.create(
                user=request.user,
                notification_types={
                    'new-lessons': True,
                    'announcements': True,
                    'reminders': True,
                    'daily-lessons': True
                }
            )

        from apps.auth_app.serializers import UserPreferencesSerializer

        if request.method == 'GET':
            serializer = UserPreferencesSerializer(preferences)
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method == 'PATCH':
            serializer = UserPreferencesSerializer(preferences, data=request.data, partial=True)

            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
