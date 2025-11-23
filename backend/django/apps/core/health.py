"""
Health check views for monitoring system status
"""
import time
import psutil
from django.http import JsonResponse
from django.conf import settings
from django.core.cache import cache
from django.db import connection
from django.utils import timezone
import redis
import logging

logger = logging.getLogger(__name__)

def health_check(request):
    """Basic health check endpoint"""
    try:
        health = {
            'status': 'ok',
            'timestamp': timezone.now().isoformat(),
            'service': 'django-backend',
            'version': '1.0.0',
            'environment': getattr(settings, 'ENVIRONMENT', 'development')
        }
        
        # Basic database check
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                health['database'] = 'connected'
        except Exception as e:
            health['database'] = 'disconnected'
            health['status'] = 'degraded'
            logger.error(f"Database health check failed: {e}")
        
        # Basic cache check
        try:
            cache_key = f"health_check_{int(time.time())}"
            cache.set(cache_key, 'test', 10)
            cache.get(cache_key)
            health['cache'] = 'connected'
        except Exception as e:
            health['cache'] = 'disconnected'
            health['status'] = 'degraded'
            logger.error(f"Cache health check failed: {e}")
        
        status_code = 200 if health['status'] == 'ok' else 503
        return JsonResponse(health, status=status_code)
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JsonResponse({
            'status': 'error',
            'timestamp': timezone.now().isoformat(),
            'service': 'django-backend',
            'error': str(e)
        }, status=503)

def detailed_health_check(request):
    """Detailed health check with system metrics"""
    try:
        health = {
            'status': 'ok',
            'timestamp': timezone.now().isoformat(),
            'service': 'django-backend',
            'version': '1.0.0',
            'environment': getattr(settings, 'ENVIRONMENT', 'development'),
            'checks': {},
            'metrics': {}
        }
        
        # System metrics
        try:
            health['metrics']['memory'] = {
                'percent': psutil.virtual_memory().percent,
                'available': psutil.virtual_memory().available,
                'total': psutil.virtual_memory().total
            }
            health['metrics']['cpu'] = {
                'percent': psutil.cpu_percent(interval=1)
            }
            health['metrics']['disk'] = {
                'percent': psutil.disk_usage('/').percent,
                'free': psutil.disk_usage('/').free,
                'total': psutil.disk_usage('/').total
            }
        except Exception as e:
            logger.warning(f"Could not gather system metrics: {e}")
        
        # Database detailed check
        try:
            start_time = time.time()
            with connection.cursor() as cursor:
                cursor.execute("SELECT COUNT(*) FROM auth_user")
                user_count = cursor.fetchone()[0]
                cursor.execute("SELECT COUNT(*) FROM lessons_lesson")
                lesson_count = cursor.fetchone()[0]
            response_time = time.time() - start_time
            
            health['checks']['database'] = {
                'status': 'ok',
                'response_time': round(response_time * 1000, 2),  # ms
                'user_count': user_count,
                'lesson_count': lesson_count
            }
        except Exception as e:
            health['checks']['database'] = {
                'status': 'error',
                'message': str(e)
            }
            health['status'] = 'degraded'
            logger.error(f"Database detailed check failed: {e}")
        
        # Cache detailed check
        try:
            start_time = time.time()
            cache_key = f"health_check_detailed_{int(time.time())}"
            test_data = {'test': 'data', 'timestamp': time.time()}
            cache.set(cache_key, test_data, 10)
            retrieved_data = cache.get(cache_key)
            response_time = time.time() - start_time
            
            health['checks']['cache'] = {
                'status': 'ok' if retrieved_data == test_data else 'degraded',
                'response_time': round(response_time * 1000, 2),  # ms
                'type': 'redis'
            }
            
            # Redis specific info
            if hasattr(cache, '_cache') and hasattr(cache._cache, '_client'):
                redis_client = cache._cache._client.get_client()
                redis_info = redis_client.info()
                health['checks']['cache']['redis_info'] = {
                    'used_memory_human': redis_info.get('used_memory_human'),
                    'connected_clients': redis_info.get('connected_clients'),
                    'total_commands_processed': redis_info.get('total_commands_processed')
                }
        except Exception as e:
            health['checks']['cache'] = {
                'status': 'error',
                'message': str(e)
            }
            health['status'] = 'degraded'
            logger.error(f"Cache detailed check failed: {e}")
        
        status_code = 200 if health['status'] == 'ok' else 503
        return JsonResponse(health, status=status_code)
        
    except Exception as e:
        logger.error(f"Detailed health check failed: {e}")
        return JsonResponse({
            'status': 'error',
            'timestamp': timezone.now().isoformat(),
            'service': 'django-backend',
            'error': str(e)
        }, status=503)