import { screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import * as authApi from '../../api/auth';
import { TEST_USER, apiError, networkError, renderAuthPages } from '../../test/utils';

vi.mock('../../api/auth', () => ({
  me: vi.fn(),
  register: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  logoutAll: vi.fn(),
}));

const PASSWORD = 'CorrectHorse42';

async function renderRegister() {
  const utils = renderAuthPages('/register');
  await screen.findByRole('heading', { name: 'Create your account' });
  return utils;
}

async function fillValidForm(user, overrides = {}) {
  const values = {
    name: '  Amina Khan ',
    email: ' Amina@Example.COM ',
    reason: 'volunteer',
    password: PASSWORD,
    confirm: PASSWORD,
    consent: true,
    ...overrides,
  };
  if (values.name) await user.type(screen.getByLabelText('Full name'), values.name);
  if (values.email) await user.type(screen.getByLabelText('Email'), values.email);
  if (values.reason) await user.selectOptions(screen.getByLabelText('Why are you joining?'), values.reason);
  if (values.password) await user.type(screen.getByLabelText('Password'), values.password);
  if (values.confirm) await user.type(screen.getByLabelText('Confirm password'), values.confirm);
  if (values.consent) await user.click(screen.getByRole('checkbox', { name: /I agree/ }));
  if (values.teachingUpdates) await user.click(screen.getByRole('checkbox', { name: /teaching resources/ }));
}

const submit = (user) => user.click(screen.getByRole('button', { name: 'Create account' }));

beforeEach(() => {
  vi.mocked(authApi.me).mockRejectedValue(apiError(401, { success: false, message: 'Authentication required' }));
});

describe('Register form', () => {
  test('renders accessible fields with the right autocomplete attributes', async () => {
    await renderRegister();
    expect(screen.getByLabelText('Full name')).toHaveAttribute('autocomplete', 'name');
    expect(screen.getByLabelText('Email')).toHaveAttribute('autocomplete', 'email');
    expect(screen.getByLabelText('Password')).toHaveAttribute('autocomplete', 'new-password');
    expect(screen.getByLabelText('Confirm password')).toHaveAttribute('autocomplete', 'new-password');
    expect(screen.getByRole('link', { name: /privacy policy/i })).toHaveAttribute('href', '/privacy');

    const options = within(screen.getByLabelText('Why are you joining?'))
      .getAllByRole('option')
      .map((option) => option.textContent);
    expect(options).toEqual(['Choose an option', 'Learner', 'Volunteer', 'Funder / Donor', 'Partner organisation', 'Other']);
  });

  test('shows every required-field error and does not call the API', async () => {
    const { user } = await renderRegister();
    await submit(user);

    expect(await screen.findByText('Full name is required')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Please tell us why you are joining')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(screen.getByText('Please confirm your password')).toBeInTheDocument();
    expect(screen.getByText('You must agree to the privacy policy to create an account')).toBeInTheDocument();
    expect(screen.getByLabelText('Full name')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Full name')).toHaveFocus();
    expect(authApi.register).not.toHaveBeenCalled();
  });

  test.each([
    ['a name with digits', { name: 'Agent 47' }, 'Full name may only contain letters, spaces, hyphens and apostrophes'],
    ['a one-letter name', { name: 'A' }, 'Full name must be at least 2 characters'],
    ['an invalid email', { email: 'not-an-email' }, 'Enter a valid email address'],
    ['a short password', { password: 'Short1a', confirm: 'Short1a' }, 'Password must be at least 10 characters'],
    ['a password without uppercase', { password: 'lowercase123', confirm: 'lowercase123' }, 'Password must contain at least one uppercase letter'],
    ['a password without a number', { password: 'NoNumbersHere', confirm: 'NoNumbersHere' }, 'Password must contain at least one number'],
    ['a password containing the email', { password: 'Xamina@example.com1', confirm: 'Xamina@example.com1' }, 'Password must not contain your email address'],
    ['mismatched passwords', { confirm: 'Different123A' }, 'Passwords do not match'],
  ])('rejects %s', async (_label, overrides, message) => {
    const { user } = await renderRegister();
    await fillValidForm(user, overrides);
    await submit(user);

    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(authApi.register).not.toHaveBeenCalled();
  });

  test('requires consent', async () => {
    const { user } = await renderRegister();
    await fillValidForm(user, { consent: false });
    await submit(user);
    expect(await screen.findByText('You must agree to the privacy policy to create an account')).toBeInTheDocument();
    expect(authApi.register).not.toHaveBeenCalled();
  });

  test('marks each password rule as met or not met while typing', async () => {
    const { user } = await renderRegister();
    const rule = (id) => document.querySelector(`[data-rule="${id}"]`);

    await user.type(screen.getByLabelText('Email'), 'amina@example.com');
    await user.type(screen.getByLabelText('Password'), 'abc');
    expect(rule('lower')).toHaveAttribute('data-met', 'true');
    expect(rule('upper')).toHaveAttribute('data-met', 'false');
    expect(rule('length')).toHaveAttribute('data-met', 'false');
    expect(rule('number')).toHaveAttribute('data-met', 'false');
    expect(rule('length')).toHaveTextContent('(not met)');

    await user.type(screen.getByLabelText('Password'), 'DEFGHIJ9');
    for (const id of ['length', 'upper', 'lower', 'number', 'email']) {
      expect(rule(id)).toHaveAttribute('data-met', 'true');
    }
  });

  test('toggles password visibility', async () => {
    const { user } = await renderRegister();
    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'password');

    await user.click(screen.getByRole('button', { name: 'Show password' }));
    expect(input).toHaveAttribute('type', 'text');
    await user.click(screen.getByRole('button', { name: 'Hide password' }));
    expect(input).toHaveAttribute('type', 'password');
  });

  test('submits the cleaned values and goes to the dashboard', async () => {
    vi.mocked(authApi.register).mockResolvedValue({ success: true, message: 'Account created', data: { user: TEST_USER } });
    const { user } = await renderRegister();
    await fillValidForm(user);
    await submit(user);

    expect(await screen.findByRole('heading', { name: 'Dashboard page' })).toBeInTheDocument();
    expect(authApi.register).toHaveBeenCalledTimes(1);
    expect(authApi.register).toHaveBeenCalledWith({
      full_name: 'Amina Khan',
      email: 'amina@example.com',
      signup_reason: 'volunteer',
      password: PASSWORD,
      confirm_password: PASSWORD,
      consent: true,
      teaching_updates: false,
    });
  });

  test('teaching updates opt-in is unticked by default and sent when ticked', async () => {
    vi.mocked(authApi.register).mockResolvedValue({ success: true, data: { user: TEST_USER } });
    const { user } = await renderRegister();
    expect(screen.getByRole('checkbox', { name: /teaching resources/ })).not.toBeChecked();

    await fillValidForm(user, { teachingUpdates: true });
    await submit(user);

    await screen.findByRole('heading', { name: 'Dashboard page' });
    expect(authApi.register).toHaveBeenCalledWith(expect.objectContaining({ teaching_updates: true }));
  });

  test('uses teaching resources wording and returns there after sign-up', async () => {
    vi.mocked(authApi.register).mockResolvedValue({ success: true, data: { user: TEST_USER } });
    const { user } = renderAuthPages({
      pathname: '/register',
      search: '?interest=teaching-resources',
      state: { from: { pathname: '/get-involved/teaching-resources', hash: '#sign-up' } },
    });
    expect(await screen.findByRole('heading', { name: 'Sign up for teaching resource updates' })).toBeInTheDocument();

    await fillValidForm(user, { teachingUpdates: true });
    await submit(user);
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/get-involved/teaching-resources'));
  });

  test('disables the button while submitting and prevents double submission', async () => {
    let resolve;
    vi.mocked(authApi.register).mockReturnValue(new Promise((r) => { resolve = r; }));
    const { user } = await renderRegister();
    await fillValidForm(user);
    await submit(user);

    const button = await screen.findByRole('button', { name: /creating account/i });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(authApi.register).toHaveBeenCalledTimes(1);

    resolve({ success: true, data: { user: TEST_USER } });
    expect(await screen.findByRole('heading', { name: 'Dashboard page' })).toBeInTheDocument();
  });

  test('shows a 409 duplicate email error on the email field', async () => {
    vi.mocked(authApi.register).mockRejectedValue(
      apiError(409, {
        success: false,
        message: 'An account with this email already exists.',
        errors: { email: ['An account with this email already exists'] },
      }),
    );
    const { user } = await renderRegister();
    await fillValidForm(user);
    await submit(user);

    expect(await screen.findByRole('alert')).toHaveTextContent('An account with this email already exists. Try logging in instead.');
    expect(screen.getByText('An account with this email already exists')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  test('maps backend 422 field errors onto the matching fields', async () => {
    vi.mocked(authApi.register).mockRejectedValue(
      apiError(422, {
        success: false,
        message: 'Validation failed',
        errors: { full_name: ['Name rejected by server'], password: ['Password rejected by server'] },
      }),
    );
    const { user } = await renderRegister();
    await fillValidForm(user);
    await submit(user);

    expect(await screen.findByText('Name rejected by server')).toBeInTheDocument();
    expect(screen.getByText('Password rejected by server')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Please check the highlighted fields and try again.');
    expect(screen.getByLabelText('Full name')).toHaveFocus();
  });

  test('explains rate limiting and network failures', async () => {
    vi.mocked(authApi.register)
      .mockRejectedValueOnce(apiError(429, { success: false, message: 'Too many sign-up attempts.' }))
      .mockRejectedValueOnce(networkError());
    const { user } = await renderRegister();
    await fillValidForm(user);

    await submit(user);
    expect(await screen.findByRole('alert')).toHaveTextContent(/wait 15 minutes/i);

    await submit(user);
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/couldn't reach Community Rise/i));
  });

  test('sends logged-in users to the dashboard', async () => {
    vi.mocked(authApi.me).mockResolvedValue({ success: true, data: { user: TEST_USER } });
    renderAuthPages('/register');
    expect(await screen.findByRole('heading', { name: 'Dashboard page' })).toBeInTheDocument();
  });
});
