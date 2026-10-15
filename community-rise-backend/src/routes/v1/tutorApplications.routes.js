import { Router } from 'express';
import * as applications from '../../controllers/tutorApplications.controller.js';
import optionalAuth from '../../middlewares/optionalAuth.js';
import { tutorApplicationLimiter } from '../../middlewares/rateLimiters.js';
import requireAuth from '../../middlewares/requireAuth.js';
import requireRole from '../../middlewares/requireRole.js';
import validate from '../../middlewares/validate.js';
import asyncHandler from '../../utils/asyncHandler.js';
import {
  applicationIdParamsSchema,
  listApplicationsQuerySchema,
  tutorApplicationSchema,
  updateApplicationSchema,
} from '../../validators/tutorApplications.validators.js';

const router = Router();

router.post(
  '/',
  tutorApplicationLimiter,
  optionalAuth,
  validate(tutorApplicationSchema),
  asyncHandler(applications.submit),
);

router.get(
  '/',
  requireAuth,
  requireRole('admin'),
  validate(listApplicationsQuerySchema, 'query'),
  asyncHandler(applications.list),
);

router.patch(
  '/:id',
  requireAuth,
  requireRole('admin'),
  validate(applicationIdParamsSchema, 'params'),
  validate(updateApplicationSchema),
  asyncHandler(applications.update),
);

export default router;
