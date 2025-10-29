const express = require('express');
const { controller: imageController, upload } = require('../controllers/imageController');
const { validate } = require('../utils/validateIntent');
const { optionalAuth } = require('../utils/auth');

const router = express.Router();

// Image generation routes (optional auth for public access)
router.post('/generate', validate(require('../utils/validateIntent').imageGenerationSchema), optionalAuth, imageController.generateImage);
router.post('/health-illustration', optionalAuth, imageController.generateHealthIllustration);
router.post('/finance-chart', optionalAuth, imageController.generateFinanceChart);
router.post('/note-illustration', optionalAuth, imageController.generateNoteIllustration);

// Image upload
router.post('/upload', upload, imageController.uploadImage);

// Image utilities
router.get('/styles', imageController.getImageStyles);
router.get('/sizes', imageController.getImageSizes);

module.exports = router;


