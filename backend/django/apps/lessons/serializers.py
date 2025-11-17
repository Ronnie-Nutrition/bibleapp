"""
Lessons Serializers
Serializers for lessons, user progress, and related content
"""

from rest_framework import serializers
from .models import Lesson, UserProgress, LessonCategory, BibleVerse


class BibleVerseSerializer(serializers.ModelSerializer):
    """Serializer for Bible verses"""

    class Meta:
        model = BibleVerse
        fields = ['id', 'book', 'chapter', 'verse', 'end_verse', 'text']
        read_only_fields = fields


class LessonCategorySerializer(serializers.ModelSerializer):
    """Serializer for lesson categories"""

    class Meta:
        model = LessonCategory
        fields = ['id', 'name', 'description', 'icon_url', 'order']


class LessonListSerializer(serializers.ModelSerializer):
    """Serializer for lesson list view (summary)"""

    category_display = serializers.CharField(source='get_category_display', read_only=True)
    difficulty_display = serializers.CharField(source='get_difficulty_display', read_only=True)

    class Meta:
        model = Lesson
        fields = [
            'id', 'lesson_id', 'title', 'subtitle', 'category', 'category_display',
            'difficulty', 'difficulty_display', 'duration', 'key_takeaway',
            'featured_image_url', 'is_featured', 'created_at'
        ]
        read_only_fields = fields


class LessonDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for individual lesson"""

    bible_verses = BibleVerseSerializer(many=True, read_only=True, source='verse_references')
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    difficulty_display = serializers.CharField(source='get_difficulty_display', read_only=True)

    class Meta:
        model = Lesson
        fields = [
            'id', 'lesson_id', 'title', 'subtitle', 'category', 'category_display',
            'difficulty', 'difficulty_display', 'duration', 'content', 'key_takeaway',
            'bible_verses', 'practical_steps', 'featured_image_url', 'video_url',
            'is_published', 'is_featured', 'created_at', 'updated_at'
        ]
        read_only_fields = fields


class UserProgressSerializer(serializers.ModelSerializer):
    """Serializer for user lesson progress"""

    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    lesson_id = serializers.CharField(source='lesson.lesson_id', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = UserProgress
        fields = [
            'id', 'lesson', 'lesson_id', 'lesson_title', 'status', 'status_display',
            'progress_percentage', 'time_spent', 'rating', 'is_favorite',
            'started_at', 'completed_at', 'notes'
        ]
        read_only_fields = ['id', 'started_at', 'completed_at']


class UserProgressCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating user progress"""

    class Meta:
        model = UserProgress
        fields = ['lesson', 'status', 'progress_percentage', 'time_spent', 'rating', 'is_favorite', 'notes']

    def validate_progress_percentage(self, value):
        """Ensure progress is between 0-100"""
        if not 0 <= value <= 100:
            raise serializers.ValidationError("Progress must be between 0 and 100")
        return value

    def validate_rating(self, value):
        """Ensure rating is between 1-5"""
        if value and not 1 <= value <= 5:
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value


class LessonFilterSerializer(serializers.Serializer):
    """Serializer for lesson filtering and search"""

    category = serializers.ChoiceField(
        choices=[choice[0] for choice in Lesson.CATEGORY_CHOICES],
        required=False
    )
    difficulty = serializers.ChoiceField(
        choices=[choice[0] for choice in Lesson.DIFFICULTY_CHOICES],
        required=False
    )
    search = serializers.CharField(max_length=255, required=False)
    is_featured = serializers.BooleanField(required=False)
    min_duration = serializers.IntegerField(required=False, min_value=0)
    max_duration = serializers.IntegerField(required=False, min_value=0)
    ordering = serializers.ChoiceField(
        choices=['created_at', '-created_at', 'title', '-title', 'duration', '-duration'],
        required=False,
        default='-created_at'
    )


class LessonProgressStatsSerializer(serializers.Serializer):
    """Serializer for user's lesson progress statistics"""

    total_lessons = serializers.IntegerField()
    lessons_completed = serializers.IntegerField()
    lessons_started = serializers.IntegerField()
    lessons_not_started = serializers.IntegerField()
    average_completion_percentage = serializers.FloatField()
    total_time_spent = serializers.IntegerField()
    average_rating = serializers.FloatField()
    favorite_count = serializers.IntegerField()


class LessonCompletionSerializer(serializers.Serializer):
    """Serializer for marking lesson as completed"""

    lesson_id = serializers.IntegerField()
    time_spent = serializers.IntegerField(required=False, min_value=0)
    notes = serializers.CharField(required=False, allow_blank=True)
