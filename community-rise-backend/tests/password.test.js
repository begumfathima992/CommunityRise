import { afterAll, beforeEach, describe, expect, jest, test } from '@jest/globals';
import request from 'supertest';
import {
  AuthToken,
  DEFAULT_PASSWORD,
  RefreshToken,
  User,
  app,
  cookieHeader,
  createUser,
  flushEmails,
  mockMailer,
  resetDatabase,
  sequelize,
  tokenFromLastEmail,
  tokensFrom,
} from './helpers.js';
import { sha256 } from '../src/utils/crypto.js';

const EMAIL = 'lee@example.com';
const NEW_PASSWORD = 'BrandNewPass99';
const GENERIC = 'If an account exists for that email address, we have sent an email with further instructions.';

const post = (path, body, cookies) => {
  const req = request(app).post(`/api/v1/auth${path}`);
  if (cookies) req.set('Cookie', cookieHeader(cookies));
  return req.send(body);
};
const login = (password, email = EMAIL) => post('/login', { email, password });

let sendMail;
let user;

beforeEach(async () => {
  await resetDatabase();
  jest.restoreAllMocks();
  sendMail = mockMailer();
  ({ user } = await createUser({ email: EMAIL }));
});

afterAll(async () => {
  await sequelize.close();
});

async function requestResetToken() {
  await post('/forgot-password', { email: EMAIL }).expect(200);
  await flushEmails();
  return tokenFromLastEmail(sendMail);
}

describe('POST /api/v1/auth/forgot-password', () => {
  test('returns the same response whether or not the email exists', async () => {
    const known = await post('/forgot-password', { email: EMAIL });
    const unknown = await post('/forgot-password', { email: 'ghost@example.com' });

    expect(known.status).toBe(200);
    expect(unknown.status).toBe(200);
    expect(known.body).toEqual({ success: true, message: GENERIC, data: null });
    expect(unknown.body).toEqual(known.body);

    await flushEmails();
    expect(sendMail).toHaveBeenCalledTimes(1);
    expect(sendMail.mock.calls[0][0].to).toBe(EMAIL);
    expect(sendMail.mock.calls[0][0].text).toContain('http://localhost:5173/reset-password?token=');
  });

  test('stores the reset token hashed with a 1 hour expiry', async () => {
    const token = await requestResetToken();
    const row = await AuthToken.findOne({ where: { user_id: user.id, type: 'password_reset' } });
    expect(row.token_hash).toBe(sha256(token));
    expect(row.token_hash).not.toBe(token);
    const ttl = row.expires_at.getTime() - Date.now();
    expect(ttl).toBeGreaterThan(59 * 60 * 1000);
    expect(ttl).toBeLessThanOrEqual(60 * 60 * 1000);
  });

  test('does not send email to inactive users', async () => {
    await user.update({ is_active: false });
    const res = await post('/forgot-password', { email: EMAIL });
    expect(res.body.message).toBe(GENERIC);
    await flushEmails();
    expect(sendMail).not.toHaveBeenCalled();
  });

  test('validates the email', async () => {
    const res = await post('/forgot-password', { email: 'nope' });
    expect(res.status).toBe(422);
    expect(res.body.errors.email).toBeDefined();
  });
});

