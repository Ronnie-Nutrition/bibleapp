"""
Django Settings for Biblical Lessons API
"""

import os
from pathlib import Path
from decouple import config
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration
from sentry_sdk.integrations.redis import RedisIntegration
from sentry_sdk.integrations.logging import LoggingIntegration

# Build paths
BASE_DIR = Path(__file__).resolve().parent.parent

# Security - CRITICAL: Must be set in production
SECRET_KEY = config('SECRET_KEY', default=None)
if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable is required for security")
DEBUG = config('DEBUG', default=True, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=lambda v: [s.strip() for s in v.split(',')])

# Application definition
INSTALLED_APPS = [
    # Django defaults
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party
    'rest_framework',
    'corsheaders',
    'django_filters',

    # Local apps
    'apps.auth_app',
    'apps.lessons',
    'apps.preferences',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'bibleapp_django.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'bibleapp_django.wsgi.application'

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME', default='bibleapp'),
        'USER': config('DB_USER', default='postgres'),
        'PASSWORD': config('DB_PASSWORD', default='postgres'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
        'OPTIONS': {
            'MAX_CONNS': 20,
            'OPTIONS': {
                'MAX_CONNS': 20,
            }
        },
        'CONN_MAX_AGE': 600,  # 10 minutes
    }
}

# Alternative: SQLite for development
if config('USE_SQLITE', default=False, cast=bool):
    DATABASES['default'] = {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 8,
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files with CDN support
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Use CDN for static files in production
USE_S3_STATIC = config('USE_S3_STATIC', default=False, cast=bool)
if USE_S3_STATIC:
    # AWS S3 Configuration
    AWS_ACCESS_KEY_ID = config('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = config('AWS_SECRET_ACCESS_KEY')
    AWS_STORAGE_BUCKET_NAME = config('AWS_STORAGE_BUCKET_NAME')
    AWS_S3_REGION_NAME = config('AWS_S3_REGION_NAME', default='us-east-1')
    AWS_S3_CUSTOM_DOMAIN = config('AWS_S3_CUSTOM_DOMAIN', default=None)
    AWS_DEFAULT_ACL = 'public-read'
    AWS_S3_OBJECT_PARAMETERS = {
        'CacheControl': 'max-age=86400',  # 1 day
    }
    
    # Use S3 for static files
    STATICFILES_STORAGE = 'apps.core.storage.StaticStorage'
    DEFAULT_FILE_STORAGE = 'apps.core.storage.MediaStorage'
    
    # CloudFront CDN
    AWS_CLOUDFRONT_DISTRIBUTION_ID = config('AWS_CLOUDFRONT_DISTRIBUTION_ID', default=None)
    CDN_DOMAIN = config('CDN_DOMAIN', default=None)
else:
    # Use optimized local storage
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Static file optimization
ENABLE_STATIC_HASHING = config('ENABLE_STATIC_HASHING', default=True, cast=bool)
ENABLE_STATIC_COMPRESSION = config('ENABLE_STATIC_COMPRESSION', default=True, cast=bool)
ENABLE_FILE_COMPRESSION = config('ENABLE_FILE_COMPRESSION', default=True, cast=bool)

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom User Model
AUTH_USER_MODEL = 'auth_app.CustomUser'

# Django REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ],
}

# CORS Configuration
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:3000,http://localhost:8000,http://127.0.0.1:3000',
    cast=lambda v: [s.strip() for s in v.split(',')]
)

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# Firebase Configuration
FIREBASE_CONFIG = {
    'type': config('FIREBASE_TYPE', default='service_account'),
    'project_id': config('FIREBASE_PROJECT_ID', default=''),
    'private_key_id': config('FIREBASE_PRIVATE_KEY_ID', default=''),
    'private_key': config('FIREBASE_PRIVATE_KEY', default=''),
    'client_email': config('FIREBASE_CLIENT_EMAIL', default=''),
    'client_id': config('FIREBASE_CLIENT_ID', default=''),
    'auth_uri': config('FIREBASE_AUTH_URI', default='https://accounts.google.com/o/oauth2/auth'),
    'token_uri': config('FIREBASE_TOKEN_URI', default='https://oauth2.googleapis.com/token'),
}

# Logging Configuration
import logging
import structlog

