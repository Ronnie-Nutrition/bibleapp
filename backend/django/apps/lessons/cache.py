"""
Caching utilities for lessons app
Implements Redis-based caching for improved performance
"""

from django.core.cache import cache
from django.conf import settings
from django.utils import timezone
from functools import wraps
import json
import hashlib
import logging

logger = logging.getLogger(__name__)

# Cache timeouts (in seconds)
CACHE_TIMEOUTS = {
    'lesson_list': 60 * 15,      # 15 minutes for lesson lists
    'lesson_detail': 60 * 30,    # 30 minutes for individual lessons
    'user_progress': 60 * 5,     # 5 minutes for user progress
    'categories': 60 * 60,       # 1 hour for categories (rarely change)
    'stats': 60 * 10,           # 10 minutes for statistics
    'search_results': 60 * 30,   # 30 minutes for search results
}


def make_cache_key(*args, prefix=None):
    """
    Generate a consistent cache key from arguments
    """
    key_parts = []
    
    if prefix:
        key_parts.append(prefix)
    
    for arg in args:
        if isinstance(arg, (dict, list)):
            # Convert complex types to JSON for consistent keys
            key_parts.append(hashlib.md5(json.dumps(arg, sort_keys=True).encode()).hexdigest()[:8])
        else:
            key_parts.append(str(arg))
    
    return ':'.join(key_parts)


