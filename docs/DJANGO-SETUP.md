# Django Backend Setup Guide

Complete setup and deployment guide for the Django REST API backend serving the Biblical Lessons iOS app.

## Overview

The Django backend provides:
- User authentication and account management
- RESTful API for lessons, user progress, and preferences
- Notification scheduling and management
- Admin dashboard for content management
- PostgreSQL database support
- Full API documentation

## Project Structure

```
backend/django/
├── bibleapp_django/              # Django project configuration
│   ├── __init__.py
│   ├── settings.py              # Django settings and configuration
│   ├── urls.py                  # URL routing configuration
│   ├── wsgi.py                  # Production WSGI config
│   └── asgi.py                  # Async support (optional)
│
├── apps/                        # Django applications
│   ├── auth_app/               # Authentication app
│   │   ├── models.py           # User, Preferences, Stats models
│   │   ├── views.py            # Auth viewsets
│   │   ├── serializers.py      # REST serializers
│   │   ├── admin.py            # Django admin config
│   │   └── apps.py
│   │
│   ├── lessons/                # Lessons app
│   │   ├── models.py           # Lesson, UserProgress models
│   │   ├── views.py            # Lesson viewsets
│   │   ├── serializers.py      # Lesson serializers
│   │   ├── admin.py
│   │   └── apps.py
│   │
│   └── preferences/            # Preferences app
│       ├── models.py           # Notification preferences
│       ├── views.py            # Preference viewsets
│       ├── serializers.py      # Preference serializers
│       ├── admin.py
│       └── apps.py
│
├── manage.py                   # Django management script
├── requirements.txt            # Python dependencies
├── .env.example               # Environment variables template
└── db.sqlite3                 # SQLite database (development only)
```

## Prerequisites

- Python 3.8+
- PostgreSQL 12+ (or SQLite for development)
- pip or conda

## Installation

### 1. Clone Repository and Install Dependencies

```bash
cd backend/django

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your configuration
nano .env  # or open in your preferred editor
```

**Required environment variables:**

```env
# Django
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (PostgreSQL)
DB_ENGINE=django.db.backends.postgresql
DB_NAME=bibleapp
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432

# Alternatively, use SQLite for development
USE_SQLITE=True

# Firebase (optional, for production)
FIREBASE_PROJECT_ID=your-firebase-project
FIREBASE_PRIVATE_KEY=your-firebase-key
FIREBASE_CLIENT_EMAIL=your-firebase-email

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000

# Logging
LOG_LEVEL=INFO
```

### 3. Create and Configure Database

**For PostgreSQL:**

```bash
# Create database (run in PostgreSQL terminal)
createdb bibleapp
createuser bibleapp_user
```

**For SQLite (development):**

Database will be created automatically.

### 4. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Create Superuser

```bash
python manage.py createsuperuser
# Follow prompts to create admin account
```

### 6. Load Initial Data (Optional)

```bash
python manage.py shell

# In Django shell:
from apps.lessons.models import Lesson
import json

with open('../../content/lessons.json', 'r') as f:
    lessons_data = json.load(f)
    for lesson_data in lessons_data:
        Lesson.objects.create(**lesson_data)
```

## Running the Server

### Development Server

```bash
python manage.py runserver

# Server runs at http://localhost:8000
# API at http://localhost:8000/api/v1/
# Admin at http://localhost:8000/admin/
```

### Production with Gunicorn

```bash
gunicorn bibleapp_django.wsgi:application --bind 0.0.0.0:8000
```

## API Endpoints

All endpoints require the `/api/v1/` prefix.

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/register/` | POST | Register new user |
| `/auth/login/` | POST | Login user |
| `/auth/logout/` | POST | Logout user |
| `/auth/me/` | GET | Get current user |
| `/auth/forgot-password/` | POST | Request password reset |
| `/auth/reset-password/` | POST | Reset password |
| `/auth/update-email/` | POST | Update email address |

### Users

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/users/profile/` | GET, PATCH | Get/update profile |
| `/users/stats/` | GET | Get user statistics |
| `/users/preferences/` | GET, PATCH | Get/update preferences |

### Lessons

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/lessons/` | GET | List all lessons |
| `/lessons/{id}/` | GET | Get lesson detail |
| `/lessons/{id}/user_progress/` | GET | Get user's progress on lesson |
| `/lessons/featured/` | GET | Get featured lessons |
| `/lessons/categories/` | GET | Get all categories |

### User Progress

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/progress/` | GET, POST | List/create progress |
| `/progress/{id}/` | PATCH | Update progress |
| `/progress/stats/` | GET | Get progress statistics |
| `/progress/completed/` | GET | Get completed lessons |
| `/progress/in_progress/` | GET | Get in-progress lessons |
| `/progress/favorites/` | GET | Get favorite lessons |
| `/progress/{id}/mark_completed/` | POST | Mark as completed |
| `/progress/{id}/toggle_favorite/` | POST | Toggle favorite status |

