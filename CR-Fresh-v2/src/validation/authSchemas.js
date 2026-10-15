import { z } from 'zod';

/**
 * Mirrors community-rise-backend/src/validators/auth.validators.js so
 * users see the same rules before submitting. The backend remains the
 * source of truth and its 422 field errors are mapped onto these fields.
 */

export const SIGNUP_REASONS = [
  { value: 'learner', label: 'Learner' },
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'funder', label: 'Funder / Donor' },
  { value: 'partner', label: 'Partner organisation' },
  { value: 'other', label: 'Other' },
];

export const signupReasonLabel = (value) =>
  SIGNUP_REASONS.find((reason) => reason.value === value)?.label ?? value;

export const passwordContainsEmail = (password, email) =>
  Boolean(email) && Boolean(password) && password.toLowerCase().includes(email.trim().toLowerCase());

/** Rules shown in the password strength checklist. */
export const PASSWORD_RULES = [
  { id: 'length', label: '10 to 128 characters', test: (pw) => pw.length >= 10 && pw.length <= 128 },
  { id: 'upper', label: 'An uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
  { id: 'lower', label: 'A lowercase letter', test: (pw) => /[a-z]/.test(pw) },
  { id: 'number', label: 'A number', test: (pw) => /[0-9]/.test(pw) },
  {
    id: 'email',
    label: 'Does not contain your email address',
    test: (pw, email) => pw.length > 0 && !passwordContainsEmail(pw, email),
  },
];

const PASSWORD_CONTAINS_EMAIL = 'Password must not contain your email address';
const PASSWORDS_DO_NOT_MATCH = 'Passwords do not match';

const fullName = z
  .string()
  .trim()
  .min(1, 'Full name is required')
  .min(2, 'Full name must be at least 2 characters')
  .max(100, 'Full name must be at most 100 characters')
  .regex(/^[\p{L}\p{M}' ’-]+$/u, 'Full name may only contain letters, spaces, hyphens and apostrophes');

export const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Email is required')
  .max(255, 'Email must be at most 255 characters')
  .pipe(z.email('Enter a valid email address'));

export const password = z
  .string()
  .min(1, 'Password is required')
  .min(10, 'Password must be at least 10 characters')
  .max(128, 'Password must be at most 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

const confirmPassword = z.string().min(1, 'Please confirm your password');

// Cross-field checks normally run only once every field is valid; `when`
// makes them run as soon as the fields they compare are present, so
// users see e.g. "Passwords do not match" alongside other errors.
const hasStrings =
  (...keys) =>
  ({ value }) =>
    keys.every((key) => typeof value?.[key] === 'string' && value[key].length > 0);

const passwordsMatch = (passwordKey) => [
  (data) => data[passwordKey] === data.confirm_password,
  { path: ['confirm_password'], message: PASSWORDS_DO_NOT_MATCH, when: hasStrings(passwordKey, 'confirm_password') },
];

export const registerSchema = z
  .object({
    full_name: fullName,
    email,
    signup_reason: z.enum(
      SIGNUP_REASONS.map((reason) => reason.value),
      { error: 'Please tell us why you are joining' },
    ),
    password,
    confirm_password: confirmPassword,
    consent: z.literal(true, { error: 'You must agree to the privacy policy to create an account' }),
    teaching_updates: z.boolean(),
  })
  .refine(...passwordsMatch('password'))
  .refine((data) => !passwordContainsEmail(data.password, data.email), {
    path: ['password'],
    message: PASSWORD_CONTAINS_EMAIL,
    when: hasStrings('password', 'email'),
  });

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required').max(128, 'Password must be at most 128 characters'),
});

export const emailOnlySchema = z.object({ email });

export const resetPasswordSchema = z
  .object({ password, confirm_password: confirmPassword })
  .refine(...passwordsMatch('password'));

export function changePasswordSchema(userEmail) {
  return z
    .object({
      current_password: z.string().min(1, 'Current password is required').max(128, 'Current password is incorrect'),
      new_password: password,
      confirm_password: confirmPassword,
    })
    .refine(...passwordsMatch('new_password'))
    .refine((data) => !passwordContainsEmail(data.new_password, userEmail), {
      path: ['new_password'],
      message: PASSWORD_CONTAINS_EMAIL,
      when: hasStrings('new_password'),
    })
    .refine((data) => data.new_password !== data.current_password, {
      path: ['new_password'],
      message: 'New password must be different from your current password',
      when: hasStrings('new_password', 'current_password'),
    });
}
