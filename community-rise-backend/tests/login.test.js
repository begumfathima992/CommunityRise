import { afterAll, beforeEach, describe, expect, jest, test } from '@jest/globals';
import request from 'supertest';
import {
  DEFAULT_PASSWORD,
  User,
  app,
  cookieHeader,
  createUser,
  mockMailer,
  parseCookies,
  resetDatabase,
  sequelize,
  tokensFrom,
} from './helpers.js';

const login = (body) => request(app).post('/api/v1/auth/login').send(body);

beforeEach(async () => {
  await resetDatabase();
  jest.restoreAllMocks();
  mockMailer();
});

afterAll(async () => {
  await sequelize.close();
});

describe('POST /api/v1/auth/login', () => {
  test('logs in with valid credentials and sets auth cookies', async () => {
    const { user } = await createUser({ email: 'sam@example.com' });

    const res = await login({ email: '  SAM@example.com', password: DEFAULT_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, data: { user: { id: user.id, email: 'sam@example.com' } } });
    expect(JSON.stringify(res.body)).not.toMatch(/password|token_hash/);

    const cookies = parseCookies(res);
    expect(cookies.access_token.value).toBeTruthy();
    expect(cookies.refresh_token.value).toBeTruthy();

    const reloaded = await User.findByPk(user.id);
    expect(reloaded.last_login_at).toBeInstanceOf(Date);
    expect(reloaded.failed_login_attempts).toBe(0);
  });

  test('returns the same 401 message for a wrong password and an unknown email', async () => {
    await createUser({ email: 'sam@example.com' });

    const wrongPassword = await login({ email: 'sam@example.com', password: 'WrongPassword1' });
    const unknownEmail = await login({ email: 'nobody@example.com', password: DEFAULT_PASSWORD });

    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.status).toBe(401);
    expect(wrongPassword.body).toEqual({ success: false, message: 'Invalid email or password' });
    expect(unknownEmail.body).toEqual(wrongPassword.body);
    expect(wrongPassword.headers['set-cookie']).toBeUndefined();
  });

  test('returns 422 for missing fields and unknown fields', async () => {
    const missing = await login({ email: 'sam@example.com' });
    expect(missing.status).toBe(422);
    expect(missing.body.errors.password).toBeDefined();

    const extra = await login({ email: 'sam@example.com', password: 'x', remember: true });
    expect(extra.status).toBe(422);
    expect(extra.body.errors.remember).toEqual(['Unknown field']);
  });

  test('locks the account for 15 minutes after 5 failed attempts', async () => {
    const { user } = await createUser({ email: 'sam@example.com' });

    for (let i = 1; i <= 4; i += 1) {
      const res = await login({ email: 'sam@example.com', password: 'WrongPassword1' });
      expect(res.status).toBe(401);
    }

    const fifth = await login({ email: 'sam@example.com', password: 'WrongPassword1' });
    expect(fifth.status).toBe(423);
    expect(fifth.body.message).toMatch(/locked/i);

    // Correct password is refused while locked.
    const whileLocked = await login({ email: 'sam@example.com', password: DEFAULT_PASSWORD });
    expect(whileLocked.status).toBe(423);

    const locked = await User.findByPk(user.id);
    const lockMs = locked.locked_until.getTime() - Date.now();
    expect(lockMs).toBeGreaterThan(14 * 60 * 1000);
    expect(lockMs).toBeLessThanOrEqual(15 * 60 * 1000);

    // Once the lock has expired the user can log in again.
    await locked.update({ locked_until: new Date(Date.now() - 1000) });
    const afterLock = await login({ email: 'sam@example.com', password: DEFAULT_PASSWORD });
    expect(afterLock.status).toBe(200);

    const reloaded = await User.findByPk(user.id);
    expect(reloaded.locked_until).toBeNull();
    expect(reloaded.failed_login_attempts).toBe(0);
  });

  test('a successful login resets the failed attempt counter', async () => {
    const { user } = await createUser({ email: 'sam@example.com' });
    for (let i = 0; i < 3; i += 1) await login({ email: 'sam@example.com', password: 'WrongPassword1' });
    expect((await User.findByPk(user.id)).failed_login_attempts).toBe(3);

    await login({ email: 'sam@example.com', password: DEFAULT_PASSWORD }).expect(200);
    expect((await User.findByPk(user.id)).failed_login_attempts).toBe(0);
  });

  test('blocks inactive users with 403', async () => {
    await createUser({ email: 'sam@example.com', is_active: false });
    const res = await login({ email: 'sam@example.com', password: DEFAULT_PASSWORD });
    expect(res.status).toBe(403);
    expect(res.headers['set-cookie']).toBeUndefined();
  });

  test('treats soft-deleted users as unknown', async () => {
    const { user } = await createUser({ email: 'sam@example.com' });
    await user.destroy();
    const res = await login({ email: 'sam@example.com', password: DEFAULT_PASSWORD });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  test('unverified users can log in and /me reports is_email_verified=false', async () => {
    await createUser({ email: 'sam@example.com', is_email_verified: false });
    const res = await login({ email: 'sam@example.com', password: DEFAULT_PASSWORD }).expect(200);

    const me = await request(app).get('/api/v1/auth/me').set('Cookie', cookieHeader(tokensFrom(res)));
    expect(me.status).toBe(200);
    expect(me.body.data.user.is_email_verified).toBe(false);
  });
});
