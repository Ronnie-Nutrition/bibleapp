from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth import get_user_model
from apps.lessons.models import Lesson, LessonCategory, UserProgress, BibleVerse
from datetime import datetime

User = get_user_model()


class LessonModelTest(TestCase):
    """Test the Lesson model"""

    def setUp(self):
        """Set up test fixtures"""
        self.category = LessonCategory.objects.create(
            name='Leadership',
            description='Leadership lessons'
        )

    def test_create_lesson(self):
        """Test creating a lesson"""
        lesson = Lesson.objects.create(
            title='The Parable of the Talents',
            subtitle='Managing resources wisely',
            category=self.category,
            difficulty='beginner',
            duration=15,
            content='Lesson content here',
            key_takeaway='Use your talents wisely'
        )
        self.assertEqual(lesson.title, 'The Parable of the Talents')
        self.assertEqual(lesson.difficulty, 'beginner')
        self.assertEqual(lesson.duration, 15)

    def test_lesson_string_representation(self):
        """Test lesson string representation"""
        lesson = Lesson.objects.create(
            title='Test Lesson',
            category=self.category,
            content='Content'
        )
        self.assertEqual(str(lesson), 'Test Lesson')

    def test_lesson_default_values(self):
        """Test default values for lesson"""
        lesson = Lesson.objects.create(
            title='Test Lesson',
            category=self.category,
            content='Content'
        )
        self.assertEqual(lesson.difficulty, 'beginner')
        self.assertEqual(lesson.duration, 0)
        self.assertTrue(lesson.is_published)


class BibleVerseModelTest(TestCase):
    """Test the BibleVerse model"""

    def setUp(self):
        """Set up test fixtures"""
        self.category = LessonCategory.objects.create(
            name='Leadership'
        )
        self.lesson = Lesson.objects.create(
            title='Test Lesson',
            category=self.category,
            content='Content'
        )

    def test_create_bible_verse(self):
        """Test creating a bible verse reference"""
        verse = BibleVerse.objects.create(
            lesson=self.lesson,
            book='Matthew',
            chapter=25,
            verse_start=14,
            verse_end=30,
            text='For the kingdom of heaven will be like a man...'
        )
        self.assertEqual(verse.book, 'Matthew')
        self.assertEqual(verse.chapter, 25)
        self.assertEqual(verse.verse_start, 14)


class UserProgressModelTest(TestCase):
    """Test the UserProgress model"""

    def setUp(self):
        """Set up test fixtures"""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.category = LessonCategory.objects.create(name='Leadership')
        self.lesson = Lesson.objects.create(
            title='Test Lesson',
            category=self.category,
            content='Content'
        )

    def test_create_user_progress(self):
        """Test creating user progress"""
        progress = UserProgress.objects.create(
            user=self.user,
            lesson=self.lesson,
            is_completed=True,
            completion_percentage=100
        )
        self.assertEqual(progress.user, self.user)
        self.assertEqual(progress.lesson, self.lesson)
        self.assertTrue(progress.is_completed)
        self.assertEqual(progress.completion_percentage, 100)

    def test_user_progress_default_values(self):
        """Test default values for user progress"""
        progress = UserProgress.objects.create(
            user=self.user,
            lesson=self.lesson
        )
        self.assertFalse(progress.is_completed)
        self.assertEqual(progress.completion_percentage, 0)
        self.assertFalse(progress.is_bookmarked)


