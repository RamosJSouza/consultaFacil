import { Router } from 'express';
import { LinkController } from '../controllers/LinkController';
import { authenticate } from '../middleware/auth';

const router = Router();
const linkController = new LinkController();

/**
 * @swagger
 * /api/links/client:
 *   get:
 *     summary: Get all professional links for the authenticated client
 *     tags: [Links]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of linked professionals for the client
 */
router.get(
  '/client',
  authenticate,
  linkController.getClientLinks
);

/**
 * @swagger
 * /api/links/professional:
 *   get:
 *     summary: Get all client links for the authenticated professional
 *     tags: [Links]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of linked clients for the professional
 */
router.get(
  '/professional',
  authenticate,
  linkController.getProfessionalLinks
);

/**
 * @swagger
 * /api/links:
 *   post:
 *     summary: Create a new link between client and professional
 *     tags: [Links]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clientId
 *               - professionalId
 *             properties:
 *               clientId:
 *                 type: integer
 *               professionalId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Link created successfully
 *       200:
 *         description: Link already exists
 *       400:
 *         description: Invalid input data
 */
router.post(
  '/',
  authenticate,
  linkController.createLink
);

/**
 * @swagger
 * /api/links:
 *   delete:
 *     summary: Delete a link between client and professional
 *     tags: [Links]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clientId
 *               - professionalId
 *             properties:
 *               clientId:
 *                 type: integer
 *               professionalId:
 *                 type: integer
 *     responses:
 *       204:
 *         description: Link deleted successfully
 *       404:
 *         description: Link not found
 */
router.delete(
  '/',
  authenticate,
  linkController.deleteLink
);

export default router; 