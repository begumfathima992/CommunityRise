import { afterAll, beforeEach, describe, expect, jest, test } from '@jest/globals';
import request from 'supertest';
import {
  DEFAULT_PASSWORD,
  TutorApplication,
  app,
  cookieHeader,
  createUser,
  flushEmails,
  mockMailer,
  resetDatabase,
  sequelize,
  tokensFrom,
} from './helpers.js';

const validApplication = (overrides = {}) => ({
  full_name: 'Priya Sharma',
  email: '  Priya@Example.com ',
  phone: '07700 900123',
  subjects: ['maths', 'coding'],
  learner_groups: ['young_people_11_16', 'adults'],
  availability: ['weekday_evening', 'weekend'],
  delivery: 'either',
  experience: 'Secondary maths teacher for six years and run an after-school coding club.',
  dbs_status: 'enhanced_update_service',
  agree_to_checks: true,
  consent: true,
  ...overrides,
});

const submit = (body, cookies) => {
  const req = request(app).post('/api/v1/tutor-applications');
  if (cookies) req.set('Cookie', cookieHeader(cookies));
  return req.send(body);
};

async function loginAs(email, attributes = {}) {
  await createUser({ email, ...attributes });
  const res = await request(app).post('/api/v1/auth/login').send({ email, password: DEFAULT_PASSWORD }).expect(200);
  return tokensFrom(res);
}

let sendMail;

beforeEach(async () => {
  await resetDatabase();
  jest.restoreAllMocks();
  sendMail = mockMailer();
});

afterAll(async () => {
  await sequelize.close();
});

describe('POST /api/v1/tutor-applications', () => {
  test('stores the application and emails the applicant and the team', async () => {
    const res = await submit(validApplication());
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const stored = await TutorApplication.findOne();
    expect(stored).toMatchObject({
      email: 'priya@example.com',
      phone: '07700 900123',
      subjects: ['maths', 'coding'],
      status: 'new',
      user_id: null,
    });
    expect(stored.agreed_to_checks_at).toBeInstanceOf(Date);
    expect(stored.consent_given_at).toBeInstanceOf(Date);

    await flushEmails();
    expect(sendMail).toHaveBeenCalledTimes(2);
    const [toApplicant, toTeam] = sendMail.mock.calls.map((call) => call[0]);
    expect(toApplicant.to).toBe('priya@example.com');
    expect(toTeam).toMatchObject({ to: 'inbox@example.com', replyTo: 'priya@example.com' });
    expect(toTeam.text).toContain('Subjects: Maths, Coding (Scratch, Python)');
    expect(toTeam.text).toContain('http://localhost:5173/admin/tutor-applications');
  });

  test('links the application to the account when logged in', async () => {
    const tokens = await loginAs('priya@example.com');
    await submit(validApplication(), tokens).expect(201);
    expect((await TutorApplication.findOne()).user_id).not.toBeNull();
  });

  test('escapes HTML in the team notification', async () => {
    await submit(validApplication({ experience: '<script>alert(1)</script> twenty characters of text' })).expect(201);
    await flushEmails();
    const toTeam = sendMail.mock.calls[1][0];
    expect(toTeam.html).toContain('&lt;script&gt;');
    expect(toTeam.html).not.toContain('<script>');
  });

  test('silently drops submissions that fill the honeypot field', async () => {
    const res = await submit(validApplication({ website: 'http://spam.example' }));
    expect(res.status).toBe(201);
    expect(await TutorApplication.count()).toBe(0);
    await flushEmails();
    expect(sendMail).not.toHaveBeenCalled();
  });

  test('rejects a second open application from the same email with 409', async () => {
    await submit(validApplication()).expect(201);
    const res = await submit(validApplication({ email: 'PRIYA@example.com' }));
    expect(res.status).toBe(409);
    expect(res.body.errors.email).toBeDefined();
  });

  test('allows a new application once the previous one is closed', async () => {
    await submit(validApplication()).expect(201);
    await TutorApplication.update({ status: 'declined' }, { where: {} });
    await submit(validApplication()).expect(201);
  });

  test.each([
    ['no subjects', { subjects: [] }, 'subjects'],
    ['an unknown subject', { subjects: ['astrology'] }, 'subjects.0'],
    ['no learner groups', { learner_groups: [] }, 'learner_groups'],
    ['no availability', { availability: [] }, 'availability'],
    ['an invalid delivery', { delivery: 'carrier pigeon' }, 'delivery'],
    ['an invalid phone', { phone: '12345' }, 'phone'],
    ['letters in the phone', { phone: 'call me maybe!' }, 'phone'],
    ['too little experience', { experience: 'Teacher' }, 'experience'],
    ['an invalid DBS status', { dbs_status: 'maybe' }, 'dbs_status'],
    ['not agreeing to checks', { agree_to_checks: false }, 'agree_to_checks'],
    ['no privacy consent', { consent: undefined }, 'consent'],
    ['an invalid email', { email: 'nope' }, 'email'],
    ['an unknown field', { status: 'approved' }, 'status'],
  ])('returns 422 for %s', async (_label, overrides, field) => {
    const body = validApplication(overrides);
    for (const key of Object.keys(body)) if (body[key] === undefined) delete body[key];
    const res = await submit(body);
    expect(res.status).toBe(422);
    expect(res.body.errors[field]).toBeDefined();
    expect(await TutorApplication.count()).toBe(0);
  });

  test('de-duplicates repeated choices', async () => {
    await submit(validApplication({ subjects: ['maths', 'maths'] })).expect(201);
    expect((await TutorApplication.findOne()).subjects).toEqual(['maths']);
  });
});

