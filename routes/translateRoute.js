const express = require('express');
const { controller: translateController, upload } = require('../controllers/translateController');
const { validate } = require('../utils/validateIntent');
const { authenticateToken } = require('../utils/auth');
const devAuth = require('../utils/devAuth');

const router = express.Router();

// All routes require authentication (bypassed in development)
router.use(devAuth);

// Translation routes
router.post('/text', translateController.translateText);
router.post('/audio', upload, translateController.translateAudio);

// Translation management
router.get('/', translateController.getTranslations);
router.get('/search', translateController.searchTranslations);
router.get('/:translationId', translateController.getTranslation);
router.delete('/:translationId', translateController.deleteTranslation);

// Translation utilities
router.get('/languages', translateController.getSupportedLanguages);
router.post('/detect', translateController.detectLanguage);
router.get('/stats', translateController.getTranslationStats);
router.get('/pairs/popular', translateController.getPopularLanguagePairs);

module.exports = router;


