import { afterAll, beforeEach, describe, expect, jest, test } from '@jest/globals';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import {
  DEFAULT_PASSWORD,
  RefreshToken,
  app,
  cookieHeader,
  createUser,
  mockMailer,
  parseCookies,
  resetDatabase,
  sequelize,
  tokensFrom,
} from './helpers.js';
import { hashRefreshToken } from '../src/services/session.service.js';

const EMAIL = 'kai@example.com';

async function loginAs(email = EMAIL, password = DEFAULT_PASSWORD) {
  const res = await request(app).post('/api/v1/auth/login').send({ email, password }).expect(200);
  return tokensFrom(res);
}

const me = (tokens) => request(app).get('/api/v1/auth/me').set('Cookie', cookieHeader(tokens));
const refresh = (tokens) => request(app).post('/api/v1/auth/refresh').set('Cookie', cookieHeader(tokens));

let user;

beforeEach(async () => {
  await resetDatabase();
  jest.restoreAllMocks();
  mockMailer();
  ({ user } = await createUser({ email: EMAIL }));
});

afterAll(async () => {
  await sequelize.close();
});

describe('GET /api/v1/auth/me', () => {
  test('returns 401 without an access token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ success: false, message: 'Authentication required' });
  });

  test('returns 401 for a tampered token', async () => {
    const { accessToken } = await loginAs();
    const res = await me({ accessToken: `${accessToken.slice(0, -2)}xx` });
    expect(res.status).toBe(401);
  });

  test('returns 401 for a token signed with another secret', async () => {
    const forged = jwt.sign({ role: 'admin' }, 'some-other-secret-that-is-long-enough', {
      subject: user.id,
      issuer: 'community-rise',
      audience: 'community-rise-web',
    });
    const res = await me({ accessToken: forged });
    expect(res.status).toBe(401);
  });

  test('returns 401 for an expired token', async () => {
    const expired = jwt.sign({ role: 'user' }, process.env.JWT_ACCESS_SECRET, {
      subject: user.id,
      issuer: 'community-rise',
      audience: 'community-rise-web',
      expiresIn: -10,
    });
    const res = await me({ accessToken: expired });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Access token expired');
  });

  test('returns 401 once the user is deactivated', async () => {
    const tokens = await loginAs();
    await user.update({ is_active: false });
    expect((await me(tokens)).status).toBe(401);
  });

  test('returns the current user with a valid token', async () => {
    const tokens = await loginAs();
    const res = await me(tokens);

    expect(res.status).toBe(200);
    expect(res.body.data.user).toEqual({
      id: user.id,
      full_name: 'Test User',
      email: EMAIL,
      signup_reason: 'learner',
      role: 'user',
      is_email_verified: false,
      email_verified_at: null,
      teaching_updates_opt_in: false,
      last_login_at: expect.any(String),
      created_at: expect.any(String),
    });
  });
});

