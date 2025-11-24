# Django Backend Dockerfile
FROM python:3.11-alpine

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apk update && apk add --no-cache \
    postgresql-dev \
    gcc \
    musl-dev \
    libffi-dev \
    jpeg-dev \
    zlib-dev \
    su-exec \
    && rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S django
RUN adduser -S django -u 1001 -G django

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Create necessary directories with proper permissions
RUN mkdir -p logs staticfiles media && \
    chmod 755 logs staticfiles media && \
    chown -R django:django /app

# Create entrypoint script to fix permissions (as root)
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Collect static files with dummy environment variables
ENV SECRET_KEY="dummy-secret-key-for-collectstatic"
RUN python manage.py collectstatic --noinput

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8000/health', timeout=5)" || exit 1

# Expose port
EXPOSE 8000

# Start the application (will switch to django user in entrypoint)
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "60", "--keep-alive", "2", "bibleapp_django.wsgi:application"]