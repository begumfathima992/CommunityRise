import { Router } from 'express';
import { health } from '../../controllers/health.controller.js';
import asyncHandler from '../../utils/asyncHandler.js';
import authRoutes from './auth.routes.js';

const router = Router();

router.get('/health', asyncHandler(health));
router.use('/auth', authRoutes);

export default router;
