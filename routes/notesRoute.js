const express = require('express');
const { controller: notesController, upload } = require('../controllers/notesController');
const { validate } = require('../utils/validateIntent');
const { authenticateToken } = require('../utils/auth');
const devAuth = require('../utils/devAuth');

const router = express.Router();

// All routes require authentication (bypassed in development)
router.use(devAuth);

// Notes CRUD
router.post('/create', validate(require('../utils/validateIntent').noteSchema), notesController.createNote);
router.get('/', notesController.getNotes);
router.get('/search', notesController.searchNotes);
router.get('/:noteId', notesController.getNote);
router.put('/:noteId', notesController.updateNote);
router.delete('/:noteId', notesController.deleteNote);

// Voice notes and transcription
router.post('/transcribe', upload, notesController.transcribeAudio);

// Note utilities
router.post('/:noteId/summarize', notesController.summarizeNote);
router.get('/stats', notesController.getNoteStats);
router.get('/tags/popular', notesController.getPopularTags);

module.exports = router;


