import api from './client';

/**
 * One function per /api/v1/auth endpoint. Each resolves to the
 * backend's response body: { success, message, data }.
 */
const body = (request) => request.then((response) => response.data);

export const register = (payload) => body(api.post('/auth/register', payload));

export const login = (payload) => body(api.post('/auth/login', payload));

export const refresh = () => body(api.post('/auth/refresh'));

export const logout = () => body(api.post('/auth/logout'));

export const logoutAll = () => body(api.post('/auth/logout-all'));

// skipSessionRedirect: used when restoring a session on page load, where
// "not logged in" is a normal outcome rather than an expired session.
export const me = ({ skipSessionRedirect = false } = {}) =>
  body(api.get('/auth/me', { skipSessionRedirect }));

export const verifyEmail = (token) => body(api.get('/auth/verify-email', { params: { token } }));

export const resendVerification = (email) => body(api.post('/auth/resend-verification', { email }));

export const forgotPassword = (email) => body(api.post('/auth/forgot-password', { email }));

export const resetPassword = (payload) => body(api.post('/auth/reset-password', payload));

export const changePassword = (payload) => body(api.patch('/auth/change-password', payload));
