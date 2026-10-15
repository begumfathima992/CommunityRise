import { screen, waitFor } from '@testing-library/react';
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

async function renderLogin(entry = '/login') {
  const utils = renderAuthPages(entry);
  await screen.findByRole('heading', { name: 'Log in' });
  return utils;
}

async function fillAndSubmit(user, email = 'Amina@Example.com ', password = 'CorrectHorse42') {
  if (email) await user.type(screen.getByLabelText('Email'), email);
  if (password) await user.type(screen.getByLabelText('Password'), password);
  await user.click(screen.getByRole('button', { name: 'Log in' }));
}

beforeEach(() => {
  vi.mocked(authApi.me).mockRejectedValue(apiError(401, { success: false, message: 'Authentication required' }));
});

describe('Login form', () => {
  test('has the expected fields and links', async () => {
    await renderLogin();
    expect(screen.getByLabelText('Email')).toHaveAttribute('autocomplete', 'email');
    expect(screen.getByLabelText('Password')).toHaveAttribute('autocomplete', 'current-password');
    expect(screen.getByRole('link', { name: 'Forgot password?' })).toHaveAttribute('href', '/forgot-password');
    expect(screen.getByRole('link', { name: 'Create an account' })).toHaveAttribute('href', '/register');
  });

  test('validates required fields and email format without calling the API', async () => {
    const { user } = await renderLogin();
    await user.click(screen.getByRole('button', { name: 'Log in' }));
    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveFocus();

    await user.type(screen.getByLabelText('Email'), 'nope');
    await user.click(screen.getByRole('button', { name: 'Log in' }));
    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument();
    expect(authApi.login).not.toHaveBeenCalled();
  });

  test('logs in with normalised credentials and goes to the dashboard', async () => {
    vi.mocked(authApi.login).mockResolvedValue({ success: true, data: { user: TEST_USER } });
    const { user } = await renderLogin();
    await fillAndSubmit(user);

    expect(await screen.findByRole('heading', { name: 'Dashboard page' })).toBeInTheDocument();
    expect(authApi.login).toHaveBeenCalledWith({ email: 'amina@example.com', password: 'CorrectHorse42' });
  });

  test('returns the user to the page they originally wanted', async () => {
    vi.mocked(authApi.login).mockResolvedValue({ success: true, data: { user: TEST_USER } });
    const { user } = await renderLogin({ pathname: '/login', state: { from: { pathname: '/account' } } });
    await fillAndSubmit(user);
    expect(await screen.findByRole('heading', { name: 'Account page' })).toBeInTheDocument();
  });

  test('ignores off-site redirect targets', async () => {
    vi.mocked(authApi.login).mockResolvedValue({ success: true, data: { user: TEST_USER } });
    const { user } = await renderLogin({ pathname: '/login', state: { from: '//evil.example/steal' } });
    await fillAndSubmit(user);
    expect(await screen.findByRole('heading', { name: 'Dashboard page' })).toBeInTheDocument();
  });

  test('shows a generic message for wrong credentials', async () => {
    vi.mocked(authApi.login).mockRejectedValue(apiError(401, { success: false, message: 'Invalid email or password' }));
    const { user } = await renderLogin();
    await fillAndSubmit(user);

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password.');
    expect(screen.getByTestId('location')).toHaveTextContent('/login');
  });

  test('explains when the account is locked', async () => {
    vi.mocked(authApi.login).mockRejectedValue(
      apiError(423, {
        success: false,
        message: 'Too many failed login attempts. Your account is locked; please try again in 15 minutes.',
      }),
    );
    const { user } = await renderLogin();
    await fillAndSubmit(user);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Account temporarily locked');
    expect(alert).toHaveTextContent('please try again in 15 minutes');
    expect(alert).toHaveClass('alert-warning');
    expect(screen.getByRole('link', { name: 'reset your password' })).toHaveAttribute('href', '/forgot-password');
  });

  test('explains rate limiting', async () => {
    vi.mocked(authApi.login).mockRejectedValue(apiError(429, { success: false, message: 'Too many login attempts.' }));
    const { user } = await renderLogin();
    await fillAndSubmit(user);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Too many attempts');
    expect(alert).toHaveTextContent(/wait 15 minutes/i);
  });

  test('reports network failures', async () => {
    vi.mocked(authApi.login).mockRejectedValue(networkError());
    const { user } = await renderLogin();
    await fillAndSubmit(user);
    expect(await screen.findByRole('alert')).toHaveTextContent(/couldn't reach Community Rise/i);
  });

  test('disables the button while the request runs', async () => {
    let resolve;
    vi.mocked(authApi.login).mockReturnValue(new Promise((r) => { resolve = r; }));
    const { user } = await renderLogin();
    await fillAndSubmit(user);

    const button = await screen.findByRole('button', { name: /logging in/i });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(authApi.login).toHaveBeenCalledTimes(1);

    resolve({ success: true, data: { user: TEST_USER } });
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/dashboard'));
  });

  test('shows a message passed from another page', async () => {
    await renderLogin({ pathname: '/login', state: { message: 'Your password has been reset. Please log in with your new password.' } });
    expect(screen.getByRole('status')).toHaveTextContent('Your password has been reset');
  });

  test('toggles password visibility', async () => {
    const { user } = await renderLogin();
    await user.click(screen.getByRole('button', { name: 'Show password' }));
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'text');
  });
});
