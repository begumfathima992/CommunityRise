import { z } from 'zod';
import {
  APPLICATION_STATUSES,
  AVAILABILITY,
  DBS_STATUS,
  DELIVERY,
  LEARNER_GROUPS,
  TUTOR_SUBJECTS,
} from '../config/tutoring.js';
import { email } from './auth.validators.js';

const keys = (map) => Object.keys(map);

const multiChoice = (map, label) =>
  z
    .array(z.enum(keys(map), { error: `Choose valid ${label}` }), { error: `Choose at least one ${label}` })
    .min(1, `Choose at least one ${label}`)
    .max(keys(map).length)
    .transform((values) => [...new Set(values)]);

export const tutorApplicationSchema = z.strictObject({
  full_name: z
    .string({ error: 'Full name is required' })
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be at most 100 characters')
    .regex(/^[\p{L}\p{M}' ’-]+$/u, 'Full name may only contain letters, spaces, hyphens and apostrophes'),
  email,
  phone: z
    .string({ error: 'Phone number is required' })
    .trim()
    .regex(/^\+?[0-9 ()-]{10,20}$/, 'Enter a valid phone number')
    .refine((value) => {
      const digits = value.replace(/\D/g, '').length;
      return digits >= 10 && digits <= 15;
    }, 'Enter a valid phone number'),
  subjects: multiChoice(TUTOR_SUBJECTS, 'subject'),
  learner_groups: multiChoice(LEARNER_GROUPS, 'group of learners'),
  availability: multiChoice(AVAILABILITY, 'time you are available'),
  delivery: z.enum(keys(DELIVERY), { error: 'Choose how you would like to teach' }),
  experience: z
    .string({ error: 'Tell us a little about your experience' })
    .trim()
    .min(20, 'Please write at least 20 characters about your experience')
    .max(2000, 'Please keep this under 2000 characters'),
  dbs_status: z.enum(keys(DBS_STATUS), { error: 'Tell us about your DBS check' }),
  agree_to_checks: z.literal(true, { error: 'You must agree to the safeguarding checks to volunteer as a tutor' }),
  consent: z.literal(true, { error: 'You must agree to the privacy policy to apply' }),
  // Honeypot: a hidden field people never see. Bots fill it in; the
  // service then pretends to accept the application without storing it.
  website: z.string().max(500).optional(),
});

export const listApplicationsQuerySchema = z.strictObject({
  status: z.enum(APPLICATION_STATUSES).optional(),
});

export const applicationIdParamsSchema = z.strictObject({
  id: z.uuid('Invalid application id'),
});

export const updateApplicationSchema = z
  .strictObject({
    status: z.enum(APPLICATION_STATUSES, { error: `Status must be one of: ${APPLICATION_STATUSES.join(', ')}` }).optional(),
    admin_notes: z.string().trim().max(2000, 'Notes must be at most 2000 characters').nullable().optional(),
  })
  .refine((data) => data.status !== undefined || data.admin_notes !== undefined, {
    message: 'Nothing to update',
    path: ['status'],
  });
