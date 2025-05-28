import { Router } from 'express';
import appointmentRoutes from './appointments';
import authRoutes from './auth';
import userRoutes from './users';
import ruleRoutes from './rules';

const router = Router();

router.use('/auth', authRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/users', userRoutes);
router.use('/rules', ruleRoutes);

export default router; 