import { afterAll, beforeEach, describe, expect, jest, test } from '@jest/globals';
import request from 'supertest';
import {
  DEFAULT_PASSWORD,
  User,
  app,
  cookieHeader,
  createUser,
  mockMailer,
  resetDatabase,
  sequelize,
  tokensFrom,
  validRegistration,
} from './helpers.js';

beforeEach(async () => {
  await resetDatabase();
  jest.restoreAllMocks();
  mockMailer();
});

afterAll(async () => {
  await sequelize.close();
});

describe('teaching resource updates opt-in', () => {
  test('registration defaults to not opted in', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(validRegistration());
    expect(res.status).toBe(201);
    expect(res.body.data.user.teaching_updates_opt_in).toBe(false);
    const user = await User.findOne({ where: { email: 'amina@example.com' } });
    expect(user.teaching_updates_opt_in_at).toBeNull();
  });

  test('registration records an explicit opt-in with a timestamp', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(validRegistration({ teaching_updates: true }));
    expect(res.status).toBe(201);
    expect(res.body.data.user.teaching_updates_opt_in).toBe(true);
    const user = await User.findOne({ where: { email: 'amina@example.com' } });
    expect(user.teaching_updates_opt_in_at).toBeInstanceOf(Date);
  });

  test('registration rejects a non-boolean opt-in', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(validRegistration({ teaching_updates: 'yes' }));
    expect(res.status).toBe(422);
    expect(res.body.errors.teaching_updates).toBeDefined();
  });

  describe('PATCH /api/v1/users/me/preferences', () => {
    const patch = (body, tokens) => {
      const req = request(app).patch('/api/v1/users/me/preferences');
      if (tokens) req.set('Cookie', cookieHeader(tokens));
      return req.send(body);
    };

    async function login() {
      await createUser({ email: 'teacher@example.com' });
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'teacher@example.com', password: DEFAULT_PASSWORD })
        .expect(200);
      return tokensFrom(res);
    }

    test('requires authentication', async () => {
      expect((await patch({ teaching_updates: true })).status).toBe(401);
    });

    test('opts in and out', async () => {
      const tokens = await login();

      const optIn = await patch({ teaching_updates: true }, tokens);
      expect(optIn.status).toBe(200);
      expect(optIn.body.data.user.teaching_updates_opt_in).toBe(true);
      const optedIn = await User.findOne({ where: { email: 'teacher@example.com' } });
      expect(optedIn.teaching_updates_opt_in_at).toBeInstanceOf(Date);

      const optOut = await patch({ teaching_updates: false }, tokens);
      expect(optOut.status).toBe(200);
      expect(optOut.body.data.user.teaching_updates_opt_in).toBe(false);
      const optedOut = await User.findOne({ where: { email: 'teacher@example.com' } });
      expect(optedOut.teaching_updates_opt_in_at).toBeNull();
    });

    test('validates the body and rejects unknown fields', async () => {
      const tokens = await login();
      expect((await patch({}, tokens)).status).toBe(422);
      expect((await patch({ teaching_updates: 'yes' }, tokens)).status).toBe(422);
      const extra = await patch({ teaching_updates: true, role: 'admin' }, tokens);
      expect(extra.status).toBe(422);
      expect(extra.body.errors.role).toEqual(['Unknown field']);
    });
  });
});