describe('admin: tutor applications', () => {
  test('listing requires an admin', async () => {
    expect((await request(app).get('/api/v1/tutor-applications')).status).toBe(401);

    const userTokens = await loginAs('user@example.com');
    const res = await request(app).get('/api/v1/tutor-applications').set('Cookie', cookieHeader(userTokens));
    expect(res.status).toBe(403);
  });

  test('admins can list, filter and update applications', async () => {
    await submit(validApplication()).expect(201);
    await submit(validApplication({ email: 'sam@example.com', full_name: 'Sam Lee' })).expect(201);
    const admin = await loginAs('admin@example.com', { role: 'admin' });

    const list = await request(app).get('/api/v1/tutor-applications').set('Cookie', cookieHeader(admin));
    expect(list.status).toBe(200);
    expect(list.body.data.applications).toHaveLength(2);
    expect(list.body.data.applications[0]).toMatchObject({ full_name: 'Sam Lee', status: 'new', has_account: false });

    const id = list.body.data.applications[0].id;
    const patch = await request(app)
      .patch(`/api/v1/tutor-applications/${id}`)
      .set('Cookie', cookieHeader(admin))
      .send({ status: 'approved', admin_notes: 'Great fit for coding club' });
    expect(patch.status).toBe(200);
    expect(patch.body.data.application).toMatchObject({ status: 'approved', admin_notes: 'Great fit for coding club' });
    expect(patch.body.data.application.reviewed_at).toBeTruthy();

    const filtered = await request(app)
      .get('/api/v1/tutor-applications?status=approved')
      .set('Cookie', cookieHeader(admin));
    expect(filtered.body.data.applications.map((a) => a.full_name)).toEqual(['Sam Lee']);
  });

  test('update validates input and the id', async () => {
    const admin = await loginAs('admin@example.com', { role: 'admin' });
    const bad = await request(app)
      .patch('/api/v1/tutor-applications/not-a-uuid')
      .set('Cookie', cookieHeader(admin))
      .send({ status: 'approved' });
    expect(bad.status).toBe(422);

    const missing = await request(app)
      .patch('/api/v1/tutor-applications/7f9c2b1e-3c55-4f0e-9a7e-2a1a0b8c9d10')
      .set('Cookie', cookieHeader(admin))
      .send({ status: 'approved' });
    expect(missing.status).toBe(404);

    await submit(validApplication()).expect(201);
    const { id } = await TutorApplication.findOne();
    const invalid = await request(app)
      .patch(`/api/v1/tutor-applications/${id}`)
      .set('Cookie', cookieHeader(admin))
      .send({ status: 'hired' });
    expect(invalid.status).toBe(422);
    const empty = await request(app).patch(`/api/v1/tutor-applications/${id}`).set('Cookie', cookieHeader(admin)).send({});
    expect(empty.status).toBe(422);
  });
});
