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
    && rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S django
RUN adduser -S django -u 1001 -G django

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Create necessary directories
RUN mkdir -p logs staticfiles media && \
    chown -R django:django /app

# Collect static files
RUN python manage.py collectstatic --noinput

# Switch to non-root user
USER django

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8000/health', timeout=5)" || exit 1

# Expose port
EXPOSE 8000

# Start the application
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "60", "--keep-alive", "2", "bibleapp_django.wsgi:application"]