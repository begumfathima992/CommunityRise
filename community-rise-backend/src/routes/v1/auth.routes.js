import { Router } from 'express';
import * as auth from '../../controllers/auth.controller.js';
import {
  forgotPasswordLimiter,
  loginLimiter,
  registerLimiter,
  resendVerificationLimiter,
} from '../../middlewares/rateLimiters.js';
import requireAuth from '../../middlewares/requireAuth.js';
import validate from '../../middlewares/validate.js';
import asyncHandler from '../../utils/asyncHandler.js';
import {
  changePasswordSchema,
  emailOnlySchema,
  emptyBodySchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailQuerySchema,
} from '../../validators/auth.validators.js';

const router = Router();

router.post('/register', registerLimiter, validate(registerSchema), asyncHandler(auth.register));
router.post('/login', loginLimiter, validate(loginSchema), asyncHandler(auth.login));
router.post('/refresh', validate(emptyBodySchema), asyncHandler(auth.refresh));
router.post('/logout', validate(emptyBodySchema), asyncHandler(auth.logout));
router.post('/logout-all', requireAuth, validate(emptyBodySchema), asyncHandler(auth.logoutAll));
router.get('/me', requireAuth, auth.me);
router.get('/verify-email', validate(verifyEmailQuerySchema, 'query'), asyncHandler(auth.verifyEmail));
router.post(
  '/resend-verification',
  resendVerificationLimiter,
  validate(emailOnlySchema),
  asyncHandler(auth.resendVerification),
);
router.post(
  '/forgot-password',
  forgotPasswordLimiter,
  validate(emailOnlySchema),
  asyncHandler(auth.forgotPassword),
);
router.post('/reset-password', validate(resetPasswordSchema), asyncHandler(auth.resetPassword));
router.patch('/change-password', requireAuth, validate(changePasswordSchema), asyncHandler(auth.changePassword));

export default router;
