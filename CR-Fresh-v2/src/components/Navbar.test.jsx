import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import * as authApi from '../api/auth';
import { AuthProvider } from '../context/AuthContext';
import { DonationModalProvider } from '../context/DonationModalContext';
import { TEST_USER, apiError } from '../test/utils';
import SiteNavbar from './Navbar';

vi.mock('../api/auth', () => ({ me: vi.fn(), logout: vi.fn() }));

beforeEach(() => {
  vi.mocked(authApi.me).mockRejectedValue(apiError(401, { success: false }));
});

function renderNavbar() {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <AuthProvider>
        <DonationModalProvider>
          <SiteNavbar />
        </DonationModalProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
  return user;
}

describe('Navbar', () => {
  test('Get Involved is a dropdown with the five sections', async () => {
    const user = renderNavbar();
    await user.click(screen.getByRole('button', { name: 'Get Involved' }));

    const donateItem = screen.getAllByRole('button', { name: 'Donate' }).find((el) => el.classList.contains('dropdown-item'));
    expect(donateItem).toBeDefined();
    expect(screen.getByRole('link', { name: 'Volunteer' })).toHaveAttribute('href', '/get-involved#volunteer');
    expect(screen.getByRole('link', { name: 'Volunteer as a Tutor' })).toHaveAttribute('href', '/get-involved/volunteer-tutor');
    expect(screen.getByRole('link', { name: 'Teaching Resources' })).toHaveAttribute('href', '/get-involved/teaching-resources');
    expect(screen.getByRole('link', { name: 'Fundraising' })).toHaveAttribute('href', '/get-involved#fundraise');
    expect(screen.getByRole('link', { name: 'Events' })).toHaveAttribute('href', '/get-involved/events');
    expect(screen.getByRole('link', { name: 'Ways to get involved' })).toHaveAttribute('href', '/get-involved');
  });

  test('has no Login or Register links in the top menu', async () => {
    renderNavbar();
    await vi.waitFor(() => expect(authApi.me).toHaveBeenCalled());
    expect(screen.queryByRole('link', { name: 'Login' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Register' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Donate' })).toHaveClass('btn-navajo');
  });

  test('shows the account menu for logged-in users', async () => {
    vi.mocked(authApi.me).mockResolvedValue({ success: true, data: { user: TEST_USER } });
    const user = renderNavbar();
    await user.click(await screen.findByRole('button', { name: 'Amina' }));
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/dashboard');
    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Tutor applications' })).not.toBeInTheDocument();
  });

  test('shows the tutor applications link to admins', async () => {
    vi.mocked(authApi.me).mockResolvedValue({ success: true, data: { user: { ...TEST_USER, role: 'admin' } } });
    const user = renderNavbar();
    await user.click(await screen.findByRole('button', { name: 'Amina' }));
    expect(screen.getByRole('link', { name: 'Tutor applications' })).toHaveAttribute('href', '/admin/tutor-applications');
  });
});