def cache_result(timeout=300, prefix=None):
    """
    Decorator to cache function results
    
    Args:
        timeout: Cache timeout in seconds
        prefix: Cache key prefix
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key from function name, args, and kwargs
            cache_key = make_cache_key(
                func.__name__,
                args,
                sorted(kwargs.items()),
                prefix=prefix
            )
            
            # Try to get from cache first
            result = cache.get(cache_key)
            if result is not None:
                logger.debug(f"Cache hit for {func.__name__}: {cache_key}")
                return result
            
            # Execute function and cache result
            result = func(*args, **kwargs)
            cache.set(cache_key, result, timeout)
            logger.debug(f"Cache set for {func.__name__}: {cache_key}")
            
            return result
        return wrapper
    return decorator


class LessonCache:
    """
    Centralized caching for lesson-related data
    """
    
    @staticmethod
    def get_lesson_list(category=None, difficulty=None, featured=None):
        """Get cached lesson list with filters"""
        cache_key = make_cache_key(
            'lesson_list',
            category or 'all',
            difficulty or 'all',
            featured or 'all',
            prefix='lessons'
        )
        return cache.get(cache_key)
    
    @staticmethod
    def set_lesson_list(lessons, category=None, difficulty=None, featured=None, timeout=None):
        """Cache lesson list"""
        cache_key = make_cache_key(
            'lesson_list',
            category or 'all',
            difficulty or 'all',
            featured or 'all',
            prefix='lessons'
        )
        timeout = timeout or CACHE_TIMEOUTS['lesson_list']
        cache.set(cache_key, lessons, timeout)
    
    @staticmethod
    def get_lesson_detail(lesson_id):
        """Get cached lesson detail"""
        cache_key = make_cache_key('lesson_detail', lesson_id, prefix='lessons')
        return cache.get(cache_key)
    
    @staticmethod
    def set_lesson_detail(lesson_id, lesson_data, timeout=None):
        """Cache lesson detail"""
        cache_key = make_cache_key('lesson_detail', lesson_id, prefix='lessons')
        timeout = timeout or CACHE_TIMEOUTS['lesson_detail']
        cache.set(cache_key, lesson_data, timeout)
    
    @staticmethod
    def get_user_progress(user_id, lesson_id=None):
        """Get cached user progress"""
        if lesson_id:
            cache_key = make_cache_key('user_progress', user_id, lesson_id, prefix='progress')
        else:
            cache_key = make_cache_key('user_progress_all', user_id, prefix='progress')
        return cache.get(cache_key)
    
    @staticmethod
    def set_user_progress(user_id, progress_data, lesson_id=None, timeout=None):
        """Cache user progress"""
        if lesson_id:
            cache_key = make_cache_key('user_progress', user_id, lesson_id, prefix='progress')
        else:
            cache_key = make_cache_key('user_progress_all', user_id, prefix='progress')
        timeout = timeout or CACHE_TIMEOUTS['user_progress']
        cache.set(cache_key, progress_data, timeout)
    
    @staticmethod
    def invalidate_lesson_caches(lesson_id=None):
        """Invalidate lesson-related caches"""
        patterns = [
            'lessons:lesson_list:*',
            'lessons:categories:*',
        ]
        
        if lesson_id:
            patterns.append(f'lessons:lesson_detail:{lesson_id}')
        else:
            patterns.append('lessons:lesson_detail:*')
        
        # Clear cache patterns (Redis-specific)
        if hasattr(cache, 'delete_pattern'):
            for pattern in patterns:
                cache.delete_pattern(pattern)
                logger.info(f"Invalidated cache pattern: {pattern}")
    
    @staticmethod
    def invalidate_user_progress_cache(user_id, lesson_id=None):
        """Invalidate user progress caches"""
        if lesson_id:
            cache_key = make_cache_key('user_progress', user_id, lesson_id, prefix='progress')
            cache.delete(cache_key)
        
        # Also clear user's overall progress
        cache_key = make_cache_key('user_progress_all', user_id, prefix='progress')
        cache.delete(cache_key)
        logger.info(f"Invalidated user progress cache for user {user_id}")


class CategoryCache:
    """
    Caching for lesson categories
    """
    
    @staticmethod
    @cache_result(timeout=CACHE_TIMEOUTS['categories'], prefix='categories')
    def get_all_categories():
        """Get all lesson categories (rarely change, cache longer)"""
        from .models import LessonCategory
        return list(LessonCategory.objects.all().values('id', 'name', 'description', 'icon_url', 'order'))
    
    @staticmethod
    def invalidate_categories():
        """Invalidate category cache"""
        cache_key = make_cache_key('get_all_categories', prefix='categories')
        cache.delete(cache_key)


class StatsCache:
    """
    Caching for statistics and analytics
    """
    
    @staticmethod
    @cache_result(timeout=CACHE_TIMEOUTS['stats'], prefix='stats')
    def get_user_stats(user_id):
        """Get cached user statistics"""
        from apps.auth_app.models import UserStats
        try:
            stats = UserStats.objects.get(user_id=user_id)
            return {
                'lessons_completed': stats.lessons_completed,
                'lessons_started': stats.lessons_started,
                'total_time_spent': stats.total_time_spent,
                'current_streak': stats.current_streak,
                'longest_streak': stats.longest_streak,
                'favorite_count': stats.favorite_count,
                'total_sessions': stats.total_sessions,
                'average_session_duration': stats.average_session_duration,
            }
        except UserStats.DoesNotExist:
            return None
    
    @staticmethod
    @cache_result(timeout=CACHE_TIMEOUTS['stats'], prefix='stats')
    def get_global_stats():
        """Get cached global statistics"""
        from django.db.models import Count, Avg, Sum
        from .models import Lesson, UserProgress
        from apps.auth_app.models import CustomUser
        
        return {
            'total_users': CustomUser.objects.count(),
            'total_lessons': Lesson.objects.filter(is_published=True).count(),
            'total_completions': UserProgress.objects.filter(status='completed').count(),
            'average_rating': UserProgress.objects.filter(rating__isnull=False).aggregate(avg=Avg('rating'))['avg'],
        }
    
    @staticmethod
    def invalidate_user_stats(user_id):
        """Invalidate user statistics cache"""
        cache_key = make_cache_key('get_user_stats', user_id, prefix='stats')
        cache.delete(cache_key)
    
    @staticmethod
    def invalidate_global_stats():
        """Invalidate global statistics cache"""
        cache_key = make_cache_key('get_global_stats', prefix='stats')
        cache.delete(cache_key)


# Utility functions for common caching patterns
def warm_cache():
    """
    Warm up commonly accessed caches
    Should be called after deployments or during off-peak hours
    """
    logger.info("Starting cache warm-up...")
    
    try:
        # Warm up categories
        CategoryCache.get_all_categories()
        
        # Warm up global stats
        StatsCache.get_global_stats()
        
        # Warm up featured lessons
        from .models import Lesson
        featured_lessons = list(Lesson.objects.filter(
            is_published=True, 
            is_featured=True
        ).order_by('order').values())
        LessonCache.set_lesson_list(featured_lessons, featured=True)
        
        logger.info("Cache warm-up completed successfully")
        
    except Exception as e:
        logger.error(f"Cache warm-up failed: {str(e)}")


def clear_all_caches():
    """
    Clear all application caches
    Use with caution - will cause temporary performance impact
    """
    logger.warning("Clearing all application caches...")
    
    if hasattr(cache, 'delete_pattern'):
        patterns = ['lessons:*', 'progress:*', 'categories:*', 'stats:*']
        for pattern in patterns:
            cache.delete_pattern(pattern)
    else:
        # Fallback for cache backends that don't support patterns
        cache.clear()
    
    logger.warning("All caches cleared")
    

def get_cache_stats():
    """
    Get cache statistics for monitoring
    """
    if hasattr(cache, 'get_stats'):
        return cache.get_stats()
    return {"error": "Cache stats not available for this backend"}