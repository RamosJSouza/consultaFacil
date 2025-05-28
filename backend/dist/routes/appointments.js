"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AppointmentController_1 = require("../controllers/AppointmentController");
const auth_1 = require("../middleware/auth");
const types_1 = require("../types");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const router = (0, express_1.Router)();
const appointmentController = new AppointmentController_1.AppointmentController();
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
router.post('/', auth_1.authenticate, (0, auth_1.authorize)(types_1.UserRole.CLIENT), (0, express_async_handler_1.default)(appointmentController.createAppointment));
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
router.get('/', auth_1.authenticate, (0, express_async_handler_1.default)(appointmentController.getUserAppointments));
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
router.patch('/:id/status', auth_1.authenticate, (0, express_async_handler_1.default)(appointmentController.updateAppointmentStatus));
// Get all appointments (superadmin only)
router.get('/all', auth_1.authenticate, (0, auth_1.authorize)(types_1.UserRole.SUPERADMIN), appointmentController.getAllAppointments);
// Get appointment by id
router.get('/:id', auth_1.authenticate, appointmentController.getAppointmentById);
// Update appointment
router.put('/:id', auth_1.authenticate, appointmentController.updateAppointment);
// Cancel appointment
router.patch('/:id/cancel', auth_1.authenticate, appointmentController.cancelAppointment);
// Confirm appointment (professional only)
router.patch('/:id/confirm', auth_1.authenticate, (0, auth_1.authorize)(types_1.UserRole.PROFESSIONAL), appointmentController.confirmAppointment);
exports.default = router;
