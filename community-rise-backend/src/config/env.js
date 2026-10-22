import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { z } from 'zod';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env'), quiet: true });

const clientUrls = z
  .string()
  .min(1)
  .transform((value, ctx) => {
    const origins = [];
    for (const raw of value.split(',').map((s) => s.trim()).filter(Boolean)) {
      try {
        const url = new URL(raw);
        if (!['http:', 'https:'].includes(url.protocol)) throw new Error('bad protocol');
        origins.push(url.origin);
      } catch {
        ctx.addIssue({ code: 'custom', message: `"${raw}" is not a valid http(s) URL` });
        return z.NEVER;
      }
    }
    if (origins.length === 0) {
      ctx.addIssue({ code: 'custom', message: 'At least one URL is required' });
      return z.NEVER;
    }
    return origins;
  });

// Blank values (e.g. an empty variable in a hosting dashboard) count as unset.
const optional = (schema) => z.preprocess((v) => (v === '' ? undefined : v), schema.optional());

// "Community Rise <noreply@communityrise.uk>" or "noreply@communityrise.uk"
const mailFrom = z
  .string()
  .trim()
  .transform((value, ctx) => {
    const match = value.match(/^(?:"?([^"<>]*?)"?\s*<([^<>\s]+)>|([^<>\s]+))$/);
    const address = match && (match[2] || match[3]);
    if (!address || !z.email().safeParse(address).success) {
      ctx.addIssue({ code: 'custom', message: 'Use "Name <address@domain>" or "address@domain"' });
      return z.NEVER;
    }
    return { name: match[1]?.trim() || undefined, address };
  });

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65535).default(5001),
    DATABASE_URL: z
      .string()
      .regex(/^postgres(ql)?:\/\//, 'Must be a postgres:// connection string'),
    JWT_ACCESS_SECRET: z.string().min(32, 'Must be at least 32 characters'),
    JWT_REFRESH_SECRET: z.string().min(32, 'Must be at least 32 characters'),
    CLIENT_URL: clientUrls,
    // Email is sent through Resend's HTTPS API (SMTP is blocked on some hosts).
    // Missing settings don't stop the server: sending fails with a logged error.
    RESEND_API_KEY: optional(z.string().min(1)),
    MAIL_FROM: optional(mailFrom),
    RESEND_API_URL: z.url().default('https://api.resend.com'),
    // Team inbox for contact form and tutor application notifications.
    CONTACT_RECIPIENT: optional(z.email()),
    // Legacy: GMAIL_USER is still used as the team inbox if CONTACT_RECIPIENT
    // is not set. GMAIL_APP_PASSWORD is no longer used.
    GMAIL_USER: optional(z.email()),
    GMAIL_APP_PASSWORD: optional(z.string()),
    REFRESH_COOKIE_PATH: z.string().startsWith('/').default('/api/v1/auth'),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).optional(),
  })
  .refine((e) => e.JWT_ACCESS_SECRET !== e.JWT_REFRESH_SECRET, {
    message: 'JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different',
    path: ['JWT_REFRESH_SECRET'],
  })
  .refine((e) => e.CONTACT_RECIPIENT || e.GMAIL_USER, {
    message: 'Set CONTACT_RECIPIENT (the inbox that receives contact form messages)',
    path: ['CONTACT_RECIPIENT'],
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const lines = parsed.error.issues.map(
    (issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`,
  );
  console.error(`Invalid environment configuration:\n${lines.join('\n')}`);
  console.error('See .env.example for the full list of required variables.');
  process.exit(1);
}

const env = Object.freeze({
  ...parsed.data,
  isProduction: parsed.data.NODE_ENV === 'production',
  isTest: parsed.data.NODE_ENV === 'test',
  // The first CLIENT_URL is used to build links in emails.
  appUrl: parsed.data.CLIENT_URL[0],
});

export default env;
