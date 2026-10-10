import { afterAll, beforeEach, describe, expect, jest, test } from '@jest/globals';
import request from 'supertest';
import { app, createUser, mailer, mockMailer, resetDatabase, sequelize } from './helpers.js';
import requireRole from '../src/middlewares/requireRole.js';

beforeEach(() => {
  jest.restoreAllMocks();
});

afterAll(async () => {
  await sequelize.close();
});

describe('health', () => {
  test('GET /api/v1/health reports database connectivity', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, data: { status: 'ok', database: 'connected' } });
  });

  test('GET /api/health (legacy) still responds', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('error handling and security headers', () => {
  test('unknown routes return a JSON 404', async () => {
    const res = await request(app).get('/api/v1/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('sets helmet headers and CORS for the configured client only', async () => {
    const allowed = await request(app).get('/api/v1/health').set('Origin', 'http://localhost:5173');
    expect(allowed.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    expect(allowed.headers['access-control-allow-credentials']).toBe('true');
    expect(allowed.headers['x-content-type-options']).toBe('nosniff');
    expect(allowed.headers['x-powered-by']).toBeUndefined();

    const denied = await request(app).get('/api/v1/health').set('Origin', 'https://evil.example');
    expect(denied.headers['access-control-allow-origin']).toBeUndefined();
  });
});

describe('POST /api/contact (existing contact form)', () => {
  const valid = { name: 'Jo', email: 'jo@example.com', reason: 'Volunteer', message: 'Hello\nthere <b>' };

  test('sends the message via the mailer', async () => {
    const sendMail = mockMailer();
    const res = await request(app).post('/api/contact').send(valid);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(sendMail).toHaveBeenCalledTimes(1);
    const mail = sendMail.mock.calls[0][0];
    expect(mail).toMatchObject({ to: 'inbox@example.com', replyTo: 'jo@example.com' });
    expect(mail.html).toContain('Hello<br>there &lt;b&gt;');
  });

  test('returns 400 with an error field the frontend reads', async () => {
    mockMailer();
    const res = await request(app).post('/api/contact').send({ ...valid, email: 'bad' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Please provide a valid email address.');
  });

  test('returns 500 when sending fails', async () => {
    jest.spyOn(mailer, 'sendMail').mockRejectedValue(new Error('SMTP down'));
    const res = await request(app).post('/api/contact').send(valid);
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Failed to send message. Please try again later.');
  });
});

describe('requireRole', () => {
  const run = (user) => {
    const next = jest.fn();
    requireRole('admin')({ user }, {}, next);
    return next.mock.calls[0][0];
  };

  test('allows matching roles', () => {
    expect(run({ role: 'admin' })).toBeUndefined();
  });

  test('forbids other roles with 403', () => {
    expect(run({ role: 'user' }).statusCode).toBe(403);
  });

  test('requires authentication first', () => {
    expect(run(undefined).statusCode).toBe(401);
  });
});

describe('User model', () => {
  beforeEach(resetDatabase);

  test('default scope never loads password_hash', async () => {
    const { user } = await createUser({ email: '  MiXeD@Example.com ' });
    expect(user.email).toBe('mixed@example.com');
    expect(JSON.stringify(user)).not.toContain('password_hash');

    const { User } = sequelize.models;
    const loaded = await User.findByPk(user.id);
    expect(loaded.get('password_hash')).toBeUndefined();
    const withPassword = await User.scope('withPassword').findByPk(user.id);
    expect(withPassword.password_hash).toBeTruthy();
  });
});
