/**
 * Notes Service
 *
 * Allows entrepreneurs to write personal reflections and notes on biblical lessons,
 * helping them apply spiritual principles to their business challenges.
 */

const { db } = require('../config/firebase');
const { FieldValue } = require('firebase-admin').firestore;

class NotesService {
  constructor() {
    this.notesCollection = 'lesson_notes';
    this.lessonsCollection = 'lessons';
  }

  /**
   * Create a new note for a lesson
   *
   * @param {string} userId - User ID
   * @param {string} lessonId - Lesson ID
   * @param {string} content - Note content
   * @param {Array<string>} tags - Optional tags for organization
   * @returns {Promise<Object>} Created note
   */
  async createNote(userId, lessonId, content, tags = []) {
    if (!db) {
      throw new Error('Database not initialized');
    }

    if (!userId || !lessonId || !content) {
      const error = new Error('userId, lessonId, and content are required');
      error.statusCode = 400;
      throw error;
    }

    // Validate content length
    if (content.length > 10000) {
      const error = new Error('Note content exceeds maximum length of 10,000 characters');
      error.statusCode = 400;
      throw error;
    }

    // Verify lesson exists
    const lessonDoc = await db.collection(this.lessonsCollection).doc(lessonId).get();
    if (!lessonDoc.exists) {
      const error = new Error('Lesson not found');
      error.statusCode = 404;
      throw error;
    }

    const lessonData = lessonDoc.data();
    const now = new Date();

    const noteData = {
      userId,
      lessonId,
      lessonTitle: lessonData.title || 'Untitled',
      lessonCategory: lessonData.category || 'general',
      content: content.trim(),
      tags: Array.isArray(tags) ? tags.filter(tag => tag && tag.trim()).map(tag => tag.toLowerCase().trim()) : [],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      characterCount: content.trim().length,
      wordCount: content.trim().split(/\s+/).length
    };

    const noteRef = await db.collection(this.notesCollection).add(noteData);

    return {
      success: true,
      note: {
        id: noteRef.id,
        ...noteData
      }
    };
  }

  /**
   * Update an existing note
   *
   * @param {string} noteId - Note ID
   * @param {string} userId - User ID (for authorization)
   * @param {string} content - Updated content
   * @param {Array<string>} tags - Updated tags
   * @returns {Promise<Object>} Updated note
   */
  async updateNote(noteId, userId, content, tags) {
    if (!db) {
      throw new Error('Database not initialized');
    }

    if (!noteId || !userId) {
      const error = new Error('noteId and userId are required');
      error.statusCode = 400;
      throw error;
    }

    const noteRef = db.collection(this.notesCollection).doc(noteId);
    const noteDoc = await noteRef.get();

    if (!noteDoc.exists) {
      const error = new Error('Note not found');
      error.statusCode = 404;
      throw error;
    }

    const noteData = noteDoc.data();

    // Verify ownership
    if (noteData.userId !== userId) {
      const error = new Error('Unauthorized to update this note');
      error.statusCode = 403;
      throw error;
    }

    const updates = {
      updatedAt: new Date().toISOString()
    };

    // Update content if provided
    if (content !== undefined && content !== null) {
      if (content.length > 10000) {
        const error = new Error('Note content exceeds maximum length of 10,000 characters');
        error.statusCode = 400;
        throw error;
      }
      updates.content = content.trim();
      updates.characterCount = content.trim().length;
      updates.wordCount = content.trim().split(/\s+/).length;
    }

    // Update tags if provided
    if (tags !== undefined) {
      updates.tags = Array.isArray(tags)
        ? tags.filter(tag => tag && tag.trim()).map(tag => tag.toLowerCase().trim())
        : [];
    }

    await noteRef.update(updates);

    const updatedDoc = await noteRef.get();

    return {
      success: true,
      note: {
        id: noteDoc.id,
        ...updatedDoc.data()
      }
    };
  }

