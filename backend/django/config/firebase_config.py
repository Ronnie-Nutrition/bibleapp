"""
Firebase Configuration for Django Backend

This module initializes Firebase Admin SDK with proper error handling.
Service account credentials should be stored in environment variables
or in a secure config file (NOT committed to Git).
"""

import os
import json
import firebase_admin
from firebase_admin import credentials, firestore, auth, messaging
from pathlib import Path

# Get the config directory
CONFIG_DIR = Path(__file__).resolve().parent

# Firebase services
db = None
firestore_client = None
auth_client = None
messaging_client = None


def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    global db, firestore_client, auth_client, messaging_client

    if firebase_admin._apps:
        # Firebase already initialized
        db = firestore.client()
        firestore_client = db
        auth_client = auth
        messaging_client = messaging
        print('✓ Firebase already initialized')
        return

    try:
        # In production, use environment variables
        if os.getenv('DJANGO_ENV') == 'production':
            service_account = {
                'type': 'service_account',
                'project_id': os.getenv('FIREBASE_PROJECT_ID'),
                'private_key_id': os.getenv('FIREBASE_PRIVATE_KEY_ID'),
                'private_key': os.getenv('FIREBASE_PRIVATE_KEY', '').replace('\\n', '\n'),
                'client_email': os.getenv('FIREBASE_CLIENT_EMAIL'),
                'client_id': os.getenv('FIREBASE_CLIENT_ID'),
                'auth_uri': 'https://accounts.google.com/o/oauth2/auth',
                'token_uri': 'https://oauth2.googleapis.com/token',
                'auth_provider_x509_cert_url': 'https://www.googleapis.com/oauth2/v1/certs',
                'client_x509_cert_url': os.getenv('FIREBASE_CLIENT_X509_CERT_URL')
            }

            cred = credentials.Certificate(service_account)
        else:
            # In development, try to load from file
            key_path = CONFIG_DIR / 'firebase-key.json'

            if not key_path.exists():
                print('⚠️  Warning: firebase-key.json not found')
                print('   To use Firebase services, add your service account JSON to:')
                print(f'   {key_path}')
                print('\n   Or set environment variables:')
                print('   - FIREBASE_PROJECT_ID')
                print('   - FIREBASE_PRIVATE_KEY')
                print('   - FIREBASE_CLIENT_EMAIL\n')
                return

            cred = credentials.Certificate(str(key_path))

        # Initialize Firebase
        firebase_admin.initialize_app(cred)

        # Get service clients
        db = firestore.client()
        firestore_client = db
        auth_client = auth
        messaging_client = messaging

        print('✓ Firebase initialized successfully')

    except Exception as error:
        print(f'❌ Error initializing Firebase: {error}')
        raise


# Initialize Firebase when module is imported
initialize_firebase()


def get_db():
    """Get Firestore database instance"""
    if db is None:
        initialize_firebase()
    return db


def get_auth():
    """Get Firebase Auth instance"""
    if auth_client is None:
        initialize_firebase()
    return auth_client


def get_messaging():
    """Get Firebase Cloud Messaging instance"""
    if messaging_client is None:
        initialize_firebase()
    return messaging_client
