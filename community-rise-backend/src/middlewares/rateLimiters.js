import rateLimit from 'express-rate-limit';
import env from '../config/env.js';

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

function limiter({ windowMs, limit, message }) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    // Integration tests make many requests from one IP.
    skip: () => env.isTest,
    handler: (req, res, next, options) => {
      res.status(options.statusCode).json({ success: false, message });
    },
  });
}

export const apiLimiter = limiter({
  windowMs: FIFTEEN_MINUTES,
  limit: 100,
  message: 'Too many requests. Please try again later.',
});

export const loginLimiter = limiter({
  windowMs: FIFTEEN_MINUTES,
  limit: 10,
  message: 'Too many login attempts. Please try again in 15 minutes.',
});

export const registerLimiter = limiter({
  windowMs: FIFTEEN_MINUTES,
  limit: 10,
  message: 'Too many sign-up attempts. Please try again in 15 minutes.',
});

export const forgotPasswordLimiter = limiter({
  windowMs: ONE_HOUR,
  limit: 5,
  message: 'Too many password reset requests. Please try again later.',
});

export const resendVerificationLimiter = limiter({
  windowMs: ONE_HOUR,
  limit: 5,
  message: 'Too many verification email requests. Please try again later.',
});

export const tutorApplicationLimiter = limiter({
  windowMs: ONE_HOUR,
  limit: 5,
  message: 'Too many applications from your connection. Please try again later.',
});

// Contact form: 5 submissions per IP every 15 minutes. Keeps the response
// shape ({ error }) that the existing frontend reads.
export const contactLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: () => env.isTest,
  message: {
    success: false,
    message: 'Too many messages sent. Please try again later.',
    error: 'Too many messages sent. Please try again later.',
  },
});
