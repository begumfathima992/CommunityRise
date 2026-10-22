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
  const valid = { name: '  Jo  ', email: ' jo@example.com ', reason: 'Volunteer', message: 'Hello\nthere <b>' };
  const contact = (body) => request(app).post('/api/contact').send(body);

  test('sends the message with the same fields as the original server', async () => {
    const sendMail = mockMailer();
    const res = await contact(valid);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, message: 'Your message has been sent successfully.' });
    expect(sendMail).toHaveBeenCalledTimes(1);
    expect(sendMail.mock.calls[0][0]).toEqual({
      from: { name: 'Community Rise Website' },
      to: 'inbox@example.com',
      replyTo: 'jo@example.com',
      subject: 'Community Rise — Volunteer (from Jo)',
      text: 'Name: Jo\nEmail: jo@example.com\nReason: Volunteer\n\nMessage:\nHello\nthere <b>',
      html: expect.stringContaining('Hello<br>there &lt;b&gt;'),
    });
  });

  const invalid = [
    ['a field is missing', { message: undefined }, 'All fields are required.'],
    ['a field is blank', { name: '   ' }, 'All fields are required.'],
    ['a field is not a string', { reason: 7 }, 'All fields are required.'],
    ['name is too long', { name: 'a'.repeat(151) }, 'One or more fields are too long.'],
    ['email is too long', { email: `${'a'.repeat(250)}@x.com` }, 'One or more fields are too long.'],
    ['reason is too long', { reason: 'a'.repeat(201) }, 'One or more fields are too long.'],
    ['message is too long', { message: 'a'.repeat(5001) }, 'Message must not exceed 5000 characters.'],
    ['email is invalid', { email: 'bad' }, 'Please provide a valid email address.'],
  ];

  test.each(invalid)('returns 400 with data.error when %s', async (_label, overrides, error) => {
    const sendMail = mockMailer();
    const res = await contact({ ...valid, ...overrides });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe(error);
    expect(sendMail).not.toHaveBeenCalled();
  });

  test('accepts a 5000-character non-ASCII message (20kb body limit)', async () => {
    mockMailer();
    const res = await contact({ ...valid, message: 'é'.repeat(5000) });
    expect(res.status).toBe(200);
  });

  test('returns data.error for malformed JSON', async () => {
    const res = await request(app).post('/api/contact').set('Content-Type', 'application/json').send('{"name":');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid JSON request body.');
  });

  test('returns data.error for an oversized body', async () => {
    const res = await contact({ ...valid, message: 'a'.repeat(21 * 1024) });
    expect(res.status).toBe(413);
    expect(res.body.error).toBeDefined();
  });

  test('returns 500 with data.error when sending fails', async () => {
    jest.spyOn(mailer, 'sendMail').mockRejectedValue(new Error('SMTP down'));
    const res = await contact(valid);
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Failed to send message. Please try again later.');
  });

  test('allows a CORS preflight from the frontend origin', async () => {
    const res = await request(app)
      .options('/api/contact')
      .set('Origin', 'http://localhost:5173')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'content-type');
    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
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
