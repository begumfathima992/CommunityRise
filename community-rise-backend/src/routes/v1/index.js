import { Router } from 'express';
import { health } from '../../controllers/health.controller.js';
import asyncHandler from '../../utils/asyncHandler.js';
import authRoutes from './auth.routes.js';
import userRoutes from './users.routes.js';
import tutorApplicationRoutes from './tutorApplications.routes.js';

const router = Router();

router.get('/health', asyncHandler(health));
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/tutor-applications', tutorApplicationRoutes);

export default router;
