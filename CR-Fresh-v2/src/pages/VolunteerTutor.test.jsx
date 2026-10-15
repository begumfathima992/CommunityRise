import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import * as authApi from '../api/auth';
import * as tutorApi from '../api/tutorApplications';
import { AuthProvider } from '../context/AuthContext';
import { TEST_USER, apiError } from '../test/utils';
import VolunteerTutor from './VolunteerTutor';

vi.mock('../api/auth', () => ({ me: vi.fn(), logout: vi.fn() }));
vi.mock('../api/tutorApplications', () => ({ submitApplication: vi.fn() }));

beforeAll(() => {
  globalThis.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

beforeEach(() => {
  vi.mocked(authApi.me).mockRejectedValue(apiError(401, { success: false }));
});

function renderPage() {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <AuthProvider>
        <VolunteerTutor />
      </AuthProvider>
    </MemoryRouter>,
  );
  return user;
}

const form = () => screen.getByRole('form', { name: 'Volunteer tutor application' });

async function fillValidForm(user) {
  const f = within(form());
  await user.type(f.getByLabelText('Full name'), 'Priya Sharma');
  await user.type(f.getByLabelText('Phone number'), '07700 900123');
  await user.type(f.getByLabelText('Email'), 'Priya@Example.com');
  await user.click(f.getByLabelText('Maths'));
  await user.click(f.getByLabelText('Coding (Scratch, Python)'));
  await user.click(f.getByLabelText('Adults'));
  await user.click(f.getByLabelText('Weekends'));
  await user.click(f.getByLabelText('Online'));
  await user.type(f.getByLabelText('Your experience'), 'Six years teaching secondary maths and coding.');
  await user.click(f.getByLabelText("I don't have a current DBS check"));
  await user.click(f.getByLabelText(/two references, an enhanced DBS check/));
  await user.click(f.getByLabelText(/storing my application/));
}

const submit = (user) => user.click(within(form()).getByRole('button', { name: 'Send application' }));

describe('Volunteer tutor page', () => {
  test('explains the pathway', async () => {
    renderPage();
    expect(screen.getByRole('heading', { level: 1, name: 'Volunteer as a tutor' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'How it works' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Keeping learners safe' })).toBeInTheDocument();
    await screen.findByRole('form', { name: 'Volunteer tutor application' });
  });

  test('shows an error for every missing answer and does not submit', async () => {
    const user = renderPage();
    await submit(user);
    const f = within(form());
    expect(await f.findByText('Full name is required')).toBeInTheDocument();
    expect(f.getByText('Phone number is required')).toBeInTheDocument();
    expect(f.getByText('Email is required')).toBeInTheDocument();
    expect(f.getByText('Choose at least one subject')).toBeInTheDocument();
    expect(f.getByText('Choose at least one group of learners')).toBeInTheDocument();
    expect(f.getByText('Choose at least one time you are available')).toBeInTheDocument();
    expect(f.getByText('Choose how you would like to teach')).toBeInTheDocument();
    expect(f.getByText('Please write at least 20 characters about your experience')).toBeInTheDocument();
    expect(f.getByText('Tell us about your DBS check')).toBeInTheDocument();
    expect(f.getByText(/must agree to the safeguarding checks/)).toBeInTheDocument();
    expect(f.getByText(/must agree to the privacy policy/)).toBeInTheDocument();
    expect(tutorApi.submitApplication).not.toHaveBeenCalled();
  });

  test('rejects an invalid phone number', async () => {
    const user = renderPage();
    await fillValidForm(user);
    const phone = within(form()).getByLabelText('Phone number');
    await user.clear(phone);
    await user.type(phone, '12345');
    await submit(user);
    expect(await within(form()).findByText('Enter a valid phone number')).toBeInTheDocument();
    expect(tutorApi.submitApplication).not.toHaveBeenCalled();
  });

  test('submits the application and shows the confirmation', async () => {
    vi.mocked(tutorApi.submitApplication).mockResolvedValue({
      success: true,
      message: "Thank you for applying to volunteer as a tutor. We've emailed you a confirmation and will be in touch soon.",
    });
    const user = renderPage();
    await fillValidForm(user);
    await submit(user);

    expect(await screen.findByText(/Thank you for applying to volunteer as a tutor/)).toBeInTheDocument();
    expect(tutorApi.submitApplication).toHaveBeenCalledWith({
      full_name: 'Priya Sharma',
      email: 'priya@example.com',
      phone: '07700 900123',
      subjects: ['maths', 'coding'],
      learner_groups: ['adults'],
      availability: ['weekend'],
      delivery: 'online',
      experience: 'Six years teaching secondary maths and coding.',
      dbs_status: 'none',
      agree_to_checks: true,
      consent: true,
      website: '',
    });
  });

  test('shows the duplicate-application message from the server', async () => {
    vi.mocked(tutorApi.submitApplication).mockRejectedValue(
      apiError(409, {
        success: false,
        message: 'We already have an application from this email address and will be in touch soon.',
        errors: { email: ['We already have an application from this email address'] },
      }),
    );
    const user = renderPage();
    await fillValidForm(user);
    await submit(user);
    expect(await screen.findByRole('alert')).toHaveTextContent('We already have an application');
    expect(within(form()).getByText('We already have an application from this email address')).toBeInTheDocument();
  });

  test('pre-fills name and email for logged-in users', async () => {
    vi.mocked(authApi.me).mockResolvedValue({ success: true, data: { user: TEST_USER } });
    renderPage();
    expect(await within(form()).findByDisplayValue('Amina Khan')).toBeInTheDocument();
    expect(within(form()).getByLabelText('Email')).toHaveValue('amina@example.com');
  });
});
