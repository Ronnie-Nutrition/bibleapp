"""
Optimized views with caching and performance improvements
"""

from django.core.cache import cache
from django.db.models import Prefetch, Count, Avg, Q
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.views.decorators.vary import vary_on_headers
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Lesson, UserProgress, LessonCategory, BibleVerse
from .serializers import LessonSerializer, UserProgressSerializer
from .cache import LessonCache, CategoryCache, StatsCache, cache_result


class OptimizedLessonViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Optimized lesson viewset with caching and query optimization
    """
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Optimized queryset with select_related and prefetch_related
        """
        return Lesson.objects.select_related().prefetch_related(
            'verse_references',
            Prefetch(
                'user_progress',
                queryset=UserProgress.objects.filter(user=self.request.user),
                to_attr='current_user_progress'
            )
        ).filter(is_published=True)

    @method_decorator(vary_on_headers('Authorization'))
    @method_decorator(cache_page(60 * 15))  # Cache for 15 minutes
    def list(self, request, *args, **kwargs):
        """
        Cached lesson list with filtering
        """
        # Get query parameters
        category = request.query_params.get('category')
        difficulty = request.query_params.get('difficulty')
        featured = request.query_params.get('featured')
        search = request.query_params.get('search')

        # Try to get from cache first
        if not search:  # Don't cache search results for now
            cached_lessons = LessonCache.get_lesson_list(category, difficulty, featured)
            if cached_lessons:
                return Response(cached_lessons)

        # Build queryset with filters
        queryset = self.get_queryset()
        
        if category:
            queryset = queryset.filter(category=category)
        
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)
        
        if featured == 'true':
            queryset = queryset.filter(is_featured=True)
        
        if search:
            # Use full-text search for PostgreSQL
            queryset = queryset.extra(
                where=["to_tsvector('english', title || ' ' || content || ' ' || key_takeaway) @@ plainto_tsquery(%s)"],
                params=[search]
            )

        # Order by custom order field, then by creation date
        queryset = queryset.order_by('order', '-created_at')

        # Serialize and cache if not a search query
        serializer = self.get_serializer(queryset, many=True)
        
        if not search:
            LessonCache.set_lesson_list(serializer.data, category, difficulty, featured)
        
        return Response(serializer.data)

    @method_decorator(vary_on_headers('Authorization'))
    @method_decorator(cache_page(60 * 30))  # Cache for 30 minutes
    def retrieve(self, request, *args, **kwargs):
        """
        Cached lesson detail
        """
        lesson_id = kwargs.get('pk')
        
        # Try cache first
        cached_lesson = LessonCache.get_lesson_detail(lesson_id)
        if cached_lesson:
            return Response(cached_lesson)
        
        # Get from database with optimizations
        try:
            lesson = self.get_queryset().get(pk=lesson_id)
        except Lesson.DoesNotExist:
            return Response(
                {'error': 'Lesson not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = self.get_serializer(lesson)
        
        # Cache the result
        LessonCache.set_lesson_detail(lesson_id, serializer.data)
        
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """
        Get featured lessons (highly cached)
        """
        cached_featured = LessonCache.get_lesson_list(featured=True)
        if cached_featured:
            return Response(cached_featured)
        
        queryset = self.get_queryset().filter(is_featured=True).order_by('order')
        serializer = self.get_serializer(queryset, many=True)
        
        # Cache featured lessons for longer (they change less frequently)
        LessonCache.set_lesson_list(serializer.data, featured=True, timeout=60*60)  # 1 hour
        
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def categories(self, request):
        """
        Get lesson categories (cached)
        """
        categories = CategoryCache.get_all_categories()
        return Response(categories)

    @action(detail=False, methods=['get'])
    def popular(self, request):
        """
        Get popular lessons based on completion rates
        """
        cache_key = 'lessons:popular:lessons'
        cached_popular = cache.get(cache_key)
        
        if cached_popular:
            return Response(cached_popular)
        
        # Get lessons with high completion rates
        popular_lessons = Lesson.objects.annotate(
            completion_count=Count('user_progress', filter=Q(user_progress__status='completed')),
            avg_rating=Avg('user_progress__rating', filter=Q(user_progress__rating__isnull=False))
        ).filter(
            is_published=True,
            completion_count__gte=5  # At least 5 completions
        ).order_by('-completion_count', '-avg_rating')[:10]
        
        serializer = self.get_serializer(popular_lessons, many=True)
        
        # Cache for 1 hour
        cache.set(cache_key, serializer.data, 60 * 60)
        
        return Response(serializer.data)


class OptimizedUserProgressViewSet(viewsets.ModelViewSet):
    """
    Optimized user progress viewset
    """
    serializer_class = UserProgressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Get progress for the authenticated user only
        """
        return UserProgress.objects.select_related('lesson', 'user').filter(
            user=self.request.user
        )

    def list(self, request, *args, **kwargs):
        """
        Get user's progress with caching
        """
        user_id = request.user.id
        
        # Try cache first
        cached_progress = LessonCache.get_user_progress(user_id)
        if cached_progress:
            return Response(cached_progress)
        
        queryset = self.get_queryset().order_by('-started_at')
        serializer = self.get_serializer(queryset, many=True)
        
        # Cache user progress
        LessonCache.set_user_progress(user_id, serializer.data)
        
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        """
        Create progress record and invalidate cache
        """
        response = super().create(request, *args, **kwargs)
        
        if response.status_code == status.HTTP_201_CREATED:
            # Invalidate relevant caches
            user_id = request.user.id
            lesson_id = request.data.get('lesson')
            
            LessonCache.invalidate_user_progress_cache(user_id, lesson_id)
            StatsCache.invalidate_user_stats(user_id)
        
        return response

    def update(self, request, *args, **kwargs):
        """
        Update progress and invalidate cache
        """
        response = super().update(request, *args, **kwargs)
        
        if response.status_code == status.HTTP_200_OK:
            # Invalidate relevant caches
            user_id = request.user.id
            lesson_id = self.get_object().lesson_id
            
            LessonCache.invalidate_user_progress_cache(user_id, lesson_id)
            StatsCache.invalidate_user_stats(user_id)
            
            # If lesson was completed, invalidate global stats too
            if request.data.get('status') == 'completed':
                StatsCache.invalidate_global_stats()
        
        return response

    @action(detail=False, methods=['get'])
    def completed(self, request):
        """
        Get completed lessons for user
        """
        user_id = request.user.id
        cache_key = f'progress:completed:{user_id}'
        
        cached_completed = cache.get(cache_key)
        if cached_completed:
            return Response(cached_completed)
        
        completed_progress = self.get_queryset().filter(status='completed').order_by('-completed_at')
        serializer = self.get_serializer(completed_progress, many=True)
        
        # Cache for 10 minutes
        cache.set(cache_key, serializer.data, 60 * 10)
        
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def favorites(self, request):
        """
        Get favorite lessons for user
        """
        user_id = request.user.id
        cache_key = f'progress:favorites:{user_id}'
        
        cached_favorites = cache.get(cache_key)
        if cached_favorites:
            return Response(cached_favorites)
        
        favorite_progress = self.get_queryset().filter(is_favorite=True).order_by('-started_at')
        serializer = self.get_serializer(favorite_progress, many=True)
        
        # Cache for 15 minutes
        cache.set(cache_key, serializer.data, 60 * 15)
        
        return Response(serializer.data)


class StatsViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Statistics viewset with heavy caching
    """
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def user_stats(self, request):
        """
        Get user statistics
        """
        user_id = request.user.id
        stats = StatsCache.get_user_stats(user_id)
        
        if stats is None:
            # User stats don't exist, create them
            from apps.auth_app.models import UserStats
            stats_obj, created = UserStats.objects.get_or_create(user_id=user_id)
            stats = StatsCache.get_user_stats(user_id)  # Re-fetch from cache
        
        return Response(stats)

    @action(detail=False, methods=['get'])
    def global_stats(self, request):
        """
        Get global application statistics
        """
        stats = StatsCache.get_global_stats()
        return Response(stats)

    @action(detail=False, methods=['get'])
    def leaderboard(self, request):
        """
        Get leaderboard data (top users by streaks)
        """
        cache_key = 'stats:leaderboard'
        cached_leaderboard = cache.get(cache_key)
        
        if cached_leaderboard:
            return Response(cached_leaderboard)
        
        from apps.auth_app.models import UserStats
        
        # Get top 10 users by current streak
        top_streaks = UserStats.objects.select_related('user').filter(
            current_streak__gt=0
        ).order_by('-current_streak', '-longest_streak')[:10]
        
        leaderboard = []
        for stats in top_streaks:
            leaderboard.append({
                'user_id': stats.user.id,
                'display_name': stats.user.get_full_name() or stats.user.username,
                'current_streak': stats.current_streak,
                'longest_streak': stats.longest_streak,
                'lessons_completed': stats.lessons_completed,
            })
        
        # Cache for 30 minutes
        cache.set(cache_key, leaderboard, 60 * 30)
        
        return Response(leaderboard)