# Configure structlog for structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.dev.set_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer() if not DEBUG else structlog.dev.ConsoleRenderer(),
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'json': {
            'format': '%(asctime)s %(name)s %(levelname)s %(message)s',
            'class': 'pythonjsonlogger.jsonlogger.JsonFormatter',
        },
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'filters': {
        'require_debug_true': {
            '()': 'django.utils.log.RequireDebugTrue',
        },
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse',
        },
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'json' if not DEBUG else 'simple',
        },
        # File handlers are added conditionally below based on Docker environment
    },
    'root': {
        'handlers': ['console'],  # Default to console only, file handlers added conditionally
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],  # Default to console only, file handlers added conditionally
            'level': 'INFO',
            'propagate': False,
        },
        'django.security': {
            'handlers': ['console'],  # Default to console only, file handlers added conditionally
            'level': 'INFO',
            'propagate': False,
        },
        'apps': {
            'handlers': ['console'],  # Default to console only, file handlers added conditionally
            'level': 'DEBUG' if DEBUG else 'INFO',
            'propagate': False,
        },
        'apps.auth_app': {
            'handlers': ['console'],  # Default to console only, file handlers added conditionally
            'level': 'INFO',
            'propagate': False,
        },
        'performance': {
            'handlers': ['console'],  # Default to console only, file handlers added conditionally
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# Check if running in Docker
RUNNING_IN_DOCKER = os.path.exists('/.dockerenv')

# Conditionally add file handlers only when not in Docker
if not RUNNING_IN_DOCKER:
    # Create logs directory if it doesn't exist (only when using file logging)
    os.makedirs(os.path.join(BASE_DIR, 'logs'), exist_ok=True)
    
    # Add file handlers to the logging configuration
    LOGGING['handlers']['file'] = {
        'level': 'INFO',
        'class': 'logging.handlers.RotatingFileHandler',
        'filename': os.path.join(BASE_DIR, 'logs', 'django.log'),
        'maxBytes': 1024 * 1024 * 10,  # 10 MB
        'backupCount': 5,
        'formatter': 'json' if not DEBUG else 'verbose',
    }
    LOGGING['handlers']['error_file'] = {
        'level': 'ERROR',
        'class': 'logging.handlers.RotatingFileHandler',
        'filename': os.path.join(BASE_DIR, 'logs', 'django_error.log'),
        'maxBytes': 1024 * 1024 * 10,  # 10 MB
        'backupCount': 10,
        'formatter': 'json',
    }
    LOGGING['handlers']['security_file'] = {
        'level': 'INFO',
        'class': 'logging.handlers.RotatingFileHandler',
        'filename': os.path.join(BASE_DIR, 'logs', 'security.log'),
        'maxBytes': 1024 * 1024 * 5,  # 5 MB
        'backupCount': 20,
        'formatter': 'json',
    }
    
    # Configure loggers to use both console and file handlers
    LOGGING['loggers']['django']['handlers'] = ['console', 'file']
    LOGGING['loggers']['django.security']['handlers'] = ['security_file', 'error_file']
    LOGGING['loggers']['apps']['handlers'] = ['console', 'file']
    LOGGING['loggers']['apps.auth_app']['handlers'] = ['console', 'file', 'security_file']
    LOGGING['loggers']['performance']['handlers'] = ['file']
    LOGGING['root']['handlers'] = ['console', 'file']
else:
    # In Docker, use only console logging for aggregation
    LOGGING['loggers']['django']['handlers'] = ['console']
    LOGGING['loggers']['django.security']['handlers'] = ['console']
    LOGGING['loggers']['apps']['handlers'] = ['console']
    LOGGING['loggers']['apps.auth_app']['handlers'] = ['console']
    LOGGING['loggers']['performance']['handlers'] = ['console']
    LOGGING['root']['handlers'] = ['console']

# Security settings for production
if not DEBUG:
    # Force HTTPS
    SECURE_SSL_REDIRECT = config('SECURE_SSL_REDIRECT', default=True, cast=bool)
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    
    # Secure cookies
    SESSION_COOKIE_SECURE = config('SESSION_COOKIE_SECURE', default=True, cast=bool)
    CSRF_COOKIE_SECURE = config('CSRF_COOKIE_SECURE', default=True, cast=bool)
    SESSION_COOKIE_HTTPONLY = True
    CSRF_COOKIE_HTTPONLY = True
    
    # Security headers
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    
    # Content Security Policy
    SECURE_CONTENT_SECURITY_POLICY = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; media-src 'self'; object-src 'none'; child-src 'none'; worker-src 'none'; frame-ancestors 'none'; form-action 'self'; base-uri 'self';"
    
    # Additional security headers
    X_FRAME_OPTIONS = 'DENY'
    SECURE_REFERRER_POLICY = 'strict-origin-when-cross-origin'

# Cache configuration with Redis
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': config('REDIS_URL', default='redis://localhost:6379/1'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'SERIALIZER': 'django_redis.serializers.json.JSONSerializer',
            'CONNECTION_POOL_KWARGS': {
                'max_connections': 50,
                'retry_on_timeout': True,
                'socket_timeout': 5,
                'socket_connect_timeout': 5,
            },
            'COMPRESSOR': 'django_redis.compressors.zlib.ZlibCompressor',
        },
        'KEY_PREFIX': 'bibleapp',
        'TIMEOUT': 300,  # 5 minutes default
        'VERSION': 1,
    }
}

# Cache settings
CACHE_MIDDLEWARE_ALIAS = 'default'
CACHE_MIDDLEWARE_SECONDS = 300
CACHE_MIDDLEWARE_KEY_PREFIX = 'bibleapp'

# Session storage in Redis
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'

# Rate limiting
RATELIMIT_ENABLE = config('RATELIMIT_ENABLE', default=True, cast=bool)

# Sentry Configuration
SENTRY_DSN = config('SENTRY_DSN', default=None)
SENTRY_ENVIRONMENT = config('SENTRY_ENVIRONMENT', default=config('ENVIRONMENT', default='development'))

if SENTRY_DSN:
    sentry_logging = LoggingIntegration(
        level=logging.INFO,        # Capture info and above as breadcrumbs
        event_level=logging.ERROR  # Send errors as events
    )
    
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[
            DjangoIntegration(transaction_style='url'),
            RedisIntegration(),
            sentry_logging,
        ],
        environment=SENTRY_ENVIRONMENT,
        
        # Performance Monitoring
        traces_sample_rate=0.1 if SENTRY_ENVIRONMENT == 'production' else 1.0,
        
        # Error Filtering
        before_send=lambda event, hint: event if not DEBUG else None,
        
        # Release Tracking
        release=config('APP_VERSION', default='unknown'),
        
        # Additional Options
        send_default_pii=False,  # Don't send personally identifiable information
        max_breadcrumbs=50,
        attach_stacktrace=True,
    )
