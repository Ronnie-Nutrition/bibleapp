"""
Custom storage backends for CDN and optimized static file serving
"""

import os
from django.conf import settings
from django.core.files.storage import FileSystemStorage
from django.contrib.staticfiles.storage import StaticFilesStorage
from storages.backends.s3boto3 import S3Boto3Storage


class StaticStorage(S3Boto3Storage):
    """
    S3 storage for static files with CDN
    """
    bucket_name = settings.AWS_STORAGE_BUCKET_NAME
    location = 'static'
    default_acl = 'public-read'
    file_overwrite = True
    custom_domain = settings.AWS_S3_CUSTOM_DOMAIN


class MediaStorage(S3Boto3Storage):
    """
    S3 storage for media files
    """
    bucket_name = settings.AWS_STORAGE_BUCKET_NAME
    location = 'media'
    default_acl = 'public-read'
    file_overwrite = False
    custom_domain = settings.AWS_S3_CUSTOM_DOMAIN


class OptimizedFileSystemStorage(FileSystemStorage):
    """
    Optimized local file storage with compression
    """
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.enable_compression = getattr(settings, 'ENABLE_FILE_COMPRESSION', True)
    
    def _save(self, name, content):
        """
        Save file with optional compression
        """
        if self.enable_compression and self._should_compress(name):
            content = self._compress_content(content, name)
        
        return super()._save(name, content)
    
    def _should_compress(self, name):
        """
        Determine if file should be compressed based on extension
        """
        compressible_extensions = ['.css', '.js', '.html', '.svg', '.txt', '.json', '.xml']
        return any(name.lower().endswith(ext) for ext in compressible_extensions)
    
    def _compress_content(self, content, name):
        """
        Compress file content using gzip
        """
        import gzip
        import io
        
        if hasattr(content, 'read'):
            content_bytes = content.read()
        else:
            content_bytes = content.encode('utf-8')
        
        # Compress the content
        compressed = io.BytesIO()
        with gzip.GzipFile(fileobj=compressed, mode='wb') as gz:
            gz.write(content_bytes)
        
        compressed.seek(0)
        return compressed


class OptimizedStaticFilesStorage(StaticFilesStorage):
    """
    Static files storage with optimization features
    """
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.enable_hashing = getattr(settings, 'ENABLE_STATIC_HASHING', True)
        self.enable_compression = getattr(settings, 'ENABLE_STATIC_COMPRESSION', True)
    
    def hashed_name(self, name, content=None, filename=None):
        """
        Generate hashed filename for cache busting
        """
        if not self.enable_hashing:
            return name
        
        return super().hashed_name(name, content, filename)


class CDNStorage:
    """
    Utility class for CDN operations
    """
    
    @staticmethod
    def get_cdn_url(path):
        """
        Get CDN URL for a given path
        """
        if hasattr(settings, 'CDN_DOMAIN') and settings.CDN_DOMAIN:
            return f"https://{settings.CDN_DOMAIN}/{path.lstrip('/')}"
        return path
    
    @staticmethod
    def invalidate_cdn_cache(paths):
        """
        Invalidate CDN cache for given paths
        This is a placeholder - implement based on your CDN provider
        """
        if not paths:
            return
        
        # Example for CloudFront
        if hasattr(settings, 'AWS_CLOUDFRONT_DISTRIBUTION_ID'):
            try:
                import boto3
                
                cloudfront = boto3.client('cloudfront')
                cloudfront.create_invalidation(
                    DistributionId=settings.AWS_CLOUDFRONT_DISTRIBUTION_ID,
                    InvalidationBatch={
                        'Paths': {
                            'Quantity': len(paths),
                            'Items': paths
                        },
                        'CallerReference': str(int(time.time()))
                    }
                )
                print(f"CDN invalidation created for {len(paths)} paths")
                
            except Exception as e:
                print(f"CDN invalidation failed: {e}")


# Template tags for optimized asset loading
from django import template
from django.utils.safestring import mark_safe
from django.contrib.staticfiles.templatetags.staticfiles import static

register = template.Library()


@register.simple_tag
def static_optimized(path):
    """
    Template tag for optimized static file loading
    """
    static_url = static(path)
    
    # Add CDN domain if configured
    if hasattr(settings, 'CDN_DOMAIN') and settings.CDN_DOMAIN:
        static_url = CDNStorage.get_cdn_url(static_url)
    
    return static_url


@register.simple_tag
def preload_css(path, media='all'):
    """
    Template tag for CSS preloading
    """
    static_url = static_optimized(path)
    return mark_safe(f'<link rel="preload" href="{static_url}" as="style" media="{media}" onload="this.onload=null;this.rel=\'stylesheet\'">')


@register.simple_tag
def preload_js(path):
    """
    Template tag for JavaScript preloading
    """
    static_url = static_optimized(path)
    return mark_safe(f'<link rel="preload" href="{static_url}" as="script">')


@register.simple_tag
def critical_css(path):
    """
    Template tag for critical CSS inlining
    """
    import os
    from django.conf import settings
    
    try:
        full_path = os.path.join(settings.STATIC_ROOT or settings.STATICFILES_DIRS[0], path)
        with open(full_path, 'r') as f:
            css_content = f.read()
        return mark_safe(f'<style type="text/css">{css_content}</style>')
    except (FileNotFoundError, IndexError):
        # Fallback to regular link tag
        static_url = static_optimized(path)
        return mark_safe(f'<link rel="stylesheet" href="{static_url}">')