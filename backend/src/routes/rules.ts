import { Router } from 'express';
import { RuleController } from '../controllers/RuleController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';
import asyncHandler from 'express-async-handler';

const router = Router();
const ruleController = new RuleController();

/**
 * @swagger
 * /api/rules:
 *   get:
 *     summary: Get all rules
 *     tags: [Rules]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/',
  authenticate,
  asyncHandler(ruleController.getAllRules)
);

/**
 * @swagger
 * /api/rules:
 *   post:
 *     summary: Create new rule (superadmin only)
 *     tags: [Rules]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ruleName
 *               - ruleValue
 *             properties:
 *               ruleName:
 *                 type: string
 *               ruleValue:
 *                 type: object
 */
router.post(
  '/',
  authenticate,
  authorize(UserRole.SUPERADMIN),
  asyncHandler(ruleController.createRule)
);

/**
 * @swagger
 * /api/rules/{id}:
 *   put:
 *     summary: Update rule (superadmin only)
 *     tags: [Rules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ruleName:
 *                 type: string
 *               ruleValue:
 *                 type: object
 */
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.SUPERADMIN),
  asyncHandler(ruleController.updateRule)
);

/**
 * @swagger
 * /api/rules/{id}:
 *   delete:
 *     summary: Delete rule (superadmin only)
 *     tags: [Rules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.SUPERADMIN),
  asyncHandler(ruleController.deleteRule)
);

export default router;
