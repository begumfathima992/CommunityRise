// Deterministic test configuration, applied before any app module loads.
// .env is read only for TEST_DATABASE_URL (matching `npm run db:test:migrate`);
// everything else is overridden so tests never touch real credentials.
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../../.env'), quiet: true });

const TEST_DB = process.env.TEST_DATABASE_URL || 'postgres://ziggy@localhost:5432/communityrise_test';

Object.assign(process.env, {
  NODE_ENV: 'test',
  TEST_DATABASE_URL: TEST_DB,
  DATABASE_URL: TEST_DB,
  JWT_ACCESS_SECRET: 'test-access-secret-0123456789-abcdefghijklmnop',
  JWT_REFRESH_SECRET: 'test-refresh-secret-0123456789-abcdefghijklmnop',
  CLIENT_URL: 'http://localhost:5173',
  REFRESH_COOKIE_PATH: '/api/v1/auth',
  // Dummy provider settings: requests go to a non-existent host and tests
  // either spy on mailer.sendMail or mock fetch, so nothing is ever sent.
  RESEND_API_KEY: 're_test_not_a_real_key',
  MAIL_FROM: 'Community Rise <noreply@example.com>',
  RESEND_API_URL: 'https://resend.invalid',
  CONTACT_RECIPIENT: 'inbox@example.com',
  GMAIL_USER: '',
  GMAIL_APP_PASSWORD: '',
  LOG_LEVEL: 'silent',
});
