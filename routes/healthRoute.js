const express = require('express');
const healthController = require('../controllers/healthController');
const { validate } = require('../utils/validateIntent');
const { authenticateToken } = require('../utils/auth');
const devAuth = require('../utils/devAuth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Health Management
 *   description: Health records and analysis management
 */

// All routes require authentication (bypassed in development)
router.use(devAuth);

/**
 * @swagger
 * /api/health/analyze:
 *   post:
 *     summary: Analyze health data
 *     tags: [Health Management]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               weight:
 *                 type: number
 *                 format: float
 *                 description: Weight in kg
 *               height:
 *                 type: number
 *                 format: float
 *                 description: Height in cm
 *               calories:
 *                 type: integer
 *                 description: Daily calories consumed
 *               sleep:
 *                 type: integer
 *                 description: Sleep hours
 *               exercise:
 *                 type: string
 *                 description: Exercise description
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Record date
 *     responses:
 *       200:
 *         description: Health analysis completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/HealthRecord'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/analyze', validate(require('../utils/validateIntent').healthAnalysisSchema), healthController.analyzeHealth);

/**
 * @swagger
 * /api/health/analyze-image:
 *   post:
 *     summary: Analyze food image
 *     tags: [Health Management]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Food image file
 *     responses:
 *       200:
 *         description: Food analysis completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     foodName:
 *                       type: string
 *                       description: Detected food name
 *                     calories:
 *                       type: integer
 *                       description: Estimated calories
 *                     nutrition:
 *                       type: object
 *                       description: Nutrition information
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/analyze-image', healthController.analyzeFoodImage);

/**
 * @swagger
 * /api/health/records:
 *   get:
 *     summary: Get health records
 *     tags: [Health Management]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of records to skip
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date filter
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date filter
 *     responses:
 *       200:
 *         description: Health records retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     records:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/HealthRecord'
 *                     total:
 *                       type: integer
 *                       description: Total number of records
 *                     limit:
 *                       type: integer
 *                     offset:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/records', healthController.getHealthRecords);

/**
 * @swagger
 * /api/health/records/{recordId}:
 *   get:
 *     summary: Get specific health record
 *     tags: [Health Management]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: recordId
 *         required: true
 *         schema:
 *           type: string
 *         description: Health record ID
 *     responses:
 *       200:
 *         description: Health record retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/HealthRecord'
 *       404:
 *         description: Health record not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/records/:recordId', healthController.getHealthRecord);

/**
 * @swagger
 * /api/health/records/{recordId}:
 *   put:
 *     summary: Update health record
 *     tags: [Health Management]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: recordId
 *         required: true
 *         schema:
 *           type: string
 *         description: Health record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               weight:
 *                 type: number
 *                 format: float
 *               height:
 *                 type: number
 *                 format: float
 *               calories:
 *                 type: integer
 *               sleep:
 *                 type: integer
 *               exercise:
 *                 type: string
 *               advice:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Health record updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Health record updated successfully
 *       404:
 *         description: Health record not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/records/:recordId', healthController.updateHealthRecord);

/**
 * @swagger
 * /api/health/records/{recordId}:
 *   delete:
 *     summary: Delete health record
 *     tags: [Health Management]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: recordId
 *         required: true
 *         schema:
 *           type: string
 *         description: Health record ID
 *     responses:
 *       200:
 *         description: Health record deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Health record deleted successfully
 *       404:
 *         description: Health record not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/records/:recordId', healthController.deleteHealthRecord);

/**
 * @swagger
 * /api/health/stats:
 *   get:
 *     summary: Get health statistics
 *     tags: [Health Management]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d]
 *           default: 30d
 *         description: Statistics period
 *     responses:
 *       200:
 *         description: Health statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     period:
 *                       type: string
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalRecords:
 *                           type: integer
 *                         averageWeight:
 *                           type: number
 *                         averageCalories:
 *                           type: number
 *                         averageSleep:
 *                           type: number
 *                         weightTrend:
 *                           type: string
 *                           enum: [increasing, decreasing, stable]
 *                         calorieTrend:
 *                           type: string
 *                           enum: [increasing, decreasing, stable]
 *                         sleepTrend:
 *                           type: string
 *                           enum: [increasing, decreasing, stable]
 *                     records:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/HealthRecord'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/stats', healthController.getHealthStats);

module.exports = router;


