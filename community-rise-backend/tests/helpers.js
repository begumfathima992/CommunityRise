import { jest } from '@jest/globals';
import app from '../src/app.js';
import { AuthToken, RefreshToken, User, sequelize } from '../src/models/index.js';
import { mailer } from '../src/services/mailer.service.js';
import { hashPassword } from '../src/utils/password.js';

export { app, sequelize, User, RefreshToken, AuthToken, mailer };

export const DEFAULT_PASSWORD = 'CorrectHorse42';

export async function resetDatabase() {
  const database = sequelize.config.database;
  if (!database.endsWith('_test')) {
    throw new Error(`Refusing to truncate non-test database "${database}"`);
  }
  await sequelize.query('TRUNCATE TABLE auth_tokens, refresh_tokens, users RESTART IDENTITY CASCADE');
}

export function mockMailer() {
  return jest.spyOn(mailer, 'sendMail').mockResolvedValue({ messageId: 'test-message' });
}

// Background emails are dispatched on a microtask; let them run.
export const flushEmails = () => new Promise((resolve) => setImmediate(resolve));

export function validRegistration(overrides = {}) {
  return {
    full_name: 'Amina O’Neil-Smith',
    email: 'amina@example.com',
    signup_reason: 'volunteer',
    password: DEFAULT_PASSWORD,
    confirm_password: DEFAULT_PASSWORD,
    consent: true,
    ...overrides,
  };
}

export async function createUser(overrides = {}) {
  const { password = DEFAULT_PASSWORD, ...attributes } = overrides;
  const user = await User.create({
    full_name: 'Test User',
    email: 'user@example.com',
    signup_reason: 'learner',
    consent_given_at: new Date(),
    password_hash: await hashPassword(password),
    ...attributes,
  });
  return { user, password };
}

// Parses Set-Cookie headers into { name: { value, attributes } }.
export function parseCookies(res) {
  const cookies = {};
  for (const header of res.headers['set-cookie'] || []) {
    const [pair, ...attrs] = header.split(';').map((part) => part.trim());
    const index = pair.indexOf('=');
    cookies[pair.slice(0, index)] = {
      value: decodeURIComponent(pair.slice(index + 1)),
      attributes: attrs.map((a) => a.toLowerCase()),
      raw: header,
    };
  }
  return cookies;
}

export function cookieHeader({ accessToken, refreshToken }) {
  const parts = [];
  if (accessToken) parts.push(`access_token=${accessToken}`);
  if (refreshToken) parts.push(`refresh_token=${refreshToken}`);
  return parts.join('; ');
}

export function tokensFrom(res) {
  const cookies = parseCookies(res);
  return {
    accessToken: cookies.access_token?.value,
    refreshToken: cookies.refresh_token?.value,
  };
}

// Pulls the ?token= value from the link in the most recent email.
export function tokenFromLastEmail(spy) {
  const { text } = spy.mock.calls.at(-1)[0];
  const url = new URL(text.match(/https?:\/\/\S+/)[0]);
  return url.searchParams.get('token');
}