  /**
   * Delete a note
   *
   * @param {string} noteId - Note ID
   * @param {string} userId - User ID (for authorization)
   * @returns {Promise<Object>} Deletion result
   */
  async deleteNote(noteId, userId) {
    if (!db) {
      throw new Error('Database not initialized');
    }

    if (!noteId || !userId) {
      const error = new Error('noteId and userId are required');
      error.statusCode = 400;
      throw error;
    }

    const noteRef = db.collection(this.notesCollection).doc(noteId);
    const noteDoc = await noteRef.get();

    if (!noteDoc.exists) {
      const error = new Error('Note not found');
      error.statusCode = 404;
      throw error;
    }

    const noteData = noteDoc.data();

    // Verify ownership
    if (noteData.userId !== userId) {
      const error = new Error('Unauthorized to delete this note');
      error.statusCode = 403;
      throw error;
    }

    await noteRef.delete();

    return {
      success: true,
      message: 'Note deleted successfully',
      noteId
    };
  }

  /**
   * Get a specific note by ID
   *
   * @param {string} noteId - Note ID
   * @param {string} userId - User ID (for authorization)
   * @returns {Promise<Object>} Note data
   */
  async getNote(noteId, userId) {
    if (!db) {
      throw new Error('Database not initialized');
    }

    if (!noteId || !userId) {
      const error = new Error('noteId and userId are required');
      error.statusCode = 400;
      throw error;
    }

    const noteDoc = await db.collection(this.notesCollection).doc(noteId).get();

    if (!noteDoc.exists) {
      const error = new Error('Note not found');
      error.statusCode = 404;
      throw error;
    }

    const noteData = noteDoc.data();

    // Verify ownership
    if (noteData.userId !== userId) {
      const error = new Error('Unauthorized to view this note');
      error.statusCode = 403;
      throw error;
    }

    return {
      id: noteDoc.id,
      ...noteData
    };
  }

