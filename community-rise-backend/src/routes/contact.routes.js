import express, { Router } from 'express';
import { submitContact } from '../controllers/contact.controller.js';
import { contactLimiter } from '../middlewares/rateLimiters.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();

// The contact message may be up to 5000 characters of non-ASCII text,
// so this route keeps its original 20kb body limit.
router.post('/', express.json({ limit: '20kb' }), contactLimiter, asyncHandler(submitContact));

export default router;
