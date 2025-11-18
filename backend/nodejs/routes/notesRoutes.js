/**
 * Notes Routes
 *
 * API endpoints for managing personal notes on biblical lessons
 */

const express = require('express');
const router = express.Router();
const notesService = require('../services/notesService');

/**
 * POST /api/notes/create
 * Create a new note for a lesson
 *
 * Body:
 * - userId: string (required)
 * - lessonId: string (required)
 * - content: string (required, max 10,000 chars)
 * - tags: array of strings (optional)
 *
 * Returns:
 * - 201: Note created successfully
 * - 400: Missing required fields or invalid data
 * - 404: Lesson not found
 * - 500: Server error
 */
router.post('/create', async (req, res) => {
  try {
    const { userId, lessonId, content, tags } = req.body;

    if (!userId || !lessonId || !content) {
      return res.status(400).json({
        error: 'Missing required fields',
        code: 'MISSING_FIELDS',
        fields: {
          userId: !userId ? 'User ID is required' : null,
          lessonId: !lessonId ? 'Lesson ID is required' : null,
          content: !content ? 'Content is required' : null
        }
      });
    }

    const result = await notesService.createNote(userId, lessonId, content, tags);
    res.status(201).json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      error: error.message,
      code: error.code || 'CREATE_NOTE_ERROR'
    });
  }
});

/**
 * PUT /api/notes/:noteId
 * Update an existing note
 *
 * Body:
 * - userId: string (required, for authorization)
 * - content: string (optional)
 * - tags: array of strings (optional)
 *
 * Returns:
 * - 200: Note updated successfully
 * - 400: Missing required fields
 * - 403: Unauthorized
 * - 404: Note not found
 * - 500: Server error
 */
router.put('/:noteId', async (req, res) => {
  try {
    const { noteId } = req.params;
    const { userId, content, tags } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: 'User ID is required',
        code: 'MISSING_USER_ID'
      });
    }

    const result = await notesService.updateNote(noteId, userId, content, tags);
    res.json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      error: error.message,
      code: error.code || 'UPDATE_NOTE_ERROR'
    });
  }
});

/**
 * DELETE /api/notes/:noteId
 * Delete a note
 *
 * Query params:
 * - userId: string (required, for authorization)
 *
 * Returns:
 * - 200: Note deleted successfully
 * - 400: Missing userId
 * - 403: Unauthorized
 * - 404: Note not found
 * - 500: Server error
 */
router.delete('/:noteId', async (req, res) => {
  try {
    const { noteId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        error: 'User ID is required',
        code: 'MISSING_USER_ID'
      });
    }

    const result = await notesService.deleteNote(noteId, userId);
    res.json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      error: error.message,
      code: error.code || 'DELETE_NOTE_ERROR'
    });
  }
});

/**
 * GET /api/notes/:noteId
 * Get a specific note
 *
 * Query params:
 * - userId: string (required, for authorization)
 *
 * Returns:
 * - 200: Note data
 * - 400: Missing userId
 * - 403: Unauthorized
 * - 404: Note not found
 * - 500: Server error
 */
router.get('/:noteId', async (req, res) => {
  try {
    const { noteId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        error: 'User ID is required',
        code: 'MISSING_USER_ID'
      });
    }

    const note = await notesService.getNote(noteId, userId);
    res.json({
      success: true,
      note
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      error: error.message,
      code: error.code || 'GET_NOTE_ERROR'
    });
  }
});

/**
 * GET /api/notes/user/:userId
 * Get all notes for a user
 *
 * Query params:
 * - limit: number (optional, default 50, max 100)
 * - offset: number (optional, default 0)
 * - sortBy: string (optional, 'updatedAt' or 'createdAt', default 'updatedAt')
 * - sortOrder: string (optional, 'asc' or 'desc', default 'desc')
 *
 * Returns:
 * - 200: Array of notes
 * - 400: Missing userId
 * - 500: Server error
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit, offset, sortBy, sortOrder } = req.query;

    if (!userId) {
      return res.status(400).json({
        error: 'User ID is required',
        code: 'MISSING_USER_ID'
      });
    }

    const options = {
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
      sortBy: sortBy || 'updatedAt',
      sortOrder: sortOrder || 'desc'
    };

    const notes = await notesService.getUserNotes(userId, options);
    res.json({
      success: true,
      count: notes.length,
      notes
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      code: 'GET_NOTES_ERROR'
    });
  }
});

/**
 * GET /api/notes/user/:userId/lesson/:lessonId
 * Get all notes for a specific lesson
 *
 * Returns:
 * - 200: Array of notes for the lesson
 * - 400: Missing parameters
 * - 500: Server error
 */
router.get('/user/:userId/lesson/:lessonId', async (req, res) => {
  try {
    const { userId, lessonId } = req.params;

    if (!userId || !lessonId) {
      return res.status(400).json({
        error: 'userId and lessonId are required',
        code: 'MISSING_PARAMS'
      });
    }

    const notes = await notesService.getNotesForLesson(userId, lessonId);
    res.json({
      success: true,
      count: notes.length,
      notes
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      code: 'GET_LESSON_NOTES_ERROR'
    });
  }
});

/**
 * GET /api/notes/user/:userId/search
 * Search notes by content
 *
 * Query params:
 * - q: string (required) - Search term
 * - limit: number (optional, default 20)
 *
 * Returns:
 * - 200: Array of matching notes
 * - 400: Missing search term
 * - 500: Server error
 */
router.get('/user/:userId/search', async (req, res) => {
  try {
    const { userId } = req.params;
    const { q: searchTerm, limit } = req.query;

    if (!userId) {
      return res.status(400).json({
        error: 'User ID is required',
        code: 'MISSING_USER_ID'
      });
    }

    if (!searchTerm) {
      return res.status(400).json({
        error: 'Search term (q) is required',
        code: 'MISSING_SEARCH_TERM'
      });
    }

    const searchLimit = limit ? parseInt(limit) : 20;
    const notes = await notesService.searchNotes(userId, searchTerm, searchLimit);

    res.json({
      success: true,
      count: notes.length,
      searchTerm,
      notes
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      code: 'SEARCH_NOTES_ERROR'
    });
  }
});

/**
 * GET /api/notes/user/:userId/tag/:tag
 * Get notes by tag
 *
 * Returns:
 * - 200: Array of notes with the tag
 * - 400: Missing parameters
 * - 500: Server error
 */
router.get('/user/:userId/tag/:tag', async (req, res) => {
  try {
    const { userId, tag } = req.params;

    if (!userId || !tag) {
      return res.status(400).json({
        error: 'userId and tag are required',
        code: 'MISSING_PARAMS'
      });
    }

    const notes = await notesService.getNotesByTag(userId, tag);
    res.json({
      success: true,
      count: notes.length,
      tag,
      notes
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      code: 'GET_TAG_NOTES_ERROR'
    });
  }
});

/**
 * GET /api/notes/user/:userId/stats
 * Get user's note statistics
 *
 * Returns:
 * - 200: Note statistics
 * - 400: Missing userId
 * - 500: Server error
 */
router.get('/user/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        error: 'User ID is required',
        code: 'MISSING_USER_ID'
      });
    }

    const stats = await notesService.getUserNoteStats(userId);
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      code: 'GET_STATS_ERROR'
    });
  }
});

module.exports = router;
