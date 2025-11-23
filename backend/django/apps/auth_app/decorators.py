"""
Rate limiting decorators for authentication endpoints
"""
from functools import wraps
from django.http import JsonResponse
from django_ratelimit import ratelimit
from django.conf import settings


def api_ratelimit(group=None, key='ip', rate='5/m', method='POST', block=True):
    """
    Custom rate limiting decorator for API endpoints
    
    Args:
        group: Rate limit group name
        key: What to rate limit by ('ip', 'user', etc.)
        rate: Rate limit format (e.g., '5/m' = 5 per minute)
        method: HTTP methods to rate limit
        block: Whether to block when rate exceeded
    """
    def decorator(view_func):
        @wraps(view_func)
        @ratelimit(group=group, key=key, rate=rate, method=method, block=block)
        def wrapped_view(request, *args, **kwargs):
            # Check if rate limiting is enabled
            if not getattr(settings, 'RATELIMIT_ENABLE', True):
                return view_func(request, *args, **kwargs)
            
            # Check if request was rate limited
            was_limited = getattr(request, 'limited', False)
            if was_limited:
                return JsonResponse({
                    'error': 'Rate limit exceeded. Too many requests.',
                    'code': 'RATE_LIMIT_EXCEEDED',
                    'retry_after': '60 seconds'
                }, status=429)
            
            return view_func(request, *args, **kwargs)
        
        return wrapped_view
    return decorator


# Specific rate limiters for different types of operations
def login_ratelimit(view_func):
    """Rate limit login attempts - 5 per minute per IP"""
    return api_ratelimit(group='login', rate='5/m')(view_func)


def register_ratelimit(view_func):
    """Rate limit registration attempts - 3 per minute per IP"""
    return api_ratelimit(group='register', rate='3/m')(view_func)


def password_reset_ratelimit(view_func):
    """Rate limit password reset attempts - 3 per 10 minutes per IP"""
    return api_ratelimit(group='password_reset', rate='3/10m')(view_func)


def general_api_ratelimit(view_func):
    """General API rate limit - 60 per minute per IP"""
    return api_ratelimit(group='api', rate='60/m', method=['GET', 'POST', 'PUT', 'DELETE'])(view_func)