class LessonAPITest(APITestCase):
    """Test lesson endpoints"""

    def setUp(self):
        """Set up test fixtures"""
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.category = LessonCategory.objects.create(
            name='Leadership',
            description='Leadership lessons'
        )
        self.lesson1 = Lesson.objects.create(
            title='The Parable of the Talents',
            category=self.category,
            difficulty='beginner',
            duration=15,
            content='Lesson content',
            key_takeaway='Use your talents wisely'
        )
        self.lesson2 = Lesson.objects.create(
            title='Integrity in Business',
            category=self.category,
            difficulty='intermediate',
            duration=20,
            content='Integrity content'
        )

        # Authenticate
        login_url = reverse('auth:login')
        response = self.client.post(
            login_url,
            {
                'email': 'test@example.com',
                'password': 'testpass123'
            },
            format='json'
        )
        self.token = response.data.get('token')
        if self.token:
            self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token}')

    def test_list_lessons(self):
        """Test listing all lessons"""
        list_url = reverse('lessons:list')
        response = self.client.get(list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_list_lessons_pagination(self):
        """Test lesson list pagination"""
        # Create more lessons
        for i in range(15):
            Lesson.objects.create(
                title=f'Lesson {i}',
                category=self.category,
                content='Content'
            )

        list_url = reverse('lessons:list')
        response = self.client.get(f'{list_url}?page=1')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_retrieve_lesson(self):
        """Test retrieving a single lesson"""
        detail_url = reverse('lessons:detail', args=[self.lesson1.id])
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'The Parable of the Talents')

    def test_retrieve_nonexistent_lesson(self):
        """Test retrieving nonexistent lesson"""
        detail_url = reverse('lessons:detail', args=[99999])
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_filter_lessons_by_category(self):
        """Test filtering lessons by category"""
        filter_url = reverse('lessons:list')
        response = self.client.get(f'{filter_url}?category={self.category.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_filter_lessons_by_difficulty(self):
        """Test filtering lessons by difficulty"""
        filter_url = reverse('lessons:list')
        response = self.client.get(f'{filter_url}?difficulty=beginner')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_search_lessons(self):
        """Test searching lessons"""
        search_url = reverse('lessons:list')
        response = self.client.get(f'{search_url}?search=Talents')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        if response.data:
            self.assertEqual(response.data[0]['title'], 'The Parable of the Talents')


class UserProgressAPITest(APITestCase):
    """Test user progress endpoints"""

    def setUp(self):
        """Set up test fixtures"""
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.category = LessonCategory.objects.create(name='Leadership')
        self.lesson = Lesson.objects.create(
            title='Test Lesson',
            category=self.category,
            content='Content'
        )

        # Authenticate
        login_url = reverse('auth:login')
        response = self.client.post(
            login_url,
            {
                'email': 'test@example.com',
                'password': 'testpass123'
            },
            format='json'
        )
        self.token = response.data.get('token')
        if self.token:
            self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token}')

    def test_mark_lesson_complete(self):
        """Test marking a lesson as complete"""
        complete_url = reverse('lessons:mark-complete', args=[self.lesson.id])
        response = self.client.post(complete_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify progress was created
        progress = UserProgress.objects.get(user=self.user, lesson=self.lesson)
        self.assertTrue(progress.is_completed)

    def test_bookmark_lesson(self):
        """Test bookmarking a lesson"""
        bookmark_url = reverse('lessons:bookmark', args=[self.lesson.id])
        response = self.client.post(bookmark_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify progress was updated
        progress = UserProgress.objects.get(user=self.user, lesson=self.lesson)
        self.assertTrue(progress.is_bookmarked)

    def test_get_user_progress(self):
        """Test getting user's lesson progress"""
        # Create progress
        UserProgress.objects.create(
            user=self.user,
            lesson=self.lesson,
            is_completed=True,
            completion_percentage=100
        )

        progress_url = reverse('lessons:user-progress')
        response = self.client.get(progress_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_completion_percentage(self):
        """Test updating lesson completion percentage"""
        # Create progress
        progress = UserProgress.objects.create(
            user=self.user,
            lesson=self.lesson
        )

        update_url = reverse('lessons:update-progress', args=[self.lesson.id])
        response = self.client.put(
            update_url,
            {'completion_percentage': 50},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify progress was updated
        progress.refresh_from_db()
        self.assertEqual(progress.completion_percentage, 50)


class LessonCategoryTest(TestCase):
    """Test LessonCategory model"""

    def test_create_category(self):
        """Test creating a lesson category"""
        category = LessonCategory.objects.create(
            name='Leadership',
            description='Leadership lessons for entrepreneurs'
        )
        self.assertEqual(category.name, 'Leadership')
        self.assertEqual(str(category), 'Leadership')

    def test_category_unique_name(self):
        """Test that category names are unique"""
        LessonCategory.objects.create(name='Leadership')
        with self.assertRaises(Exception):
            LessonCategory.objects.create(name='Leadership')
