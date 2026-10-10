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
    GMAIL_USER: z.email(),
    GMAIL_APP_PASSWORD: z.string().min(1),
    CONTACT_RECIPIENT: z.email().optional(),
    REFRESH_COOKIE_PATH: z.string().startsWith('/').default('/api/v1/auth'),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).optional(),
  })
  .refine((e) => e.JWT_ACCESS_SECRET !== e.JWT_REFRESH_SECRET, {
    message: 'JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different',
    path: ['JWT_REFRESH_SECRET'],
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
