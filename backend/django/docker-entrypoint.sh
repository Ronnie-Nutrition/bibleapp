#!/bin/sh

# Fix permissions for mounted volumes
# This ensures the django user can write to the logs directory
# even when it's mounted as a Docker volume

echo "Fixing permissions for mounted volumes..."

# Create logs directory if it doesn't exist and set ownership
mkdir -p /app/logs
chown django:django /app/logs
chmod 755 /app/logs

# Create staticfiles directory if it doesn't exist and set ownership
mkdir -p /app/staticfiles
chown django:django /app/staticfiles
chmod 755 /app/staticfiles

# Create media directory if it doesn't exist and set ownership
mkdir -p /app/media
chown django:django /app/media
chmod 755 /app/media

echo "Permissions fixed. Switching to django user..."

# Switch to django user and execute the command
exec su-exec django "$@"