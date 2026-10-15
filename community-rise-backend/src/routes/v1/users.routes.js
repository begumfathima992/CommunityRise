import { Router } from 'express';
import * as users from '../../controllers/users.controller.js';
import requireAuth from '../../middlewares/requireAuth.js';
import validate from '../../middlewares/validate.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { preferencesSchema } from '../../validators/users.validators.js';

const router = Router();

router.patch('/me/preferences', requireAuth, validate(preferencesSchema), asyncHandler(users.updatePreferences));

export default router;
