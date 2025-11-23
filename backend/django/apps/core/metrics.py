"""
Application metrics collection and endpoint
"""
import time
import psutil
from django.http import JsonResponse
from django.conf import settings
from django.core.cache import cache
from django.db import connection
from django.utils import timezone
from django.contrib.auth import get_user_model
from apps.lessons.models import Lesson, UserProgress
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
from prometheus_client.core import CollectorRegistry
import logging

logger = logging.getLogger(__name__)

User = get_user_model()

# Create a custom registry for our metrics
registry = CollectorRegistry()

# Define Prometheus metrics
request_count = Counter('django_requests_total', 'Total requests', ['method', 'endpoint', 'status'], registry=registry)
request_duration = Histogram('django_request_duration_seconds', 'Request duration', ['method', 'endpoint'], registry=registry)
active_users = Gauge('django_active_users', 'Number of active users', registry=registry)
total_lessons = Gauge('django_total_lessons', 'Total number of lessons', registry=registry)
completed_lessons = Gauge('django_completed_lessons', 'Number of completed lessons', registry=registry)
cache_hits = Counter('django_cache_hits_total', 'Cache hits', registry=registry)
cache_misses = Counter('django_cache_misses_total', 'Cache misses', registry=registry)
database_queries = Counter('django_database_queries_total', 'Database queries', ['table'], registry=registry)

def update_business_metrics():
    """Update business-related metrics"""
    try:
        # Update user metrics
        total_users = User.objects.count()
        active_users.set(total_users)
        
        # Update lesson metrics
        lesson_count = Lesson.objects.count()
        total_lessons.set(lesson_count)
        
        # Update completion metrics
        completed_count = UserProgress.objects.filter(completed=True).count()
        completed_lessons.set(completed_count)
        
        logger.debug(f"Updated business metrics: {total_users} users, {lesson_count} lessons, {completed_count} completed")
    except Exception as e:
        logger.error(f"Failed to update business metrics: {e}")

def metrics_endpoint(request):
    """Prometheus metrics endpoint"""
    try:
        # Update metrics before generating output
        update_business_metrics()
        
        # Generate metrics in Prometheus format
        metrics_output = generate_latest(registry)
        
        return JsonResponse({
            'metrics': metrics_output.decode('utf-8'),
            'format': 'prometheus',
            'timestamp': timezone.now().isoformat()
        }, content_type='text/plain')
    except Exception as e:
        logger.error(f"Metrics endpoint error: {e}")
        return JsonResponse({'error': str(e)}, status=500)