### Preferences

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/preferences/` | GET | Get preferences |
| `/preferences/update/` | POST | Update single preference |
| `/preferences/notification-type/` | POST | Update notification type |
| `/preferences/categories/` | POST | Set preferred categories |
| `/preferences/daily-time/` | POST | Set daily reminder time |
| `/preferences/batch-update/` | POST | Update multiple preferences |
| `/preferences/reset/` | POST | Reset to defaults |
| `/preferences/stats/` | GET | Get preference statistics |
| `/preferences/quiet-hours/` | POST | Set quiet hours |
| `/preferences/notification-frequency/` | POST | Set frequency |

## Example API Calls

### Register User

```bash
curl -X POST http://localhost:8000/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "display_name": "John Doe"
  }'
```

### Login

```bash
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

### Get Lessons

```bash
curl http://localhost:8000/api/v1/lessons/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Preferences

```bash
curl -X POST http://localhost:8000/api/v1/preferences/batch-update/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "preferences": {
      "notificationsEnabled": true,
      "dailyLessonsEnabled": true,
      "dailyReminderTime": "09:00"
    }
  }'
```

## Django Admin Dashboard

Access the Django admin interface at `http://localhost:8000/admin/` using your superuser credentials.

Features:
- Manage users and their preferences
- Create, edit, and delete lessons
- View user progress and statistics
- Monitor scheduled notifications
- Manage notification templates

## Development Commands

```bash
# Create new migration
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run tests
python manage.py test

# Shell
python manage.py shell

# Collect static files (production)
python manage.py collectstatic

# Generate API schema
python manage.py spectacular --file schema.yml
```

## Database Schema

### Key Models

**CustomUser**
- Extends Django's AbstractUser
- Stores Firebase UID, email verification, password reset tracking
- One-to-one with UserPreferences and UserStats

**Lesson**
- Title, subtitle, category, difficulty, duration
- Full content, key takeaway, Bible verses, practical steps
- Featured flag and publication status

**UserProgress**
- Tracks user's progress on each lesson
- Status: not_started, in_progress, completed
- Progress percentage, time spent, rating, favorite flag

**NotificationPreference**
- Notification toggles by type
- Daily reminder time
- Preferred categories
- Quiet hours configuration

**ScheduledNotification**
- Tracks sent notifications
- Delivery and read status
- Scheduling and send times

## Testing

```bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test apps.lessons

# Run specific test class
python manage.py test apps.lessons.tests.LessonTestCase

# Run with verbosity
python manage.py test --verbosity=2
```

## Troubleshooting

### Migration Errors

```bash
# Reset migrations (development only!)
python manage.py migrate apps.auth_app zero
python manage.py migrate

# Check migration status
python manage.py showmigrations
```

### Database Connection Issues

```bash
# Check database connection
python manage.py dbshell

# View current database
python manage.py shell
>>> from django.conf import settings
>>> print(settings.DATABASES)
```

### Permission Errors

```bash
# Fix static file permissions
sudo chown -R $USER:$USER staticfiles/
chmod -R 755 staticfiles/
```

## Deployment

### Using Docker

```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "bibleapp_django.wsgi:application", "--bind", "0.0.0.0:8000"]
```

### Using Heroku

```bash
# Create Heroku app
heroku create biblical-lessons-api

# Set environment variables
heroku config:set DJANGO_SETTINGS_MODULE=bibleapp_django.settings
heroku config:set SECRET_KEY=your-secret-key
heroku config:set ALLOWED_HOSTS=biblical-lessons-api.herokuapp.com

# Deploy
git push heroku main

# Run migrations
heroku run python manage.py migrate
```

### Environment Setup

See `.env.example` for all required variables.

## Performance Optimization

- Use database indexes on frequently queried fields
- Implement caching for lesson lists
- Use Celery for async tasks (notifications, etc.)
- Enable gzip compression in production
- Use CDN for static files

## Security

- Change `SECRET_KEY` in production
- Set `DEBUG=False` in production
- Use HTTPS in production
- Configure CORS appropriately
- Implement rate limiting
- Use database encryption for sensitive data

## Next Steps

1. Deploy to production server
2. Configure domain and SSL
3. Set up automated backups
4. Monitor API performance
5. Implement analytics

---

**Last Updated:** November 2024
**Version:** 1.0.0
