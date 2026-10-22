import { afterAll, afterEach, describe, expect, jest, test } from '@jest/globals';
import request from 'supertest';
import { app, sequelize } from './helpers.js';
import { EmailSendError, SEND_TIMEOUT_MS, createResendMailer } from '../src/services/mailer.service.js';

const FROM = { name: 'Community Rise', address: 'noreply@communityrise.uk' };
const message = {
  to: 'help@communityrise.uk',
  replyTo: 'visitor@example.com',
  subject: 'Hello',
  html: '<p>Hi</p>',
  text: 'Hi',
};

const jsonResponse = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

// A fetch that never answers until the request is aborted.
const hangingFetch = (url, { signal }) =>
  new Promise((_, reject) => {
    signal.addEventListener('abort', () => reject(signal.reason));
  });

afterEach(() => {
  jest.restoreAllMocks();
});

afterAll(async () => {
  await sequelize.close();
});

describe('createResendMailer', () => {
  test('posts the message to the Resend API over HTTPS', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(jsonResponse(200, { id: 'email_123' }));
    const mailer = createResendMailer({ apiKey: 're_key', from: FROM, baseUrl: 'https://api.resend.com', fetchImpl });

    await expect(mailer.sendMail({ ...message, from: { name: 'Community Rise Website' } })).resolves.toEqual({
      id: 'email_123',
    });

    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe('https://api.resend.com/emails');
    expect(init.method).toBe('POST');
    expect(init.headers).toMatchObject({ Authorization: 'Bearer re_key', 'Content-Type': 'application/json' });
    expect(JSON.parse(init.body)).toEqual({
      from: '"Community Rise Website" <noreply@communityrise.uk>',
      to: ['help@communityrise.uk'],
      reply_to: 'visitor@example.com',
      subject: 'Hello',
      html: '<p>Hi</p>',
      text: 'Hi',
    });
  });

  test('uses the MAIL_FROM name when the caller gives none, and strips unsafe characters', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(jsonResponse(200, { id: 'x' }));
    const mailer = createResendMailer({ apiKey: 'k', from: FROM, baseUrl: 'https://api.resend.com/', fetchImpl });
    await mailer.sendMail(message);
    await mailer.sendMail({ ...message, from: { name: 'Evil" <x@y>\r\nBcc: z' } });

    expect(JSON.parse(fetchImpl.mock.calls[0][1].body).from).toBe('"Community Rise" <noreply@communityrise.uk>');
    expect(JSON.parse(fetchImpl.mock.calls[1][1].body).from).toBe('"Evil x@yBcc: z" <noreply@communityrise.uk>');
    expect(fetchImpl.mock.calls[0][0]).toBe('https://api.resend.com/emails');
  });

  test('rejects with the provider message when Resend refuses the email', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(
      jsonResponse(403, { statusCode: 403, name: 'validation_error', message: 'The communityrise.uk domain is not verified.' }),
    );
    const mailer = createResendMailer({ apiKey: 'k', from: FROM, baseUrl: 'https://api.resend.com', fetchImpl });

    const error = await mailer.sendMail(message).catch((e) => e);
    expect(error).toBeInstanceOf(EmailSendError);
    expect(error).toMatchObject({ code: 'validation_error', status: 403 });
    expect(error.message).toContain('domain is not verified');
  });

  test('times out instead of hanging', async () => {
    const mailer = createResendMailer({
      apiKey: 'k',
      from: FROM,
      baseUrl: 'https://api.resend.com',
      timeoutMs: 200,
      fetchImpl: hangingFetch,
    });
    const started = Date.now();
    const error = await mailer.sendMail(message).catch((e) => e);
    expect(error).toMatchObject({ name: 'EmailSendError', code: 'ETIMEDOUT' });
    expect(Date.now() - started).toBeLessThan(1000);
  });

  test('reports network failures', async () => {
    const fetchImpl = jest.fn().mockRejectedValue(new TypeError('fetch failed'));
    const mailer = createResendMailer({ apiKey: 'k', from: FROM, baseUrl: 'https://api.resend.com', fetchImpl });
    await expect(mailer.sendMail(message)).rejects.toMatchObject({ code: 'ENETWORK' });
  });

  test('fails clearly without calling the API when not configured', async () => {
    const fetchImpl = jest.fn();
    const mailer = createResendMailer({ apiKey: undefined, from: FROM, baseUrl: 'https://api.resend.com', fetchImpl });
    await expect(mailer.sendMail(message)).rejects.toMatchObject({ code: 'EMAIL_NOT_CONFIGURED' });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  test('never puts the API key in error messages', async () => {
    const secret = 're_super_secret_key';
    const fetchImpl = jest.fn().mockResolvedValue(jsonResponse(401, { name: 'missing_api_key', message: 'API key is invalid' }));
    const mailer = createResendMailer({ apiKey: secret, from: FROM, baseUrl: 'https://api.resend.com', fetchImpl });
    const error = await mailer.sendMail(message).catch((e) => e);
    expect(JSON.stringify({ message: error.message, code: error.code, status: error.status })).not.toContain(secret);
  });
});

describe('POST /api/contact through the real mailer (provider mocked)', () => {
  const valid = { name: 'Jo', email: 'jo@example.com', reason: 'Volunteer', message: 'Hello there' };

  test('success: 200 with the same JSON as before', async () => {
    const fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(200, { id: 'email_abc' }));

    const res = await request(app).post('/api/contact').send(valid);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, message: 'Your message has been sent successfully.' });
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe('https://resend.invalid/emails');
    const payload = JSON.parse(init.body);
    expect(payload).toMatchObject({
      from: '"Community Rise Website" <noreply@example.com>',
      to: ['inbox@example.com'],
      reply_to: 'jo@example.com',
      subject: 'Community Rise — Volunteer (from Jo)',
    });
    expect(payload.text).toContain('Message:\nHello there');
  });

  test('provider rejects: 500 with the error JSON the frontend reads', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(422, { name: 'validation_error', message: 'Invalid from field' }));

    const res = await request(app).post('/api/contact').send(valid);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      success: false,
      message: 'Failed to send message. Please try again later.',
      error: 'Failed to send message. Please try again later.',
    });
  });

  test(`provider hangs: responds with 500 within ~${SEND_TIMEOUT_MS / 1000}s instead of hanging`, async () => {
    jest.spyOn(globalThis, 'fetch').mockImplementation(hangingFetch);

    const started = Date.now();
    const res = await request(app).post('/api/contact').send(valid);
    const elapsed = Date.now() - started;

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Failed to send message. Please try again later.');
    expect(elapsed).toBeGreaterThanOrEqual(SEND_TIMEOUT_MS - 100);
    expect(elapsed).toBeLessThan(SEND_TIMEOUT_MS + 2000);
  }, 15000);

  test('validation errors still return 400 without calling the provider', async () => {
    const fetchSpy = jest.spyOn(globalThis, 'fetch');
    const res = await request(app).post('/api/contact').send({ ...valid, email: 'bad' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Please provide a valid email address.');
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
