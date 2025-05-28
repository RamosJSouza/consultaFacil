import { Router } from 'express';
import appointmentRoutes from './appointments';
import authRoutes from './auth';
import userRoutes from './users';
import ruleRoutes from './rules';
import notificationRoutes from './notifications';

const router = Router();

router.use('/auth', authRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/users', userRoutes);
router.use('/rules', ruleRoutes);
router.use('/notifications', notificationRoutes);

export default router; 