describe('POST /api/v1/auth/reset-password', () => {
  test('resets the password, revokes sessions and clears any lockout', async () => {
    const session = tokensFrom(await login(DEFAULT_PASSWORD).expect(200));
    await user.update({ failed_login_attempts: 3, locked_until: new Date(Date.now() + 600000) });
    const token = await requestResetToken();

    const res = await post('/reset-password', { token, password: NEW_PASSWORD, confirm_password: NEW_PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    expect(await RefreshToken.count({ where: { user_id: user.id, revoked_at: null } })).toBe(0);
    expect((await post('/refresh', {}, { refreshToken: session.refreshToken })).status).toBe(401);

    expect((await login(DEFAULT_PASSWORD)).status).toBe(401);
    expect((await login(NEW_PASSWORD)).status).toBe(200);
  });

  test('tokens are single use', async () => {
    const token = await requestResetToken();
    await post('/reset-password', { token, password: NEW_PASSWORD, confirm_password: NEW_PASSWORD }).expect(200);

    const again = await post('/reset-password', {
      token,
      password: 'AnotherPass77',
      confirm_password: 'AnotherPass77',
    });
    expect(again.status).toBe(400);
    expect(again.body.message).toMatch(/invalid or has expired/);
  });

  test('a newer reset request invalidates the older link', async () => {
    const oldToken = await requestResetToken();
    const newToken = await requestResetToken();
    expect(newToken).not.toBe(oldToken);

    const res = await post('/reset-password', { token: oldToken, password: NEW_PASSWORD, confirm_password: NEW_PASSWORD });
    expect(res.status).toBe(400);
    await post('/reset-password', { token: newToken, password: NEW_PASSWORD, confirm_password: NEW_PASSWORD }).expect(200);
  });

  test('rejects expired tokens', async () => {
    const token = await requestResetToken();
    await AuthToken.update({ expires_at: new Date(Date.now() - 1000) }, { where: { token_hash: sha256(token) } });
    const res = await post('/reset-password', { token, password: NEW_PASSWORD, confirm_password: NEW_PASSWORD });
    expect(res.status).toBe(400);
  });

  test('rejects unknown tokens', async () => {
    const res = await post('/reset-password', { token: 'bogus', password: NEW_PASSWORD, confirm_password: NEW_PASSWORD });
    expect(res.status).toBe(400);
  });

  test('rejects a password containing the email without consuming the token', async () => {
    const token = await requestResetToken();
    const bad = `A1${EMAIL}`;
    const res = await post('/reset-password', { token, password: bad, confirm_password: bad });
    expect(res.status).toBe(422);
    expect(res.body.errors.password).toEqual(['Password must not contain your email address']);

    await post('/reset-password', { token, password: NEW_PASSWORD, confirm_password: NEW_PASSWORD }).expect(200);
  });

  test('validates password rules and confirmation', async () => {
    const token = await requestResetToken();
    const weak = await post('/reset-password', { token, password: 'weak', confirm_password: 'weak' });
    expect(weak.status).toBe(422);
    expect(weak.body.errors.password.length).toBeGreaterThan(0);

    const mismatch = await post('/reset-password', { token, password: NEW_PASSWORD, confirm_password: 'Other12345A' });
    expect(mismatch.status).toBe(422);
    expect(mismatch.body.errors.confirm_password).toEqual(['Passwords do not match']);
  });
});

describe('email verification', () => {
  const verify = (token) => request(app).get('/api/v1/auth/verify-email').query({ token });

  async function registerAndGetToken() {
    await post('/register', {
      full_name: 'New Person',
      email: 'new@example.com',
      signup_reason: 'learner',
      password: DEFAULT_PASSWORD,
      confirm_password: DEFAULT_PASSWORD,
      consent: true,
    }).expect(201);
    await flushEmails();
    return tokenFromLastEmail(sendMail);
  }

  test('GET /verify-email verifies the address once', async () => {
    const token = await registerAndGetToken();

    const res = await verify(token);
    expect(res.status).toBe(200);
    expect(res.body.data.user.is_email_verified).toBe(true);

    const stored = await User.findOne({ where: { email: 'new@example.com' } });
    expect(stored.is_email_verified).toBe(true);
    expect(stored.email_verified_at).toBeInstanceOf(Date);

    expect((await verify(token)).status).toBe(400);
  });

  test('GET /verify-email rejects missing, unknown and expired tokens', async () => {
    expect((await request(app).get('/api/v1/auth/verify-email')).status).toBe(422);
    expect((await verify('bogus')).status).toBe(400);

    const token = await registerAndGetToken();
    await AuthToken.update({ expires_at: new Date(Date.now() - 1000) }, { where: { token_hash: sha256(token) } });
    expect((await verify(token)).status).toBe(400);
  });

  test('POST /resend-verification sends a fresh link and invalidates the old one', async () => {
    const oldToken = await registerAndGetToken();
    sendMail.mockClear();

    const res = await post('/resend-verification', { email: 'NEW@example.com' });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe(GENERIC);
    await flushEmails();
    expect(sendMail).toHaveBeenCalledTimes(1);
    const newToken = tokenFromLastEmail(sendMail);

    expect((await verify(oldToken)).status).toBe(400);
    expect((await verify(newToken)).status).toBe(200);
  });

  test('POST /resend-verification gives the same response for unknown and verified emails', async () => {
    await user.update({ is_email_verified: true, email_verified_at: new Date() });
    const verified = await post('/resend-verification', { email: EMAIL });
    const unknown = await post('/resend-verification', { email: 'ghost@example.com' });

    expect(verified.status).toBe(200);
    expect(unknown.body).toEqual(verified.body);
    await flushEmails();
    expect(sendMail).not.toHaveBeenCalled();
  });
});

describe('PATCH /api/v1/auth/change-password', () => {
  const change = (body, cookies) => {
    const req = request(app).patch('/api/v1/auth/change-password');
    if (cookies) req.set('Cookie', cookieHeader(cookies));
    return req.send(body);
  };

  test('requires authentication', async () => {
    const res = await change({ current_password: DEFAULT_PASSWORD, new_password: NEW_PASSWORD, confirm_password: NEW_PASSWORD });
    expect(res.status).toBe(401);
  });

  test('changes the password, signs out other devices and keeps this one signed in', async () => {
    const otherDevice = tokensFrom(await login(DEFAULT_PASSWORD).expect(200));
    const thisDevice = tokensFrom(await login(DEFAULT_PASSWORD).expect(200));

    const res = await change(
      { current_password: DEFAULT_PASSWORD, new_password: NEW_PASSWORD, confirm_password: NEW_PASSWORD },
      thisDevice,
    );
    expect(res.status).toBe(200);

    const fresh = tokensFrom(res);
    expect(fresh.refreshToken).toBeTruthy();
    expect((await post('/refresh', {}, { refreshToken: otherDevice.refreshToken })).status).toBe(401);
    expect((await post('/refresh', {}, { refreshToken: fresh.refreshToken })).status).toBe(200);

    expect((await login(DEFAULT_PASSWORD)).status).toBe(401);
    expect((await login(NEW_PASSWORD)).status).toBe(200);
  });

  test('rejects an incorrect current password', async () => {
    const session = tokensFrom(await login(DEFAULT_PASSWORD).expect(200));
    const res = await change(
      { current_password: 'WrongPassword1', new_password: NEW_PASSWORD, confirm_password: NEW_PASSWORD },
      session,
    );
    expect(res.status).toBe(422);
    expect(res.body.errors.current_password).toEqual(['Current password is incorrect']);
  });

  test('rejects reusing the current password', async () => {
    const session = tokensFrom(await login(DEFAULT_PASSWORD).expect(200));
    const res = await change(
      { current_password: DEFAULT_PASSWORD, new_password: DEFAULT_PASSWORD, confirm_password: DEFAULT_PASSWORD },
      session,
    );
    expect(res.status).toBe(422);
    expect(res.body.errors.new_password).toBeDefined();
  });

  test('rejects a new password containing the email', async () => {
    const session = tokensFrom(await login(DEFAULT_PASSWORD).expect(200));
    const bad = `Z9${EMAIL.toUpperCase()}x`;
    const res = await change({ current_password: DEFAULT_PASSWORD, new_password: bad, confirm_password: bad }, session);
    expect(res.status).toBe(422);
    expect(res.body.errors.new_password).toEqual(['Password must not contain your email address']);
  });

  test('validates the new password and confirmation', async () => {
    const session = tokensFrom(await login(DEFAULT_PASSWORD).expect(200));
    const res = await change(
      { current_password: DEFAULT_PASSWORD, new_password: 'short', confirm_password: 'nope' },
      session,
    );
    expect(res.status).toBe(422);
    expect(res.body.errors.new_password).toBeDefined();
    expect(res.body.errors.confirm_password).toBeDefined();
  });
});