  /**
   * Get all notes for a user
   *
   * @param {string} userId - User ID
   * @param {Object} options - Query options (limit, offset, sortBy)
   * @returns {Promise<Array>} Array of notes
   */
  async getUserNotes(userId, options = {}) {
    if (!db) {
      throw new Error('Database not initialized');
    }

    if (!userId) {
      const error = new Error('userId is required');
      error.statusCode = 400;
      throw error;
    }

    const {
      limit = 50,
      offset = 0,
      sortBy = 'updatedAt', // updatedAt, createdAt
      sortOrder = 'desc' // desc, asc
    } = options;

    let query = db.collection(this.notesCollection)
      .where('userId', '==', userId);

    // Apply sorting
    const validSortFields = ['updatedAt', 'createdAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'updatedAt';
    query = query.orderBy(sortField, sortOrder);

    // Apply pagination
    if (offset > 0) {
      query = query.offset(offset);
    }
    query = query.limit(Math.min(limit, 100)); // Max 100 per request

    const snapshot = await query.get();

    const notes = [];
    snapshot.forEach(doc => {
      notes.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return notes;
  }

  /**
   * Get all notes for a specific lesson by a user
   *
   * @param {string} userId - User ID
   * @param {string} lessonId - Lesson ID
   * @returns {Promise<Array>} Array of notes
   */
  async getNotesForLesson(userId, lessonId) {
    if (!db) {
      throw new Error('Database not initialized');
    }

    if (!userId || !lessonId) {
      const error = new Error('userId and lessonId are required');
      error.statusCode = 400;
      throw error;
    }

    const snapshot = await db.collection(this.notesCollection)
      .where('userId', '==', userId)
      .where('lessonId', '==', lessonId)
      .orderBy('createdAt', 'desc')
      .get();

    const notes = [];
    snapshot.forEach(doc => {
      notes.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return notes;
  }

  /**
   * Search notes by content
   *
   * @param {string} userId - User ID
   * @param {string} searchTerm - Search term
   * @param {number} limit - Result limit
   * @returns {Promise<Array>} Array of matching notes
   */
  async searchNotes(userId, searchTerm, limit = 20) {
    if (!db) {
      throw new Error('Database not initialized');
    }

    if (!userId || !searchTerm) {
      const error = new Error('userId and searchTerm are required');
      error.statusCode = 400;
      throw error;
    }

    // Get all user notes (Firestore doesn't support full-text search natively)
    // For production, consider using Algolia or Elasticsearch
    const snapshot = await db.collection(this.notesCollection)
      .where('userId', '==', userId)
      .orderBy('updatedAt', 'desc')
      .limit(200) // Limit initial fetch
      .get();

    const searchLower = searchTerm.toLowerCase();
    const notes = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      const content = data.content.toLowerCase();
      const tags = (data.tags || []).join(' ').toLowerCase();
      const title = (data.lessonTitle || '').toLowerCase();

      // Simple text search (contains)
      if (content.includes(searchLower) ||
          tags.includes(searchLower) ||
          title.includes(searchLower)) {
        notes.push({
          id: doc.id,
          ...data
        });
      }
    });

    return notes.slice(0, limit);
  }

  /**
   * Get notes by tag
   *
   * @param {string} userId - User ID
   * @param {string} tag - Tag to filter by
   * @returns {Promise<Array>} Array of notes with the tag
   */
  async getNotesByTag(userId, tag) {
    if (!db) {
      throw new Error('Database not initialized');
    }

    if (!userId || !tag) {
      const error = new Error('userId and tag are required');
      error.statusCode = 400;
      throw error;
    }

    const normalizedTag = tag.toLowerCase().trim();

    const snapshot = await db.collection(this.notesCollection)
      .where('userId', '==', userId)
      .where('tags', 'array-contains', normalizedTag)
      .orderBy('updatedAt', 'desc')
      .limit(50)
      .get();

    const notes = [];
    snapshot.forEach(doc => {
      notes.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return notes;
  }

  /**
   * Get user's note statistics
   *
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Note statistics
   */
  async getUserNoteStats(userId) {
    if (!db) {
      throw new Error('Database not initialized');
    }

    if (!userId) {
      const error = new Error('userId is required');
      error.statusCode = 400;
      throw error;
    }

    const snapshot = await db.collection(this.notesCollection)
      .where('userId', '==', userId)
      .get();

    let totalNotes = 0;
    let totalWords = 0;
    let totalCharacters = 0;
    const allTags = new Set();
    const lessonMap = new Map();
    const categoryMap = new Map();

    snapshot.forEach(doc => {
      const data = doc.data();
      totalNotes++;
      totalWords += data.wordCount || 0;
      totalCharacters += data.characterCount || 0;

      // Collect tags
      (data.tags || []).forEach(tag => allTags.add(tag));

      // Count notes per lesson
      lessonMap.set(data.lessonId, (lessonMap.get(data.lessonId) || 0) + 1);

      // Count notes per category
      const category = data.lessonCategory || 'general';
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });

    // Calculate recent activity
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let notesThisWeek = 0;
    let notesThisMonth = 0;

    snapshot.forEach(doc => {
      const data = doc.data();
      const createdDate = new Date(data.createdAt);

      if (createdDate >= sevenDaysAgo) {
        notesThisWeek++;
      }
      if (createdDate >= thirtyDaysAgo) {
        notesThisMonth++;
      }
    });

    return {
      totalNotes,
      totalWords,
      totalCharacters,
      averageWordsPerNote: totalNotes > 0 ? Math.round(totalWords / totalNotes) : 0,
      uniqueTags: allTags.size,
      tags: Array.from(allTags),
      lessonsWithNotes: lessonMap.size,
      categoriesWithNotes: Array.from(categoryMap.entries()).map(([category, count]) => ({
        category,
        count
      })),
      recentActivity: {
        notesThisWeek,
        notesThisMonth
      }
    };
  }
}

module.exports = new NotesService();
