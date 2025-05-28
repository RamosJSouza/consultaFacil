import { Router } from 'express';
import { AppointmentController } from '../controllers/AppointmentController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';
import asyncHandler from 'express-async-handler';

const router = Router();
const appointmentController = new AppointmentController();

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Create a new appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - date
 *               - startTime
 *               - endTime
 *               - professionalId
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               startTime:
 *                 type: string
 *                 format: time
 *               endTime:
 *                 type: string
 *                 format: time
 *               professionalId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *       400:
 *         description: Invalid input data
 */
router.post('/', authenticate, authorize(UserRole.CLIENT), asyncHandler(appointmentController.createAppointment));

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     summary: Get all appointments for the user
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of appointments
 */
router.get('/', authenticate, asyncHandler(appointmentController.getUserAppointments));

/**
 * @swagger
 * /api/appointments/{id}/status:
 *   patch:
 *     summary: Update appointment status
 *     tags: [Appointments]
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
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, cancelled]
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       404:
 *         description: Appointment not found
 */
router.patch('/:id/status', authenticate, asyncHandler(appointmentController.updateAppointmentStatus));

// Get all appointments (superadmin only)
router.get(
  '/all',
  authenticate,
  authorize(UserRole.SUPERADMIN),
  appointmentController.getAllAppointments
);

// Get appointment by id
router.get(
  '/:id',
  authenticate,
  appointmentController.getAppointmentById
);

// Update appointment
router.put(
  '/:id',
  authenticate,
  appointmentController.updateAppointment
);

// Cancel appointment
router.patch(
  '/:id/cancel',
  authenticate,
  appointmentController.cancelAppointment
);

// Confirm appointment (professional only)
router.patch(
  '/:id/confirm',
  authenticate,
  authorize(UserRole.PROFESSIONAL),
  appointmentController.confirmAppointment
);

export default router;
