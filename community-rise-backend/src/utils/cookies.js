import env from '../config/env.js';
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_TTL_MS,
} from '../config/auth.js';

const baseOptions = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: env.isProduction,
});

const accessOptions = () => ({ ...baseOptions(), path: '/' });
const refreshOptions = () => ({ ...baseOptions(), path: env.REFRESH_COOKIE_PATH });

export function setAuthCookies(res, { accessToken, refreshToken }) {
  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
    ...accessOptions(),
    maxAge: ACCESS_TOKEN_TTL_SECONDS * 1000,
  });
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...refreshOptions(),
    maxAge: REFRESH_TOKEN_TTL_MS,
  });
}

export function clearAuthCookies(res) {
  res.clearCookie(ACCESS_TOKEN_COOKIE, accessOptions());
  res.clearCookie(REFRESH_TOKEN_COOKIE, refreshOptions());
}
