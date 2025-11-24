/**
 * Firebase Configuration for Node.js Backend
 *
 * This file initializes Firebase Admin SDK with proper error handling.
 * Service account credentials should be stored in environment variables
 * or in a secure config file (NOT committed to Git).
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Check if Firebase is already initialized
if (admin.apps.length === 0) {
  const nodeEnv = process.env.NODE_ENV || 'development';

  try {
    // Try to load from JSON file first (works for both dev and production)
    const keyPath = path.join(__dirname, 'firebase-key.json');
    
    console.log(`🔍 Looking for Firebase credentials at: ${keyPath}`);
    console.log(`🔍 File exists: ${fs.existsSync(keyPath)}`);
    console.log(`🔍 Environment: ${nodeEnv}`);
    
    if (fs.existsSync(keyPath)) {
      console.log('📂 Loading Firebase credentials from JSON file');
      const serviceAccount = require(keyPath);

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL ||
          `https://${serviceAccount.project_id}.firebaseio.com`
      });

      console.log('✓ Firebase initialized with service account JSON');
    } else if (nodeEnv === 'production' && process.env.FIREBASE_PROJECT_ID) {
      console.log('🔧 Using environment variables for Firebase credentials');
      // Fallback to environment variables for production
      const serviceAccount = {
        type: 'service_account',
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL
      });

      console.log('✓ Firebase initialized with environment variables');
    } else {
      console.warn('⚠️  Warning: Firebase credentials not found');
      console.warn('   To use Firebase services, add your service account JSON to:');
      console.warn(`   ${path.join(__dirname, 'firebase-key.json')}`);
      console.warn('\n   Or set environment variables:');
      console.warn('   - FIREBASE_PROJECT_ID');
      console.warn('   - FIREBASE_PRIVATE_KEY');
      console.warn('   - FIREBASE_CLIENT_EMAIL\n');
    }
  } catch (error) {
    console.error('❌ Error initializing Firebase:', error.message);
    throw error;
  }
}

// Export Firebase services
module.exports = {
  admin,
  db: admin.firestore(),
  auth: admin.auth(),
  messaging: admin.messaging(),
  storage: admin.storage()
};
