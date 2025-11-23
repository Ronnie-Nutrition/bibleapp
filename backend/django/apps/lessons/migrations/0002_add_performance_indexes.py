# Generated performance optimization indexes for lessons

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('lessons', '0001_initial'),
    ]

    operations = [
        # Index for lesson ID lookups (unique identifier)
        migrations.RunSQL(
            sql="CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_lesson_lesson_id ON lessons_lesson (lesson_id);",
            reverse_sql="DROP INDEX IF EXISTS idx_lesson_lesson_id;"
        ),
        
        # Index for published lessons filtering
        migrations.RunSQL(
            sql="CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_lesson_published ON lessons_lesson (is_published, order) WHERE is_published = true;",
            reverse_sql="DROP INDEX IF EXISTS idx_lesson_published;"
        ),
        
        # Index for featured lessons
        migrations.RunSQL(
            sql="CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_lesson_featured ON lessons_lesson (is_featured, order) WHERE is_featured = true;",
            reverse_sql="DROP INDEX IF EXISTS idx_lesson_featured;"
        ),
        
        # Index for category filtering (most common query)
        migrations.RunSQL(
            sql="CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_lesson_category_published ON lessons_lesson (category, is_published, order);",
            reverse_sql="DROP INDEX IF EXISTS idx_lesson_category_published;"
        ),
        
        # Index for difficulty filtering
        migrations.RunSQL(
            sql="CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_lesson_difficulty ON lessons_lesson (difficulty, is_published);",
            reverse_sql="DROP INDEX IF EXISTS idx_lesson_difficulty;"
        ),
        
        # Full-text search index for lesson content
        migrations.RunSQL(
            sql="CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_lesson_search ON lessons_lesson USING gin(to_tsvector('english', title || ' ' || content || ' ' || key_takeaway));",
            reverse_sql="DROP INDEX IF EXISTS idx_lesson_search;"
        ),
        
        # Index for user progress queries (most common)
        migrations.RunSQL(
            sql="CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_userprogress_user_status ON lessons_userprogress (user_id, status, started_at DESC);",
            reverse_sql="DROP INDEX IF EXISTS idx_userprogress_user_status;"
        ),
        
        # Index for lesson progress lookups
        migrations.RunSQL(
            sql="CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_userprogress_lesson ON lessons_userprogress (lesson_id, user_id);",
            reverse_sql="DROP INDEX IF EXISTS idx_userprogress_lesson;"
        ),
        
        # Index for completed lessons (analytics)
        migrations.RunSQL(
            sql="CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_userprogress_completed ON lessons_userprogress (user_id, completed_at DESC) WHERE status = 'completed';",
            reverse_sql="DROP INDEX IF EXISTS idx_userprogress_completed;"
        ),
        
        # Index for favorite lessons
        migrations.RunSQL(
            sql="CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_userprogress_favorites ON lessons_userprogress (user_id, is_favorite) WHERE is_favorite = true;",
            reverse_sql="DROP INDEX IF EXISTS idx_userprogress_favorites;"
        ),
        
        # Index for lesson ratings (analytics and recommendations)
        migrations.RunSQL(
            sql="CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_userprogress_ratings ON lessons_userprogress (lesson_id, rating) WHERE rating IS NOT NULL;",
            reverse_sql="DROP INDEX IF EXISTS idx_userprogress_ratings;"
        ),
        
        # Index for Bible verse lookups
        migrations.RunSQL(
            sql="CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bibleverse_reference ON lessons_bibleverse (book, chapter, verse);",
            reverse_sql="DROP INDEX IF EXISTS idx_bibleverse_reference;"
        ),
        
        # Index for lesson category ordering
        migrations.RunSQL(
            sql="CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_lessoncategory_order ON lessons_lessoncategory (order, name);",
            reverse_sql="DROP INDEX IF EXISTS idx_lessoncategory_order;"
        ),
    ]