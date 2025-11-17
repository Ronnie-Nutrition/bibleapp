"""
Lessons Views
REST API views for lessons, user progress, and related content
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db.models import Q, Count, Avg
from django.shortcuts import get_object_or_404
from .models import Lesson, UserProgress, LessonCategory
from .serializers import (
    LessonListSerializer, LessonDetailSerializer, UserProgressSerializer,
    UserProgressCreateUpdateSerializer, LessonFilterSerializer, LessonProgressStatsSerializer
)


class LessonViewSet(viewsets.ModelViewSet):
    """
    ViewSet for lessons
    Provides list, retrieve, and filtering functionality
    """

    serializer_class = LessonListSerializer
    permission_classes = [AllowAny]
    filterset_fields = ['category', 'difficulty', 'is_featured', 'is_published']

    def get_queryset(self):
        """Get lessons queryset with filtering"""
        queryset = Lesson.objects.filter(is_published=True).order_by('-created_at')

        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)

        # Filter by difficulty
        difficulty = self.request.query_params.get('difficulty')
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)

        # Filter by featured
        is_featured = self.request.query_params.get('is_featured')
        if is_featured:
            queryset = queryset.filter(is_featured=is_featured.lower() == 'true')

        # Search by title or subtitle
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(subtitle__icontains=search) |
                Q(content__icontains=search)
            )

        # Duration filtering
        min_duration = self.request.query_params.get('min_duration')
        if min_duration:
            queryset = queryset.filter(duration__gte=int(min_duration))

        max_duration = self.request.query_params.get('max_duration')
        if max_duration:
            queryset = queryset.filter(duration__lte=int(max_duration))

        # Ordering
        ordering = self.request.query_params.get('ordering', '-created_at')
        queryset = queryset.order_by(ordering)

        return queryset

    def get_serializer_class(self):
        """Use detail serializer for retrieve action"""
        if self.action == 'retrieve':
            return LessonDetailSerializer
        return LessonListSerializer

    @action(detail=True, methods=['get'])
    def detail(self, request, pk=None):
        """Get detailed lesson information"""
        lesson = self.get_object()
        serializer = LessonDetailSerializer(lesson)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Get all lesson categories"""
        categories = LessonCategory.objects.all()
        from apps.lessons.serializers import LessonCategorySerializer
        serializer = LessonCategorySerializer(categories, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured lessons"""
        lessons = self.get_queryset().filter(is_featured=True)[:6]
        serializer = self.get_serializer(lessons, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def user_progress(self, request, pk=None):
        """Get user's progress on a specific lesson"""
        lesson = self.get_object()

        try:
            progress = UserProgress.objects.get(user=request.user, lesson=lesson)
        except UserProgress.DoesNotExist:
            # Return default progress if not started
            progress = UserProgress(user=request.user, lesson=lesson, status='not_started')

        serializer = UserProgressSerializer(progress)
        return Response(serializer.data)


class UserProgressViewSet(viewsets.ModelViewSet):
    """
    ViewSet for user lesson progress
    Allows users to track their progress on lessons
    """

    serializer_class = UserProgressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Get user's progress on lessons"""
        return UserProgress.objects.filter(user=self.request.user).order_by('-started_at')

    def create(self, request, *args, **kwargs):
        """Create or update user progress on a lesson"""
        serializer = UserProgressCreateUpdateSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        lesson_id = serializer.validated_data.get('lesson')

        try:
            lesson = Lesson.objects.get(id=lesson_id)
        except Lesson.DoesNotExist:
            return Response({
                'error': 'Lesson not found',
                'code': 'LESSON_NOT_FOUND'
            }, status=status.HTTP_404_NOT_FOUND)

        progress, created = UserProgress.objects.get_or_create(
            user=request.user,
            lesson=lesson
        )

        # Update fields
        for field, value in serializer.validated_data.items():
            setattr(progress, field, value)

        progress.save()

        return Response(
            UserProgressSerializer(progress).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )

    def update(self, request, *args, **kwargs):
        """Update user progress on a lesson"""
        serializer = UserProgressCreateUpdateSerializer(data=request.data, partial=True)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        progress = self.get_object()

        for field, value in serializer.validated_data.items():
            setattr(progress, field, value)

        progress.save()

        return Response(UserProgressSerializer(progress).data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get user's progress statistics"""
        progresses = self.get_queryset()

        total_lessons = Lesson.objects.filter(is_published=True).count()
        lessons_completed = progresses.filter(status='completed').count()
        lessons_started = progresses.filter(status='in_progress').count()
        lessons_not_started = total_lessons - (lessons_completed + lessons_started)

        completed_progresses = progresses.filter(status='completed')
        avg_percentage = completed_progresses.aggregate(
            avg=Avg('progress_percentage')
        )['avg'] or 0

        total_time = progresses.aggregate(
            total=Count('time_spent', distinct=True)
        )['total'] or 0

        avg_rating = progresses.filter(rating__isnull=False).aggregate(
            avg=Avg('rating')
        )['avg'] or 0

        favorite_count = progresses.filter(is_favorite=True).count()

        data = {
            'total_lessons': total_lessons,
            'lessons_completed': lessons_completed,
            'lessons_started': lessons_started,
            'lessons_not_started': lessons_not_started,
            'average_completion_percentage': avg_percentage,
            'total_time_spent': total_time,
            'average_rating': avg_rating,
            'favorite_count': favorite_count
        }

        serializer = LessonProgressStatsSerializer(data)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def completed(self, request):
        """Get completed lessons"""
        progresses = self.get_queryset().filter(status='completed')
        serializer = self.get_serializer(progresses, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def in_progress(self, request):
        """Get in-progress lessons"""
        progresses = self.get_queryset().filter(status='in_progress')
        serializer = self.get_serializer(progresses, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def not_started(self, request):
        """Get not-started lessons"""
        progresses = self.get_queryset().filter(status='not_started')
        serializer = self.get_serializer(progresses, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def favorites(self, request):
        """Get favorite lessons"""
        progresses = self.get_queryset().filter(is_favorite=True)
        serializer = self.get_serializer(progresses, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def mark_completed(self, request, pk=None):
        """Mark a lesson as completed"""
        progress = self.get_object()
        progress.status = 'completed'
        progress.progress_percentage = 100
        progress.completed_at = __import__('django.utils.timezone', fromlist=['now']).now()
        progress.save()

        return Response(UserProgressSerializer(progress).data)

    @action(detail=True, methods=['post'])
    def toggle_favorite(self, request, pk=None):
        """Toggle lesson as favorite"""
        progress = self.get_object()
        progress.is_favorite = not progress.is_favorite
        progress.save()

        return Response(UserProgressSerializer(progress).data)
