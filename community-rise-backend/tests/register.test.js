import { afterAll, beforeEach, describe, expect, jest, test } from '@jest/globals';
import request from 'supertest';
import {
  AuthToken,
  RefreshToken,
  User,
  app,
  createUser,
  flushEmails,
  mockMailer,
  parseCookies,
  resetDatabase,
  sequelize,
  tokenFromLastEmail,
  validRegistration,
} from './helpers.js';
import { sha256 } from '../src/utils/crypto.js';

const register = (body) => request(app).post('/api/v1/auth/register').send(body);

let sendMail;

beforeEach(async () => {
  await resetDatabase();
  jest.restoreAllMocks();
  sendMail = mockMailer();
});

afterAll(async () => {
  await sequelize.close();
});

describe('POST /api/v1/auth/register', () => {
  test('creates the user, logs them in and sends a verification email', async () => {
    const res = await register(validRegistration({ email: '  Amina@Example.COM ', full_name: '  Amina Khan  ' }));

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toMatchObject({
      full_name: 'Amina Khan',
      email: 'amina@example.com',
      signup_reason: 'volunteer',
      role: 'user',
      is_email_verified: false,
    });
    expect(JSON.stringify(res.body)).not.toMatch(/password|token_hash/);

    const cookies = parseCookies(res);
    expect(cookies.access_token.attributes).toEqual(expect.arrayContaining(['httponly', 'samesite=lax', 'path=/']));
    expect(cookies.refresh_token.attributes).toEqual(
      expect.arrayContaining(['httponly', 'samesite=lax', 'path=/api/v1/auth']),
    );
    expect(cookies.access_token.attributes).not.toContain('secure');

    const stored = await User.scope('withPassword').findOne({ where: { email: 'amina@example.com' } });
    expect(stored.password_hash).toMatch(/^\$2[aby]\$12\$/);
    expect(stored.consent_given_at).toBeInstanceOf(Date);

    const refresh = await RefreshToken.findOne({ where: { user_id: stored.id } });
    expect(refresh.token_hash).not.toBe(cookies.refresh_token.value);

    await flushEmails();
    expect(sendMail).toHaveBeenCalledTimes(1);
    expect(sendMail.mock.calls[0][0].to).toBe('amina@example.com');
    const rawToken = tokenFromLastEmail(sendMail);
    const authToken = await AuthToken.findOne({ where: { user_id: stored.id } });
    expect(authToken.type).toBe('email_verification');
    expect(authToken.token_hash).toBe(sha256(rawToken));
    expect(authToken.expires_at.getTime() - Date.now()).toBeGreaterThan(23 * 60 * 60 * 1000);
  });

  test('accepts names with accents, hyphens and apostrophes', async () => {
    const res = await register(validRegistration({ full_name: "Zoë D'Arcy-Núñez" }));
    expect(res.status).toBe(201);
  });

  test('returns 409 when the email already exists (case-insensitive)', async () => {
    await createUser({ email: 'amina@example.com' });
    const res = await register(validRegistration({ email: 'AMINA@example.com' }));

    expect(res.status).toBe(409);
    expect(res.body).toMatchObject({ success: false, errors: { email: expect.any(Array) } });
  });

  test('returns 409 when the email belongs to a soft-deleted account', async () => {
    const { user } = await createUser({ email: 'amina@example.com' });
    await user.destroy();
    const res = await register(validRegistration());
    expect(res.status).toBe(409);
  });

  const longEmail = `${'a'.repeat(250)}@x.com`;
  const invalidCases = [
    ['full_name missing', { full_name: undefined }, 'full_name'],
    ['full_name too short', { full_name: 'A' }, 'full_name'],
    ['full_name only spaces', { full_name: '   ' }, 'full_name'],
    ['full_name too long', { full_name: 'A'.repeat(101) }, 'full_name'],
    ['full_name with digits', { full_name: 'Agent 47' }, 'full_name'],
    ['full_name with symbols', { full_name: '<script>' }, 'full_name'],
    ['email missing', { email: undefined }, 'email'],
    ['email invalid', { email: 'not-an-email' }, 'email'],
    ['email too long', { email: longEmail }, 'email'],
    ['email not a string', { email: 42 }, 'email'],
    ['signup_reason missing', { signup_reason: undefined }, 'signup_reason'],
    ['signup_reason invalid', { signup_reason: 'hacker' }, 'signup_reason'],
    ['password too short', { password: 'Short1a', confirm_password: 'Short1a' }, 'password'],
    ['password too long', { password: `Aa1${'x'.repeat(126)}`, confirm_password: `Aa1${'x'.repeat(126)}` }, 'password'],
    ['password without uppercase', { password: 'lowercase123', confirm_password: 'lowercase123' }, 'password'],
    ['password without lowercase', { password: 'UPPERCASE123', confirm_password: 'UPPERCASE123' }, 'password'],
    ['password without number', { password: 'NoNumbersHere', confirm_password: 'NoNumbersHere' }, 'password'],
    [
      'password containing the email',
      { password: 'Xamina@example.com1', confirm_password: 'Xamina@example.com1' },
      'password',
    ],
    ['confirm_password mismatch', { confirm_password: 'Different123A' }, 'confirm_password'],
    ['confirm_password missing', { confirm_password: undefined }, 'confirm_password'],
    ['consent false', { consent: false }, 'consent'],
    ['consent missing', { consent: undefined }, 'consent'],
    ['consent as string', { consent: 'true' }, 'consent'],
    ['unknown field', { is_admin: true }, 'is_admin'],
    ['attempt to set role', { role: 'admin' }, 'role'],
  ];

  test.each(invalidCases)('returns 422 when %s', async (_label, overrides, field) => {
    const body = validRegistration(overrides);
    for (const key of Object.keys(body)) if (body[key] === undefined) delete body[key];

    const res = await register(body);

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation failed');
    expect(res.body.errors[field]).toEqual(expect.arrayContaining([expect.any(String)]));
    expect(await User.count()).toBe(0);
  });

  test('returns all field errors at once', async () => {
    const res = await register({});
    expect(res.status).toBe(422);
    expect(Object.keys(res.body.errors)).toEqual(
      expect.arrayContaining(['full_name', 'email', 'signup_reason', 'password', 'confirm_password', 'consent']),
    );
  });

  test('rejects malformed JSON with 400', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .set('Content-Type', 'application/json')
      .send('{"email": ');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ success: false, message: 'Invalid JSON request body' });
  });

  test('rejects bodies over 10kb with 413', async () => {
    const res = await register(validRegistration({ full_name: 'A'.repeat(11 * 1024) }));
    expect(res.status).toBe(413);
  });
});
