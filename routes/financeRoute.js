const express = require('express');
const financeController = require('../controllers/financeController');
const { validate } = require('../utils/validateIntent');
const { authenticateToken } = require('../utils/auth');
const devAuth = require('../utils/devAuth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Finance Management
 *   description: Personal finance tracking and analysis
 */

// All routes require authentication (bypassed in development)
router.use(devAuth);

/**
 * @swagger
 * /api/finance/record:
 *   post:
 *     summary: Create a new finance record
 *     tags: [Finance Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category
 *               - amount
 *               - type
 *             properties:
 *               category:
 *                 type: string
 *                 description: Finance category
 *                 example: "Food & Dining"
 *               amount:
 *                 type: number
 *                 format: float
 *                 description: Transaction amount
 *                 example: 50.00
 *               note:
 *                 type: string
 *                 description: Transaction note
 *                 example: "Lunch at restaurant"
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *                 description: Transaction type
 *                 example: "expense"
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Transaction date
 *                 example: "2024-01-01T00:00:00.000Z"
 *     responses:
 *       201:
 *         description: Finance record created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/FinanceRecord'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/record', validate(require('../utils/validateIntent').financeRecordSchema), financeController.createFinanceRecord);

/**
 * @swagger
 * /api/finance/records:
 *   get:
 *     summary: Get finance records
 *     tags: [Finance Management]
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
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Category filter
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *         description: Transaction type filter
 *     responses:
 *       200:
 *         description: Finance records retrieved successfully
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
 *                         $ref: '#/components/schemas/FinanceRecord'
 *                     total:
 *                       type: integer
 *                       description: Total number of records
 *                     limit:
 *                       type: integer
 *                     offset:
 *                       type: integer
 */
router.get('/records', financeController.getFinanceRecords);

/**
 * @swagger
 * /api/finance/records/{recordId}:
 *   get:
 *     summary: Get specific finance record
 *     tags: [Finance Management]
 *     parameters:
 *       - in: path
 *         name: recordId
 *         required: true
 *         schema:
 *           type: string
 *         description: Finance record ID
 *     responses:
 *       200:
 *         description: Finance record retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/FinanceRecord'
 *       404:
 *         description: Finance record not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/records/:recordId', financeController.getFinanceRecord);

/**
 * @swagger
 * /api/finance/records/{recordId}:
 *   put:
 *     summary: Update finance record
 *     tags: [Finance Management]
 *     parameters:
 *       - in: path
 *         name: recordId
 *         required: true
 *         schema:
 *           type: string
 *         description: Finance record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *               amount:
 *                 type: number
 *                 format: float
 *               note:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *               date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Finance record updated successfully
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
 *                   example: Finance record updated successfully
 *       404:
 *         description: Finance record not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/records/:recordId', financeController.updateFinanceRecord);

/**
 * @swagger
 * /api/finance/records/{recordId}:
 *   delete:
 *     summary: Delete finance record
 *     tags: [Finance Management]
 *     parameters:
 *       - in: path
 *         name: recordId
 *         required: true
 *         schema:
 *           type: string
 *         description: Finance record ID
 *     responses:
 *       200:
 *         description: Finance record deleted successfully
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
 *                   example: Finance record deleted successfully
 *       404:
 *         description: Finance record not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/records/:recordId', financeController.deleteFinanceRecord);

/**
 * @swagger
 * /api/finance/stats:
 *   get:
 *     summary: Get finance statistics
 *     tags: [Finance Management]
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 1y]
 *           default: 30d
 *         description: Statistics period
 *     responses:
 *       200:
 *         description: Finance statistics retrieved successfully
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
 *                         totalIncome:
 *                           type: number
 *                         totalExpenses:
 *                           type: number
 *                         netAmount:
 *                           type: number
 *                         categoryBreakdown:
 *                           type: object
 *                         monthlyBreakdown:
 *                           type: object
 *                         topCategories:
 *                           type: array
 *                         averageTransaction:
 *                           type: number
 *                     records:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/FinanceRecord'
 */
router.get('/stats', financeController.getFinanceStats);

/**
 * @swagger
 * /api/finance/insights:
 *   get:
 *     summary: Get AI-powered finance insights
 *     tags: [Finance Management]
 *     responses:
 *       200:
 *         description: Finance insights retrieved successfully
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
 *                     insights:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                           message:
 *                             type: string
 *                           confidence:
 *                             type: number
 *                     recommendations:
 *                       type: array
 *                       items:
 *                         type: string
 */
router.get('/insights', financeController.getFinanceInsights);

/**
 * @swagger
 * /api/finance/category/{category}/insights:
 *   get:
 *     summary: Get category-specific insights
 *     tags: [Finance Management]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: Finance category
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d]
 *           default: 30d
 *         description: Analysis period
 *     responses:
 *       200:
 *         description: Category insights retrieved successfully
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
 *                     category:
 *                       type: string
 *                     period:
 *                       type: string
 *                     totalAmount:
 *                       type: number
 *                     averageAmount:
 *                       type: number
 *                     transactionCount:
 *                       type: integer
 *                     records:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/FinanceRecord'
 */
router.get('/category/:category/insights', financeController.getCategoryInsights);

module.exports = router;


