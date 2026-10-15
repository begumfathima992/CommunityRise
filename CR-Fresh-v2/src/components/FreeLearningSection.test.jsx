import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import * as authApi from '../api/auth';
import { AuthProvider } from '../context/AuthContext';
import { CONTACT_API_URL } from '../emailConfig';
import { apiError } from '../test/utils';
import FreeLearningSection, { buildPlaceRequest } from './FreeLearningSection';

vi.mock('../api/auth', () => ({ me: vi.fn(), logout: vi.fn() }));

beforeAll(() => {
  globalThis.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

let fetchMock;
beforeEach(() => {
  vi.mocked(authApi.me).mockRejectedValue(apiError(401, { success: false }));
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

function renderSection() {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <AuthProvider>
        <FreeLearningSection />
      </AuthProvider>
    </MemoryRouter>,
  );
  return user;
}

const form = () => screen.getByRole('form', { name: 'Request a free place' });
const submit = (user) => user.click(within(form()).getByRole('button', { name: 'Request a free place' }));

describe('Free tuition and IT courses', () => {
  test('lists the programmes', () => {
    renderSection();
    expect(screen.getByRole('heading', { name: 'Free Tuition and IT Courses' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Free academic tuition' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Free IT courses' })).toBeInTheDocument();
  });

  test('validates the request form', async () => {
    const user = renderSection();
    await submit(user);
    const f = within(form());
    expect(await f.findByText('Please choose a course')).toBeInTheDocument();
    expect(f.getByText('Tell us who the place is for')).toBeInTheDocument();
    expect(f.getByText('Choose online, in person or either')).toBeInTheDocument();
    expect(f.getByText('Your name is required')).toBeInTheDocument();
    expect(f.getByText('Phone number is required')).toBeInTheDocument();
    expect(f.getByText('Email is required')).toBeInTheDocument();
    expect(f.getByText(/must agree to the privacy policy/)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('asks a parent for the child age group and sends the request', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
    const user = renderSection();
    const f = within(form());

    await user.selectOptions(f.getByLabelText('Course'), 'tuition_maths');
    await user.click(f.getByLabelText('My child'));
    expect(f.getByLabelText('Your name (parent or guardian)')).toBeInTheDocument();
    await user.click(f.getByLabelText('Online'));
    await user.type(f.getByLabelText('Your name (parent or guardian)'), 'Farah Ali');
    await user.type(f.getByLabelText('Phone number'), '07700 900456');
    await user.type(f.getByLabelText('Email'), 'farah@example.com');
    await user.click(f.getByRole('checkbox'));
    await submit(user);
    expect(await f.findByText("Choose your child's age group")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();

    await user.selectOptions(f.getByLabelText("Your child's age group"), 'secondary_gcse');
    await user.type(f.getByLabelText(/Best days and times/), 'Weekday evenings');
    await submit(user);

    expect(await screen.findByText(/your request has been sent/)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(CONTACT_API_URL);
    const body = JSON.parse(options.body);
    expect(body).toEqual({
      name: 'Farah Ali',
      email: 'farah@example.com',
      reason: 'Free tuition / IT course place request: Maths',
      message: expect.stringContaining("Child's age group: GCSE, Years 10–11 (ages 14–16)"),
    });
    expect(body.message).toContain('Phone: 07700 900456');
    expect(body.message).toContain('Best times: Weekday evenings');
  });

  test('shows the server error and an email fallback', async () => {
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({ error: 'Too many messages sent. Please try again later.' }) });
    const user = renderSection();
    const f = within(form());
    await user.selectOptions(f.getByLabelText('Course'), 'it_coding');
    await user.click(f.getByLabelText('Myself'));
    await user.click(f.getByLabelText('Either'));
    await user.type(f.getByLabelText('Your name'), 'Sam Lee');
    await user.type(f.getByLabelText('Phone number'), '07700 900789');
    await user.type(f.getByLabelText('Email'), 'sam@example.com');
    await user.click(f.getByRole('checkbox'));
    await submit(user);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Too many messages sent');
    expect(within(alert).getByRole('link', { name: 'help@communityrise.org.uk' })).toBeInTheDocument();
  });

  test('builds a message within the contact form limits', () => {
    const payload = buildPlaceRequest({
      full_name: 'Sam Lee',
      email: 'sam@example.com',
      phone: '07700 900789',
      course: 'it_office_skills',
      learner: 'myself',
      mode: 'in_person',
      availability: '',
      notes: 'x'.repeat(1500),
    });
    expect(payload.reason.length).toBeLessThanOrEqual(200);
    expect(payload.message.length).toBeLessThanOrEqual(5000);
    expect(payload.message).not.toContain("Child's age group");
  });
});
