import { Router } from 'express';
import appointmentRoutes from './appointments';
import authRoutes from './auth';
import userRoutes from './users';
import ruleRoutes from './rules';
import notificationRoutes from './notifications';
import availabilityRoutes from './availability';

const router = Router();

router.use('/auth', authRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/users', userRoutes);
router.use('/rules', ruleRoutes);
router.use('/notifications', notificationRoutes);
router.use('/availability', availabilityRoutes);

export default router; 