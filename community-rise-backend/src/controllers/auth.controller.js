import { REFRESH_TOKEN_COOKIE } from '../config/auth.js';
import * as authService from '../services/auth.service.js';
import { clearAuthCookies, setAuthCookies } from '../utils/cookies.js';
import requestMeta from '../utils/requestMeta.js';
import { sendSuccess } from '../utils/response.js';
import serializeUser from '../utils/serializeUser.js';

const GENERIC_EMAIL_SENT =
  'If an account exists for that email address, we have sent an email with further instructions.';

export async function register(req, res) {
  const { user, session } = await authService.register(req.body, requestMeta(req));
  setAuthCookies(res, session);
  sendSuccess(res, {
    status: 201,
    message: 'Account created. Please check your email to verify your address.',
    data: { user: serializeUser(user) },
  });
}

export async function login(req, res) {
  const { user, session } = await authService.login(req.body, requestMeta(req));
  setAuthCookies(res, session);
  sendSuccess(res, { message: 'Logged in successfully', data: { user: serializeUser(user) } });
}

export async function refresh(req, res) {
  try {
    const { user, accessToken, refreshToken } = await authService.refresh(
      req.cookies?.[REFRESH_TOKEN_COOKIE],
      requestMeta(req),
    );
    setAuthCookies(res, { accessToken, refreshToken });
    sendSuccess(res, { message: 'Session refreshed', data: { user: serializeUser(user) } });
  } catch (err) {
    clearAuthCookies(res);
    throw err;
  }
}

export async function logout(req, res) {
  await authService.logout(req.cookies?.[REFRESH_TOKEN_COOKIE]);
  clearAuthCookies(res);
  sendSuccess(res, { message: 'Logged out successfully' });
}

export async function logoutAll(req, res) {
  await authService.logoutAll(req.user.id);
  clearAuthCookies(res);
  sendSuccess(res, { message: 'Logged out from all devices' });
}

export function me(req, res) {
  sendSuccess(res, { message: 'Current user', data: { user: serializeUser(req.user) } });
}

export async function verifyEmail(req, res) {
  const user = await authService.verifyEmail(req.query.token);
  sendSuccess(res, { message: 'Email address verified', data: { user: serializeUser(user) } });
}

export async function resendVerification(req, res) {
  await authService.resendVerification(req.body.email);
  sendSuccess(res, { message: GENERIC_EMAIL_SENT });
}

export async function forgotPassword(req, res) {
  await authService.forgotPassword(req.body.email);
  sendSuccess(res, { message: GENERIC_EMAIL_SENT });
}

export async function resetPassword(req, res) {
  await authService.resetPassword(req.body);
  clearAuthCookies(res);
  sendSuccess(res, { message: 'Your password has been reset. Please log in with your new password.' });
}

export async function changePassword(req, res) {
  const session = await authService.changePassword(req.user.id, req.body, requestMeta(req));
  setAuthCookies(res, session);
  sendSuccess(res, { message: 'Password changed. Other devices have been signed out.' });
}
