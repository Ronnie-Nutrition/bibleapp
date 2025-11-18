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

let firebaseInitialized = false;

// Check if Firebase is already initialized
if (admin.apps.length === 0) {
  const nodeEnv = process.env.NODE_ENV || 'development';

  try {
    // In production, use environment variables
    if (nodeEnv === 'production') {
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
      firebaseInitialized = true;
    } else {
      // In development, try to load from file
      const keyPath = path.join(__dirname, 'firebase-key.json');

      if (!fs.existsSync(keyPath)) {
        console.warn('⚠️  Warning: firebase-key.json not found');
        console.warn('   To use Firebase services, add your service account JSON to:');
        console.warn(`   ${keyPath}`);
        console.warn('\n   Or set environment variables:');
        console.warn('   - FIREBASE_PROJECT_ID');
        console.warn('   - FIREBASE_PRIVATE_KEY');
        console.warn('   - FIREBASE_CLIENT_EMAIL\n');
        console.warn('   Firebase features will be disabled until configured.\n');
      } else {
        const serviceAccount = require(keyPath);

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: process.env.FIREBASE_DATABASE_URL ||
            `https://${serviceAccount.project_id}.firebaseio.com`
        });

        console.log('✓ Firebase initialized with service account');
        firebaseInitialized = true;
      }
    }
  } catch (error) {
    console.error('❌ Error initializing Firebase:', error.message);
    console.warn('   Firebase features will be disabled.\n');
  }
} else {
  firebaseInitialized = true;
}

// Export Firebase services only if initialized
module.exports = {
  admin,
  firebaseInitialized,
  db: firebaseInitialized ? admin.firestore() : null,
  auth: firebaseInitialized ? admin.auth() : null,
  messaging: firebaseInitialized ? admin.messaging() : null,
  storage: firebaseInitialized ? admin.storage() : null
};