def application_metrics(request):
    """Human-readable application metrics"""
    try:
        metrics = {
            'timestamp': timezone.now().isoformat(),
            'service': 'django-backend',
            'version': '1.0.0',
            'environment': getattr(settings, 'ENVIRONMENT', 'development'),
        }
        
        # System metrics
        try:
            metrics['system'] = {
                'memory': {
                    'percent': psutil.virtual_memory().percent,
                    'available_bytes': psutil.virtual_memory().available,
                    'total_bytes': psutil.virtual_memory().total,
                    'used_bytes': psutil.virtual_memory().used,
                },
                'cpu': {
                    'percent': psutil.cpu_percent(interval=1),
                    'count': psutil.cpu_count(),
                },
                'disk': {
                    'percent': psutil.disk_usage('/').percent,
                    'free_bytes': psutil.disk_usage('/').free,
                    'total_bytes': psutil.disk_usage('/').total,
                    'used_bytes': psutil.disk_usage('/').used,
                },
                'load_average': psutil.getloadavg() if hasattr(psutil, 'getloadavg') else [0, 0, 0],
            }
        except Exception as e:
            logger.warning(f"Could not gather system metrics: {e}")
            metrics['system'] = {'error': str(e)}
        
        # Database metrics
        try:
            start_time = time.time()
            with connection.cursor() as cursor:
                # Get table sizes
                cursor.execute("""
                    SELECT 
                        schemaname, tablename, 
                        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
                        pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
                    FROM pg_tables 
                    WHERE schemaname = 'public' 
                    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC 
                    LIMIT 10
                """)
                table_sizes = [
                    {'table': f"{row[0]}.{row[1]}", 'size': row[2], 'size_bytes': row[3]}
                    for row in cursor.fetchall()
                ]
                
                # Get connection stats
                cursor.execute("SELECT count(*) FROM pg_stat_activity")
                active_connections = cursor.fetchone()[0]
                
                # Get slow queries count (if pg_stat_statements is available)
                try:
                    cursor.execute("""
                        SELECT count(*) 
                        FROM pg_stat_statements 
                        WHERE mean_time > 1000
                    """)
                    slow_queries = cursor.fetchone()[0]
                except:
                    slow_queries = 'unavailable'
                
            db_response_time = (time.time() - start_time) * 1000  # ms
            
            metrics['database'] = {
                'response_time_ms': round(db_response_time, 2),
                'active_connections': active_connections,
                'slow_queries': slow_queries,
                'table_sizes': table_sizes,
            }
        except Exception as e:
            logger.error(f"Database metrics error: {e}")
            metrics['database'] = {'error': str(e)}
        
        # Cache metrics
        try:
            start_time = time.time()
            cache_key = f"metrics_test_{int(time.time())}"
            cache.set(cache_key, 'test', 10)
            cache.get(cache_key)
            cache_response_time = (time.time() - start_time) * 1000  # ms
            
            # Get Redis info if available
            cache_info = {}
            if hasattr(cache, '_cache') and hasattr(cache._cache, '_client'):
                try:
                    redis_client = cache._cache._client.get_client()
                    redis_info = redis_client.info()
                    cache_info = {
                        'memory_used': redis_info.get('used_memory_human'),
                        'connected_clients': redis_info.get('connected_clients'),
                        'total_commands': redis_info.get('total_commands_processed'),
                        'keyspace_hits': redis_info.get('keyspace_hits', 0),
                        'keyspace_misses': redis_info.get('keyspace_misses', 0),
                    }
                    
                    # Calculate hit ratio
                    hits = cache_info['keyspace_hits']
                    misses = cache_info['keyspace_misses']
                    total = hits + misses
                    cache_info['hit_ratio'] = round(hits / total * 100, 2) if total > 0 else 0
                except Exception as e:
                    logger.warning(f"Could not get Redis info: {e}")
            
            metrics['cache'] = {
                'response_time_ms': round(cache_response_time, 2),
                'info': cache_info,
            }
        except Exception as e:
            logger.error(f"Cache metrics error: {e}")
            metrics['cache'] = {'error': str(e)}
        
        # Application metrics
        try:
            user_count = User.objects.count()
            lesson_count = Lesson.objects.count()
            progress_count = UserProgress.objects.count()
            completed_count = UserProgress.objects.filter(completed=True).count()
            
            metrics['application'] = {
                'users': {
                    'total': user_count,
                    'active_today': User.objects.filter(last_login__date=timezone.now().date()).count() if hasattr(User, 'last_login') else 0,
                },
                'lessons': {
                    'total': lesson_count,
                    'by_difficulty': {
                        level: Lesson.objects.filter(difficulty=level).count() 
                        for level in ['beginner', 'intermediate', 'advanced']
                    },
                },
                'progress': {
                    'total_records': progress_count,
                    'completed': completed_count,
                    'completion_rate': round(completed_count / progress_count * 100, 2) if progress_count > 0 else 0,
                },
            }
        except Exception as e:
            logger.error(f"Application metrics error: {e}")
            metrics['application'] = {'error': str(e)}
        
        return JsonResponse(metrics)
        
    except Exception as e:
        logger.error(f"Application metrics error: {e}")
        return JsonResponse({
            'error': str(e),
            'timestamp': timezone.now().isoformat(),
            'service': 'django-backend'
        }, status=500)