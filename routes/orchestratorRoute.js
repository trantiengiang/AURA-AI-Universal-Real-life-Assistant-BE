const express = require('express');
const { controller: orchestratorController, upload } = require('../controllers/orchestratorController');
const { validate } = require('../utils/validateIntent');
const { optionalAuth } = require('../utils/auth');

const router = express.Router();

// Orchestrator routes (optional auth for public access)
router.post('/process', validate(require('../utils/validateIntent').orchestratorSchema), optionalAuth, orchestratorController.processComplexRequest);
router.post('/multimodal', upload, optionalAuth, orchestratorController.processMultiModalRequest);

// Orchestrator utilities
router.get('/capabilities', orchestratorController.getOrchestratorCapabilities);
router.get('/status', orchestratorController.getOrchestratorStatus);
router.post('/test', optionalAuth, orchestratorController.testOrchestrator);

module.exports = router;


