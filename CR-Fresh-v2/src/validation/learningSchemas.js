import { z } from 'zod';
import { CHILD_AGE_GROUPS, COURSES, LEARNER_OPTIONS, MODE_OPTIONS } from '../data/freeLearning';
import { email } from './authSchemas';

const values = (options) => options.map((option) => option.value);

export const placeRequestSchema = z
  .object({
    full_name: z
      .string()
      .trim()
      .min(1, 'Your name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be at most 100 characters'),
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
    course: z.enum(values(COURSES), { error: 'Please choose a course' }),
    learner: z.enum(values(LEARNER_OPTIONS), { error: 'Tell us who the place is for' }),
    child_age: z.string().optional(),
    mode: z.enum(values(MODE_OPTIONS), { error: 'Choose online, in person or either' }),
    availability: z.string().trim().max(300, 'Please keep this under 300 characters').optional(),
    notes: z.string().trim().max(1500, 'Please keep this under 1500 characters').optional(),
    consent: z.literal(true, { error: 'You must agree to the privacy policy to request a place' }),
  })
  .refine((data) => data.learner !== 'child' || values(CHILD_AGE_GROUPS).includes(data.child_age), {
    path: ['child_age'],
    message: "Choose your child's age group",
    when: ({ value }) => value?.learner === 'child',
  });