describe('POST /api/v1/auth/refresh', () => {
  test('rotates the refresh token and issues a new access token', async () => {
    const first = await loginAs();
    const res = await refresh({ refreshToken: first.refreshToken });

    expect(res.status).toBe(200);
    const second = tokensFrom(res);
    expect(second.refreshToken).toBeTruthy();
    expect(second.refreshToken).not.toBe(first.refreshToken);
    expect(second.accessToken).toBeTruthy();
    expect(parseCookies(res).refresh_token.attributes).toContain('path=/api/v1/auth');

    const oldRow = await RefreshToken.findOne({ where: { token_hash: hashRefreshToken(first.refreshToken) } });
    const newRow = await RefreshToken.findOne({ where: { token_hash: hashRefreshToken(second.refreshToken) } });
    expect(oldRow.revoked_at).toBeInstanceOf(Date);
    expect(oldRow.replaced_by_token_id).toBe(newRow.id);
    expect(newRow.revoked_at).toBeNull();

    expect((await me({ accessToken: second.accessToken })).status).toBe(200);
  });

  test('returns 401 without a refresh token', async () => {
    const res = await request(app).post('/api/v1/auth/refresh');
    expect(res.status).toBe(401);
  });

  test('returns 401 for an unknown refresh token', async () => {
    const res = await refresh({ refreshToken: 'not-a-real-token' });
    expect(res.status).toBe(401);
  });

  test('returns 401 for an expired refresh token', async () => {
    const { refreshToken } = await loginAs();
    await RefreshToken.update(
      { expires_at: new Date(Date.now() - 1000) },
      { where: { token_hash: hashRefreshToken(refreshToken) } },
    );
    expect((await refresh({ refreshToken })).status).toBe(401);
  });

  test('detects reuse of a rotated token and revokes every session', async () => {
    const otherDevice = await loginAs();
    const first = await loginAs();
    const second = tokensFrom(await refresh({ refreshToken: first.refreshToken }).expect(200));

    // Attacker replays the already-rotated token.
    const reuse = await refresh({ refreshToken: first.refreshToken });
    expect(reuse.status).toBe(401);
    // Cookies are cleared on failure.
    expect(parseCookies(reuse).refresh_token.value).toBe('');

    const active = await RefreshToken.count({ where: { user_id: user.id, revoked_at: null } });
    expect(active).toBe(0);
    expect((await refresh({ refreshToken: second.refreshToken })).status).toBe(401);
    expect((await refresh({ refreshToken: otherDevice.refreshToken })).status).toBe(401);
  });

  test('rejects unknown body fields', async () => {
    const { refreshToken } = await loginAs();
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', cookieHeader({ refreshToken }))
      .send({ extra: 1 });
    expect(res.status).toBe(422);
  });
});

describe('POST /api/v1/auth/logout', () => {
  test('revokes the current refresh token and clears cookies', async () => {
    const tokens = await loginAs();
    const res = await request(app).post('/api/v1/auth/logout').set('Cookie', cookieHeader(tokens));

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, message: 'Logged out successfully', data: null });
    const cookies = parseCookies(res);
    expect(cookies.access_token.value).toBe('');
    expect(cookies.refresh_token.value).toBe('');

    const row = await RefreshToken.findOne({ where: { token_hash: hashRefreshToken(tokens.refreshToken) } });
    expect(row.revoked_at).toBeInstanceOf(Date);
    expect((await refresh(tokens)).status).toBe(401);
  });

  test('succeeds even without cookies', async () => {
    const res = await request(app).post('/api/v1/auth/logout');
    expect(res.status).toBe(200);
  });

  test('only revokes the current session', async () => {
    const deviceA = await loginAs();
    const deviceB = await loginAs();
    await request(app).post('/api/v1/auth/logout').set('Cookie', cookieHeader(deviceA)).expect(200);
    expect((await refresh(deviceB)).status).toBe(200);
  });

  test('replaying a logged-out token is rejected without revoking other sessions', async () => {
    const deviceA = await loginAs();
    const deviceB = await loginAs();
    await request(app).post('/api/v1/auth/logout').set('Cookie', cookieHeader(deviceA)).expect(200);

    expect((await refresh(deviceA)).status).toBe(401);
    expect((await refresh(deviceB)).status).toBe(200);
  });
});

describe('POST /api/v1/auth/logout-all', () => {
  test('requires authentication', async () => {
    expect((await request(app).post('/api/v1/auth/logout-all')).status).toBe(401);
  });

  test('revokes every refresh token for the user', async () => {
    const deviceA = await loginAs();
    const deviceB = await loginAs();

    const res = await request(app).post('/api/v1/auth/logout-all').set('Cookie', cookieHeader(deviceA));
    expect(res.status).toBe(200);

    expect(await RefreshToken.count({ where: { user_id: user.id, revoked_at: null } })).toBe(0);
    expect((await refresh(deviceB)).status).toBe(401);
  });
});
