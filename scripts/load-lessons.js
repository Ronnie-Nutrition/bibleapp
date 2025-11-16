#!/usr/bin/env node

/**
 * Firebase Lesson Data Loader
 *
 * This script loads sample lessons from content/lessons.json into Firestore.
 *
 * Usage:
 *   node scripts/load-lessons.js
 *
 * Requirements:
 *   - Firebase Admin SDK initialized with service account
 *   - Service account JSON in backend/nodejs/config/firebase-key.json
 *   - Firestore database created in Firebase Console
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Get service account path
const serviceAccountPath = path.join(__dirname, '../backend/nodejs/config/firebase-key.json');

// Check if service account exists
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Error: Service account file not found at:', serviceAccountPath);
  console.error('\nPlease:');
  console.error('1. Go to Firebase Console → Project Settings → Service Accounts');
  console.error('2. Click "Generate New Private Key"');
  console.error('3. Save the JSON file to:', serviceAccountPath);
  process.exit(1);
}

// Initialize Firebase Admin
try {
  const serviceAccount = require(serviceAccountPath);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  console.log('✓ Firebase Admin SDK initialized');
} catch (error) {
  console.error('❌ Error initializing Firebase:', error.message);
  process.exit(1);
}

// Load lessons data
const lessonsPath = path.join(__dirname, '../content/lessons.json');
let lessonsData;

try {
  lessonsData = require(lessonsPath);
  console.log(`✓ Loaded ${lessonsData.length} lessons from content/lessons.json`);
} catch (error) {
  console.error('❌ Error loading lessons:', error.message);
  process.exit(1);
}

// Get Firestore instance
const db = admin.firestore();

/**
 * Load lessons into Firestore
 */
async function loadLessons() {
  console.log('\n📚 Loading lessons into Firestore...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const lesson of lessonsData) {
    try {
      // Validate lesson has required fields
      if (!lesson.id || !lesson.title) {
        throw new Error('Lesson missing id or title');
      }

      // Set the lesson document
      await db.collection('lessons').doc(lesson.id).set(lesson);

      console.log(`✓ Loaded: "${lesson.title}"`);
      successCount++;
    } catch (error) {
      console.error(`✗ Error loading lesson: ${error.message}`);
      errorCount++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`Summary:`);
  console.log(`✓ Successfully loaded: ${successCount} lessons`);
  if (errorCount > 0) {
    console.log(`✗ Errors: ${errorCount} lessons`);
  }
  console.log('='.repeat(50) + '\n');

  // Verify data
  console.log('Verifying data in Firestore...\n');

  try {
    const snapshot = await db.collection('lessons').get();
    console.log(`✓ Total lessons in Firestore: ${snapshot.size}`);

    if (snapshot.size > 0) {
      console.log('\nLessons in database:');
      snapshot.forEach(doc => {
        const lesson = doc.data();
        console.log(`  • ${lesson.title} (${lesson.category})`);
      });
    }
  } catch (error) {
    console.error('✗ Error verifying data:', error.message);
  }

  // Exit
  if (errorCount === 0) {
    console.log('\n✓ All lessons loaded successfully!');
    process.exit(0);
  } else {
    console.log(`\n✗ ${errorCount} errors occurred.`);
    process.exit(1);
  }
}

// Run
loadLessons().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
