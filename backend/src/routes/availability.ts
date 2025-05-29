import { Router } from 'express';
import { AvailabilityController } from '../controllers/AvailabilityController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();
const availabilityController = new AvailabilityController();

/**
 * @swagger
 * /api/availability:
 *   get:
 *     summary: Get availability for the authenticated professional
 *     tags: [Availability]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of availabilities for the professional
 */
router.get(
  '/',
  authenticate,
  authorize(UserRole.PROFESSIONAL),
  availabilityController.getProfessionalAvailability
);

/**
 * @swagger
 * /api/availability/professional/{professionalId}:
 *   get:
 *     summary: Get availability for a specific professional
 *     tags: [Availability]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: professionalId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of availabilities for the professional
 */
router.get(
  '/professional/:professionalId',
  authenticate,
  availabilityController.getProfessionalAvailability
);

/**
 * @swagger
 * /api/availability/professionals/available:
 *   get:
 *     summary: Get professionals with availability in a specific time frame
 *     tags: [Availability]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timeFrame
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *         description: Time frame to check availability (day, week, month)
 *       - in: query
 *         name: specialty
 *         schema:
 *           type: string
 *         description: Filter by professional specialty
 *     responses:
 *       200:
 *         description: List of professionals with availability in the specified time frame
 */
router.get(
  '/professionals/available',
  authenticate,
  availabilityController.getProfessionalsWithAvailability
);

/**
 * @swagger
 * /api/availability/professional/{professionalId}/day/{dayOfWeek}:
 *   get:
 *     summary: Get available time slots for a specific professional and day
 *     tags: [Availability]
 *     parameters:
 *       - in: path
 *         name: professionalId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: dayOfWeek
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of available time slots
 */
router.get(
  '/professional/:professionalId/day/:dayOfWeek',
  availabilityController.getAvailableTimeSlots
);

/**
 * @swagger
 * /api/availability/professional/{professionalId}/days:
 *   get:
 *     summary: Get available days of the week for a specific professional
 *     tags: [Availability]
 *     parameters:
 *       - in: path
 *         name: professionalId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of available days (0-6, Sunday to Saturday)
 */
router.get(
  '/professional/:professionalId/days',
  availabilityController.getAvailableDaysForProfessional
);

/**
 * @swagger
 * /api/availability:
 *   post:
 *     summary: Create a new availability
 *     tags: [Availability]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dayOfWeek
 *               - startTime
 *               - endTime
 *             properties:
 *               dayOfWeek:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 6
 *               startTime:
 *                 type: string
 *                 format: time
 *               endTime:
 *                 type: string
 *                 format: time
 *               isAvailable:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Availability created successfully
 *       400:
 *         description: Invalid input data
 */
router.post(
  '/',
  authenticate,
  authorize(UserRole.PROFESSIONAL),
  availabilityController.createAvailability
);

/**
 * @swagger
 * /api/availability/{id}:
 *   put:
 *     summary: Update an availability
 *     tags: [Availability]
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
 *               dayOfWeek:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 6
 *               startTime:
 *                 type: string
 *                 format: time
 *               endTime:
 *                 type: string
 *                 format: time
 *               isAvailable:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Availability updated successfully
 *       404:
 *         description: Availability not found
 */
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.PROFESSIONAL),
  availabilityController.updateAvailability
);

/**
 * @swagger
 * /api/availability/{id}:
 *   delete:
 *     summary: Delete an availability
 *     tags: [Availability]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Availability deleted successfully
 *       404:
 *         description: Availability not found
 */
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.PROFESSIONAL),
  availabilityController.deleteAvailability
);

export default router; 