#!/usr/bin/env python
"""
Firebase Lesson Data Loader

This script loads sample lessons from content/lessons.json into Firestore.

Usage:
    python scripts/load_lessons.py

Requirements:
    - Firebase Admin SDK installed
    - Service account JSON in backend/django/config/firebase-key.json
    - Firestore database created in Firebase Console
"""

import json
import os
import sys
from pathlib import Path

import firebase_admin
from firebase_admin import credentials, firestore

# Get base directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Service account path
SERVICE_ACCOUNT_PATH = BASE_DIR / 'backend/django/config/firebase-key.json'

# Check if service account exists
if not SERVICE_ACCOUNT_PATH.exists():
    print('❌ Error: Service account file not found at:', SERVICE_ACCOUNT_PATH)
    print('\nPlease:')
    print('1. Go to Firebase Console → Project Settings → Service Accounts')
    print('2. Click "Generate New Private Key"')
    print('3. Save the JSON file to:', SERVICE_ACCOUNT_PATH)
    sys.exit(1)

# Initialize Firebase Admin
try:
    cred = credentials.Certificate(str(SERVICE_ACCOUNT_PATH))
    firebase_admin.initialize_app(cred)
    print('✓ Firebase Admin SDK initialized')
except Exception as error:
    print(f'❌ Error initializing Firebase: {error}')
    sys.exit(1)

# Load lessons data
lessons_path = BASE_DIR / 'content/lessons.json'

try:
    with open(lessons_path, 'r') as f:
        lessons_data = json.load(f)
    print(f'✓ Loaded {len(lessons_data)} lessons from content/lessons.json')
except Exception as error:
    print(f'❌ Error loading lessons: {error}')
    sys.exit(1)

# Get Firestore instance
db = firestore.client()


def load_lessons():
    """Load lessons into Firestore"""
    print('\n📚 Loading lessons into Firestore...\n')

    success_count = 0
    error_count = 0

    for lesson in lessons_data:
        try:
            # Validate lesson has required fields
            if not lesson.get('id') or not lesson.get('title'):
                raise ValueError('Lesson missing id or title')

            # Set the lesson document
            db.collection('lessons').document(lesson['id']).set(lesson)

            print(f'✓ Loaded: "{lesson["title"]}"')
            success_count += 1
        except Exception as error:
            print(f'✗ Error loading lesson: {error}')
            error_count += 1

    # Summary
    print('\n' + '=' * 50)
    print('Summary:')
    print(f'✓ Successfully loaded: {success_count} lessons')
    if error_count > 0:
        print(f'✗ Errors: {error_count} lessons')
    print('=' * 50 + '\n')

    # Verify data
    print('Verifying data in Firestore...\n')

    try:
        docs = db.collection('lessons').get()
        doc_list = list(docs)
        print(f'✓ Total lessons in Firestore: {len(doc_list)}')

        if doc_list:
            print('\nLessons in database:')
            for doc in doc_list:
                lesson = doc.to_dict()
                print(f'  • {lesson["title"]} ({lesson["category"]})')
    except Exception as error:
        print(f'✗ Error verifying data: {error}')

    # Exit
    if error_count == 0:
        print('\n✓ All lessons loaded successfully!')
        sys.exit(0)
    else:
        print(f'\n✗ {error_count} errors occurred.')
        sys.exit(1)


if __name__ == '__main__':
    try:
        load_lessons()
    except Exception as error:
        print(f'❌ Fatal error: {error}')
        sys.exit(1)
