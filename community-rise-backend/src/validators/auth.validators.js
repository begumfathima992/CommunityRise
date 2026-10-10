import { z } from 'zod';
import { SIGNUP_REASONS } from '../models/user.model.js';
import { passwordContainsEmail } from '../utils/password.js';

const PASSWORD_CONTAINS_EMAIL = 'Password must not contain your email address';
const PASSWORDS_DO_NOT_MATCH = 'Passwords do not match';

const fullName = z
  .string({ error: 'Full name is required' })
  .trim()
  .min(2, 'Full name must be at least 2 characters')
  .max(100, 'Full name must be at most 100 characters')
  .regex(/^[\p{L}\p{M}' ’-]+$/u, 'Full name may only contain letters, spaces, hyphens and apostrophes');

export const email = z
  .string({ error: 'Email is required' })
  .trim()
  .toLowerCase()
  .max(255, 'Email must be at most 255 characters')
  .pipe(z.email('Enter a valid email address'));

export const password = z
  .string({ error: 'Password is required' })
  .min(10, 'Password must be at least 10 characters')
  .max(128, 'Password must be at most 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

const token = z
  .string({ error: 'Token is required' })
  .trim()
  .min(1, 'Token is required')
  .max(256, 'Token is invalid');

const confirmPassword = z.string({ error: 'Please confirm your password' });

export const registerSchema = z
  .strictObject({
    full_name: fullName,
    email,
    signup_reason: z.enum(SIGNUP_REASONS, {
      error: `Signup reason must be one of: ${SIGNUP_REASONS.join(', ')}`,
    }),
    password,
    confirm_password: confirmPassword,
    consent: z.literal(true, { error: 'You must agree to the terms to create an account' }),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirm_password) {
      ctx.addIssue({ code: 'custom', path: ['confirm_password'], message: PASSWORDS_DO_NOT_MATCH });
    }
    if (passwordContainsEmail(data.password, data.email)) {
      ctx.addIssue({ code: 'custom', path: ['password'], message: PASSWORD_CONTAINS_EMAIL });
    }
  });

export const loginSchema = z.strictObject({
  email,
  // Policy is not re-checked at login; only presence and a sane upper bound.
  password: z
    .string({ error: 'Password is required' })
    .min(1, 'Password is required')
    .max(128, 'Invalid email or password'),
});

export const emptyBodySchema = z.strictObject({});

export const emailOnlySchema = z.strictObject({ email });

export const verifyEmailQuerySchema = z.strictObject({ token });

export const resetPasswordSchema = z
  .strictObject({ token, password, confirm_password: confirmPassword })
  .refine((data) => data.password === data.confirm_password, {
    path: ['confirm_password'],
    message: PASSWORDS_DO_NOT_MATCH,
  });

export const changePasswordSchema = z
  .strictObject({
    current_password: z
      .string({ error: 'Current password is required' })
      .min(1, 'Current password is required')
      .max(128, 'Current password is incorrect'),
    new_password: password,
    confirm_password: confirmPassword,
  })
  .refine((data) => data.new_password === data.confirm_password, {
    path: ['confirm_password'],
    message: PASSWORDS_DO_NOT_MATCH,
  });
