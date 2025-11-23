# Generated performance optimization indexes

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('auth_app', '0001_initial'),
    ]

    operations = [
        # Index for Firebase UID lookups (frequently used for authentication)
        migrations.RunSQL(
            sql="CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customuser_firebase_uid ON auth_app_customuser (firebase_uid);",
            reverse_sql="DROP INDEX IF EXISTS idx_customuser_firebase_uid;"
        ),
        
        # Index for email verification lookups
        migrations.RunSQL(
            sql="CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customuser_email_verified ON auth_app_customuser (email_verified) WHERE email_verified = false;",
            reverse_sql="DROP INDEX IF EXISTS idx_customuser_email_verified;"
        ),
        
        # Composite index for password reset lookups
        migrations.RunSQL(
            sql="CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customuser_password_reset ON auth_app_customuser (email, password_reset_code) WHERE password_reset_code IS NOT NULL;",
            reverse_sql="DROP INDEX IF EXISTS idx_customuser_password_reset;"
        ),
        
        # Index for user preferences lookups (OneToOne relationship)
        migrations.RunSQL(
            sql="CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_userpreferences_user_id ON auth_app_userpreferences (user_id);",
            reverse_sql="DROP INDEX IF EXISTS idx_userpreferences_user_id;"
        ),
        
        # Index for notification preferences
        migrations.RunSQL(
            sql="CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_userpreferences_notifications ON auth_app_userpreferences (notifications_enabled, daily_lessons_enabled);",
            reverse_sql="DROP INDEX IF EXISTS idx_userpreferences_notifications;"
        ),
        
        # Index for user stats lookups
        migrations.RunSQL(
            sql="CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_userstats_user_id ON auth_app_userstats (user_id);",
            reverse_sql="DROP INDEX IF EXISTS idx_userstats_user_id;"
        ),
        
        # Index for streak queries (top performers, leaderboard)
        migrations.RunSQL(
            sql="CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_userstats_streaks ON auth_app_userstats (current_streak DESC, longest_streak DESC);",
            reverse_sql="DROP INDEX IF EXISTS idx_userstats_streaks;"
        ),
        
        # Index for login history by user (security auditing)
        migrations.RunSQL(
            sql="CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_loginhistory_user_timestamp ON auth_app_loginhistory (user_id, timestamp DESC);",
            reverse_sql="DROP INDEX IF EXISTS idx_loginhistory_user_timestamp;"
        ),
        
        # Index for failed login attempts (security monitoring)
        migrations.RunSQL(
            sql="CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_loginhistory_failed_attempts ON auth_app_loginhistory (ip_address, login_successful, timestamp) WHERE login_successful = false;",
            reverse_sql="DROP INDEX IF EXISTS idx_loginhistory_failed_attempts;"
        ),
        
        # Index for recent login activity
        migrations.RunSQL(
            sql="CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_loginhistory_recent ON auth_app_loginhistory (timestamp DESC) WHERE login_successful = true;",
            reverse_sql="DROP INDEX IF EXISTS idx_loginhistory_recent;"
        ),
    ]