import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import GuestRoute from '../components/auth/GuestRoute';
import { AuthProvider } from '../context/AuthContext';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

/** Shape of an axios error as produced by the API client. */
export function apiError(status, data = {}) {
  return Object.assign(new Error(`Request failed with status code ${status}`), {
    isAxiosError: true,
    response: { status, data },
  });
}

export function networkError() {
  return Object.assign(new Error('Network Error'), { isAxiosError: true, request: {}, response: undefined });
}

function LocationProbe() {
  const location = useLocation();
  return <p data-testid="location">{location.pathname}</p>;
}

/** Renders the auth pages inside the real AuthProvider and route guards. */
export function renderAuthPages(initialEntry) {
  const user = userEvent.setup();
  const utils = render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AuthProvider>
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          <Route path="/dashboard" element={<h1>Dashboard page</h1>} />
          <Route path="/account" element={<h1>Account page</h1>} />
          <Route path="/forgot-password" element={<h1>Forgot password page</h1>} />
          <Route path="/get-involved/teaching-resources" element={<h1>Teaching resources page</h1>} />
        </Routes>
        <LocationProbe />
      </AuthProvider>
    </MemoryRouter>,
  );
  return { user, ...utils };
}

export const TEST_USER = {
  id: '6a1f6c1e-0c6b-4f43-9d38-9a3f3c2f8a11',
  full_name: 'Amina Khan',
  email: 'amina@example.com',
  signup_reason: 'volunteer',
  role: 'user',
  is_email_verified: false,
  email_verified_at: null,
  teaching_updates_opt_in: false,
  last_login_at: null,
  created_at: '2026-10-10T12:00:00.000Z',
};
