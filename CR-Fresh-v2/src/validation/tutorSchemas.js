import { z } from 'zod';
import { AVAILABILITY, DBS_STATUS, DELIVERY, LEARNER_GROUPS, SUBJECTS } from '../data/tutoring';
import { email } from './authSchemas';

/** Mirrors community-rise-backend/src/validators/tutorApplications.validators.js */

const values = (options) => options.map((option) => option.value);

const multiChoice = (options, message) =>
  z.array(z.enum(values(options)), { error: message }).min(1, message);

export const tutorApplicationSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(1, 'Full name is required')
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be at most 100 characters')
    .regex(/^[\p{L}\p{M}' ’-]+$/u, 'Full name may only contain letters, spaces, hyphens and apostrophes'),
  email,
  phone: z
    .string()
    .trim()
    .min(1, 'Phone number is required')
    .regex(/^\+?[0-9 ()-]{10,20}$/, 'Enter a valid phone number')
    .refine((value) => {
      const digits = value.replace(/\D/g, '').length;
      return digits >= 10 && digits <= 15;
    }, 'Enter a valid phone number'),
  subjects: multiChoice(SUBJECTS, 'Choose at least one subject'),
  learner_groups: multiChoice(LEARNER_GROUPS, 'Choose at least one group of learners'),
  availability: multiChoice(AVAILABILITY, 'Choose at least one time you are available'),
  delivery: z.enum(values(DELIVERY), { error: 'Choose how you would like to teach' }),
  experience: z
    .string()
    .trim()
    .min(20, 'Please write at least 20 characters about your experience')
    .max(2000, 'Please keep this under 2000 characters'),
  dbs_status: z.enum(values(DBS_STATUS), { error: 'Tell us about your DBS check' }),
  agree_to_checks: z.literal(true, { error: 'You must agree to the safeguarding checks to volunteer as a tutor' }),
  consent: z.literal(true, { error: 'You must agree to the privacy policy to apply' }),
  website: z.string().optional(),
});
